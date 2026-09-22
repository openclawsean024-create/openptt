import { Link } from 'react-router-dom'

interface FeatureStatusPageProps {
  eyebrow: string
  title: string
  description: string
  reason: string
}

export default function FeatureStatusPage({ eyebrow, title, description, reason }: FeatureStatusPageProps) {
  return (
    <div>
      <div className="mb-6"><p className="text-xs font-bold tracking-[0.16em] text-slate-500 dark:text-slate-400">{eyebrow}</p><h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1><p className="mt-2 text-slate-500 dark:text-slate-400">{description}</p></div>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900" data-testid="feature-status">
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">尚未納入 MVP</span>
        <h2 className="mt-4 text-lg font-semibold">功能入口已保留</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{reason}</p>
        <Link to="/about" className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-300">查看產品邊界與資料來源 →</Link>
      </section>
    </div>
  )
}
