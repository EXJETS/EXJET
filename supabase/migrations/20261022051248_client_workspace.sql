begin;
create table public.portal_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 100),
  company text not null default '' check (char_length(company) <= 120),
  travel_role text not null default 'traveler' check (travel_role in ('traveler','executive_assistant','family_office','corporate_team')),
  created_at timestamptz not null default now()
);
comment on column public.portal_profiles.travel_role is 'Presentation preference only. Never grants authorization.';
create table public.portal_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  airport_code text not null check (airport_code ~ '^[A-Z0-9]{3,4}$'),
  label text not null check (char_length(label) between 2 and 100),
  created_at timestamptz not null default now(),
  unique (user_id, airport_code)
);
create table public.portal_trip_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  departure text not null check (departure ~ '^[A-Z0-9]{3,4}$'),
  arrival text not null check (arrival ~ '^[A-Z0-9]{3,4}$'),
  departure_date date not null,
  passengers integer not null check (passengers between 1 and 100),
  notes text not null default '' check (char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  check (departure <> arrival)
);
create index portal_trip_drafts_owner_date on public.portal_trip_drafts(user_id, departure_date);
create table public.portal_confirmed_trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reference text not null unique,
  departure text not null,
  arrival text not null,
  departure_at timestamptz not null,
  status text not null check (status in ('scheduled','completed','cancelled')),
  aircraft text,
  operator_name text,
  created_at timestamptz not null default now()
);
comment on table public.portal_confirmed_trips is 'Verified operations records only. Clients cannot create or modify bookings.';
create index portal_confirmed_trips_owner_date on public.portal_confirmed_trips(user_id, departure_at);
create table public.portal_staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
comment on table public.portal_staff is 'Administrative provisioning only. No client insert, update or delete grant.';
create table public.portal_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  direction text not null default 'customer' check (direction in ('customer','advisor')),
  body text not null check (char_length(body) between 2 and 4000),
  created_at timestamptz not null default now()
);
create index portal_messages_owner_date on public.portal_messages(user_id, created_at);

alter table public.portal_profiles enable row level security;
alter table public.portal_locations enable row level security;
alter table public.portal_trip_drafts enable row level security;
alter table public.portal_confirmed_trips enable row level security;
alter table public.portal_staff enable row level security;
alter table public.portal_messages enable row level security;

create policy profile_read on public.portal_profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy profile_insert on public.portal_profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy profile_update on public.portal_profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy location_read on public.portal_locations for select to authenticated using ((select auth.uid()) = user_id);
create policy location_insert on public.portal_locations for insert to authenticated with check ((select auth.uid()) = user_id);
create policy location_update on public.portal_locations for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy location_delete on public.portal_locations for delete to authenticated using ((select auth.uid()) = user_id);
create policy draft_read on public.portal_trip_drafts for select to authenticated using ((select auth.uid()) = user_id);
create policy draft_insert on public.portal_trip_drafts for insert to authenticated with check ((select auth.uid()) = user_id);
create policy draft_delete on public.portal_trip_drafts for delete to authenticated using ((select auth.uid()) = user_id);
create policy confirmed_trip_read on public.portal_confirmed_trips for select to authenticated using ((select auth.uid()) = user_id);
create policy staff_self_read on public.portal_staff for select to authenticated using ((select auth.uid()) = user_id);
create policy message_read on public.portal_messages for select to authenticated using (
  (select auth.uid()) = user_id or exists (select 1 from public.portal_staff where user_id = (select auth.uid()))
);
create policy message_insert on public.portal_messages for insert to authenticated with check (
  ((select auth.uid()) = user_id and direction = 'customer') or
  (direction = 'advisor' and exists (select 1 from public.portal_staff where user_id = (select auth.uid())))
);

revoke all on public.portal_profiles, public.portal_locations, public.portal_trip_drafts, public.portal_confirmed_trips, public.portal_staff, public.portal_messages from anon, authenticated;
grant select on public.portal_profiles, public.portal_locations, public.portal_trip_drafts, public.portal_confirmed_trips, public.portal_staff, public.portal_messages to authenticated;
grant insert(user_id,full_name,company,travel_role), update(user_id,full_name,company,travel_role) on public.portal_profiles to authenticated;
grant insert(user_id,airport_code,label), update(user_id,airport_code,label), delete on public.portal_locations to authenticated;
grant insert(user_id,departure,arrival,departure_date,passengers,notes), delete on public.portal_trip_drafts to authenticated;
grant insert(user_id,direction,body) on public.portal_messages to authenticated;
grant all on public.portal_profiles, public.portal_locations, public.portal_trip_drafts, public.portal_confirmed_trips, public.portal_staff, public.portal_messages to service_role;
commit;
