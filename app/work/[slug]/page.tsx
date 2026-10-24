import Link from '@/lib/navigation';
import { projects } from '@/lib/content';
import { PageIntro, WorkTogether } from '@/components/site/shared';
import { Arrow } from '@/components/site/icons';
export default function Project({ slug }: { slug: string }) {
  const project = projects.find(item => item.slug === slug);
  if (!project) return null;
  return <><PageIntro title={project.name}><p>{project.description}</p></PageIntro><div className="container inner-section"><div className={`project-hero ${project.tone}`}><div className={`project-art${project.logo ? ' has-logo' : ''}`}><span className="project-status">{project.status}</span>{project.logo ? <img className="project-logo" src={project.logo} alt={`شعار ${project.name}`} width={500} height={500} /> : <><span className={`project-mark mark-${project.slug}`} dir={slug === 'lamsa' ? 'rtl' : 'ltr'}>{project.mark}</span><span className="project-art-caption">عرض كتابي مؤقت · المواد الفعلية لسه متضافتش</span></>}</div></div><div className="project-sections">{[['الفكرة كانت إيه؟', project.context], ...(project.role ? [['دوري في التجربة', project.role]] : []), ...(project.result ? [['إيه اللي حصل؟', project.result]] : []), ['إيه اللي اتعلمته؟', project.lesson]].map(([heading, text]) => <section className="editorial-block" key={heading}><h2>{heading}</h2><p>{text}</p></section>)}<div className="next-project"><Link className="text-link" href="/work">ارجع لكل المشاريع <Arrow /></Link><Link href="/approach">طريقة الشغل ←</Link></div></div></div><WorkTogether /></>;
}
