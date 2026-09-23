import { describe, expect, it } from 'vitest'
import { parseArticleHtml, parseArticleMarkdown, parseBoardHtml, parseBoardMarkdown } from '../api/lib/ptt'

describe('PTT HTML adapter', () => {
  it('parses every article row from a board index page and exposes history links', () => {
    const html = `
      <a class="btn wide" href="/bbs/Stock/index10402.html">&lsaquo; 上頁</a>
      <a class="btn wide" href="/bbs/Stock/index10404.html">下頁 &rsaquo;</a>
      <div class="r-ent"><div class="nrec"><span class="hl f3">爆</span></div><div class="title"><a href="/bbs/Stock/M.1790123403.A.A5D.html">[新聞] 台積電最新消息 &amp; 觀察</a></div><div class="meta"><div class="author">alice</div><div class="date"> 9/23</div><div class="mark">M</div></div></div>
      <div class="r-ent"><div class="nrec">12</div><div class="title"><a href="/bbs/Stock/M.1790123300.A.BBB.html">[閒聊] 今日盤勢</a></div><div class="meta"><div class="author">bob</div><div class="date"> 9/23</div><div class="mark"></div></div></div>
    `
    const result = parseBoardHtml(html, 'Stock', '/bbs/Stock/index10403.html', '2026-09-23T01:00:00.000Z')
    expect(result.articles).toHaveLength(2)
    expect(result.articles[0]).toMatchObject({ title: '[新聞] 台積電最新消息 & 觀察', author: 'alice', pushes: 100, isHot: true, isPin: true, source: 'ptt' })
    expect(result.olderPath).toBe('/bbs/Stock/index10402.html')
    expect(result.newerPath).toBe('/bbs/Stock/index10404.html')
    expect(result.staleAt).toBe('2026-09-23T02:00:00.000Z')
  })

  it('parses article metadata, body HTML, and push summary', () => {
    const html = `<div id="main-content"><div class="article-metaline"><span class="article-meta-tag">作者</span><span class="article-meta-value">alice (A)</span></div><div class="article-metaline"><span class="article-meta-tag">標題</span><span class="article-meta-value">[心得] 測試文章</span></div><div class="article-metaline"><span class="article-meta-tag">時間</span><span class="article-meta-value">Wed Sep 23 08:30:00 2026</span></div>第一段<br>第二段<div class="push"><span class="push-tag">推 </span></div><div class="push"><span class="push-tag">噓 </span></div><div id="article-polling"></div>`
    const result = parseArticleHtml(html, 'Stock', 'M.1790123403.A.A5D', '2026-09-23T01:00:00.000Z')
    expect(result.article).toMatchObject({ title: '[心得] 測試文章', author: 'alice (A)', pushes: 1, boos: 1, arrows: 0, source: 'ptt' })
    expect(result.article.content).toContain('第一段')
    expect(result.article.content).toContain('第二段')
  })

  it('parses the reader-proxy markdown fallback for board and article pages', () => {
    const board = `Title: 看板 Stock 文章列表\n\nMarkdown Content:\n32\n\n[[閒聊] 今日盤勢](https://www.ptt.cc/bbs/Stock/M.1790123403.A.A5D.html)\n\nalice\n\n⋯`
    const article = `Title: [閒聊] 今日盤勢\n\nURL Source: https://www.ptt.cc/bbs/Stock/M.1790123403.A.A5D.html\n\nMarkdown Content:\n作者 alice (A)\n\n看板 Stock\n\n標題[閒聊] 今日盤勢\n\n時間 Wed Sep 23 08:30:00 2026\n\n第一段\n\n推 bob : 早安\n噓 eve : 不同意\n→ sam : 補充\n\n※ 發信站: 批踢踢實業坊`
    const feed = parseBoardMarkdown(board, 'Stock', '/bbs/Stock/index.html', '2026-09-23T01:00:00.000Z')
    const result = parseArticleMarkdown(article, 'Stock', 'M.1790123403.A.A5D', '2026-09-23T01:00:00.000Z')
    expect(feed.articles).toHaveLength(1)
    expect(feed.articles[0]).toMatchObject({ title: '[閒聊] 今日盤勢', author: 'alice', pushes: 32, source: 'ptt' })
    expect(feed.olderPath).toBe('/bbs/Stock/index1.html')
    expect(result.article).toMatchObject({ title: '[閒聊] 今日盤勢', author: 'alice (A)', pushes: 1, boos: 1, arrows: 1, source: 'ptt' })
    expect(result.article.content).toContain('第一段')
  })
})
