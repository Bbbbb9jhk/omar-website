import type { Metadata } from '@/lib/meta';

import { IntakeForm } from '@/components/site/intake-form';
export const metadata: Metadata = { title: 'مكالمة تعارف', description: 'احجز مكالمة 45 دقيقة لفهم البزنس والمشكلة، واختار من المواعيد المتاحة.' };
export default function Book() {
  return <div className="container booking-direct"><h1 className="visually-hidden">احجز مكالمتك</h1><IntakeForm kind="intro" showNotice={false} /></div>;
}
