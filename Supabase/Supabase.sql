-- 1) Profiler (1:1 till auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  is_admin boolean default false,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;

-- 2) Properties
create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  location text,
  price_per_night numeric(10,2) not null check (price_per_night >= 0),
  available boolean default true,
  created_at timestamptz default now()
);
alter table public.properties enable row level security;

-- 3) Bookings
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  check_in_date date not null,
  check_out_date date not null,
  total_price numeric(10,2) not null,
  created_at timestamptz default now(),
  constraint chk_dates check (check_out_date > check_in_date)
);
alter table public.bookings enable row level security;

-- Indexer
create index if not exists idx_properties_user on public.properties(user_id);
create index if not exists idx_bookings_user on public.bookings(user_id);
create index if not exists idx_bookings_property on public.bookings(property_id);

-- POLICIES (RLS)

-- profiles
drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles
  for select using (auth.uid() = id);

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- properties
drop policy if exists properties_read_all on public.properties;
create policy properties_read_all on public.properties
  for select using (auth.role() = 'authenticated');

drop policy if exists properties_insert_own on public.properties;
create policy properties_insert_own on public.properties
  for insert with check (user_id = auth.uid());

drop policy if exists properties_update_owner on public.properties;
create policy properties_update_owner on public.properties
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists properties_delete_owner on public.properties;
create policy properties_delete_owner on public.properties
  for delete using (user_id = auth.uid());

-- bookings
drop policy if exists bookings_select_user_or_property_owner on public.bookings;
create policy bookings_select_user_or_property_owner on public.bookings
  for select using (
    user_id = auth.uid() or exists (
      select 1 from public.properties pr where pr.id = property_id and pr.user_id = auth.uid()
    )
  );

drop policy if exists bookings_insert_self on public.bookings;
create policy bookings_insert_self on public.bookings
  for insert with check (user_id = auth.uid());

drop policy if exists bookings_update_owner on public.bookings;
create policy bookings_update_owner on public.bookings
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists bookings_delete_owner on public.bookings;
create policy bookings_delete_owner on public.bookings
  for delete using (user_id = auth.uid());
