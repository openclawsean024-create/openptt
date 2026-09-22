# OpenPTT — Sprint 1+2 驗收狀態

## M3 React production increment（2026-09-21）

- ✅ \`web/index.html\` 已修正為 Vite React root，不再轉址到舊 \`public/dashboard.html\`。
- ✅ reading-first responsive shell：desktop sidebar、mobile bottom nav、mobile menu drawer。
- ✅ Dashboard、熱門文章、閱讀歷史與設定頁已接入 React Router。
- ✅ FR-009：最近 10 個看板 / 文章寫入 \`openptt:recent\`，可在首頁與歷史頁檢視、清除。
- ✅ FR-011：指定看板關鍵字訂閱寫入 \`openptt:keyword-subscriptions\`，支援建立、命中 badge、啟用 / 停用、刪除與設定頁管理。
- ✅ React smoke：Dashboard、Stock 訂閱建立、命中提示、設定管理、390px mobile menu 已以瀏覽器驗證。
- ✅ deterministic checks：typecheck、23/23 Vitest、build、\`git diff --check\` 通過；route smoke 18 條全部回傳 200 且保留 React root/title。
- ✅ Codex + MiniMax follow-up：補齊看板空狀態／分類篩選、文章不存在 recovery、最愛 tabs + undo toast、Dashboard 搜尋與 `/` 快捷鍵，以及 SettingsPage UI-006 資料與隱私清除區塊；驗收紀錄見 `PRD/MINIMAX-HANDOFF.md`。

下一個 bounded increment：以瀏覽器做 390px / desktop 的 production visual QA，再評估真實 PTT data adapter；本輪不部署、不 push。

## M2.5 規格與 UI 原型（2026-09-21，歷史快照）

- ✅ `PRD/SPEC.md` 重整為 v4.0：產品邊界、Persona、FR/AC、資料契約、NFR、里程碑與風險。
- ✅ `PRD/UI-SPEC.md`：UI v1.0，涵蓋 responsive shell、screen contract、component contract、a11y 與 states。
- ✅ `prototype/openptt.html`：獨立 HTML prototype，涵蓋首頁、看板列表、看板頁、文章閱讀、收藏、指定看板關鍵字訂閱、主題切換與 mobile nav。
- ✅ 關鍵字訂閱規格：每筆綁定單一看板與單一 keyword；prototype 以 in-app 命中提示示範，不宣稱已接通推播。
- ✅ prototype review 已完成；後續 M3 production increment 見上方。

> 最後驗收: 2026-09-05 (sandbox 自動驗證)
> HEAD commit: `7fd14eb feat: OpenPTT Sprint 1+2`

## 7 條驗收項 (Sprint 1+2)

- [x] **1. ≥ 30 個看板**
  - 證據: `grep -c "^  { name:" web/src/data/boards.ts` = **33** 條
  - 涵蓋: Stock, Gossiping, Tech_Job, NBA, Baseball 5 個 Sprint 1 看板 + 28 個新看板 (Foreign_Exchange, Bank_Service, Option, PC_Shopping, MobileComm, Browsers, iOS, Android, movie, Marvel, KoreaStar, TW_Entertainment, CPBL, MLB, Tennis, Boy-Girl, marriage, Lesbian, Gay, C_Chat, Lifeismoney, TaichungBun, car, Food, Beauty, HatePolitics, Japan_Travel, Korea_Travel)

- [x] **2. 看板分類樹 8+ 個**
  - 證據: `web/src/data/boards.ts` → `export const CATEGORIES = ['財經', '科技', '娛樂', '運動', '感情', '生活', '政治', '旅遊']` (8 個)

- [x] **3. 文章列表 3 種排序**
  - 證據: `web/src/pages/BoardPage.tsx:10` → `useState<'time' | 'hot' | 'pin'>('time')` + `data-testid="sort-select"` UI
  - 實作位置: BoardPage L10 宣告三態 sort, L12 傳入 `getArticles(boardName, sort)`, L39–42 渲染 select

- [x] **4. 看板搜尋 (輸入即時過濾)**
  - 證據: `web/src/pages/BoardListPage.tsx` 匯入 `searchBoards` 並 `useMemo(() => searchBoards(search), [search])` 即時過濾
  - 搜尋函式: `web/src/data/boards.ts` → `export function searchBoards(query: string): BoardMeta[]`

- [x] **5. TypeScript strict**
  - 證據: `web/tsconfig.json` → `"strict": true`
  - 執行: `cd web && npx tsc --noEmit` → **0 error** (sandbox 實跑通過)

- [x] **6. 5+ 個 E2E 全綠**
  - 證據: **10/10** vitest 通過 (`cd web && npx vitest run`)
  - 涵蓋:
    - 5 個 P0 (Sprint 1): 看板列表渲染 / 文章列表 / 加入最愛 / 深色模式切換 / 移除最愛
    - 5 個 Sprint 2: 看板數 ≥ 30 / 搜尋 "NBA" 有結果 / 文章列表 3 種排序 / 搜尋無結果 / 搜尋 by 類別

- [ ] **7. Lighthouse Performance ≥ 90**
  - 狀態: **待本機跑** (sandbox 沒瀏覽器、無法跑 lighthouse CLI)
  - 建議指令: `npx lighthouse http://localhost:5173 --view` 或部署 Vercel 後跑 PageSpeed Insights
  - 註: Vite build 產出 `index.js` 280.91 kB / gzip 93.18 kB, 符合 SPA 標準

