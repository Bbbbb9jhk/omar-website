'use client';
import { useState } from 'react';
import { usePathname } from '@/lib/navigation';
import Link from '@/lib/navigation';
import { Arrow, Star } from './icons';
const links = [{ href: '/', label: 'الرئيسية' }, { href: '/about', label: 'قصتي' }, { href: '/approach', label: 'طريقة الشغل' }];
export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return <header className="site-header"><div className="container header-inner">
    <Link href="/" className="brand" aria-label="عمر أيمن — الرئيسية" onClick={() => setOpen(false)}><Star /><span>عمر أيمن<span className="brand-latin" lang="en">OMAR AYMAN</span></span></Link>
    <nav aria-label="التنقل الرئيسي" className="desktop-nav">{links.map(link => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined}>{link.label}</Link>)}</nav>
    <Link href="/book" className="button button-small header-cta">احجز مكالمة <Arrow /></Link>
    <button className="menu-toggle" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'اقفل القائمة' : 'افتح القائمة'} onClick={() => setOpen(!open)}><span /><span /></button>
  </div>{open ? <nav className="mobile-nav container" id="mobile-navigation" aria-label="قائمة الموبايل">{links.map(link => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? 'page' : undefined} onClick={() => setOpen(false)}>{link.label}</Link>)}<Link href="/book" onClick={() => setOpen(false)}>احجز مكالمة</Link></nav> : null}</header>;
}
