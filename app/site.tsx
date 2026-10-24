import Home from './page';
import About, { metadata as aboutMeta } from './about/page';
import Work, { metadata as workMeta } from './work/page';
import Approach, { metadata as approachMeta } from './approach/page';
import Book, { metadata as bookMeta } from './book/page';
import Consultation, { metadata as consultationMeta } from './consultation/page';
import Privacy, { metadata as privacyMeta } from './privacy/page';
import BookingAdmin, { metadata as bookingAdminMeta } from './booking-admin/page';
import Project from './work/[slug]/page';
import NotFound from './not-found';
import RootLayout from './layout';
import { PathContext } from '@/lib/navigation';
import { projects } from '@/lib/content';
import type { Metadata } from '@/lib/meta';
const pages = {
  '/': { component: Home, metadata: { title: 'الحكاية لسه بتتكمل', description: 'من طيارات ورق في المدرسة، لبناء أنظمة وأتمتة تساعد أصحاب البزنس والمسوقين. اعرف قصة عمر أيمن وشغله.' } },
  '/about': { component: About, metadata: aboutMeta }, '/work': { component: Work, metadata: workMeta },
  '/approach': { component: Approach, metadata: approachMeta }, '/book': { component: Book, metadata: bookMeta },
  '/consultation': { component: Consultation, metadata: consultationMeta }, '/privacy': { component: Privacy, metadata: privacyMeta },
  '/booking-admin': { component: BookingAdmin, metadata: bookingAdminMeta },
};
export const routes = [...Object.keys(pages), ...projects.map(project => `/work/${project.slug}`)];
export function App({ path }: { path: string }) {
  const normalized = path.replace(/\/$/, '') || '/';
  const match = pages[normalized as keyof typeof pages];
  const project = projects.find(item => normalized === `/work/${item.slug}`);
  const meta: Metadata = match?.metadata ?? (project ? { title: project.name, description: project.description } : { title: 'الصفحة مش موجودة', description: 'ارجع للرئيسية واعرف قصة عمر أيمن.' });
  const Page = match?.component;
  return <PathContext.Provider value={normalized}><RootLayout path={normalized} title={String(meta.title)} description={String(meta.description)}>{Page ? <Page /> : project ? <Project slug={project.slug} /> : <NotFound />}</RootLayout></PathContext.Provider>;
}
