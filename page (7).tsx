import type { Metadata } from '@/lib/meta';
import { PageIntro, ProjectCards, WorkTogether } from '@/components/site/shared';
export const metadata: Metadata = { title: 'المشاريع والتجارب', description: 'تجارب عمر أيمن في التجارة والأزياء وشغله الحالي على Twenzer AI، بالنتائج والدروس المتاحة.' };
export default function Work() {
  return <><PageIntro title="المحاولة جزء من الشغل."><p>مش كل مشروع هنا قصة نجاح. دي تجارب شخصية وشغلي الحالي، مع توضيح اللي حصل واللي اتعلمته، من غير أرقام أكبر من الحقيقة.</p></PageIntro><section className="container inner-section" aria-label="المشاريع"><ProjectCards /><div className="notice" style={{ marginTop: 45 }}>بعض المشاريع لسه معروضة بتنسيقات كتابية مؤقتة. هنضيف باقي الصور والشعارات الحقيقية لما تتوفر.</div></section><WorkTogether /></>;
}
