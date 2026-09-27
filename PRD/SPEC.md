# OpenPTT · Product Requirements Document v4.4

> 文件狀態：Approved for international editorial reader production release
> 更新日期：2026-09-27
> Single source of truth：本文件定義產品範圍；`PRD/UI-SPEC.md` 定義介面契約；`prototype/openptt.html` 是視覺溝通原型。

## 1. 產品定義

### 1.1 一句話

OpenPTT 是一個讓 PTT 使用者快速找到看板、掃讀文章、閱讀全文並保留個人收藏的跨平台閱讀器；它保留推、噓、箭頭、爆文等 PTT 語彙，但移除 BBS 操作的摩擦。

### 1.2 問題

PTT 的資訊密度高，但現有 Web / 行動介面在小螢幕上難以掃讀：看板入口分散、文章標題與推噓訊號層級不清、跨板回訪成本高。使用者需要的是「打開即看」而不是完整模擬終端機。

### 1.3 價值主張

| 對象 | 需求 | OpenPTT 的承諾 |
|---|---|---|
| 休閒讀者 | 5 分鐘掌握熱門討論 | 首頁以熱門板與熱門文章作為入口 |
| 重度跨板讀者 | 快速切換固定看板 | 收藏、最近瀏覽與明確的看板層級 |
| 行動使用者 | 單手掃讀，不迷路 | mobile bottom nav、卡片化資訊、清楚返回 |
| 隱私敏感使用者 | 不想註冊也能用 | guest-first；收藏與主題僅 localStorage |

### 1.4 Non-goals（MVP 明確不做）

- PTT 登入、發文、回文、推文、噓文、私人信箱與站內社交。
- 付費訂閱、廣告投放、雲端同步與跨裝置帳號；本版的「關鍵字訂閱」是免費的本機閱讀偏好，不是商業訂閱方案。
- 即時 WebSocket、推播、聊天室與影音內容。
- 自訂 CSS、複製完整 BePTT / PTT 終端機操作模型。
- 以瀏覽器端直接繞過 PTT 風控或宣稱未驗證的即時資料。

## 2. 目標、指標與假設

### 2.1 MVP 目標

1. 新使用者在 10 秒內找到一個想看的板。
2. 使用者在 3 次點擊內從首頁進入文章全文。
3. 使用者能在不登入的情況下收藏看板或文章，重新整理後仍保留。
4. 介面在 390px 寬度可單手操作，在桌面寬度可同時閱讀列表與上下文。

### 2.2 可觀測指標

| 指標 | MVP 目標 | 量測方式 |
|---|---:|---|
| 首屏可互動時間 | < 1.5s（static build） | Lighthouse / Web Vitals |
| 首頁 → 文章 | ≤ 3 clicks | 手動任務測試 |
| 搜尋回饋 | input 後 100ms 內更新 mock 結果 | performance mark |
| 主要流程可用性 | 10 位測試者中 8 位完成 | usability test |
| Accessibility | Lighthouse AA 方向；鍵盤可走完主流程 | axe / Lighthouse |

### 2.3 產品假設

- 第一階段讀者只需要閱讀；互動行為先以收藏與主題偏好驗證黏著度。
- 以「熱門訊號 + 看板分類 + 搜尋」取代複雜的推薦演算法。
- guest-first 能降低註冊阻力，但 localStorage 不是可靠資料庫；任何雲端同步都是後續明確 scope。

## 3. Personas 與主要任務

### Alex｜午休快速掃讀

- 桌面 Chrome、每天 5–10 分鐘。
- 任務：從「最近瀏覽」回到 Tech_Job，改以熱門排序，開一篇文章後返回。
- 成功：不需要記住 URL，不被多餘設定打斷。

### Betty｜手機追蹤固定看板

- Android 手機、單手操作。
- 任務：搜尋 NBA，收藏看板，閱讀熱門文章，切換深色模式。
- 成功：觸控目標至少 44px；返回與收藏狀態明確。

### Charlie｜跨板讀者

- 同時追蹤財經、科技、生活板。
- 任務：從首頁看熱門板 → 進板 → 回到收藏，再跳到另一篇收藏文章。
- 成功：不丟失上下文；收藏頁能分辨看板與文章。

## 4. 使用者流程與資訊架構

### 4.1 Sitemap