## 驗收命令輸出 (sandbox 實跑)

```
$ cd web && npx vitest run

 RUN  v2.1.9 /Users/sean/.minimax-agent/projects/openptt/web

 ✓ tests/e2e.test.tsx (10 tests) 116ms

 Test Files  1 passed (1)
      Tests  10 passed (10)
   Start at  16:19:16
   Duration  796ms
```

```
$ cd web && npx tsc --noEmit
(0 error)
```

```
$ cd web && npx vite build
vite v6.4.3 building for production...
✓ 53 modules transformed.
dist/index.html                   0.54 kB │ gzip:  0.37 kB
dist/assets/index-BZ42vO_2.css   10.57 kB │ gzip:  3.03 kB
dist/assets/index-CFMxZ5t8.js   280.91 kB │ gzip: 93.18 kB
✓ built in 450ms
```

## 程式碼證據 (Snippet)

**`web/src/pages/BoardPage.tsx` (排序):**
```tsx
const [sort, setSort] = useState<'time' | 'hot' | 'pin'>('time')
const all = useMemo(() => (boardName ? getArticles(boardName, sort) : []), [boardName, sort])
// L39-42
<select value={sort} onChange={...} data-testid="sort-select">
```

**`web/src/pages/BoardListPage.tsx` (搜尋):**
```tsx
import { BOARDS, searchBoards, CATEGORIES, getCategoryStats } from '../data/boards'
const boards = useMemo(() => searchBoards(search), [search])
```

**`web/src/data/boards.ts` (Article 介面):**
```ts
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
```

## 剩餘工作 (Backlog)

- [ ] **P2-6 效能優化** — React.memo 重構 + 文章虛擬滾動 (react-window)
- [ ] **Capacitor iOS + Android 平台殼** — 從 web PWA 變成原生 app
- [ ] **Sprint 3 真實 Ptt 爬蟲** — telnet / WebSocket / Ptt API
- [ ] **推播** — Web Push + 看板新文通知
- [ ] **Search index** — Meilisearch / Typesense 全文搜尋
- [ ] **Vercel deploy + Lighthouse 驗收** — 本機跑

## 路線圖

| 階段 | 內容 | 狀態 |
|---|---|---|
| Sprint 1 | 5 P0 + 5 E2E | ✅ |
| Sprint 2 | 33 看板 + metadata + 排序 + 搜尋 + 5 E2E | ✅ |
| Sprint 2.5 | P2-6 效能 | ⏳ |
| Sprint 3 | 真實 Ptt 爬蟲 + 推播 + search index | ⏳ |
| Cross-platform | Capacitor iOS + Android | ⏳ |
| Production | Vercel deploy + Lighthouse | ⏳ |
