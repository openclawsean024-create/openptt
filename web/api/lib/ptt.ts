import type { Article } from '../../src/data/boards'

export const PTT_ORIGIN = 'https://www.ptt.cc'
export const FEED_CACHE_SECONDS = 60 * 60

export interface PttBoardFeed {
  board: string
  currentPath: string
  articles: Article[]
  olderPath: string | null
  newerPath: string | null
  fetchedAt: string
  staleAt: string
  source: 'ptt'
}

export interface PttArticleResult {
  article: Article
  fetchedAt: string
  staleAt: string
  source: 'ptt'
}

function decodeEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
}

function stripTags(value: string): string {
  return decodeEntities(value.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim()
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

function tagType(title: string): string[] {
  const tags: string[] = []
  const rules: Array<[RegExp, string]> = [
    [/^Re:/, 'Re:'], [/^Fw:/, 'Fw:'], [/^\[新聞\]/, '新聞'], [/^\[爆卦\]/, '爆卦'],
    [/^\[問卦\]/, '問卦'], [/^\[食記\]/, '食記'], [/^\[好雷\]/, '好雷'],
    [/^\[負雷\]/, '負雷'], [/^\[求助\]/, '求助'], [/^\[情報\]/, '情報'], [/^\[問題\]/, '問題'],
  ]
  for (const [rule, label] of rules) if (rule.test(title)) tags.push(label)
  return tags
}

function articleDate(articleId: string, fallback: string): string {
  const timestamp = articleId.match(/^M\.(\d+)/)?.[1]
  if (timestamp) {
    const parsed = new Date(Number(timestamp) * 1000)
    if (!Number.isNaN(parsed.getTime())) return parsed.toISOString()
  }
  const parsed = Date.parse(fallback)
  return Number.isNaN(parsed) ? new Date().toISOString() : new Date(parsed).toISOString()
}

function relativePath(value: string): string | null {
  const href = value.match(/href="([^\"]+)"/)?.[1]
  if (!href || !href.startsWith('/bbs/')) return null
  return decodeEntities(href)
}

function parseRecommendation(value: string): { pushes: number; isHot: boolean } {
  const text = stripTags(value)
  if (text.includes('爆')) return { pushes: 100, isHot: true }
  const pushes = Number.parseInt(text, 10)
  return { pushes: Number.isFinite(pushes) ? pushes : 0, isHot: pushes >= 100 }
}

export function latestBoardPath(board: string): string {
  return `/bbs/${board}/index.html`
}

export function validBoardName(board: string): boolean {
  return /^[A-Za-z0-9_-]{1,32}$/.test(board)
}

export function validBoardPath(board: string, value: string | undefined): string {
  if (!value) return latestBoardPath(board)
  const decoded = decodeURIComponent(value)
  const pattern = new RegExp(`^/bbs/${board.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/index(?:\\d+)?\\.html$`)
  return pattern.test(decoded) ? decoded : latestBoardPath(board)
}

export function parseBoardHtml(html: string, board: string, currentPath: string, fetchedAt = new Date().toISOString()): PttBoardFeed {
  const starts = Array.from(html.matchAll(/<div class="r-ent">/g)).map(match => match.index ?? 0)
  const articles: Article[] = []

  for (let index = 0; index < starts.length; index += 1) {
    const block = html.slice(starts[index], starts[index + 1] ?? html.length)
    const link = block.match(/<div class="title">[\s\S]*?<a href="([^\"]+)">([\s\S]*?)<\/a>/)
    if (!link) continue
    const articleUrl = relativePath(link[0])
    const path = link[1]
    const articleId = path.split('/').pop()?.replace(/\.html$/, '') ?? ''
    if (!articleId) continue
    const title = stripTags(link[2])
    const author = stripTags(block.match(/<div class="author">([\s\S]*?)<\/div>/)?.[1] ?? 'unknown')
    const recommendation = parseRecommendation(block.match(/<div class="nrec">([\s\S]*?)<\/div>/)?.[1] ?? '')
    const isPin = /<div class="mark">\s*M\s*<\/div>/.test(block) || /^\[公告\]/.test(title)
    const tags = tagType(title)
    const boos = 0
    const arrows = 0
    articles.push({
      id: articleId,
      board,
      title,
      author,
      authorIp: 'PTT',
      postedAt: articleDate(articleId, stripTags(block.match(/<div class="date">([\s\S]*?)<\/div>/)?.[1] ?? '')),
      content: '',
      tags,
      pushes: recommendation.pushes,
      boos,
      arrows,
      isHot: recommendation.isHot,
      isPin,
      pushToBooRatio: recommendation.pushes > 0 ? recommendation.pushes : 0,
      pushedToward: recommendation.pushes > 0 ? 'positive' : 'neutral',
      source: 'ptt',
      sourceUrl: articleUrl ? `${PTT_ORIGIN}${articleUrl}` : `${PTT_ORIGIN}${path}`,
      fetchedAt,
    })
  }

  const navLinks = Array.from(html.matchAll(/<a class="btn wide" href="([^"]+)">([^<]+)<\/a>/g))
  const olderPath = navLinks.find(match => stripTags(match[2]).includes('上頁'))?.[1] ?? null
  const newerPath = navLinks.find(match => stripTags(match[2]).includes('下頁'))?.[1] ?? null
  const staleAt = new Date(new Date(fetchedAt).getTime() + FEED_CACHE_SECONDS * 1000).toISOString()
  return {
    board,
    currentPath,
    articles,
    olderPath,
    newerPath,
    fetchedAt,
    staleAt,
    source: 'ptt',
  }
}

export function parseArticleHtml(html: string, board: string, articleId: string, fetchedAt = new Date().toISOString()): PttArticleResult {
  const main = html.match(/<div id="main-content"[^>]*>([\s\S]*?)<div id="article-polling"/)?.[1] ?? ''
  const author = stripTags(main.match(/<span class="article-meta-tag">作者<\/span><span class="article-meta-value">([\s\S]*?)<\/span>/)?.[1] ?? 'unknown')
  const title = stripTags(main.match(/<span class="article-meta-tag">標題<\/span><span class="article-meta-value">([\s\S]*?)<\/span>/)?.[1] ?? articleId)
  const postedAtText = stripTags(main.match(/<span class="article-meta-tag">時間<\/span><span class="article-meta-value">([\s\S]*?)<\/span>/)?.[1] ?? '')
  const body = main
    .replace(/<div class="article-metaline(?:-right)?">[\s\S]*?<\/div>/g, '')
    .replace(/<div class="push">[\s\S]*?<\/div>/g, '')
    .trim()
  const pushBlocks = Array.from(main.matchAll(/<div class="push">([\s\S]*?)<\/div>/g)).map(match => match[1])
  const pushes = pushBlocks.filter(block => stripTags(block.match(/class="[^\"]*push-tag[^\"]*">([\s\S]*?)<\/span>/)?.[1] ?? '').includes('推')).length
  const boos = pushBlocks.filter(block => stripTags(block.match(/class="[^\"]*push-tag[^\"]*">([\s\S]*?)<\/span>/)?.[1] ?? '').includes('噓')).length
  const arrows = pushBlocks.length - pushes - boos
  const tags = tagType(title)
  const article: Article = {
    id: articleId,
    board,
    title,
    author,
    authorIp: 'PTT',
    postedAt: articleDate(articleId, postedAtText),
    content: body || `<p>${escapeHtml(title)}</p>`,
    tags,
    pushes,
    boos,
    arrows,
    isHot: pushes >= 100,
    isPin: /^\[公告\]/.test(title),
    pushToBooRatio: boos > 0 ? +(pushes / boos).toFixed(2) : pushes,
    pushedToward: pushes > boos * 3 ? 'positive' : boos > pushes ? 'negative' : 'neutral',
    source: 'ptt',
    sourceUrl: `${PTT_ORIGIN}/bbs/${board}/${articleId}.html`,
    fetchedAt,
  }
  return {
    article,
    fetchedAt,
    staleAt: new Date(new Date(fetchedAt).getTime() + FEED_CACHE_SECONDS * 1000).toISOString(),
    source: 'ptt',
  }
}
