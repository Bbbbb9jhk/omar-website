import type { Metadata } from '@/lib/meta';
import Link from '@/lib/navigation';
export const metadata: Metadata = { title: 'الاستشارات قريبًا', description: 'حجز الاستشارات هيفتح قريبًا.' };
export default function Consultation() {
  return <section className="container consultation-coming-soon"><h1>الاستشارات قريبًا</h1><p>هنفتح حجز الاستشارات قريبًا.</p><Link href="/" className="text-link">ارجع للرئيسية ←</Link></section>;
}