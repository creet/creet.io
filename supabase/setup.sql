-- ==============================================================================
-- Creet.io - Complete Supabase Setup Script
-- ==============================================================================
-- Description: This script sets up the full backend schema including tables for
-- projects, forms, customers, testimonials, walls, widgets, and user profiles.
-- It also enables RLS, creates performance indexes, and configures storage.
-- ==============================================================================

-- 1. Extensions
create extension if not exists "uuid-ossp";

-- 2. Tables
-- ------------------------------------------------------------------------------

-- PROFILES: Extends auth.users with app-specific data
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  provider text default 'email'::text,
  plan text default 'free'::text,
  active_project_id uuid, -- Reference to projects(id) added later to avoid circular dependency issues during creation
  created_at timestamp with time zone default timezone('utc'::text, now()) not null, -- keeping existing default for consistency
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PROJECTS: Top-level grouping
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  brand_settings jsonb default '{}'::jsonb, -- Stores logo, colors, fonts
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add foreign key for active_project_id now that projects table exists
alter table public.profiles 
  add constraint fk_profiles_active_project 
  foreign key (active_project_id) references public.projects(id) on delete set null;

-- FORMS: Configuration for testimonial collection
create table if not exists public.forms (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  name text not null,
  settings jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CUSTOMERS: People who submit testimonials
create table if not exists public.customers (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  email text,
  full_name text,
  headline text,
  company_details jsonb default '{}'::jsonb,
  social_profiles jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(project_id, email)
);

-- TESTIMONIALS: The core content
create table if not exists public.testimonials (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  customer_id uuid references public.customers(id) on delete cascade,
  type text not null check (type in ('text', 'video')),
  data jsonb default '{}'::jsonb not null,
  status text default 'hidden' not null,
  tags text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- WALLS: Wall of Love display pages
create table if not exists public.walls (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  name text not null,
  slug text,
  config jsonb default '{}'::jsonb, -- Stores layout, selectedTestimonialIds (merged), etc.
  is_published boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- WIDGETS: Embeddable widgets
create table if not exists public.widgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  name text not null,
  type text not null, -- 'social-card', 'list-feed', etc.
  status text default 'published',
  config jsonb default '{}'::jsonb,
  selected_testimonial_ids text[] default array[]::text[], -- Explicit column for widgets
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Security (Row Level Security)
-- ------------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.forms enable row level security;
alter table public.customers enable row level security;
alter table public.testimonials enable row level security;
alter table public.walls enable row level security;
alter table public.widgets enable row level security;

-- 4. Unified Policies (CRUD)
-- ------------------------------------------------------------------------------

-- Users can manage their own profile
create policy "Users manage their own profile" on public.profiles
  using (auth.uid() = id);

-- Projects
create policy "Users manage their own projects" on public.projects
  using (auth.uid() = user_id);

-- Forms (via Project)
create policy "Users manage forms via project" on public.forms
  using (
    exists (
      select 1 from public.projects
      where projects.id = forms.project_id
      and projects.user_id = auth.uid()
    )
  );

-- Customers (via Project)
create policy "Users manage customers via project" on public.customers
  using (
    exists (
      select 1 from public.projects
      where projects.id = customers.project_id
      and projects.user_id = auth.uid()
    )
  );

-- Testimonials (Direct User)
create policy "Users manage their own testimonials" on public.testimonials
  using (auth.uid() = user_id);

-- Walls (Direct User)
create policy "Users manage their own walls" on public.walls
  using (auth.uid() = user_id);

-- Widgets (Direct User)
create policy "Users manage their own widgets" on public.widgets
  using (auth.uid() = user_id);


-- 5. Performance Indexes
-- ------------------------------------------------------------------------------

create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists idx_projects_user_id on public.projects(user_id);
create index if not exists idx_forms_project_id on public.forms(project_id);
create index if not exists idx_customers_project_id on public.customers(project_id);
create index if not exists idx_testimonials_user_id on public.testimonials(user_id);
create index if not exists idx_testimonials_project_id on public.testimonials(project_id);
create index if not exists idx_testimonials_customer_id on public.testimonials(customer_id);
create index if not exists idx_walls_user_id on public.walls(user_id);
create index if not exists idx_walls_project_id on public.walls(project_id);
create index if not exists idx_widgets_user_id on public.widgets(user_id);
create index if not exists idx_widgets_project_id on public.widgets(project_id);


-- 6. Storage Setup
-- ------------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('assets', 'assets', true)
on conflict (id) do nothing;

create policy "Public Read Access"
  on storage.objects for select
  using ( bucket_id = 'assets' );

create policy "Authenticated Upload Access"
  on storage.objects for insert
  with check ( bucket_id = 'assets' and auth.role() = 'authenticated' );

create policy "Owner Modify Access"
  on storage.objects for update
  using ( bucket_id = 'assets' and auth.uid() = owner );

create policy "Owner Delete Access"
  on storage.objects for delete
  using ( bucket_id = 'assets' and auth.uid() = owner );


-- 7. Triggers (User Creation)
-- ------------------------------------------------------------------------------
-- Automatically create a profile when a new user signs up via Supabase Auth

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop check to prevent error if run multiple times
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
