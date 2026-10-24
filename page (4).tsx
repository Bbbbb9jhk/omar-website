'use client';
import { useState, type FormEvent } from 'react';
import { BOOKING_ENDPOINT, BOOKING_HEADERS, SUPABASE_URL, SUPABASE_PUBLIC_KEY, bookingDateLabel, bookingTimeLabel } from '@/lib/booking-config';
import type { Metadata } from '@/lib/meta';
export const metadata: Metadata = { title: 'إدارة مواعيد الحجز', description: 'إدارة أيام وساعات الحجز المتاحة.' };
type Settings = { enabled: boolean; days: number[]; hours: number[]; blocked_dates: string[] };
type Booking = { id: string; scheduled_at: string; leads: { name: string; whatsapp: string }; project_requests: { business_name: string; consultation_kind: string } };
const dayNames = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
export default function BookingAdmin() {
  const [token,setToken] = useState('');
  const [settings,setSettings] = useState<Settings | null>(null);
  const [bookings,setBookings] = useState<Booking[]>([]);
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState('');
  const [closedDate,setClosedDate] = useState('');
  async function load(accessToken: string) {
    const response = await fetch(BOOKING_ENDPOINT+'/admin',{headers:{...BOOKING_HEADERS,Authorization:'Bearer '+accessToken},cache:'no-store'});
    const data = await response.json();
    if(!response.ok) throw new Error(data.error || 'تعذّر تحميل الإعدادات.');
    setSettings(data.settings);setBookings(data.bookings);
  }
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();setBusy(true);setMessage('');
    const form = event.currentTarget;
    const values = new FormData(form);
    try {
      const response = await fetch(SUPABASE_URL+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:SUPABASE_PUBLIC_KEY,'Content-Type':'application/json'},body:JSON.stringify({email:values.get('email'),password:values.get('password')})});
      const data = await response.json();
      if(!response.ok) throw new Error('راجع الإيميل وكلمة السر.');
      await load(data.access_token);setToken(data.access_token);form.reset();
    } catch(error) {setMessage(error instanceof Error?error.message:'تعذّر تسجيل الدخول.');}
    finally {setBusy(false);}
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();if(!settings)return;setBusy(true);setMessage('');
    try {
      const response = await fetch(BOOKING_ENDPOINT+'/admin',{method:'PATCH',headers:{...BOOKING_HEADERS,Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(settings)});
      const data=await response.json();if(!response.ok)throw new Error(data.error||'تعذّر الحفظ.');
      setMessage('الإعدادات اتحفظت وظهرت للعملاء.');await load(token);
    } catch(error){setMessage(error instanceof Error?error.message:'تعذّر الحفظ.');}
    finally{setBusy(false);}
  }
  function toggle(key:'days'|'hours',value:number) {if(settings)setSettings({...settings,[key]:settings[key].includes(value)?settings[key].filter(v=>v!==value):[...settings[key],value].sort((a,b)=>a-b)});}
  return <section className="container booking-admin"><h1>إدارة مواعيد الحجز</h1><p>جلسة 45 دقيقة، وموعد واحد كل ساعة · توقيت القاهرة</p>{message?<p className="admin-message" role="status">{message}</p>:null}
    {!token?<form onSubmit={login} className="admin-login"><p>ادخل بحساب صاحب المشروع الموجود في Supabase.</p><div className="field"><label htmlFor="admin-email">الإيميل</label><input id="admin-email" name="email" type="email" autoComplete="username" dir="ltr" required /></div><div className="field"><label htmlFor="admin-password">كلمة السر</label><input id="admin-password" name="password" type="password" autoComplete="current-password" required /></div><button className="button" disabled={busy}>{busy?'جاري الدخول…':'دخول'}</button></form>:settings?<><button type="button" className="text-link admin-logout" onClick={()=>{setToken('');setSettings(null);setBookings([]);setMessage('');}}>تسجيل الخروج</button><form onSubmit={save}><fieldset disabled={busy} className="admin-settings"><label className="admin-check"><input type="checkbox" checked={settings.enabled} onChange={e=>setSettings({...settings,enabled:e.target.checked})} />استقبال حجوزات جديدة</label><h2>أيام العمل</h2><div className="admin-checkbox-grid">{dayNames.map((day,i)=><label className="admin-check" key={day}><input type="checkbox" checked={settings.days.includes(i)} onChange={()=>toggle('days',i)} />{day}</label>)}</div><h2>ساعات بداية المواعيد</h2><div className="admin-checkbox-grid admin-hours">{Array.from({length:24},(_,hour)=><label className="admin-check" key={hour}><input type="checkbox" checked={settings.hours.includes(hour)} onChange={()=>toggle('hours',hour)} /><bdi>{String(hour).padStart(2,'0')}:00</bdi></label>)}</div><h2>أيام مقفولة بالكامل</h2><div className="admin-close-date"><input type="date" aria-label="اليوم المطلوب إغلاقه" value={closedDate} onChange={e=>setClosedDate(e.target.value)} /><button type="button" className="button button-small" disabled={!closedDate} onClick={()=>{setSettings({...settings,blocked_dates:[...new Set([...settings.blocked_dates,closedDate])].sort()});setClosedDate('');}}>أضف اليوم</button></div><div className="closed-dates">{settings.blocked_dates.map(day=><button type="button" key={day} onClick={()=>setSettings({...settings,blocked_dates:settings.blocked_dates.filter(d=>d!==day)})}>{day} · إزالة ×</button>)}</div><button className="button" type="submit">{busy?'جاري الحفظ…':'حفظ المواعيد'}</button></fieldset></form><h2>الحجوزات القادمة</h2><div className="admin-bookings">{bookings.length?bookings.map(booking=><article key={booking.id}><h3>{booking.leads?.name}</h3><p>{booking.project_requests?.business_name} · {booking.project_requests?.consultation_kind==='audit'?'استشارة':'مكالمة'}</p><p>{bookingDateLabel(new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Cairo'}).format(new Date(booking.scheduled_at)))} · {bookingTimeLabel(booking.scheduled_at)}</p><bdi>{booking.leads?.whatsapp}</bdi></article>):<p>مفيش حجوزات قادمة.</p>}</div></>:null}
  </section>;
}