```text
OpenPTT
├── 首頁 / Dashboard
│   ├── 最近瀏覽
│   ├── 熱門看板
│   └── 熱門文章
├── 看板列表
│   ├── 完整 PTT 看板目錄同步
│   └── 搜尋 / 分類篩選
│   └── 看板頁
│       ├── 最新 / 熱門 / 板主推薦
│       └── 文章頁
├── 我的收藏
│   ├── 收藏看板
│   └── 收藏文章
├── 閱讀佇列 /queue
│   ├── 稍後閱讀文章
│   └── 清空與移除
└── 設定
    ├── 主題（系統 / 淺色 / 深色）
    └── 資料與隱私說明
```

### 4.2 核心流程

```mermaid
flowchart LR
  A[首頁] --> B[搜尋或熱門看板]
  B --> C[看板頁]
  C --> D[文章列表]
  D --> E[文章全文]
  E --> F{收藏?}
  F -->|是| G[localStorage]
  F -->|否| H[返回看板]
  G --> H
  A --> I[我的收藏]
  I --> C
  C --> J[設定看板關鍵字]
  J --> K[本機儲存訂閱]
  K --> L[新文章命中提示]
  A --> M[閱讀佇列]
  M --> D
```

### 4.3 對標 App 功能拆解

參考截圖呈現的是一個以「主選單」為核心的 PTT App：將帳號、熱門、收藏、分組、歷史、看板搜尋、設定與關於集中在一個可垂直瀏覽的入口。OpenPTT 借用其功能地圖，但維持自己的 reading-first、guest-first 定位。

| 對標功能 | OpenPTT 決策 | 產品落點 |
|---|---|---|
| 動詞熱門 / 即時熱門 | 採用 | `FR-007` Dashboard 與熱門文章入口；先用示範資料，真實更新由 adapter 提供。 |
| 我的最愛 / 文章收藏 | 採用 | `FR-004` 收藏看板與文章，localStorage 持久化。 |
| 看板歷史 / 閱讀歷史 | 採用（P1） | `FR-009` 保存最近 10 個板 / 文，提供清除入口。 |
| 全站看板搜尋 | 採用 | `FR-001` 看板名稱、描述、分類即時搜尋；全文搜尋另列 `FR-008`。 |
| 指定看板關鍵字訂閱 | 正式採用（P1） | `FR-011` 綁定單一看板與 keyword；先做 in-app 命中提示，再評估推播。 |
| 分組討論 | 延後 | 需要定義群組模型與內容治理，避免與 PTT 公開文章概念混淆。 |
| 帳號、帳號切換、私人信件 | 不採用 | 與 MVP 的 guest-first / 純閱讀邊界衝突。 |
| 推文歷史、圖片上傳紀錄、水球紀錄 | 不採用 | 屬於登入互動或站內社交行為，不是本產品核心任務。 |
| 贊助 / 付費方案 | 延後 | 先驗證閱讀與訂閱使用率，不在本階段加入商業化 UI。 |
| 設定 / 關於 / 資料來源 | 採用 | 設定頁提供主題、本機資料清除、關鍵字訂閱管理與 mock / stale 說明。 |

## 5. 功能需求與 Acceptance Criteria

### P0：MVP 必須完成

| ID | 功能 | 狀態 | Acceptance Criteria |
|---|---|---|---|
| FR-001 | 看板探索 | shipped | AC-001：展示至少 30 個看板與 8 個分類；AC-002：可依名稱、描述、分類即時搜尋；AC-003：空結果有明確 empty state。 |
| FR-002 | 看板文章列表 | shipped | AC-004：每列展示標題、標籤、作者、時間、推/噓/箭頭；AC-005：最新、熱門、板主推薦三種排序可切換；AC-006：點擊列進入全文。 |
| FR-003 | 文章閱讀 | shipped | AC-007：展示標題、看板、作者、時間、推噓摘要與內文；AC-008：HTML 內容先經 DOMPurify；AC-009：文章不存在時顯示可返回的錯誤狀態。 |
| FR-004 | 收藏 | shipped | AC-010：可收藏看板與文章；AC-011：重新整理後保留；AC-012：收藏頁可移除與拖曳排序，並區分類型。 |
| FR-005 | 主題 | shipped | AC-013：支援系統、淺色、深色；AC-014：選擇持久化；AC-015：切換後文字與邊界仍符合對比要求。 |
| FR-006 | Guest-first | shipped | AC-016：不登入即可完成探索、閱讀、收藏與主題切換；AC-017：介面不出現假的登入門檻。 |

