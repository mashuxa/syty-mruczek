-- Additive migration: private admin access and daily, cookie-free visit estimates.
create index leads_created_id_idx on restaurant.leads(created_at desc,id desc);
create table restaurant.visits (
 visit_day date not null,
 visitor_key text not null check(visitor_key ~ '^[a-f0-9]{64}$'),
 first_path text not null check(first_path in ('/','/ru','/uk')),
 last_path text not null check(last_path in ('/','/ru','/uk')),
 locale text not null check(locale in ('pl','ru','uk')),
 page_views integer not null default 1 check(page_views>0),
 first_seen timestamptz not null default now(),
 last_seen timestamptz not null default now(),
 primary key(visit_day,visitor_key)
);
alter table restaurant.visits enable row level security;
revoke all on restaurant.visits from public,anon,authenticated;
comment on table restaurant.visits is 'Daily approximate uniques. Key is a rotating HMAC of day, IP and user-agent; raw IP and user-agent are not stored. Known bots filtered at API.';

create function restaurant.consume_admin_login(p_key text) returns boolean
language plpgsql security invoker set search_path='' as $$
declare k text; cap integer; used integer;
 window_now timestamptz := date_trunc('hour',now()) + floor(extract(minute from now())/15)*interval '15 minutes';
begin
 if p_key !~ '^[a-f0-9]{64}$' then return false; end if;
 for k,cap in select 'login:'||p_key,10 union all select 'login:global',100 loop
  insert into restaurant.rate_limits(bucket,window_start,attempts) values(k,window_now,1)
  on conflict(bucket) do update set window_start=excluded.window_start,
   attempts=case when restaurant.rate_limits.window_start=excluded.window_start then least(restaurant.rate_limits.attempts+1,101) else 1 end
  returning attempts into used;
  if used>cap then return false; end if;
 end loop;
 return true;
end; $$;
revoke all on function restaurant.consume_admin_login(text) from public,anon,authenticated;

create function restaurant.record_visit(p_key text,p_day date,p_path text,p_locale text,p_network text) returns boolean
language plpgsql security invoker set search_path='' as $$
declare used integer;
begin
 if p_key !~ '^[a-f0-9]{64}$' or p_network !~ '^[a-f0-9]{64}$' or p_day<>(now() at time zone 'Europe/Warsaw')::date then return false; end if;
 insert into restaurant.rate_limits(bucket,window_start,attempts) values('visit:'||p_network,date_trunc('hour',now()),1)
 on conflict(bucket) do update set window_start=excluded.window_start,
 attempts=case when restaurant.rate_limits.window_start=excluded.window_start then least(restaurant.rate_limits.attempts+1,121) else 1 end
 returning attempts into used;
 if used>120 then return false; end if;
 insert into restaurant.visits(visit_day,visitor_key,first_path,last_path,locale) values(p_day,p_key,p_path,p_path,p_locale)
 on conflict(visit_day,visitor_key) do update set last_seen=now(),last_path=excluded.last_path,locale=excluded.locale,page_views=least(restaurant.visits.page_views+1,1000000);
 return true;
end; $$;
revoke all on function restaurant.record_visit(text,date,text,text,text) from public,anon,authenticated;
