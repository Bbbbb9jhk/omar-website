export function Arrow({ className = '' }: { className?: string }) {
  return <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 5 5 19M5 5v14h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
export function Star({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 72 72" fill="none" aria-hidden="true"><path d="m36 3 4.7 22.2L58 10 46.8 29.2 70 36l-23.2 6.8L58 62 40.7 46.8 36 69l-4.7-22.2L14 62l11.2-19.2L2 36l23.2-6.8L14 10l17.3 15.2L36 3Z" fill="currentColor" /></svg>;
}
export function Illustration({ kind }: { kind: string }) {
  return <svg className="story-illustration" viewBox="0 0 240 200" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {kind === 'sun' ? <><circle cx="120" cy="84" r="35" /><path d="M120 23V10m0 149v-13M59 84H46m148 0h-13M77 41l-9-9m104 104-9-9m0-86 9-9M77 127l-9 9M30 174q45-24 90 0t90 0" /><path d="M97 89q23 21 46 0" /></> : null}
    {kind === 'plane' ? <><path d="m25 105 188-71-62 143-41-58-85-14Zm85 14L213 34M110 119l-3 43 23-14" /><path d="M61 151c-61 13-35 51 5 28" strokeDasharray="5 7" /></> : null}
    {kind === 'play' ? <><rect x="40" y="43" width="160" height="112" rx="20" /><path d="m103 75 43 25-43 25V75Z" /><path d="m72 174 11-19m84 19-11-19M31 27l-9-9m185 9 9-9" /></> : null}
    {kind === 'shop' ? <><path d="M55 88v82h130V88M45 88l15-49h120l15 49M45 88q15 21 30 0 15 21 30 0 15 21 30 0 15 21 30 0 15 21 30 0M102 170v-50h37v50M75 39v49m30-49v49m30-49v49m30-49v49" /></> : null}
    {kind === 'receipt' ? <><path d="M70 27v150l13-9 13 9 13-9 13 9 13-9 13 9 13-9 13 9V27l-13 9-13-9-13 9-13-9-13 9-13-9-13 9-13-9Z" /><path d="M93 65h57M93 88h38M93 112h57M93 143h57M44 75l-15 8m173 45 13 8" /></> : null}
    {kind === 'spark' ? <><path d="m120 24 13 55 52 20-52 19-13 57-15-57-52-19 52-20 15-55Zm67 2 5 19 18 6-18 6-5 20-6-20-18-6 18-6 6-19Z" /><path d="m56 145 5 13 14 5-14 5-5 14-4-14-14-5 14-5 4-13Z" /></> : null}
    {kind === 'flow' ? <><rect x="88" y="24" width="64" height="40" rx="10" /><rect x="25" y="136" width="64" height="40" rx="10" /><rect x="151" y="136" width="64" height="40" rx="10" /><path d="M120 64v35H57v37m63-37h63v37m-70-19 7 7 7-7" /><circle cx="120" cy="44" r="5" /></> : null}
  </svg>;
}