### P1：下一個產品 increment

| ID | 功能 | 目的 | 驗收方向 |
|---|---|---|---|
| FR-007 | 首頁 Dashboard | 降低回訪成本 | 最近瀏覽、收藏看板、熱門文章有穩定入口；首次使用有空狀態。 |
| FR-008 | 全文搜尋 | 從「找板」擴展到「找文」 | 搜尋標題與內容；顯示結果板名、時間、命中摘要；無結果可清除。 |
| FR-009 | 最近瀏覽 | 保留閱讀上下文 | 最近 10 個板 / 文 localStorage；可清除，不存內容以外的個資。 |
| FR-010 | 真實 PTT 資料 adapter | 進行中 | UI 只依賴 typed adapter；每個看板完整列出 PTT 目前 index page 實際提供的文章，支援歷史頁翻頁；資料經 server-side proxy 取得並以 1 小時 cache window 更新，資料過期顯示 timestamp 與 stale state。 |
| FR-011 | 指定看板關鍵字訂閱 | 降低重複搜尋成本 | AC-018：從看板頁建立「看板 + 關鍵字」訂閱；AC-019：比對文章標題、內容與 tags；AC-020：訂閱可啟用、停用、刪除；AC-021：重新整理後保留；AC-022：命中只先提供 in-app 提示，不宣稱已接通推播。 |
| FR-016 | 閱讀佇列 | 保存稍後閱讀上下文 | AC-029：文章列可加入或移出閱讀佇列；AC-030：`/queue` 顯示佇列文章、看板與加入時間；AC-031：重新整理後保留最多 30 筆；AC-032：可單筆移除或清空；AC-033：資料只寫入本機 localStorage，不上傳、不推播、不宣稱雲端同步。 |
| FR-017 | 完整 PTT 看板目錄 | 讓使用者搜尋全站分類，而非只看固定熱門板 | AC-034：`/api/ptt/catalog` 由 server-side adapter 讀取 PTT 官方分類樹並回傳去重後的看板目錄；AC-035：看板列表支援完整目錄的名稱、描述與分類搜尋，並以 1 小時 CDN cache 降低上游壓力；AC-036：目錄同步失敗時回退到本機示範目錄並清楚標示來源，不阻斷既有閱讀流程；AC-037：從動態目錄點入的看板可正常進入看板頁並沿用 PTT adapter。 |
| FR-018 | 跨板熱門聚合 | 讓首頁與熱門頁共用一致的跨板訊號 | AC-038：新增 `/api/ptt/cross-board`，由 server-side adapter 對一組代表性看板 fan-out 取得 typed feed；AC-039：fan-out 上限 12 板、可由 query string `boards` 與 `limit` 控制；AC-040：回傳 `source: 'ptt' \| 'mock'`、`partial: boolean`、`boards[].status: 'ptt' \| 'mock' \| 'failed'`、`fetchedAt`、`staleAt`，並使用 1 小時 `s-maxage` + `stale-while-revalidate`；AC-041：去重後依推數與時間排序，總數上限 60；AC-042：DashboardPage、HotPage、LiveHotPage 透過 typed client adapter `fetchCrossBoardFeed` 與 hook `useCrossBoardFeed` 取得資料；AC-043：來源為 mock 時 UI 顯示「示範快照 · PTT 暫時無法取得，資料可能過期」並保留可閱讀文章；部分看板失敗時 `partial=true` 並在 UI 標示「部分看板失敗」。 |

### P2：驗證後才做

| ID | 功能 | 前置條件 |
|---|---|---|
| FR-012 | Web Push / APNs / FCM | 先完成關鍵字訂閱的命中規則與通知偏好，再驗證瀏覽器 / 原生權限流程。 |
| FR-013 | Capacitor iOS / Android | Web UI 完成 mobile QA，且定義原生權限策略。 |
| FR-014 | 多板 Dashboard 拖拽 | 先有足夠收藏與回訪資料，避免空功能。 |
| FR-015 | 虛擬滾動 | 以 profiling 證明長列表為瓶頸後才引入。 |

### FR-018 對應 UI 編號（cross-feed source / fallback）

