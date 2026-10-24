import { useState } from 'react';
import { ProjectCards } from './shared';
import { Arrow } from './icons';

export function ProjectsDisclosure() {
  const [open, setOpen] = useState(false);
  return <section className="work-section" aria-labelledby="work-title"><div className="container">
    <div className="section-heading projects-heading">
      <h2 id="work-title">تجارب سابقة</h2>
      <button type="button" className="button projects-toggle" aria-expanded={open} aria-controls="home-projects" onClick={() => setOpen(previous => !previous)}>
        {open ? 'إخفاء المشاريع' : 'اكتشف المشاريع'}<Arrow />
      </button>
    </div>
    <div className="projects-content" id="home-projects" hidden={!open}><ProjectCards compact /></div>
  </div></section>;
}
