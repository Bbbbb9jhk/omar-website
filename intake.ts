export type IntakeKind = 'intro' | 'audit';
export type IntakeAvailability = { available: true; code: 'READY'; message: string };
export const intakeAvailability: IntakeAvailability = { available: true, code: 'READY', message: 'اختار موعدك وأكد الحجز لحفظ الطلب.' };
export const MAX_BRIEF_BYTES = 5 * 1024 * 1024;
export async function validateBrief(file: File): Promise<string | null> {
  if (file.size > MAX_BRIEF_BYTES) return 'حجم الملف لازم يكون ٥ ميجابايت أو أقل.';
  if (!file.name.toLowerCase().endsWith('.pdf') || (file.type && file.type !== 'application/pdf')) return 'اختار ملف PDF فقط.';
  const header = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  if (String.fromCharCode(...header) !== '%PDF-') return 'الملف مش PDF صالح. جرّب تصديره كـPDF تاني.';
  return null;
}