| UI 編號 | 元件 | 內容 / 驗證對象 |
|---|---|---|
| UI-018a | DashboardPage `data-testid="dashboard-cross-source"` | 「來源：PTT · 跨 N 板」或「示範快照 · PTT 暫時無法取得」 |
| UI-018b | DashboardPage `data-testid="dashboard-feed-meta"` | 文章總數 + 來源與最近同步時間，含 `partial` 註記 |
| UI-018c | DashboardPage `data-testid="dashboard-source-note"` | 「跨板聚合每小時更新 · 最近同步於 …」或 mock fallback copy |
| UI-018d | DashboardPage `data-testid="dashboard-cross-stale"` | fetch 失敗時的 stale banner |
| UI-018e | HotPage `data-testid="hot-source-meta"` | 「來源：PTT · 跨 N 板」/「示範快照」標頭 |
| UI-018f | HotPage `data-testid="hot-stale-banner"` | fetch 失敗時降級提示 |
| UI-018g | HotPage `data-testid="hot-source-mock-{id}"` | 顯示 mock 文章的「示範」徽章 |
| UI-018h | LiveHotPage `data-testid="live-hot-updated"` | 即時熱門更新時間與來源文字 |
| UI-018i | LiveHotPage `data-testid="live-hot-stale-banner"` | fetch 失敗時降級提示 |
| UI-018j | LiveHotPage `data-testid="live-hot-source-{id}"` | 每篇文章的「即時 / 示範」徽章 |

### FR-010 真實 PTT 資料 adapter Acceptance Criteria

- AC-023：`/board/:board` 預設載入該 PTT 看板目前 index page 的完整文章列（數量由 PTT 當下頁面決定），不再以固定 6 篇 mock 文章冒充真實資料。
- AC-024：看板頁可往較舊／較新的 PTT index page 翻頁；目前頁碼由 PTT source page 決定，不在前端虛構總頁數。
- AC-025：點擊真實文章後，由 server-side adapter 取得 PTT 全文、作者、時間與推噓摘要；瀏覽器不直接呼叫 `ptt.cc`。
- AC-026：adapter 回傳 `source`、`fetchedAt`、`staleAt`；UI 顯示資料來源與最近同步時間。
- AC-027：Vercel response 使用 `s-maxage=3600` 與 stale-while-revalidate；同一看板資料最多每小時重新抓取一次，手動重新整理可重新驗證。
- AC-028：PTT 回應逾時、看板受限或格式變更時，保留可閱讀的 mock fallback，並顯示「資料可能過期」錯誤狀態，不顯示假即時標籤。

### FR-018 跨板熱門聚合 Acceptance Criteria

- AC-038（API 契約）：`GET /api/ptt/cross-board` 回傳 `{ boards: CrossBoardBoardReport[]; articles: CrossBoardArticle[]; fetchedAt; staleAt; source: 'ptt' | 'mock'; partial: boolean }`，response 帶 `Cache-Control: public, s-maxage=3600, stale-while-revalidate=300` 與 `X-OpenPTT-Fetched-At`。
- AC-039（輸入控管）：`boards` 最多 12 筆，過長截斷；空或缺值回退預設 8 板；`limit` 介於 1..60，越界或非法值回退預設 30。
- AC-040（來源透明度）：每板回報 `status: 'ptt' | 'mock' | 'failed'`；當任一板回傳 PTT 資料時整體 `source = 'ptt'`，全部失敗時 `source = 'mock'`；失敗與成功並存時 `partial = true`。
- AC-041（聚合規則）：依 `board:articleId` 去重；合併後依推數遞減、發文時間遞減排序；總筆數依 `limit` 截斷。
- AC-042（前端整合）：`web/src/data/remote.ts` 匯出 `fetchCrossBoardFeed`；`web/src/lib/useCrossBoardFeed.ts` 提供 `data/loading/error/refresh`；DashboardPage、HotPage、LiveHotPage 皆透過該 hook 取得 typed feed；瀏覽器不直接呼叫 ptt.cc。
- AC-043（降級）：PTT 全部失敗時 UI 改顯示示範快照，並在 DashboardPage 顯示「示範資料」、在 HotPage 顯示「示範快照 · PTT 暫時無法取得，資料可能過期」、在 LiveHotPage 顯示「示範快照（資料可能過期）」；`partial=true` 時三頁皆有對應 banner 文字。

