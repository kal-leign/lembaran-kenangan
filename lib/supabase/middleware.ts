import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Jika URL Supabase masih placeholder, lewati session check tanpa error
  if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Me-refresh token auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublicView = process.env.NEXT_PUBLIC_PUBLIC_VIEW === 'true';
  const { pathname } = request.nextUrl;

  // Jika mode privat murni dan belum login, arahkan ke /masuk (kecuali untuk /masuk dan aset statis)
  if (
    !isPublicView &&
    !user &&
    pathname !== '/masuk' &&
    !pathname.startsWith('/_next') &&
    !pathname.startsWith('/api') &&
    !pathname.includes('.')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/masuk';
    return NextResponse.redirect(url);
  }

  // Jika sudah login dan mengakses /masuk, arahkan ke beranda
  if (user && pathname === '/masuk') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
