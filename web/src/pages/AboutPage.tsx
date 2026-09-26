export default function AboutPage() {
  return (
    <div>
      <section className="border-b border-[var(--line)] pb-12">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--brand)]">About OpenPTT</p>
        <h1 className="mt-3 max-w-[760px] text-[clamp(38px,6vw,72px)] font-extrabold leading-[1.03] tracking-[-0.075em] text-[var(--ink)]">
          關於 OpenPTT
        </h1>
        <p className="mt-4 max-w-[560px] text-[16px] leading-[1.75] text-[var(--muted)]">
          一個 reading-first、guest-first 的 PTT 閱讀介面。
        </p>
      </section>

      <div className="mt-10 grid gap-x-8 gap-y-6 lg:grid-cols-2">
        <section className="border-t-2 border-[var(--ink)] pt-5">
          <span className="inline-flex items-center rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-[10px] font-extrabold text-[var(--brand)]">Prototype scope</span>
          <h2 className="mt-3 text-[15px] tracking-[-0.025em] text-[var(--ink)]">目前已展示</h2>
          <p className="mt-2 text-[12px] leading-[1.65] text-[var(--muted)]">
            看板探索、熱門與即時熱門、文章閱讀、收藏、閱讀／看板歷史、指定看板關鍵字訂閱與主題偏好。
          </p>
        </section>
        <section className="border-t-2 border-[var(--ink)] pt-5">
          <span className="inline-flex items-center rounded-full bg-[var(--surface-soft)] px-2 py-0.5 text-[10px] font-extrabold text-[var(--muted)]">資料狀態</span>
          <h2 className="mt-3 text-[15px] tracking-[-0.025em] text-[var(--ink)]">示範資料與產品邊界</h2>
          <p className="mt-2 text-[12px] leading-[1.65] text-[var(--muted)]">
            目前內容為 mock；收藏、主題、最近瀏覽與關鍵字訂閱保存在瀏覽器 localStorage。尚未接入帳號、私人信件、發文互動、Web Push 或正式資料 adapter。
          </p>
        </section>
      </div>
    </div>
  )
}