「全部文章」的產品定義是「目前 PTT index page 的完整列 + 可翻頁的歷史 index pages」；不包含一次性下載 PTT 全站自建以來的無限歷史文章。文章全文採點擊載入，避免每小時抓取數百篇文章造成來源負載。

## 6. Domain 與資料契約

### 6.1 BoardMeta

```ts
interface BoardMeta {
  name: string
  category: string
  description: string
  subscribers: number
  isHot?: boolean
}
```

### 6.2 Article

```ts
interface Article {
  id: string
  board: string
  title: string
  author: string
  authorIp: string
  postedAt: string // ISO 8601
  content: string // sanitize before render
  tags: string[]
  pushes: number
  boos: number
  arrows: number
  isHot: boolean
  isPin: boolean
  pushToBooRatio?: number
  pushedToward: 'positive' | 'negative' | 'neutral'
  source?: 'mock' | 'ptt'
  sourceUrl?: string
  fetchedAt?: string
}

interface BoardFeedPage {
  board: string
  page: number // 0 = PTT 最新頁
  articles: Article[]
  hasOlder: boolean
  hasNewer: boolean
  fetchedAt: string
  staleAt: string
  source: 'ptt' | 'mock'
}
```

### 6.3 KeywordSubscription

```ts
interface KeywordSubscription {
  id: string
  board: string
  keyword: string
  enabled: boolean
  createdAt: number
}
```

規則：關鍵字以 trim 後的 case-insensitive substring 比對 `title`、`content` 與 `tags`；同一看板不可建立完全相同的啟用中訂閱；每筆訂閱只綁定一個看板。prototype 以 in-app 命中提示示範，production notification channel 另由 FR-012 定義。

### 6.4 Local storage

| Key | 內容 | 失敗策略 |
|---|---|---|
| `openptt:favorites` | 收藏看板 / 文章陣列 | try/catch；回退到 memory-only |
| `openptt:theme` | `light` / `dark` / `system` | 回退到 system preference |
| `openptt:recent`（P1） | 最近瀏覽 id 陣列 | 無法寫入時不阻斷閱讀 |
| `openptt:keyword-subscriptions`（P1） | `KeywordSubscription[]` | 無法寫入時不阻斷閱讀，顯示本次不會保留 |
| `openptt:queue`（P1） | `QueueItem[]`，最多 30 筆稍後閱讀文章 | 無法寫入時不阻斷閱讀，維持 memory-only |

不得儲存 PTT 密碼、token、email、完整 IP 歷史或任何不必要的個資。

## 7. 技術架構與降級

```text
React SPA / Vite
  ├── Router: board list → board → article
  ├── Domain: typed PTT adapter + mock fallback
  ├── Vercel Functions: server-side PTT HTML proxy / parser
  │   └── PTT 受限時使用 reader-proxy 取得同一公開頁面，再轉成 typed feed
  ├── Cache: Vercel CDN s-maxage 3600s + stale-while-revalidate
  ├── Storage: favorites + theme (localStorage)
  ├── Security: DOMPurify before HTML render
  └── Deploy: Vercel static output + serverless API
```

### 降級策略

- 資料 adapter 失敗：顯示最後一次可用資料與「資料可能過期」提示。
- PTT 看板受限或來源格式變更：不繞過登入／18 歲驗證／風控；回退 mock，並保留錯誤與最後同步時間。
- localStorage 不可用：功能仍可使用，但提示「本次瀏覽不會保留收藏」。
- 圖片載入失敗：顯示固定比例 placeholder，不讓文章排版跳動。
- 深色模式讀不到系統偏好：預設淺色。

## 8. 非功能需求

| 類別 | 要求 |
|---|---|
| Performance | FCP < 1.5s；production JS gzip 目標 < 300KB；列表避免不必要 re-render。 |
| Accessibility | 語意 heading；按鈕有 accessible name；鍵盤 focus visible；色彩不是唯一訊號；觸控目標 ≥ 44px。 |
| Responsive | 390px、768px、1440px 三個 QA viewport；mobile bottom nav，desktop sidebar。 |
| Security | DOMPurify；不把未信任內容插入 `innerHTML`；CSP 由部署層補上。 |
| Privacy | guest-first、無第三方追蹤、資料來源與 mock 狀態可見。 |
| Compatibility | 最新 Chrome、Safari、Firefox、Edge；iOS Safari PWA 先以 Web QA 覆蓋。 |

