export interface BoardMeta {
  name: string
  category: string
  description: string
  subscribers: number
  isHot?: boolean
}

export const BOARDS: BoardMeta[] = [
  { name: 'Stock', category: '財經', description: '股票討論板', subscribers: 125000, isHot: true },
  { name: 'Foreign_Exchange', category: '財經', description: '外匯投資討論', subscribers: 28000 },
  { name: 'Bank_Service', category: '財經', description: '銀行服務', subscribers: 9500 },
  { name: 'Option', category: '財經', description: '選擇權交易', subscribers: 7800 },
  { name: 'Tech_Job', category: '科技', description: '科技業職缺板', subscribers: 85000, isHot: true },
  { name: 'PC_Shopping', category: '科技', description: '電腦選購與組裝', subscribers: 62000, isHot: true },
  { name: 'MobileComm', category: '科技', description: '行動通訊', subscribers: 41000 },
  { name: 'Browsers', category: '科技', description: '瀏覽器使用', subscribers: 5200 },
  { name: 'iOS', category: '科技', description: 'Apple iOS', subscribers: 38000 },
  { name: 'Android', category: '科技', description: 'Android 系統', subscribers: 32000 },
  { name: 'Gossiping', category: '娛樂', description: '八卦板', subscribers: 380000, isHot: true },
  { name: 'movie', category: '娛樂', description: '電影討論', subscribers: 32000 },
  { name: 'Marvel', category: '娛樂', description: 'Marvel 漫威', subscribers: 22000 },
  { name: 'KoreaStar', category: '娛樂', description: '韓星追星', subscribers: 45000 },
  { name: 'TW_Entertainment', category: '娛樂', description: '台灣演藝娛樂', subscribers: 38000 },
  { name: 'NBA', category: '運動', description: 'NBA 籃球', subscribers: 92000, isHot: true },
  { name: 'Baseball', category: '運動', description: '棒球討論', subscribers: 110000, isHot: true },
  { name: 'CPBL', category: '運動', description: '中華職棒', subscribers: 45000 },
  { name: 'MLB', category: '運動', description: '美國職棒', subscribers: 38000 },
  { name: 'Tennis', category: '運動', description: '網球', subscribers: 9500 },
  { name: 'Boy-Girl', category: '感情', description: '兩性互動', subscribers: 65000, isHot: true },
  { name: 'marriage', category: '感情', description: '結婚、婚姻', subscribers: 28000 },
  { name: 'Lesbian', category: '感情', description: '女同志', subscribers: 18000 },
  { name: 'Gay', category: '感情', description: '男同志', subscribers: 22000 },
  { name: 'C_Chat', category: '生活', description: '學術與生活', subscribers: 28000 },
  { name: 'Lifeismoney', category: '生活', description: '省錢、優惠', subscribers: 72000 },
  { name: 'TaichungBun', category: '生活', description: '台中板', subscribers: 38000 },
  { name: 'car', category: '生活', description: '汽車討論', subscribers: 95000 },
  { name: 'Food', category: '生活', description: '美食推薦', subscribers: 48000 },
  { name: 'Beauty', category: '生活', description: '美妝保養', subscribers: 35000 },
  { name: 'HatePolitics', category: '政治', description: '政治評論', subscribers: 145000, isHot: true },
  { name: 'Japan_Travel', category: '旅遊', description: '日本旅遊', subscribers: 28000 },
  { name: 'Korea_Travel', category: '旅遊', description: '韓國旅遊', subscribers: 8500 },
]

export const CATEGORIES = ['財經', '科技', '娛樂', '運動', '感情', '生活', '政治', '旅遊']

export interface Article {
  id: string
  board: string
  title: string
  author: string
  authorIp: string
  postedAt: string
  content: string
  tags: string[]
  pushes: number
  boos: number
  arrows: number
  isHot: boolean
  isPin: boolean
  pushToBooRatio?: number
  pushedToward: 'positive' | 'negative' | 'neutral'
}

const boardSeeds: Record<string, string[]> = {
  Stock: ['台積電法說會後法人目標價上修到 1500', '聯準會放鴿台股明年 Q1 還有高點', '0050 vs 0056 配息率實測', '航海王回來了?長榮 Q3 營收爆發', '美股 VIX 飆升台股下週該逃命嗎', 'AI 概念股退潮?廣達緯創還能進場嗎'],
  Gossiping: ['[爆卦] 某科技公司大裁員 200 人受影響', '賴清德出訪過境美國鄉民反應兩極', '台北房價還會跌嗎實價登陸最新數據', '[新聞] 三星電子 Q3 財報超預期', 'iPhone 18 爆料來了 A20 處理器實測', '[爆卦] BTS 要來台灣開演唱會嗎'],
  Tech_Job: ['Google L7 軟體工程師面試心得', '台積電 EE 部門面試經驗', '面試被問五年後想做什麼要怎麼回答', '2027 應屆畢業該選哪家 offer', 'Junior backend 跳槽可以談多少'],
  NBA: ['Curry 傷後歸隊勇士戰績能否回溫', 'LeBron 40 歲了還在打這科學嗎', '勇士隊交易傳聞 Kuminga 會被交易嗎', 'NBA 2027 MVP 預測 Tatum 還是 Doncic', '新秀榜單更新 2026 梯誰打出來了'],
  Baseball: ['大谷翔平 2026 年球季最終成績整理', '日本武士隊 12 強名單預測', '中職新人王之爭 古林 vs 林昱珉', 'MLB 自由球員市場大咖去向預測', 'MLB 道奇 vs 洋基世界大賽 G1 預測'],
  Movie: ['[好雷] 鬼滅之刃無限城篇', 'Re: 沙丘 3 上映跟小說差多少'],
  Lifeismoney: ['[情報] 全聯 PX Pay 滿 500 送 50', 'Re: 信用卡推薦 2027 必辦卡'],
  HatePolitics: ['賴清德國慶演說全文', 'Re: 藍白合不合最新民調', '[新聞] 立法院三讀通過法案'],
  car: ['[問題] Toyota Altis 2027 值得買嗎', 'Re: 特斯拉 Model Y 二手價崩盤'],
  Food: ['[食記] 台中 20 家必吃拉麵', 'Re: 台北米其林 2027 名單'],
  'Boy-Girl': ['[求助] 女友說我太黏怎麼辦', 'Fw: 學長劈腿了好幾個學妹'],
}

