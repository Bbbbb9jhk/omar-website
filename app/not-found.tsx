import Link from '@/lib/navigation';
export default function NotFound() { return <div className="container not-found"><h1>الصفحة دي مش موجودة.</h1><p>ممكن اللينك اتغير. نرجع للحكاية من أولها؟</p><Link className="button" href="/">ارجع للرئيسية ←</Link></div>; }
