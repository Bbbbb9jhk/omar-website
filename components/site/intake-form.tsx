'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { type IntakeKind } from '@/lib/intake';
import Link from '@/lib/navigation';
import { BookingCalendar } from './booking-calendar';

const revenueOptions = [
  ['under-100k', 'أقل من 100 ألف'],
  ['100k-200k', 'من 100 ألف إلى 200 ألف'],
  ['200k-500k', 'من 200 ألف إلى 500 ألف'],
  ['500k-1m', 'من 500 ألف إلى مليون'],
  ['1m-3m', 'من مليون إلى 3 ملايين'],
  ['over-3m', 'أكثر من 3 ملايين'],
];
const budgetOptions = [
  ['10k-30k', 'من 10 آلاف إلى 30 ألف'],
  ['30k-70k', 'من 30 ألف إلى 70 ألف'],
  ['70k-200k', 'من 70 ألف إلى 200 ألف'],
  ['over-200k', 'أكثر من 200 ألف'],
];
const stepTitles = ['بياناتك', 'بيانات البزنس', 'اختيار موعد'];

export function IntakeForm({ kind }: { kind: IntakeKind; showNotice?: boolean }) {
  const [step, setStep] = useState(1);
  const [briefMode, setBriefMode] = useState<'manual' | 'file'>('manual');
  const [fileName, setFileName] = useState('');
  const [complete, setComplete] = useState(false);
  const [bookingBusy, setBookingBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(1);
  useEffect(() => {
    if (previousStep.current !== step) titleRef.current?.focus();
    previousStep.current = step;
  }, [step]);
  function continueForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < 3 && formRef.current?.reportValidity()) setStep(step + 1);
  }
  function getSubmission() {
    const data = new FormData();
    for (const name of ['name','businessName','contact','instagram','website','revenue','budget','employees','business','problemsAndTools','attempts','help','companyWebsiteCheck']) {
      const field = formRef.current?.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[name="${name}"]`);
      if (field && (briefMode === 'manual' || !['business','problemsAndTools','attempts','help'].includes(name))) data.set(name, field.value);
    }
    data.set('kind', kind); data.set('mode', briefMode === 'file' ? 'brief' : 'manual');
    if (briefMode === 'file' && fileRef.current?.files?.[0]) data.set('briefFile', fileRef.current.files[0]);
    return data;
  }
  return <form className="intake-form booking-wizard" ref={formRef} aria-label={kind === 'intro' ? 'حجز مكالمة' : 'حجز استشارة'} onSubmit={continueForm}>
    <div className="booking-topline"><Link href="/" className="back-link">→ الرئيسية</Link><ol className="booking-progress" aria-label="خطوات الحجز">{stepTitles.map((title, index) => <li key={title} aria-current={step === index + 1 ? 'step' : undefined} className={step > index + 1 ? 'is-complete' : ''}><span aria-hidden="true">{index + 1}</span>{title}</li>)}</ol></div>
    <h2 className={step === 1 || complete ? 'visually-hidden' : 'booking-step-title'} ref={titleRef} tabIndex={-1}>{stepTitles[step - 1]}</h2>
    <div className="visually-hidden" aria-hidden="true"><label>اترك الحقل ده فاضي<input name="companyWebsiteCheck" tabIndex={-1} autoComplete="off" /></label></div>
    <fieldset className="booking-step" hidden={step !== 1} disabled={step !== 1}>
      <legend className="visually-hidden">بيانات العميل</legend>
      <div className="form-grid first-step-grid">
        <div className="field"><label htmlFor={`${kind}-business-name`}>اسم البزنس</label><input id={`${kind}-business-name`} name="businessName" autoComplete="organization" maxLength={150} placeholder="اسم البزنس بتاعك" required /></div>
        <div className="field"><label htmlFor={`${kind}-name`}>اسمك</label><input id={`${kind}-name`} name="name" autoComplete="name" maxLength={100} placeholder="اسمك بالكامل" required /></div>
        <div className="field"><label htmlFor={`${kind}-contact`}>رقم واتساب</label><input id={`${kind}-contact`} name="contact" type="tel" dir="ltr" autoComplete="tel" maxLength={30} minLength={7} pattern="[+0-9٠-٩۰-۹ .\-]{7,30}" title="اكتب رقم واتساب صحيح بكود الدولة" placeholder="+20 …" required /></div>
        <div className="field"><label htmlFor={`${kind}-instagram`}>حساب إنستجرام <span className="optional">اختياري</span></label><input id={`${kind}-instagram`} name="instagram" type="text" dir="ltr" autoCapitalize="none" spellCheck={false} maxLength={300} placeholder="@username" aria-describedby={`${kind}-instagram-help`} /><small id={`${kind}-instagram-help`}>ممكن تكتب اليوزرنيم أو لينك الحساب.</small></div>
        <div className="field"><label htmlFor={`${kind}-website`}>الويب سايت <span className="optional">اختياري</span></label><input id={`${kind}-website`} name="website" type="url" dir="ltr" autoComplete="url" maxLength={500} placeholder="https://example.com" /></div><div className="booking-inline-next"><button className="button booking-next" type="submit">أكمل <span aria-hidden="true">←</span></button></div>
      </div>
    </fieldset>
    <fieldset className="booking-step" hidden={step !== 2} disabled={step !== 2}>
      <legend className="visually-hidden">تفاصيل البزنس</legend>
      <div className="brief-options" aria-label="طريقة تقديم بيانات البزنس">
        <button className="brief-option" type="button" aria-pressed={briefMode === 'manual'} aria-controls={`${kind}-manual-brief`} onClick={() => setBriefMode('manual')}>أجاوب على الأسئلة يدويًا</button>
        <button className="brief-option" type="button" aria-pressed={briefMode === 'file'} aria-controls={`${kind}-file-brief`} onClick={() => { setBriefMode('file'); requestAnimationFrame(() => fileRef.current?.click()); }}>عندي بريف جاهز</button>
      </div>
      <fieldset className="brief-panel" id={`${kind}-manual-brief`} hidden={briefMode !== 'manual'} disabled={briefMode !== 'manual'}>
        <legend className="visually-hidden">الأسئلة</legend>
        <div className="field"><label htmlFor={`${kind}-business`}>إيه نوع البزنس بتاعك، وإنت دورك إيه فيه؟</label><textarea id={`${kind}-business`} name="business" maxLength={3000} placeholder="احكيلنا باختصار عن نشاط البزنس ودورك فيه" required /></div>
        <div className="field"><label htmlFor={`${kind}-problems-tools`}>إيه المشاكل اللي بتواجهها، وإيه الأدوات اللي بتستخدمها بشكل يومي؟</label><textarea id={`${kind}-problems-tools`} name="problemsAndTools" maxLength={5000} placeholder="احكيلنا عن المشاكل في شغلك اليومي والأدوات اللي بتعتمد عليها" required /></div>
        <div className="field"><label htmlFor={`${kind}-attempts`}>هل جربت تحل المشاكل دي قبل كده؟ وإيه الحلول اللي جربتها؟</label><textarea id={`${kind}-attempts`} name="attempts" maxLength={3000} placeholder="قولنا جربت إيه والنتيجة كانت إيه، أو لو لسه مجربتش" required /></div>
        <div className="field"><label htmlFor={`${kind}-help`}>شايف إننا ممكن نساعدك بإيه؟ <span className="optional">اختياري</span></label><textarea id={`${kind}-help`} name="help" maxLength={3000} placeholder="إيه اللي تتمنى نساعدك تحققه؟" /></div>
      </fieldset>
      <fieldset className="brief-panel" id={`${kind}-file-brief`} hidden={briefMode !== 'file'} disabled={briefMode !== 'file'}>
        <legend className="visually-hidden">البريف الجاهز</legend>
        <div className="field brief-upload"><label htmlFor={`${kind}-brief-file`}>ارفق البريف الجاهز</label><input ref={fileRef} id={`${kind}-brief-file`} type="file" name="briefFile" required={briefMode === 'file'} aria-describedby={`${kind}-brief-file-help`} onChange={event => { const file = event.currentTarget.files?.[0]; setFileName(file?.name ?? ''); event.currentTarget.setCustomValidity(file && file.size > 10 * 1024 * 1024 ? 'حجم الملف لازم يكون 10 ميجابايت أو أقل.' : ''); event.currentTarget.reportValidity(); }} /><small id={`${kind}-brief-file-help`}>PDF، Word، Excel، أو أي نوع ملف عندك، لحد 10 ميجابايت.</small>{fileName ? <p className="brief-file-name" role="status">الملف المختار: <bdi>{fileName}</bdi></p> : null}</div>
      </fieldset>
      <div className="form-grid financial-fields">
        <div className="field"><label htmlFor={`${kind}-revenue`}>الإيرادات الشهرية</label><select id={`${kind}-revenue`} name="revenue" defaultValue="" required><option value="" disabled>اختار حجم الإيرادات</option>{revenueOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><small>بالجنيه المصري</small></div>
        {kind === 'intro' && <div className="field"><label htmlFor={`${kind}-budget`}>ميزانية المشروع</label><select id={`${kind}-budget`} name="budget" defaultValue="" required><option value="" disabled>اختار الميزانية المتاحة</option>{budgetOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><small>بالجنيه المصري</small></div>}
        <div className="field employees-field"><label htmlFor={`${kind}-employees`}>عدد الموظفين</label><select id={`${kind}-employees`} name="employees" defaultValue="" required><option value="" disabled>اختار حجم الفريق</option><option value="solo">أنا لوحدي</option><option value="2-4">من 2 إلى 4</option><option value="4-8">من 4 إلى 8</option><option value="8-plus">أكثر من 8</option></select></div>
      </div>
    </fieldset>
    <div className="booking-step" hidden={step !== 3}><BookingCalendar active={step === 3} getSubmission={getSubmission} onComplete={() => setComplete(true)} onBusyChange={setBookingBusy} /></div>
    <div className="booking-actions" hidden={step === 1 || complete}>{step > 1 ? <button className="text-link booking-back" type="button" disabled={bookingBusy} onClick={() => setStep(step - 1)}>رجوع</button> : null}{step === 2 ? <button className="button booking-next" type="submit">أكمل <span aria-hidden="true">←</span></button> : null}</div>
    
  </form>;
}
