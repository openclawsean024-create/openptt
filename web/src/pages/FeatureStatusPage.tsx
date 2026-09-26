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
      <section className="border-b border-[var(--line)] pb-12">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--brand)]">{eyebrow}</p>
        <h1 className="mt-3 max-w-[760px] text-[clamp(28px,4vw,46px)] font-extrabold leading-[1.12] tracking-[-0.065em] text-[var(--ink)]">
          {title}
        </h1>
        <p className="mt-2 text-[12px] text-[var(--muted)]">{description}</p>
      </section>
      <section className="mt-10 border-t-2 border-[var(--ink)] pt-5" data-testid="feature-status">
        <span className="inline-flex items-center rounded-full bg-[var(--surface-soft)] px-2 py-0.5 text-[10px] font-extrabold text-[var(--muted)]">尚未納入 MVP</span>
        <h2 className="mt-3 text-[15px] tracking-[-0.025em] text-[var(--ink)]">功能入口已保留</h2>
        <p className="mt-2 text-[12px] leading-[1.65] text-[var(--muted)]">{reason}</p>
        <Link to="/about" className="mt-4 inline-block text-[12px] font-extrabold text-[var(--brand)] hover:underline">查看產品邊界與資料來源 →</Link>
      </section>
    </div>
  )
}
