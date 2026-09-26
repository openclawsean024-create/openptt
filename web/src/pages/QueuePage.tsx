import { Link } from 'react-router-dom'
import { useQueue } from '../lib/useQueue'
import { removeFromQueue, clearQueue } from '../lib/queue'

export default function QueuePage() {
  const items = useQueue()

  return (
    <div>
      <section className="pb-12">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--brand)]">Reading queue</p>
        <h1 className="mt-3 max-w-[760px] text-[clamp(38px,6vw,72px)] font-extrabold leading-[1.03] tracking-[-0.075em] text-[var(--ink)]">
          Read it <span className="text-[var(--brand)]">when ready.</span>
        </h1>
        <p className="mt-4 max-w-[560px] text-[16px] leading-[1.75] text-[var(--muted)]">
          把想讀但現在沒時間的文章存進來，留給之後的自己。所有項目只保存在這個瀏覽器，不會推播、不會上傳。
        </p>
      </section>

      <section className="mb-6 flex items-end justify-between gap-4 border-b border-[var(--line)] pb-3">
        <div>
          <strong className="text-[var(--ink)]">{items.length} 篇文章</strong>
          <p className="mt-1 text-[11px] text-[var(--muted)]">依加入時間排序，最近加入在最上方。</p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && !window.confirm('確定要清空閱讀佇列？此動作只會清掉這個瀏覽器 localStorage 裡的資料，無法復原。')) {
                return
              }
              clearQueue()
            }}
            className="rounded-md border border-[var(--line)] px-3 py-1.5 text-[11px] font-bold text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
            data-testid="queue-clear"
          >
            清空佇列
          </button>
        )}
      </section>

      {items.length === 0 ? (
        <div
          className="border-b border-[var(--line)] py-12 text-center text-[var(--muted)]"
          data-testid="queue-empty"
        >
          <strong className="mb-1 block text-[var(--ink)]">閱讀佇列是空的</strong>
          <p>看到想讀但現在沒時間的內容，按下 +，會列在這裡。</p>
          <Link
            to="/hot"
            className="mt-3 inline-block text-[11px] font-extrabold text-[var(--brand)] hover:underline"
          >
            去熱門文章找一篇 →
          </Link>
        </div>
      ) : (
        <ul className="border-t-2 border-[var(--ink)]" data-testid="queue-list">
          {items.map(item => (
            <li
              key={item.id}
              className="grid grid-cols-[48px_minmax(0,1fr)_96px] items-start gap-4 border-b border-[var(--line)] py-5 hover:bg-[color-mix(in_srgb,var(--surface-soft)_54%,transparent)]"
              data-testid={`queue-row-${item.id}`}
            >
              <div className="font-mono text-[12px] text-[var(--faint)]">▱</div>
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] text-[var(--faint)]">
                  <span className="font-extrabold text-[var(--brand)]">{item.board}</span>
                  <span aria-hidden="true">·</span>
                  <span>佇列</span>
                </div>
                <Link
                  to={`/article/${item.id}?board=${item.board}`}
                  className="block text-[18px] font-extrabold leading-[1.45] tracking-[-0.025em] text-[var(--ink)] hover:text-[var(--brand)]"
                >
                  {item.title}
                </Link>
                <p className="mt-1 text-[10px] text-[var(--faint)]">加入於 {new Date(item.addedAt).toLocaleString('zh-Hant')}</p>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => removeFromQueue(item.id)}
                  className="inline-flex h-[34px] min-w-[34px] items-center justify-center rounded-md border border-[var(--line)] bg-[var(--surface)] px-2 text-[13px] text-[var(--faint)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
                  aria-label={`從佇列移除 ${item.title}`}
                  data-testid={`queue-remove-${item.id}`}
                >
                  ✓
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