const boardAuthors: Record<string, string[]> = {
  Stock: ['abcStock', 'KID8', 'sillylily'],
  Gossiping: ['newsman', 'gossipKing', 'taipei_8F'],
  Tech_Job: ['engres', 'jeffery', 'assn911'],
  NBA: ['dunk', 'lebron23', 'curry30'],
  Baseball: ['coach', 'pitcher99', 'tiger'],
}

function tagType(title: string): string[] {
  const tags: string[] = []
  if (title.startsWith('Re:')) tags.push('Re:')
  if (title.startsWith('Fw:')) tags.push('Fw:')
  if (title.match(/^\[新聞\]/)) tags.push('新聞')
  if (title.match(/^\[爆卦\]/)) tags.push('爆卦')
  if (title.match(/^\[問卦\]/)) tags.push('問卦')
  if (title.match(/^\[食記\]/)) tags.push('食記')
  if (title.match(/^\[新聞\]/)) tags.push('新聞')
  if (title.match(/^\[好雷\]/)) tags.push('好雷')
  if (title.match(/^\[負雷\]/)) tags.push('負雷')
  if (title.match(/^\[求助\]/)) tags.push('求助')
  if (title.match(/^\[情報\]/)) tags.push('情報')
  if (title.match(/^\[問題\]/)) tags.push('問題')
  return Array.from(new Set(tags))
}

function generateArticles(board: string): Article[] {
  const seeds = boardSeeds[board] ?? []
  if (seeds.length === 0) return []
  const authors = boardAuthors[board] ?? ['user123', 'abc', 'xyz']
  return seeds.map((title, i) => {
    const tags = tagType(title)
    const pushes = Math.floor(Math.random() * 250)
    const boos = Math.floor(Math.random() * 30)
    const arrows = Math.floor(Math.random() * 15)
    return {
      id: `${board}-${i + 1}`,
      board,
      title,
      author: authors[i % authors.length],
      authorIp: ['台北市', '新北市', '桃園市', '新竹市'][i % 4],
      postedAt: new Date(Date.now() - i * 3600 * 1000).toISOString(),
      content: `<p>這是 <strong>${board}</strong> 板的 Sprint 2 mock 文章,標題為「${title}」。</p><p>Ptt 格式特色:換行不加空段、推爆文門檻 100 推、爆文自動置頂 24 小時。</p><p>${tags.length > 0 ? '標籤: ' + tags.join(', ') : ''}</p>`,
      tags,
      pushes,
      boos,
      arrows,
      isHot: pushes >= 100,
      isPin: i === 0 || pushes >= 100,
      pushToBooRatio: boos > 0 ? +(pushes / boos).toFixed(2) : 99,
      pushedToward: pushes > boos * 3 ? 'positive' as const : boos > pushes ? 'negative' as const : 'neutral' as const,
    }
  })
}

export function getArticles(board: string, sort: 'time' | 'hot' | 'pin' = 'time'): Article[] {
  const arts = generateArticles(board)
  if (sort === 'time') return arts.sort((a, b) => b.postedAt.localeCompare(a.postedAt))
  if (sort === 'hot') return arts.sort((a, b) => b.pushes - a.pushes)
  return arts.sort((a, b) => Number(b.isPin) - Number(a.isPin))
}

export function getArticle(board: string, id: string): Article | undefined {
  return generateArticles(board).find((a) => a.id === id)
}

export function getTopBoards(limit = 20): BoardMeta[] {
  return [...BOARDS].sort((a, b) => b.subscribers - a.subscribers).slice(0, limit)
}

export function searchBoards(query: string): BoardMeta[] {
  if (!query) return BOARDS
  const q = query.toLowerCase()
  return BOARDS.filter(b =>
    b.name.toLowerCase().includes(q) ||
    b.description.toLowerCase().includes(q) ||
    b.category.toLowerCase().includes(q)
  )
}

export function getCategoryStats() {
  const stats: Record<string, number> = {}
  for (const b of BOARDS) {
    stats[b.category] = (stats[b.category] ?? 0) + 1
  }
  return stats
}
