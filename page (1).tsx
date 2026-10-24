import type { Metadata } from '@/lib/meta';
import { Journey } from '@/components/site/journey';
import { PageIntro, WorkTogether } from '@/components/site/shared';
export const metadata: Metadata = { title: 'قصتي', description: 'قصة عمر أيمن من طفولته في الكويت وتجارب البيع والمحتوى، لتعلم الـAI وبناء الأنظمة.' };
export default function About() {
  return <><PageIntro title="كل تجربة سابت حاجة."><p>أنا عمر أيمن. دي الحكاية بتفاصيلها: من طفل نفسه يعمل بيزنس، لواحد بيحاول يفهم المشاكل ويبني ليها حلول. فيها محاولات مكملتش، ودروس لسه بتعلمها.</p></PageIntro><div className="container inner-section"><Journey detailed /><blockquote className="story-quote">«مش معنى إنك بتبيع، يعني إنك بتكسب.»</blockquote></div><WorkTogether /></>;
}
