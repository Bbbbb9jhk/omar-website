import { mediaAssets, mediaDimensions } from '@/lib/content';
import { Illustration } from './icons';
export function MediaSlot({ id, label, art = 'sun', portrait = false }: { id: string; label: string; art?: string; portrait?: boolean }) {
  const src = mediaAssets[id];
  const dimensions = mediaDimensions[id];
  return <div className={`media-slot ${portrait ? 'portrait-slot' : ''}`} style={src && !portrait && dimensions ? { aspectRatio: `${dimensions.width} / ${dimensions.height}` } : undefined}>
    {src ? <img src={src} alt={label} width={dimensions?.width ?? (portrait ? 700 : 640)} height={dimensions?.height ?? (portrait ? 840 : 480)} loading={portrait ? 'eager' : 'lazy'} /> : <div className="media-placeholder" role="img" aria-label={`مكان مخصص: ${label}. الصورة الحقيقية لم تُضف بعد.`}>
      {portrait ? <><span className="portrait-word">عمر<span>أيمن.</span></span><span className="portrait-handwriting">كل تجربة ليها حكاية</span><span className="portrait-caption">مكان الصورة الشخصية</span></> : <><Illustration kind={art} /><span className="media-placeholder-label">{label}<small>مكان الصورة الحقيقية</small></span></>}
    </div>}
  </div>;
}
