import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization,apikey,content-type', 'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS', 'Cache-Control': 'no-store' };
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' } });
const text = (form: FormData, key: string, max: number) => String(form.get(key) ?? '').trim().slice(0, max);
const hash = async (value: BufferSource) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', value))).map(v => v.toString(16).padStart(2, '0')).join('');
const revenue = ['under-100k','100k-200k','200k-500k','500k-1m','1m-3m','over-3m'];
const budgets = ['10k-30k','30k-70k','70k-200k','over-200k'];
const employeeCounts = ['solo','2-4','4-8','8-plus'];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  let uploadedPath = '';
  let db: ReturnType<typeof createClient> | undefined;
  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const modern = Deno.env.get('SUPABASE_SECRET_KEYS');
    const secret = modern ? JSON.parse(modern).default : Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const publicKeys = [Deno.env.get('SUPABASE_ANON_KEY'), ...Object.values(JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') || '{}'))];
    if (!publicKeys.includes(req.headers.get('apikey'))) return json({ error: 'طلب غير مسموح.' }, 401);
    db = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
    const isAdminRoute = new URL(req.url).pathname.endsWith('/admin');
    if (isAdminRoute) {
      const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') || '';
      const { data: auth, error: authError } = await db.auth.getUser(token);
      if (authError || !auth.user) return json({ error: 'سجّل دخولك الأول.' }, 401);
      const { data: member, error: memberError } = await db.from('tw_members').select('role,active').eq('id', auth.user.id).maybeSingle();
      if (memberError || !member?.active || member.role !== 'owner') return json({ error: 'الإدارة متاحة لصاحب الحساب فقط.' }, 403);
      if (req.method === 'GET') {
        const [settings, bookings] = await Promise.all([
          db.from('oa_booking_settings').select('*').eq('id', 1).single(),
          db.from('bookings').select('id,scheduled_at,status,leads(name,whatsapp),project_requests(business_name,consultation_kind)').gte('scheduled_at', new Date().toISOString()).in('status', ['pending','confirmed']).order('scheduled_at').limit(150),
        ]);
        if (settings.error || bookings.error) throw new Error('admin query failed');
        return json({ settings: settings.data, bookings: bookings.data });
      }
      if (req.method === 'PATCH') {
        const body = await req.json();
        const validArray = (value: unknown, limit: number) => Array.isArray(value) && value.length <= limit && value.every(v => Number.isInteger(v) && v >= 0 && v < limit);
        if (typeof body.enabled !== 'boolean' || !validArray(body.days, 7) || !validArray(body.hours, 24)
          || !Array.isArray(body.blocked_dates) || body.blocked_dates.length > 366 || !body.blocked_dates.every((d: unknown) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d)))) return json({ error: 'راجع الأيام والساعات المختارة.' }, 400);
        const { error } = await db.from('oa_booking_settings').update({ enabled: body.enabled, days: [...new Set(body.days)], hours: [...new Set(body.hours)], blocked_dates: [...new Set(body.blocked_dates)] }).eq('id', 1);
        if (error) throw error;
        return json({ ok: true });
      }
      return json({ error: 'طريقة غير متاحة.' }, 405);
    }
    if (req.method === 'GET') {
      const { data, error } = await db.rpc('oa_available_slots');
      if (error) throw error;
      return json({ timezone: 'Africa/Cairo', durationMinutes: 45, slots: data });
    }
    if (req.method !== 'POST') return json({ error: 'طريقة غير متاحة.' }, 405);
    if (Number(req.headers.get('content-length') || 0) > 12 * 1024 * 1024) return json({ error: 'حجم البريف لازم يكون 10 ميجابايت أو أقل.' }, 413);
    const form = await req.formData();
    if (text(form, 'companyWebsiteCheck', 100)) return json({ error: 'راجع بيانات الطلب.' }, 400);
    const data = Object.fromEntries([
      ['name',text(form,'name',100)], ['businessName',text(form,'businessName',150)],
      ['contact',text(form,'contact',30).replace(/[٠-٩۰-۹]/g,c => String(c.charCodeAt(0) >= 1776 ? c.charCodeAt(0)-1776 : c.charCodeAt(0)-1632))],
      ['instagram',text(form,'instagram',300)],['website',text(form,'website',500)],
      ['business',text(form,'business',3000)],['problemsAndTools',text(form,'problemsAndTools',5000)],['attempts',text(form,'attempts',3000)],['help',text(form,'help',3000)],
      ['revenue',text(form,'revenue',30)],['budget',text(form,'budget',30)],['employees',text(form,'employees',20)],['kind',text(form,'kind',10)],['mode',text(form,'mode',10)],
    ]);
    if (data.name.length < 2 || !data.businessName || !/^[+0-9 .\-]{7,30}$/.test(data.contact) || data.contact.replace(/\D/g,'').length > 15
      || !['intro','audit'].includes(data.kind) || !['manual','brief'].includes(data.mode) || !revenue.includes(data.revenue) || !budgets.includes(data.budget) || !employeeCounts.includes(data.employees)
      || (data.mode === 'manual' && (!data.business || !data.problemsAndTools || !data.attempts))) return json({ error: 'كمّل البيانات المطلوبة بشكل صحيح.' }, 400);
    if (data.website) { try { if (!['https:','http:'].includes(new URL(data.website).protocol)) throw 0; } catch { return json({ error: 'راجع لينك الويب سايت.' },400); } }
    const slot = text(form, 'slot', 40), token = text(form, 'token', 36);
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token) || Number.isNaN(Date.parse(slot))) return json({ error: 'اختار موعد صالح.' }, 400);
    const file = form.get('briefFile');
    if (data.mode === 'brief' && (!(file instanceof File) || !file.size)) return json({ error: 'اختار ملف البريف.' },400);
    if (file instanceof File && file.size > 10 * 1024 * 1024) return json({ error: 'حجم البريف لازم يكون 10 ميجابايت أو أقل.' },413);
    let fileMeta = null, fileHash = '';
    if (data.mode === 'brief' && file instanceof File) {
      const bytes = await file.arrayBuffer();
      fileHash = await hash(bytes);
      uploadedPath = `personal-site/${token}/${crypto.randomUUID()}`;
      const { error } = await db.storage.from('omar-briefs').upload(uploadedPath, bytes, { contentType: 'application/octet-stream', upsert: false });
      if (error) throw error;
      fileMeta = { name: file.name.slice(0,255), type: file.type || 'application/octet-stream', size: file.size, path: uploadedPath };
    }
    const fingerprint = await hash(new TextEncoder().encode(JSON.stringify({ data, slot, fileHash })));
    const { data: booking, error } = await db.rpc('oa_confirm_booking', { p_token: token, p_fingerprint: fingerprint, p_slot: slot, p_data: data, p_file: fileMeta });
    if (error) {
      if (uploadedPath) await db.storage.from('omar-briefs').remove([uploadedPath]);
      uploadedPath = '';
      if (error.code === '23505' || error.message?.includes('OA_SLOT_UNAVAILABLE')) return json({ error: 'الموعد ده اتحجز دلوقتي. اختار موعد تاني.', code: 'slot_taken' },409);
      if (error.message?.includes('OA_BOOKING_LIMIT')) return json({ error: 'عندك حجوزات قائمة بالفعل. تواصل معانا لتعديلها.' },429);
      if (error.message?.includes('OA_INVALID_RETRY')) return json({ error: 'البيانات اتغيّرت. حدّث الصفحة وجرّب تاني.' },409);
      throw error;
    }
    if (booking.replayed && uploadedPath) await db.storage.from('omar-briefs').remove([uploadedPath]);
    uploadedPath = '';
    return json({ ok: true, booking: { id: booking.id, scheduledAt: booking.scheduledAt, durationMinutes: 45, timezone: 'Africa/Cairo' } },201);
  } catch (error) {
    if (uploadedPath && db) await db.storage.from('omar-briefs').remove([uploadedPath]).catch(() => {});
    console.error('omar-booking request failed', error instanceof Error ? error.message : 'unknown error');
    return json({ error: 'تعذّر إتمام الطلب. جرّب تاني بعد لحظات.' },500);
  }
});
