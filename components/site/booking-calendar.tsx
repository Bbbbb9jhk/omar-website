'use client';
import { useEffect, useRef, useState } from 'react';
import Link from '@/lib/navigation';
import { BOOKING_ENDPOINT, BOOKING_HEADERS, bookingDateLabel, bookingTimeLabel, type BookingSlot } from '@/lib/booking-config';

export function BookingCalendar({ active, getSubmission, onComplete, onBusyChange }: { active: boolean; getSubmission: () => FormData; onComplete: () => void; onBusyChange: (busy: boolean) => void }) {
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [date, setDate] = useState('');
  const [selected, setSelected] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<{ id: string; scheduledAt: string; name: string } | null>(null);
  const [consent, setConsent] = useState(false);
  const token = useRef('');
  const sendingLock = useRef(false);
  const successRef = useRef<HTMLHeadingElement>(null);
  async function refresh(signal?: AbortSignal) {
    setLoading(true); setError('');
    try {
      const response = await fetch(BOOKING_ENDPOINT, { headers: BOOKING_HEADERS, signal, cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'تعذّر تحميل المواعيد.');
      setSlots(data.slots); return data.slots as BookingSlot[];
    } catch (err) {
      if (signal?.aborted) return;
      setError(err instanceof Error ? err.message : 'تعذّر تحميل المواعيد.'); return null;
    } finally { if (!signal?.aborted) setLoading(false); }
  }
  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    setSelected(''); void refresh(controller.signal);
    return () => controller.abort();
  }, [active]);
  useEffect(() => { if (receipt) successRef.current?.focus(); }, [receipt]);
  const dates = [...new Set(slots.map(slot => slot.local_date))];
  const visibleDate = dates.includes(date) ? date : dates[0] || '';
  async function confirm() {
    if (sendingLock.current || !selected || !consent) return;
    sendingLock.current = true; setSending(true); onBusyChange(true); setError('');
    const form = getSubmission();
    if (!token.current) token.current = crypto.randomUUID();
    form.set('slot', selected); form.set('token', token.current);
    try {
      const response = await fetch(BOOKING_ENDPOINT, { method: 'POST', headers: BOOKING_HEADERS, body: form });
      const data = await response.json();
      if (!response.ok) {
        if (data.code === 'slot_taken') { setSelected(''); token.current = ''; await refresh(); }
        throw new Error(data.error || 'تعذّر تأكيد الحجز.');
      }
      setReceipt({ ...data.booking, name: String(form.get('name') || '') }); onComplete();
    } catch (err) { setError(err instanceof Error ? err.message : 'تعذّر الاتصال. جرّب تاني بنفس الموعد.'); }
    finally { sendingLock.current = false; setSending(false); onBusyChange(false); }
  }
  if (receipt) return <section className="booking-thanks" role="status"><span aria-hidden="true" className="thanks-check">✓</span><h2 tabIndex={-1} ref={successRef}>شكرًا ليك يا {receipt.name}!</h2><p>حجزك اتأكد. هنتواصل معاك على واتساب بخصوص تفاصيل المكالمة.</p><p className="receipt-time">{bookingDateLabel(new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Cairo'}).format(new Date(receipt.scheduledAt)))} · {bookingTimeLabel(receipt.scheduledAt)}</p><p>مدة الجلسة 45 دقيقة · بتوقيت القاهرة</p><small>رقم الحجز: <bdi>{receipt.id}</bdi></small><Link href="/" className="text-link">ارجع للرئيسية ←</Link></section>;
  return <div className="calendar-picker">
    <p className="calendar-meta">مدة الجلسة 45 دقيقة · كل المواعيد بتوقيت القاهرة</p>
    {loading ? <p role="status">جاري تحميل المواعيد المتاحة…</p> : null}
    {error ? <div className="calendar-error" role="alert"><p>{error}</p><button type="button" className="text-link" disabled={sending || loading} onClick={() => void refresh()}>تحديث المواعيد</button></div> : null}
    {!loading && !dates.length && !error ? <p className="calendar-empty">مفيش مواعيد متاحة حاليًا. جرّب تزورنا مرة تانية قريبًا.</p> : null}
    {dates.length ? <><h3>اختار اليوم</h3><div className="calendar-days">{dates.map(day => <button key={day} type="button" disabled={sending} aria-pressed={visibleDate === day} onClick={() => { setDate(day); setSelected(''); }}>{bookingDateLabel(day)}</button>)}</div><h3>اختار الساعة</h3><div className="calendar-times">{slots.filter(slot => slot.local_date === visibleDate).map(slot => <button key={slot.scheduled_at} type="button" disabled={sending} aria-pressed={selected === slot.scheduled_at} onClick={() => { setSelected(slot.scheduled_at); setError(''); }}>{bookingTimeLabel(slot.scheduled_at)}</button>)}</div><label className="consent"><input type="checkbox" checked={consent} disabled={sending} onChange={event => setConsent(event.target.checked)} /><span>أوافق على حفظ بياناتي والبريف والتواصل معايا بخصوص الحجز، وفق <Link href="/privacy">سياسة الخصوصية</Link>.</span></label><button type="button" className="button calendar-confirm" disabled={!selected || !consent || sending || loading} onClick={() => void confirm()}>{sending ? 'جاري تأكيد الحجز…' : 'تأكيد الحجز'}</button></> : null}
  </div>;
}
