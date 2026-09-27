import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useArticleSearch } from '../lib/useArticleSearch'

function formatDate(value: string) {
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toLocaleString('zh-Hant')
}

export default function SearchPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const routeQuery = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(routeQuery)
  const { data, loading, error } = useArticleSearch(routeQuery)
  const stale = Boolean(data?.staleAt && Date.parse(data.staleAt) <= Date.now())
  const resultCount = data?.articles.length ?? 0
  const resultBoards = useMemo(() => Array.from(new Set(data?.articles.map(article => article.board) ?? [])), [data?.articles])

  useEffect(() => setQuery(routeQuery), [routeQuery])

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const clean = query.trim()
    navigate(clean ? `/search?q=${encodeURIComponent(clean)}` : '/search')
  }

  return (
    <div data-testid="search-page">
      <section className="border-b border-[var(--line)] pb-8">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--brand)]">Search the conversation</p>
        <h1 className="mt-3 text-[clamp(36px,6vw,68px)] font-extrabold leading-[1.03] tracking-[-0.075em] text-[var(--ink)]">
          Find the thread<br /><span className="text-[var(--brand)]">behind the signal.</span>
        </h1>
        <form onSubmit={submit} role="search" className="mt-6 flex max-w-2xl flex-col gap-2 sm:flex-row">
          <label htmlFor="article-search" className="sr-only">搜尋文章</label>
          <input
            id="article-search"
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="搜尋文章標題、作者或目前看板索引"
            className="h-[44px] flex-1 rounded-md border border-[var(--control)] bg-[var(--surface)] px-3 text-sm text-[var(--ink)] placeholder:text-[var(--faint)]"
            data-testid="article-search-input"
          />
          <button type="submit" className="h-[44px] rounded-md border border-[var(--brand)] bg-[var(--brand)] px-5 text-[12px] font-extrabold text-white hover:bg-[var(--brand-deep)]">搜尋</button>
        </form>
        <p className="mt-3 max-w-2xl text-[11px] leading-[1.7] text-[var(--muted)]">
          目前搜尋 PTT 看板 index page 的標題、作者與標籤；這是 bounded search，不宣稱已建立全站永久全文索引。
        </p>
      </section>

      {!routeQuery.trim() ? (
        <div className="py-16 text-center text-[var(--muted)]" data-testid="search-empty">
          <p className="font-extrabold text-[var(--ink)]">輸入關鍵字開始搜尋文章</p>
          <p className="mt-2 text-[12px]">你也可以先到 <Link className="text-[var(--brand)] underline" to="/boards">看板列表</Link> 探索完整目錄。</p>
        </div>
      ) : (
        <section className="mt-8 border-t-2 border-[var(--ink)]" data-testid="search-results">
          <div className="flex flex-col gap-2 border-b border-[var(--line)] py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <strong className="text-[var(--ink)]">「{routeQuery}」的搜尋結果</strong>
              <p className="mt-1 text-[11px] text-[var(--muted)]">{loading ? '正在同步 PTT 看板索引…' : `${resultCount} 篇 · ${resultBoards.length} 個看板`}</p>
            </div>
            <span className="text-[10px] text-[var(--faint)]" data-testid="search-source">
              {loading ? '正在同步…' : data?.source === 'ptt' ? `來源：PTT index page${stale ? ' · 可能過期' : ''}` : '示範快照 · PTT 暫時無法取得，資料可能過期'}
            </span>
          </div>
          {error && <div className="border-b border-[var(--warning)] bg-[var(--warning-soft)] px-4 py-3 text-[12px] text-[var(--warning)]" role="status">搜尋同步失敗，目前顯示可用資料。</div>}
          {data?.partial && <div className="border-b border-[var(--warning)] bg-[var(--warning-soft)] px-4 py-3 text-[12px] text-[var(--warning)]" role="status" data-testid="search-partial">部分看板失敗，結果只涵蓋成功取得的 index page。</div>}
          {data && data.articles.length > 0 ? (
            <ul>
              {data.articles.map((article, index) => (
                <li key={`${article.board}:${article.id}`} className="grid grid-cols-[36px_minmax(0,1fr)] gap-3 border-b border-[var(--line)] py-5">
                  <span className="font-mono text-[12px] text-[var(--faint)]">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] text-[var(--faint)]">
                      <span className="font-extrabold text-[var(--brand)]">{article.board}</span>
                      <span aria-hidden="true">·</span>
                      <span>{article.author}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatDate(article.postedAt)}</span>
                      {article.source === 'mock' && <span className="rounded bg-[var(--surface-soft)] px-1.5 py-0.5 font-extrabold" data-testid={`search-source-mock-${article.id}`}>示範</span>}
                    </div>
                    <Link to={`/article/${article.id}?board=${encodeURIComponent(article.board)}`} className="block text-[18px] font-extrabold leading-[1.45] tracking-[-0.025em] text-[var(--ink)] hover:text-[var(--brand)]">{article.title}</Link>
                    <p className="mt-2 text-[12px] leading-[1.7] text-[var(--muted)]">{article.snippet}</p>
                    <p className="mt-1 text-[10px] text-[var(--faint)]">命中：{article.matchFields.join('、')} · 推 {article.pushes}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : !loading ? (
            <div className="py-16 text-center text-[var(--muted)]" data-testid="search-no-results">
              <p className="font-extrabold text-[var(--ink)]">找不到相關文章</p>
              <p className="mt-2 text-[12px]">換個關鍵字，或回到看板列表探索其他討論。</p>
              <button type="button" onClick={() => navigate('/search')} className="mt-4 inline-flex h-[40px] items-center rounded-md border border-[var(--brand)] bg-[var(--brand)] px-4 text-[12px] font-extrabold !text-white" data-testid="search-clear">清除搜尋</button>
            </div>
          ) : null}
        </section>
      )}
    </div>
  )
}
