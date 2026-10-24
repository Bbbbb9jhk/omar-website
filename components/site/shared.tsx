import Link from '@/lib/navigation';
import { projects } from '@/lib/content';
import { Arrow, Star } from './icons';
export function ProjectCards({ compact = false }: { compact?: boolean }) {
  return <div className="project-grid">{projects.map((project, index) => <Link href={`/work/${project.slug}`} className={`project-card ${project.tone}`} key={project.slug}>
    <div className={`project-art${project.logo ? ' has-logo' : ''}`}><span className="project-status">{project.status}</span>{project.logo ? <img className="project-logo" src={project.logo} alt={`شعار ${project.name}`} width={500} height={500} loading="lazy" /> : <><span className={`project-mark mark-${project.slug}`} dir={index === 0 ? 'rtl' : 'ltr'}>{project.mark}</span><span className="project-art-caption">{index === 0 ? 'أزياء · تجارة إلكترونية' : 'SYSTEMS THAT MAKE SENSE'}</span></>}</div>
    <div className="project-info"><div><h3 dir={index === 0 ? 'rtl' : 'auto'}>{project.name}</h3><p>{project.category}</p></div><span className="circle-arrow"><Arrow /></span></div>
    {!compact ? <p className="project-description">{project.description}</p> : null}
  </Link>)}</div>;
}
export function WorkTogether() {
  return null;
}
const socialLinks = [
  { label: 'إنستجرام', href: '' },
  { label: 'تيك توك', href: '' },
  { label: 'واتساب', href: '' },
];
export function Footer() {
  return <footer className="site-footer container"><div className="footer-top"><Link href="/" className="footer-name">عمر أيمن<Star /></Link><nav className="footer-socials" aria-label="حسابات التواصل">{socialLinks.map(({ label, href }) => href ? <a key={label} href={href} target="_blank" rel="noopener noreferrer">{label} <Arrow /></a> : <span key={label}>{label}</span>)}</nav></div><div className="footer-bottom"><span>© {new Date().getUTCFullYear()} عمر أيمن</span><Link href="/privacy">الخصوصية</Link></div></footer>;
}
export function PageIntro({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="page-intro container"><Link href="/" className="back-link">→ الرئيسية</Link><h1>{title}</h1><div className="intro-copy">{children}</div></div>;
}
