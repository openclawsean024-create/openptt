export interface BoardMeta {
  name: string
  category: string
  description: string
  subscribers: number
}

export const BOARDS: BoardMeta[] = [
  { name: 'Stock', category: '財經', description: '股票討論板,台股、美股、總經', subscribers: 125000 },
  { name: 'Gossiping', category: '娛樂', description: '八卦板,最大宗的鄉民集散地', subscribers: 380000 },
  { name: 'Tech_Job', category: '科技', description: '科技業職缺板', subscribers: 85000 },
  { name: 'NBA', category: '運動', description: 'NBA 籃球討論', subscribers: 92000 },
  { name: 'Baseball', category: '運動', description: '棒球討論,中職、MLB、日職', subscribers: 110000 },
]

export interface Article {
  id: string
  board: string
  title: string
  author: string
  postedAt: string
  content: string
  pushes: Push[]
}

export interface Push {
  type: '推' | '噓' | '→' | '爆'
  user: string
  content: string
  time: string
}

function generateArticles(board: string): Article[] {
  const seeds: Record<string, string[]> = {
    Stock: [
      '台積電法說會後,法人目標價上修到 1500',
      '聯準會放鴿,台股明年 Q1 還有高點?',
      '0050 vs 0056,2027 年配息率實測比較',
      '航海王回來了?長榮、陽明 Q3 營收爆發',
      '美股 VIX 飆升,台股下週該逃命嗎?',
      '台股萬九保衛戰,法人買賣超全解析',
      'AI 概念股退潮?廣達、緯創現在還能進場嗎',
      '0056 季配 1.2 元,存股族的最愛回來了',
    ],
    Gossiping: [
      '[爆卦] 某科技公司大裁員,200 人受影響',
      '賴清德出訪過境美國,鄉民反應兩極',
      '台北房價還會跌嗎?網友整理實價登陸最新數據',
      '求問》台灣哪一間大學 CS 最值得讀',
      '[新聞] 三星電子 Q3 財報超預期',
      'iPhone 18 爆料來了,A20 處理器效能實測',
      '鄉民問卦》台灣最頂的咖啡廳在哪',
      '[爆卦] BTS 要來台灣開演唱會?經紀公司回應了',
    ],
    Tech_Job: [
      '[請益] 104 vs 518,哪個媒合率比較高',
      'Google L7 軟體工程師面試心得分享',
      '台積電 EE 部門面試經驗(內附考題)',
      '[心得] 從 IC design 轉職 web,值不值得',
      '面試被問「五年後想做什麼」要怎麼回答',
      '[請益] 2027 應屆畢業,該選哪家 offer',
      'Junior backend 兩年經驗,跳槽可以談多少',
      '外商 vs 本土,軟體工程師薪資結構差多少',
    ],
    NBA: [
      '[Live] 湖人 vs 勇士,G5 戰況文字直播',
      'Curry 傷後歸隊,勇士戰績能否回溫',
      'LeBron 40 歲了還在打,這科學嗎?',
      '勇士隊交易傳聞,Kuminga 會被交易嗎',
      'NBA 2027 MVP 預測:Tatum 還是 Doncic',
      '[討論] 字母哥轉隊的可能性,目前傳聞整理',
      '新秀榜單更新:2026 梯誰打出來了',
      '[爆卦] 某球星私生活醜聞,聯盟調查中',
    ],
    Baseball: [
      '[Live] 中職總冠軍賽 G7,中信 vs 統一',
      '大谷翔平 2026 年球季最終成績整理',
      '日本武士隊 12 強名單預測',
      '中職新人王之爭:古林 vs 林昱珉',
      '[討論] 統一獅明年會換總教練嗎',
      'MLB 自由球員市場,大咖去向預測',
      '王建民回台灣任教?棒協最新回應',
      'MLB 道奇 vs 洋基,世界大賽 G1 預測',
    ],
  }
  const items = seeds[board] ?? []
  return items.map((title, i) => ({
    id: `${board}-${i + 1}`,
    board,
    title,
    author: `user${i + 100}`,
    postedAt: new Date(Date.now() - i * 3600 * 1000).toISOString(),
    content: `<p>這是 ${board} 板的 mock 文章內容。</p><p>標題:<strong>${title}</strong></p><p>內文展示 HTML 渲染、圖片 lazy load、推噓等功能。</p><p>這段示範文字用於版面測試,不對應真實 PTT 內容。</p>`,
    pushes: Array.from({ length: 12 }, (_, j) => ({
      type: (['推', '推', '推', '噓', '→', '推'] as const)[j % 6],
      user: `${board.toLowerCase()}_pusher_${j + 1}`,
      content: `${['+1', '先推再說', '這篇有料', '鄉民專業', '同意樓上', '已收藏'][j % 6]}`,
      time: new Date(Date.now() - j * 600 * 1000).toISOString(),
    })),
  }))
}

export function getArticles(board: string): Article[] {
  return generateArticles(board)
}

export function getArticle(board: string, id: string): Article | undefined {
  return generateArticles(board).find((a) => a.id === id)
}

export function getTopBoards(): BoardMeta[] {
  return [...BOARDS].sort((a, b) => b.subscribers - a.subscribers).slice(0, 20)
}
