import { useState } from 'react';
import { portraitOptions } from '@/lib/content';

export function PortraitCompare() {
  const [selected, setSelected] = useState('portrait-1');
  const active = portraitOptions.find(photo => photo.id === selected && photo.src)
    ?? portraitOptions.find(photo => photo.src);
  if (!active?.src) return null;
  return <>
    <div className="portrait-paper"><div className="media-slot portrait-slot"><img src={active.src} alt={`صورة عمر أيمن الشخصية — ${active.label}`} width={700} height={840} loading="eager" /></div></div>
    <div className="portrait-choices" role="group" aria-label="مقارنة اختيارات الصورة الشخصية">
      {portraitOptions.map(photo => <button key={photo.id} type="button" aria-pressed={active.id === photo.id} disabled={!photo.src} aria-label={photo.src ? `اعرض ${photo.label}` : `${photo.label} — في انتظار إضافتها`} title={photo.src ? photo.label : 'في انتظار إضافة الصورة'} onClick={() => setSelected(photo.id)}>{photo.label}</button>)}
    </div>
  </>;
}
