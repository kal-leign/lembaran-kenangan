-- ========================================================
-- LEMBARAN KENANGAN - SKEMA DATABASE & STORAGE (SUPABASE)
-- ========================================================
-- Jalankan skrip ini di SQL Editor pada dashboard Supabase Anda.
-- ========================================================

-- 1. TABEL FOTO (photos)
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
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

-- Index untuk performa query foto
create index if not exists idx_photos_created_at on public.photos(created_at desc);
create index if not exists idx_photos_memory_date on public.photos(memory_date desc);

-- 2. TABEL CATATAN / PUISI / QUOTES (notes)
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
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

-- Index untuk performa query tulisan
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
-- 3. ROW LEVEL SECURITY (RLS)
-- ========================================================

alter table public.photos enable row level security;
alter table public.notes enable row level security;

-- Hapus kebijakan lama jika ada
drop policy if exists "Izinkan publik melihat foto jika diaktifkan" on public.photos;
drop policy if exists "Hanya pemilik terautentikasi yang boleh mengelola foto" on public.photos;
drop policy if exists "Izinkan publik membaca foto" on public.photos;
drop policy if exists "Izinkan pemilik menambah foto" on public.photos;
drop policy if exists "Izinkan pemilik mengubah foto" on public.photos;
drop policy if exists "Izinkan pemilik menghapus foto" on public.photos;

-- Kebijakan SELECT foto:
-- Dapat dibaca oleh siapa saja (anon & authenticated) untuk mode galeri publik,
-- atau batasi hanya authenticated bila ingin galeri privat murni di tingkat database.
create policy "Izinkan publik membaca foto"
  on public.photos for select
  using (true);

-- Kebijakan INSERT, UPDATE, DELETE foto: Hanya pemilik (authenticated)
create policy "Izinkan pemilik menambah foto"
  on public.photos for insert
  to authenticated
  with check (true);

create policy "Izinkan pemilik mengubah foto"
  on public.photos for update
  to authenticated
  using (true)
  with check (true);

create policy "Izinkan pemilik menghapus foto"
  on public.photos for delete
  to authenticated
  using (true);

-- Kebijakan SELECT tulisan:
drop policy if exists "Izinkan publik membaca catatan" on public.notes;
drop policy if exists "Izinkan pemilik menambah catatan" on public.notes;
drop policy if exists "Izinkan pemilik mengubah catatan" on public.notes;
drop policy if exists "Izinkan pemilik menghapus catatan" on public.notes;

create policy "Izinkan publik membaca catatan"
  on public.notes for select
  using (true);

-- Kebijakan INSERT, UPDATE, DELETE tulisan: Hanya pemilik (authenticated)
create policy "Izinkan pemilik menambah catatan"
  on public.notes for insert
  to authenticated
  with check (true);

create policy "Izinkan pemilik mengubah catatan"
  on public.notes for update
  to authenticated
  using (true)
  with check (true);

create policy "Izinkan pemilik menghapus catatan"
  on public.notes for delete
  to authenticated
  using (true);

-- ========================================================
-- 4. STORAGE BUCKET (photos)
-- ========================================================
-- Buat bucket 'photos' publik untuk menyimpan file foto kenangan
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'photos',
  'photos',
  true,
  5242880, -- 5 MB (5 * 1024 * 1024)
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic'];

-- Kebijakan Storage: Siapa pun bisa melihat foto publik
drop policy if exists "Akses baca publik untuk foto" on storage.objects;
create policy "Akses baca publik untuk foto"
  on storage.objects for select
  using (bucket_id = 'photos');

-- Kebijakan Storage: Hanya pemilik terautentikasi yang boleh upload
drop policy if exists "Hanya pemilik yang boleh upload foto" on storage.objects;
create policy "Hanya pemilik yang boleh upload foto"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'photos');

-- Kebijakan Storage: Hanya pemilik terautentikasi yang boleh update foto
drop policy if exists "Hanya pemilik yang boleh update foto" on storage.objects;
create policy "Hanya pemilik yang boleh update foto"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'photos');

-- Kebijakan Storage: Hanya pemilik terautentikasi yang boleh hapus foto
drop policy if exists "Hanya pemilik yang boleh hapus foto" on storage.objects;
create policy "Hanya pemilik yang boleh hapus foto"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'photos');
