// Public project key. Server credentials stay inside Supabase Edge Functions.
export const SUPABASE_URL = 'https://xtgypzlbkmpjotvmkhrn.supabase.co';
export const SUPABASE_PUBLIC_KEY = 'sb_publishable_VI6OLqPrpaLmggxYhptw2A_qjxBiQAE';
export const BOOKING_ENDPOINT = SUPABASE_URL + '/functions/v1/omar-booking';
export const BOOKING_HEADERS = { apikey: SUPABASE_PUBLIC_KEY };
export type BookingSlot = { scheduled_at: string; local_date: string; local_time: string };
export function bookingDateLabel(date: string) {
  return new Intl.DateTimeFormat('ar-EG', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Africa/Cairo' }).format(new Date(date + 'T12:00:00Z'));
}
export function bookingTimeLabel(iso: string) {
  return new Intl.DateTimeFormat('ar-EG', { hour: 'numeric', minute: '2-digit', timeZone: 'Africa/Cairo' }).format(new Date(iso));
}
