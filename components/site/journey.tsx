'use client';
import { useEffect, useRef } from 'react';
import { milestones } from '@/lib/content';
import { MediaSlot } from './media-slot';
type Segment = { node: SVGPathElement; length: number; startY: number; endY: number };
export function Journey({ detailed = false, limit }: { detailed?: boolean; limit?: number }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const arrowRef = useRef<SVGGElement>(null);
  const shown = limit ? milestones.slice(0, limit) : milestones;
  useEffect(() => {
    const root = rootRef.current, svg = svgRef.current, arrow = arrowRef.current;
    if (!root || !svg || !arrow) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let segments: Segment[] = [], frame = 0, alive = true, rootTop = 0;
    function paint() {
      frame = 0;
      if (!alive || !root || !arrow) return;
      const scanY = window.scrollY + window.innerHeight * 0.64 - rootTop;
      let head: { segment: Segment; progress: number } | undefined;
      for (const segment of segments) {
        let progress = reduced.matches ? 1 : Math.max(0, Math.min(1, (scanY - segment.startY) / (segment.endY - segment.startY)));
        if (progress > 0 && progress < 1) {
          let low = 0, high = segment.length;
          for (let n = 0; n < 13; n++) { const middle = (low + high) / 2; if (segment.node.getPointAtLength(middle).y < scanY) low = middle; else high = middle; }
          progress = (low + high) / (2 * segment.length);
        }
        segment.node.style.strokeDashoffset = String(segment.length * (1 - progress));
        if (progress > 0) head = { segment, progress };
      }
      if (!head) { arrow.style.opacity = '0'; return; }
      const distance = head.segment.length * head.progress;
      const point = head.segment.node.getPointAtLength(distance);
      const before = head.segment.node.getPointAtLength(Math.max(0, distance - 2));
      const after = head.segment.node.getPointAtLength(Math.min(head.segment.length, distance + 2));
      const angle = Math.atan2(after.y - before.y, after.x - before.x) * 180 / Math.PI;
      arrow.setAttribute('transform', `translate(${point.x}, ${point.y}) rotate(${angle})`);
      arrow.style.opacity = '1';
    }
    function requestPaint() { if (!frame) frame = requestAnimationFrame(paint); }
    function measure() {
      if (!alive || !root || !svg) return;
      const box = root.getBoundingClientRect(); rootTop = box.top + window.scrollY;
      const mobile = window.matchMedia('(max-width: 700px)').matches;
      const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-photo]'));
      const paths = Array.from(svg.querySelectorAll<SVGPathElement>('[data-connector]'));
      svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
      segments = paths.map((node, index) => {
        const a = cards[index].getBoundingClientRect(), b = cards[index + 1].getBoundingClientRect();
        const x1 = a.left - box.left + a.width / 2;
        const x2 = b.left - box.left + b.width / 2;
        const y1 = a.top - box.top + a.height / 2;
        const y2 = b.top - box.top + b.height / 2;
        const bottom = a.bottom - box.top;
        const top = b.top - box.top;
        const gap = top - bottom;
        // Adjacent segments meet inside each opaque photo, so the arrow
        // disappears behind it and emerges below it without jumping.
        const gutter = box.width - 14;
        const turn = Math.min(24, gap / 4);
        const path = mobile
          ? `M ${x1} ${y1} L ${x1} ${bottom} C ${x1} ${bottom + turn / 2}, ${gutter} ${bottom + turn / 2}, ${gutter} ${bottom + turn} L ${gutter} ${top - turn} C ${gutter} ${top - turn / 2}, ${x2} ${top - turn / 2}, ${x2} ${top} L ${x2} ${y2}`
          : `M ${x1} ${y1} L ${x1} ${bottom} C ${x1} ${bottom + gap * 0.55}, ${x2} ${top - gap * 0.55}, ${x2} ${top} L ${x2} ${y2}`;
        node.setAttribute('d', path);
        const length = node.getTotalLength(); node.style.strokeDasharray = String(length);
        return { node, length, startY: y1, endY: y2 };
      });
      root.dataset.ready = 'true'; requestPaint();
    }
    const resize = new ResizeObserver(measure); resize.observe(root);
    window.addEventListener('resize', measure); window.addEventListener('scroll', requestPaint, { passive: true });
    reduced.addEventListener('change', requestPaint); document.fonts.ready.then(() => { if (alive) measure(); }); measure();
    return () => { alive = false; resize.disconnect(); window.removeEventListener('resize', measure); window.removeEventListener('scroll', requestPaint); reduced.removeEventListener('change', requestPaint); cancelAnimationFrame(frame); };
  }, [limit]);
  return <div className={`journey ${detailed ? 'journey-detailed' : ''}`} ref={rootRef}>
    <svg className="journey-lines" ref={svgRef} preserveAspectRatio="none" aria-hidden="true">{shown.slice(1).map(item => <path key={item.id} data-connector="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />)}<g ref={arrowRef} className="journey-arrow"><path d="M -11 -7 L 1 0 L -11 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></g></svg>
    {shown.map((item, index) => <article key={item.id} className={`journey-stop stop-${index}`}><figure className={`journey-photo photo-${item.art}`} data-photo="true"><div className="photo-tape" /><MediaSlot id={item.id} label={item.media} art={item.art} /><figcaption><span>{item.time}</span><span dir="ltr">{String(index + 1).padStart(2, '0')} / {String(shown.length).padStart(2, '0')}</span></figcaption></figure><div className="journey-copy"><span className="journey-time">{item.time}</span><h3>{item.title}</h3><p>{item.text}</p>{detailed ? <p className="story-detail">{item.detail}</p> : null}</div></article>)}
  </div>;
}
