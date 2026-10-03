-- ========================================================
-- LEMBARAN KENANGAN - SKEMA DATABASE & STORAGE (SUPABASE)
-- MULTI-AKUN (ISOLASI KENANGAN PER USER SECARA KETAT)
-- ========================================================
-- Jalankan skrip ini di SQL Editor pada dashboard Supabase Anda.
-- Akun lain tidak dapat melihat kenangan Anda, dan sebaliknya.
-- Pengunjung yang belum login tidak dapat melihat apa-apa.
-- ========================================================

-- 1. TABEL FOTO (photos)
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  storage_path text not null,
  public_url text not null,
  width int,
  height int,
  caption text,
  memory_date date default current_date,
  frame text not null default 'none',      -- none | classic | gold | walnut | polaroid | vintage_print
  filter text not null default 'original', -- original | sepia | bw | faded
  rotation numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Pastikan kolom user_id ada bila tabel sudah pernah dibuat sebelumnya
do $$ 
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='photos' and column_name='user_id') then
    alter table public.photos add column user_id uuid references auth.users(id) on delete cascade not null default auth.uid();
  end if;
end $$;

-- Index untuk performa query foto per user
create index if not exists idx_photos_user_id on public.photos(user_id);
create index if not exists idx_photos_created_at on public.photos(created_at desc);
create index if not exists idx_photos_memory_date on public.photos(memory_date desc);

-- 2. TABEL CATATAN / PUISI / QUOTES (notes)
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  kind text not null default 'quote',      -- poem | quote | note
  title text,
  body text not null,
  author text,
  paper text not null default 'ivory',     -- ivory | aged | lined | letter | torn
  font text not null default 'serif',      -- serif | italic | script
  ink text not null default 'brown',       -- brown | black | blue | wine
  decoration text default 'none',          -- none | tape | pin
  rotation numeric default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Pastikan kolom user_id ada bila tabel sudah pernah dibuat sebelumnya
do $$ 
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='notes' and column_name='user_id') then
    alter table public.notes add column user_id uuid references auth.users(id) on delete cascade not null default auth.uid();
  end if;
end $$;

-- Index untuk performa query tulisan per user
create index if not exists idx_notes_user_id on public.notes(user_id);
create index if not exists idx_notes_created_at on public.notes(created_at desc);
create index if not exists idx_notes_kind on public.notes(kind);

-- Trigger otomatis untuk memperbarui updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tr_photos_updated_at on public.photos;
create trigger tr_photos_updated_at
  before update on public.photos
  for each row execute function public.handle_updated_at();

drop trigger if exists tr_notes_updated_at on public.notes;
create trigger tr_notes_updated_at
  before update on public.notes
  for each row execute function public.handle_updated_at();

-- ========================================================
-- 3. ROW LEVEL SECURITY (RLS) - PRIVAT PENUH PER AKUN
-- ========================================================

alter table public.photos enable row level security;
alter table public.notes enable row level security;

-- Hapus kebijakan lama
drop policy if exists "Izinkan publik melihat foto jika diaktifkan" on public.photos;
drop policy if exists "Hanya pemilik terautentikasi yang boleh mengelola foto" on public.photos;
drop policy if exists "Izinkan publik membaca foto" on public.photos;
drop policy if exists "Izinkan pemilik menambah foto" on public.photos;
drop policy if exists "Izinkan pemilik mengubah foto" on public.photos;
drop policy if exists "Izinkan pemilik menghapus foto" on public.photos;
drop policy if exists "User hanya dapat melihat fotonya sendiri" on public.photos;
drop policy if exists "User hanya dapat menambah fotonya sendiri" on public.photos;
drop policy if exists "User hanya dapat mengubah fotonya sendiri" on public.photos;
drop policy if exists "User hanya dapat menghapus fotonya sendiri" on public.photos;

-- RLS FOTO: Pengguna HANYA bisa mengakses data miliknya sendiri
create policy "User hanya dapat melihat fotonya sendiri"
  on public.photos for select
  to authenticated
  using (auth.uid() = user_id);

create policy "User hanya dapat menambah fotonya sendiri"
  on public.photos for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "User hanya dapat mengubah fotonya sendiri"
  on public.photos for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "User hanya dapat menghapus fotonya sendiri"
  on public.photos for delete
  to authenticated
  using (auth.uid() = user_id);

-- RLS TULISAN: Pengguna HANYA bisa mengakses catatan miliknya sendiri
drop policy if exists "Izinkan publik membaca catatan" on public.notes;
drop policy if exists "Izinkan pemilik menambah catatan" on public.notes;
drop policy if exists "Izinkan pemilik mengubah catatan" on public.notes;
drop policy if exists "Izinkan pemilik menghapus catatan" on public.notes;
drop policy if exists "User hanya dapat membaca catatannya sendiri" on public.notes;
drop policy if exists "User hanya dapat menambah catatannya sendiri" on public.notes;
drop policy if exists "User hanya dapat mengubah catatannya sendiri" on public.notes;
drop policy if exists "User hanya dapat menghapus catatannya sendiri" on public.notes;

create policy "User hanya dapat membaca catatannya sendiri"
  on public.notes for select
  to authenticated
  using (auth.uid() = user_id);

create policy "User hanya dapat menambah catatannya sendiri"
  on public.notes for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "User hanya dapat mengubah catatannya sendiri"
  on public.notes for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "User hanya dapat menghapus catatannya sendiri"
  on public.notes for delete
  to authenticated
  using (auth.uid() = user_id);

-- ========================================================
-- 4. STORAGE BUCKET (photos)
-- ========================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'photos',
  'photos',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic'];

-- Kebijakan Storage: Foto dapat diakses publik via URL terenkripsi/acak
drop policy if exists "Akses baca publik untuk foto" on storage.objects;
create policy "Akses baca publik untuk foto"
  on storage.objects for select
  using (bucket_id = 'photos');

-- Kebijakan Storage: Pengguna hanya boleh upload ke folder ID-nya sendiri
drop policy if exists "Hanya pemilik yang boleh upload foto" on storage.objects;
drop policy if exists "User hanya upload foto ke foldernya sendiri" on storage.objects;
create policy "User hanya upload foto ke foldernya sendiri"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'photos' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Kebijakan Storage: Update hanya file miliknya sendiri
drop policy if exists "Hanya pemilik yang boleh update foto" on storage.objects;
drop policy if exists "User hanya update foto miliknya sendiri" on storage.objects;
create policy "User hanya update foto miliknya sendiri"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'photos' and
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Kebijakan Storage: Hapus hanya file miliknya sendiri
drop policy if exists "Hanya pemilik yang boleh hapus foto" on storage.objects;
drop policy if exists "User hanya hapus foto miliknya sendiri" on storage.objects;
create policy "User hanya hapus foto miliknya sendiri"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'photos' and
    (storage.foldername(name))[1] = auth.uid()::text
  );
