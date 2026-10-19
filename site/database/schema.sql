-- Only additive objects in the dedicated restaurant schema.
-- Keep this schema out of the Data API exposed schemas.
create schema restaurant;
revoke all on schema restaurant from public, anon, authenticated;

create table restaurant.leads (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  place text not null check (char_length(btrim(place)) between 5 and 300),
  meal_type text not null check (meal_type in ('hot','hot_soup','hot_soup_snack')),
  people integer not null check (people between 1 and 1000),
  contact text not null check (char_length(contact) between 3 and 150),
  contact_name text not null default '' check (char_length(contact_name) <= 100),
  notes text not null default '' check (char_length(notes) <= 1500),
  locale text not null check (locale in ('pl','ru','uk')),
  consent_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new','contacted','qualified','closed','test')),
  notification_status text not null default 'placeholder' check (notification_status in ('placeholder','pending','sent','failed')),
  payload_hash text not null check (payload_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now()
);
create index leads_status_created_idx on restaurant.leads (status, created_at desc);
alter table restaurant.leads enable row level security;
revoke all on restaurant.leads from public, anon, authenticated;

create table restaurant.rate_limits (
  bucket text primary key check (char_length(bucket) <= 160),
  window_start timestamptz not null,
  attempts integer not null check (attempts > 0)
);
alter table restaurant.rate_limits enable row level security;
revoke all on restaurant.rate_limits from public, anon, authenticated;

create function restaurant.submit_lead(
  p_request_id uuid, p_place text, p_meal_type text, p_people integer,
  p_contact text, p_name text, p_notes text, p_locale text,
  p_payload_hash text, p_network_key text, p_contact_key text
) returns jsonb
language plpgsql security invoker
set search_path = ''
as $$
declare
  existing restaurant.leads%rowtype;
  saved_id uuid;
  attempts_now integer;
  this_hour timestamptz := date_trunc('hour', now());
  k text;
  cap integer;
begin
  if p_network_key !~ '^[a-f0-9]{64}$' or p_contact_key !~ '^[a-f0-9]{64}$' then
    raise exception 'invalid_bucket' using errcode = '22023';
  end if;
  -- A retry of the same payload is safe, including concurrent browser retries.
  perform pg_advisory_xact_lock(hashtextextended(p_request_id::text, 0));
  select * into existing from restaurant.leads where request_id = p_request_id;
  if found then
    if existing.payload_hash <> p_payload_hash then
      raise exception 'idempotency_conflict' using errcode = '22023';
    end if;
    return jsonb_build_object('id', existing.id, 'repeated', true);
  end if;
  -- Persistent counters work across server/edge instances. No raw IP is retained.
  for k, cap in select 'network:' || p_network_key, 60 union all select 'contact:' || p_contact_key, 5 loop
    insert into restaurant.rate_limits(bucket, window_start, attempts)
    values (k, this_hour, 1)
    on conflict (bucket) do update
      set window_start = excluded.window_start,
          attempts = case when restaurant.rate_limits.window_start = excluded.window_start
                          then restaurant.rate_limits.attempts + 1 else 1 end
    returning attempts into attempts_now;
    if attempts_now > cap then raise exception 'rate_limited' using errcode = 'P0001'; end if;
  end loop;
  delete from restaurant.rate_limits where window_start < now() - interval '2 days';
  insert into restaurant.leads(request_id,place,meal_type,people,contact,contact_name,notes,locale,payload_hash)
  values(p_request_id,p_place,p_meal_type,p_people,p_contact,p_name,p_notes,p_locale,p_payload_hash)
  returning id into saved_id;
  return jsonb_build_object('id',saved_id,'repeated',false);
end;
$$;
revoke all on function restaurant.submit_lead(uuid,text,text,integer,text,text,text,text,text,text,text) from public, anon, authenticated;
comment on schema restaurant is 'Syty Mruczek lead capture. Private schema; server access only.';