## 9. Definition of Done

### MVP（現況基線）

- [x] FR-001 ～ FR-006 完成且有對應測試。
- [x] TypeScript strict 通過。
- [x] Vitest 現有 10 條測試通過。
- [x] `npm run build` 通過。
- [ ] Lighthouse Performance / Accessibility ≥ 90：需在瀏覽器環境驗證。
- [ ] UI-SPEC 對應的 React visual QA：prototype 核准後進行。
- [ ] FR-011 關鍵字訂閱 production implementation：prototype 已示範，React / data adapter 尚未接入。

### International editorial reader production release

- [x] UI-SPEC v2.0 確認後已落地 React production UI：editorial reading desk、水平 masthead、mobile drawer / bottom nav、dark mode 與 source boundary。
- [x] FR-016 閱讀佇列完成 localStorage adapter、`/queue` route、加入／移除／清空流程與自動化測試。
- [x] FR-017 完整 PTT 看板目錄：server-side 分類樹同步、localStorage cache、分類／搜尋與動態看板路由。
- [x] `npm run typecheck`、`npm test`、`npm run build`、`git diff --check` 通過；browser smoke 已驗證搜尋、文章 route 與 queue。
- [ ] Production deploy、Lighthouse / axe 與三向對齊：release gate 執行中。

### 每個後續 feature

- 有 FR / AC 編號與測試案例。
- mobile + desktop 版面都有驗證。
- loading、empty、error、stale、success 狀態都有設計。
- deterministic checks 有 command output 與 exit code 證據。

## 10. Milestones

| Milestone | 內容 | 狀態 |
|---|---|---|
| M1 | 5 個 P0 + Web PWA 骨架 | ✅ |
| M2 | PTT 看板目錄、分類、排序、搜尋、metadata | ✅ |
| M2.5 | PRD v4 + UI-SPEC + HTML prototype | 🔄 本次 |
| M3 | 以 UI-SPEC 重構 React visual layer + P1 Dashboard / recent / keyword subscription | ⏳ 待 prototype review |
| M4 | 真實 PTT 資料 adapter、文章全文 proxy、歷史頁翻頁、1 小時 stale state | 🔄 本次 |
| M5 | Mobile QA 後評估 Capacitor / notifications | ⏳ |

## 11. 風險與決策

| 風險 | 影響 | 決策 / 緩解 |
|---|---|---|
| PTT 資料來源或規則變更 | 高 | 將 adapter 與 UI 解耦；prototype 與 mock 不宣稱即時。 |
| 使用者以為可登入互動 | 中 | 全站 copy 明示「閱讀模式」與 guest 狀態。 |
| localStorage 清除或滿額 | 中 | try/catch + 不阻斷閱讀 + P1 提供清除與備份思路。 |
| UI 過度像管理後台 | 中 | 以 reading-first layout、文章層級與 board context 作為 UI-SPEC 核心。 |
| 真實資料帶入 HTML | 高 | DOMPurify；不允許未消毒內容渲染。 |
| PTT 來源限流或 Cloudflare 規則變更 | 高 | server-side adapter、每看板 1 小時 cache、reader-proxy fallback、逾時 fallback；不在瀏覽器繞過風控。 |

### ADR-001｜閱讀優先，不複製終端機

採卡片與清楚 typography 層級，保留 PTT 語意訊號但不複製等寬終端機排版。原因是目標包含手機與第一次接觸 PTT 的使用者。

### ADR-002｜Guest-first local-only MVP

在尚未驗證內容黏著與登入需求前，不引入 auth / DB / payment；收藏與主題使用 localStorage，並提供明確降級。

### ADR-003｜Prototype 與 production 分離

HTML prototype 位於 `prototype/`，可快速評審 UI flow，不污染 Vite bundle，也不把 prototype mock 當 production 完成證據。

## 12. 目前已知缺口

- `web/public/dashboard.html` 是舊的通用 dashboard 草稿，待 prototype 核准後移除或改成 redirect，避免兩套 UI source of truth。
- M4 第一階段只保證看板文章列表與文章全文真實來源；FR-018 跨板熱門聚合（AC-038..AC-043）已接上 typed adapter 與 UI 整合，仍未做 source-priority 排序與看板權重。
- `ci.yml` 的 lint job 目前可在沒有 lint script 時繼續通過；需另開 engineering debt 修正。
