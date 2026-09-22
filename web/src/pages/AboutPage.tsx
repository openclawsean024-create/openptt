export default function AboutPage() {
  return (
    <div>
      <div className="mb-6"><p className="text-xs font-bold tracking-[0.16em] text-emerald-700 dark:text-emerald-300">ABOUT OPENPTT</p><h1 className="mt-2 text-3xl font-bold tracking-tight">關於 OpenPTT</h1><p className="mt-2 text-slate-500 dark:text-slate-400">一個 reading-first、guest-first 的 PTT 閱讀介面。</p></div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"><span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Prototype scope</span><h2 className="mt-4 text-lg font-semibold">目前已展示</h2><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">看板探索、熱門與即時熱門、文章閱讀、收藏、閱讀／看板歷史、指定看板關鍵字訂閱與主題偏好。</p></section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">資料狀態</span><h2 className="mt-4 text-lg font-semibold">示範資料與產品邊界</h2><p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">目前內容為 mock；收藏、主題、最近瀏覽與關鍵字訂閱保存在瀏覽器 localStorage。尚未接入帳號、私人信件、發文互動、Web Push 或正式資料 adapter。</p></section>
      </div>
    </div>
  )
}
