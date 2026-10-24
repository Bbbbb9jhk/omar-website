import Link from '@/lib/navigation';
import { Journey } from '@/components/site/journey';
import { MediaSlot } from '@/components/site/media-slot';
import { Arrow, Star } from '@/components/site/icons';
import { BookingInvitation } from '@/components/site/booking-invitation';
import { ProjectsDisclosure } from '@/components/site/projects-disclosure';
export default function Home() {
  return <>
    <section className="hero container" aria-labelledby="hero-title"><div className="hero-copy"><p className="hello">أهلًا، أنا عمر <span aria-hidden="true">✳</span></p><h1 id="hero-title" className="story-title">تعالى أحكيلك،<br /><span className="underlined">الحكاية بدأت إزاي.</span></h1><p className="hero-description">جربت التجارة، والتسويق، وصناعة المحتوى.<br className="desktop-break" /> والنهارده ببني أنظمة برمجيات تساعد أصحاب البزنس والمسوقين على مضاعفة إنتاجيتهم داخل البزنس الخاص بيهم.</p><div className="hero-actions"><Link href="/book" className="button">احجز مكالمة <Arrow /></Link><a href="#journey" className="text-link">تعالى أحكيلك <span aria-hidden="true">↓</span></a></div></div>
      <div className="hero-visual"><div className="portrait-paper"><MediaSlot id="portrait" label="صورة عمر أيمن الشخصية" portrait /></div><Star className="hero-star" /><svg className="hero-scribble" viewBox="0 0 100 100" fill="none" aria-hidden="true"><path d="M78 12C18 3 9 54 44 58s37-39 15-25-7 47-34 53m0 0 3-16m-3 16 17-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
    </section>
    <div className="hero-divider container" aria-hidden="true" />
    <section id="journey" className="story-section container" aria-labelledby="journey-title"><div className="section-heading story-heading"><h2 id="journey-title">بداية الرحلة</h2></div><Journey /></section>
    <ProjectsDisclosure />
    <section className="home-approach container" aria-labelledby="approach-title"><div className="section-heading"><h2 id="approach-title">طريقة الشغل</h2></div><div className="home-steps">{[['01', 'بنفهم طريقة الشغل الأول.', 'نتكلم عن البزنس والفريق، ونشوف الخطوات الحالية من أول دخول العميل لحد التسليم والمتابعة.'], ['02', 'نحدد العطلة الحقيقية.', 'هل المشكلة في وضوح الخطوات؟ البيانات؟ التفويض؟ ولا تكرار شغل ممكن يتعمل بطريقة أبسط؟'], ['03', 'نختار الحل اللي يخدمك.', 'ممكن يبقى CRM، أتمتة مهام معينة، نظام مخصص، AI Agent، أو تغيير بسيط في طريقة الشغل.'], ['04', 'نرتب الأولويات قبل التنفيذ.', 'نحدد إيه الأهم وإيه الممكن، ونوضح الافتراضات. أي تقدير للعائد يبقى مبني على بيانات متاحة، مش وعود.']].map(([number, title, text]) => <article className="step" key={number}><span aria-hidden="true">{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></section>
    
    <section className="booking-between container" aria-label="حجز مكالمة أو استشارة"><Link href="/book" className="button">احجز مكالمة <Arrow /></Link><button type="button" className="button" disabled>احجز استشارة · قريبًا</button></section>
    <section className="problems-section container" aria-labelledby="problems-title"><div className="problems-intro"><Star /><h2 id="problems-title">بعض المشاكل{' '}<br />اللي بنساعدك{' '}<br /><span>في حلها</span></h2></div><div className="problem-list">{[['كل حاجة واقفة عليك؟', 'قرارات ومتابعة وتفاصيل يومية، ومفيش حاجة بتتحرك من غير ما ترجعلك.'], ['نفس الشغل بيتكرر كل يوم؟', 'وقت الفريق بيروح في نقل بيانات ورسائل وخطوات ممكن تتنظم بشكل أحسن.'], ['العميل بيضيع وسط المتابعة؟', 'معلومات في شات، ومواعيد في ورقة، ومحدش شايف الصورة كاملة.'], ['التفويض مش بيمشي؟', 'المسؤوليات والخطوات مش واضحة، فالشغل بيرجعلك تاني.']].map(([title, text], index) => <article key={title}><span className="problem-number" aria-hidden="true">0{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div><span className="problem-plus" aria-hidden="true">↙</span></article>)}</div></section>
    <BookingInvitation />
  </>;
}
