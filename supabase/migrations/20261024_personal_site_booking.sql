create table public.oa_booking_settings (
  id integer primary key check (id = 1),
  enabled boolean not null default true,
  timezone text not null default 'Africa/Cairo' check (timezone = 'Africa/Cairo'),
  days integer[] not null default array[0,1,2,3,4,5,6] check (days <@ array[0,1,2,3,4,5,6]),
  hours integer[] not null default array[10,11,12,13,14,15,16] check (hours <@ array[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]),
  blocked_dates date[] not null default '{}',
  horizon_days integer not null default 30 check (horizon_days between 1 and 90),
  notice_minutes integer not null default 120 check (notice_minutes between 0 and 10080)
);
insert into public.oa_booking_settings(id) values (1);
alter table public.oa_booking_settings enable row level security;
revoke all on public.oa_booking_settings from anon, authenticated;
grant all on public.oa_booking_settings to service_role;

alter table public.project_requests
  add column business_name text,
  add column project_budget text,
  add column employee_count text,
  add column business_details text,
  add column problems_and_tools text,
  add column previous_attempts text,
  add column requested_help text,
  add column consultation_kind text;

create table public.oa_booking_receipts (
  token uuid primary key,
  fingerprint text not null,
  booking_id uuid not null references public.bookings(id),
  created_at timestamptz not null default now()
);
alter table public.oa_booking_receipts enable row level security;
revoke all on public.oa_booking_receipts from anon, authenticated;
grant all on public.oa_booking_receipts to service_role;

insert into storage.buckets(id,name,public,file_size_limit)
values ('omar-briefs','omar-briefs',false,10485760);

create function public.oa_available_slots()
returns table(scheduled_at timestamptz, local_date text, local_time text)
language sql stable security definer set search_path = '' as $$
  select t.at_time, to_char(t.at_time at time zone s.timezone,'YYYY-MM-DD'), to_char(t.at_time at time zone s.timezone,'HH24:MI')
  from public.oa_booking_settings s
  cross join lateral generate_series(0,s.horizon_days) d(n)
  cross join lateral unnest(s.hours) h(hour)
  cross join lateral (select (((now() at time zone s.timezone)::date+d.n)::timestamp + make_interval(hours=>h.hour)) at time zone s.timezone as at_time) t
  where s.id=1 and s.enabled
    and extract(dow from t.at_time at time zone s.timezone)::integer = any(s.days)
    and not ((t.at_time at time zone s.timezone)::date = any(s.blocked_dates))
    and t.at_time > now()+make_interval(mins=>s.notice_minutes)
    and not exists(select 1 from public.bookings b where b.status in ('pending','confirmed')
      and b.scheduled_at < t.at_time+interval '45 minutes' and b.scheduled_at+interval '45 minutes' > t.at_time)
  order by t.at_time;
$$;
revoke all on function public.oa_available_slots() from public, anon, authenticated;
grant execute on function public.oa_available_slots() to service_role;

create function public.oa_confirm_booking(p_token uuid,p_fingerprint text,p_slot timestamptz,p_data jsonb,p_file jsonb default null)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  existing public.oa_booking_receipts;
  lead_uuid uuid;
  request_uuid uuid;
  booking_uuid uuid;
  phone text;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_token::text,0));
  select * into existing from public.oa_booking_receipts where token=p_token;
  if found then
    if existing.fingerprint<>p_fingerprint then raise exception 'OA_INVALID_RETRY'; end if;
    return jsonb_build_object('id',existing.booking_id,'scheduledAt',(select scheduled_at from public.bookings where id=existing.booking_id),'replayed',true);
  end if;
  perform pg_advisory_xact_lock(hashtextextended('oa-slot-'||p_slot::text,0));
  if not exists(select 1 from public.oa_available_slots() a where a.scheduled_at=p_slot) then raise exception 'OA_SLOT_UNAVAILABLE'; end if;
  if length(trim(p_data->>'name')) not between 2 and 100 or length(trim(p_data->>'businessName')) not between 1 and 150
    or p_data->>'kind' not in ('intro','audit') or p_data->>'mode' not in ('manual','brief') then raise exception 'OA_INVALID_DATA'; end if;
  phone:=regexp_replace(p_data->>'contact','[^0-9]','','g');
  if length(phone) not between 7 and 15 then raise exception 'OA_INVALID_DATA'; end if;
  perform pg_advisory_xact_lock(hashtextextended('oa-phone-'||phone,0));
  select id into lead_uuid from public.leads where whatsapp_normalized=phone;
  if lead_uuid is null then
    insert into public.leads(name,whatsapp,instagram,website,source,status)
    values (trim(p_data->>'name'),p_data->>'contact',nullif(p_data->>'instagram',''),nullif(p_data->>'website',''),'omar_website','meeting_booked') returning id into lead_uuid;
  end if;
  if (select count(*) from public.bookings where lead_id=lead_uuid and status in ('pending','confirmed') and scheduled_at>now())>=3 then raise exception 'OA_BOOKING_LIMIT'; end if;
  insert into public.project_requests(lead_id,submission_mode,monthly_revenue,service_needed,goals,additional_notes,business_name,project_budget,employee_count,business_details,problems_and_tools,previous_attempts,requested_help,consultation_kind)
  values(lead_uuid,p_data->>'mode',p_data->>'revenue',p_data->>'kind',nullif(p_data->>'problemsAndTools',''),nullif(p_data->>'help',''),p_data->>'businessName',p_data->>'budget',p_data->>'employees',nullif(p_data->>'business',''),nullif(p_data->>'problemsAndTools',''),nullif(p_data->>'attempts',''),nullif(p_data->>'help',''),p_data->>'kind') returning id into request_uuid;
  insert into public.bookings(lead_id,project_request_id,scheduled_at,timezone,status,notes)
  values(lead_uuid,request_uuid,p_slot,'Africa/Cairo','confirmed','جلسة 45 دقيقة · موقع عمر أيمن') returning id into booking_uuid;
  if p_file is not null then
    insert into public.uploaded_files(lead_id,project_request_id,file_name,file_type,file_size,storage_bucket,storage_path)
    values(lead_uuid,request_uuid,p_file->>'name',p_file->>'type',(p_file->>'size')::bigint,'omar-briefs',p_file->>'path');
  end if;
  insert into public.oa_booking_receipts(token,fingerprint,booking_id) values(p_token,p_fingerprint,booking_uuid);
  return jsonb_build_object('id',booking_uuid,'scheduledAt',p_slot,'replayed',false);
end;
$$;
revoke all on function public.oa_confirm_booking(uuid,text,timestamptz,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.oa_confirm_booking(uuid,text,timestamptz,jsonb,jsonb) to service_role;
