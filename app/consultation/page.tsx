import type { Metadata } from '@/lib/meta';

import { IntakeForm } from '@/components/site/intake-form';
export const metadata: Metadata = { title: 'احجز استشارة', description: 'احجز استشارة: ابدأ ببياناتك وبيانات البزنس، ثم حدد الإيرادات والميزانية.' };
export default function Consultation() {
  return <div className="container booking-direct"><h1 className="visually-hidden">احجز استشارة</h1><IntakeForm kind="audit" /></div>;
}