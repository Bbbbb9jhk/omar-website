'use client';
import { useEffect, useRef, useState } from 'react';
import Link from '@/lib/navigation';
import { Arrow } from './icons';

export function BookingInvitation() {
  const [visible, setVisible] = useState(true);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let previousY = window.scrollY;
    let frame = 0;
    function update() {
      frame = 0;
      const nextY = Math.max(0, window.scrollY);
      if (Math.abs(nextY - previousY) < 10) return;
      const hasFocus = actionsRef.current?.contains(document.activeElement);
      setVisible(Boolean(hasFocus) || nextY > previousY || nextY < 24);
      previousY = nextY;
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <section className="paths-section booking-invitation container" aria-labelledby="booking-invitation-title">
    <div className="booking-intro"><h2 id="booking-invitation-title">جاهز تكبّر البزنس بتاعك؟</h2><p>ابدأ دلوقتي معانا</p></div>
    <div className="booking-callouts" ref={actionsRef} data-visible={visible} aria-hidden={!visible} onFocusCapture={() => setVisible(true)}>
      {['intro', 'audit'].map(kind => <div className="booking-choice" key={kind}>
        <svg className="booking-choice-arrow" viewBox="0 0 160 100" fill="none" aria-hidden="true"><path pathLength="1" d="M20 8C102 5 137 30 91 86M91 86l-2-19m2 19 19-6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <div className={`path-card${kind === 'audit' ? ' path-audit' : ''}`}>{kind === 'intro' ? <Link href="/book" className="button">احجز مكالمة <Arrow /></Link> : <button type="button" className="button" disabled>احجز استشارة · قريبًا</button>}</div>
      </div>)}
    </div>
  </section>;
}
