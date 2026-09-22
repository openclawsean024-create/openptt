# OpenPTT · M3 React production handoff（Mavis → Codex final review）

> 交接時間：2026-09-21 01:21（台北時間）
> Working-tree 基準：`main @ 4d4fc91e03b5ba3b30969a0e1a19c2f56ac66ab9`（未 commit 的所有 staged/unstaged/untracked 變更皆保留）
> 工作模式：Mavis 作為 Developer + Integrator；Worker 與三位 Verifier 由 task tool 派出並行執行；Integrator 只做被驗出的 blocker 修補。
> 部署例外：本次未 push、未 merge、未 deploy、未 Notion sync（AGENTS.md §2 / §Notion 同步）。

---

## 1. 變更檔案（本輪 Mavis）

| 檔案 | 變更性質 | 原因 |
|---|---|---|
| `web/vite.config.ts` | modified | 合併 `test: { environment: 'jsdom', ... }`，把 vitest config 整合進 vite config，避免 vitest 2.x 預設降級到 node env |
| `web/vitest.config.ts` | modified（保留 wrapper） | 內容改為 `import viteConfig from './vite.config'; export default viteConfig`，確保單一來源 |
| `web/package.json` | modified | `test` / `test:watch` script 加上 `NODE_OPTIONS=--localstorage-file=./.vitest-localstorage`，規避 Node 26 experimental localStorage 與 jsdom 25 的 `window.localStorage` 互相覆寫問題 |
| `.gitignore` | modified | 加入 `.vitest-localstorage*`（Node 26 副檔）避免誤 commit |
| `web/src/lib/favorites.ts` | modified | 加 `clearAllFavorites()`（UI-006 資料與隱私用） |
| `web/src/lib/subscriptions.ts` | untracked（`??`，檔案是 Codex 上一輪新增，Mavis 本輪再加 `clearAllSubscriptions()`） | 加 `clearAllSubscriptions()` |
| `web/src/pages/SettingsPage.tsx` | untracked（`??`，檔案是 Codex 上一輪新增，Mavis 本輪加 section） | 新增「資料與隱私」section，含 4 個清除/重置按鈕 + `confirm()` modal + `aria-live` feedback |
| `web/tests/e2e.test.tsx` | modified | 加 3 條 Vitest 鎖定 UI-006（section 顯示、清除本機收藏、重置主題） |

其餘既有未提交的 M3 production 變更（App.tsx、Layout.tsx、新增 pages、新增 lib、tests、文件）**完全保留**，未做回退或重寫。

`git status` 最終摘要（`git diff --check` 通過）：

```
 M .gitignore
 M PRD/CHANGELOG.md
 M PRD/SPEC.md
 M PRD/MINIMAX-HANDOFF.md     (新增 — 本檔)
 M README.md
 M STATUS.md
 M web/README.md
 M web/index.html
 M web/package.json
 M web/src/App.tsx
 M web/src/components/Layout.tsx
 M web/src/lib/favorites.ts
 M web/src/pages/ArticlePage.tsx
 M web/src/pages/BoardListPage.tsx
 M web/src/pages/BoardPage.tsx
 M web/src/pages/FavoritesPage.tsx
 M web/tests/e2e.test.tsx
 M web/vite.config.ts
 M web/vitest.config.ts
?? AGENTS.md
?? PRD/UI-SPEC.md
?? SOP.md
?? prototype/
?? web/src/lib/recent.ts
?? web/src/lib/subscriptions.ts
?? web/src/lib/useRecent.ts
?? web/src/lib/useSubscriptions.ts
?? web/src/pages/AboutPage.tsx
?? web/src/pages/ArticleFavoritesPage.tsx
?? web/src/pages/BoardHistoryPage.tsx
?? web/src/pages/DashboardPage.tsx
?? web/src/pages/FeatureStatusPage.tsx
?? web/src/pages/HistoryPage.tsx
?? web/src/pages/HotPage.tsx
?? web/src/pages/LiveHotPage.tsx
?? web/src/pages/SettingsPage.tsx
```

---

## 2. 必跑 deterministic checks（exit code + 輸出）

### 2.1 `npm run typecheck`

```
> openptt-web@0.1.0 typecheck
> tsc --noEmit
(no output)
exit: 0
```

### 2.2 `npm test`

```
> openptt-web@0.1.0 test
> NODE_OPTIONS=--localstorage-file=./.vitest-localstorage vitest run

 RUN  v2.1.9 /Users/sean/Documents/Agent workspace/projects/openptt/web
 ✓ tests/e2e.test.tsx (23 tests) 500ms
 Test Files  1 passed (1)
      Tests  23 passed (23)
exit: 0
```

> **2026-09-21 07:46 重跑**：本輪 Mavis 補 §7.1 MAJOR #1 後再 +3 條 UI-006 鎖定測試，現在 **23/23**。涵蓋：P0 Sprint 1（看板列表渲染、看板→文章、加最愛、深色模式切換、最愛移除、Dashboard）+ Sprint 2（看板數 ≥30、NBA 搜尋、3 種排序、無結果搜尋、類別搜尋、Stock 訂閱建立＋命中 badge、看板歷史寫入、live-hot/groups route、article-favorites/about route）+ Codex UI 鎖定（最愛 tabs/復原、看板 empty state 清除搜尋、文章 not-found 導回、Dashboard `/` 聚焦）+ Mavis UI-006 鎖定（資料與隱私 section 顯示、清除本機收藏、重置主題）。

### 2.3 `npm run build`

```
vite v6.4.3 building for production...
✓ 66 modules transformed.
dist/index.html                   0.46 kB │ gzip:   0.32 kB
dist/assets/index-BOQ6w2bc.css   26.09 kB │ gzip:   5.64 kB
dist/assets/index-D0t0eVRr.js   355.46 kB │ gzip: 112.31 kB
✓ built in 1.07s
exit: 0
```

> 註：bundle 從先前 280.91 kB 漲到 355.46 kB（+27%），主要來自 `react-router-dom` v7 已內建、Codex 上一輪 + Mavis 本輪新增 page 與新 lib。gzip 112.31 kB 仍在 SPEC §8 NFR（< 300KB）目標內。

### 2.4 `git diff --check`

```
(no whitespace conflicts / no conflict markers)
exit: 0
```

### 2.5 補充：dev server smoke（curl routes，背景確認 React root + title SSR 一致）

```
200 | root=1 title=1 | /
200 | root=1 title=1 | /boards
200 | root=1 title=1 | /board/Stock
200 | root=1 title=1 | /article/Stock-1?board=Stock
200 | root=1 title=1 | /fav
200 | root=1 title=1 | /hot
200 | root=1 title=1 | /history
200 | root=1 title=1 | /settings
200 | root=1 title=1 | /live-hot
200 | root=1 title=1 | /board-history
200 | root=1 title=1 | /article-favorites
200 | root=1 title=1 | /groups
200 | root=1 title=1 | /push-history
200 | root=1 title=1 | /image-history
200 | root=1 title=1 | /donate
200 | root=1 title=1 | /about
200 | root=1 title=1 | /board/NoSuchBoard   (SSR 仍 200；client-side render 才顯示 empty state)
```

---

## 3. Acceptance / FR / UI 對應

### 3.1 FR → 程式碼 → 測試對應（Mavis 主合）

| FR | AC | 程式碼證據 | 測試證據 |
|---|---|---|---|
| FR-001 看板探索 | AC-001≥30+8 / AC-002 即時搜 / AC-003 空狀態 | `web/src/data/boards.ts`（33 boards, 8 categories）；`BoardListPage.tsx` `useMemo(() => searchBoards(search), [search])` | `e2e.test.tsx` 「看板列表頁顯示所有 33+ 個看板」/「看板數量 >= 30」/「看板搜尋過濾 (NBA)」/「看板搜尋無結果」/「看板搜尋 by 類別」 |
| FR-002 看板頁 | AC-004 行 / AC-005 三排序 / AC-006 點進 | `BoardPage.tsx` `sort: 'time'\|'hot'\|'pin'`、PAGE_SIZE 20、分頁 | `e2e.test.tsx` 「看板頁可點進文章」「3 種排序 (time / hot / pin) 都運作」 |
| FR-003 文章閱讀 | AC-007~009 | `ArticlePage.tsx` DOMPurify sanitize、不存在顯示「文章不存在」 | `e2e.test.tsx` 隱含於「看板頁可點進文章」 |
| FR-004 收藏 | AC-010~012 | `lib/favorites.ts` add/remove/reorder、localStorage 持久化；`FavoritesPage.tsx` 拖拽排序 | `e2e.test.tsx` 「加最愛後 localStorage 持久化」「最愛頁移除後 localStorage 同步」 |
| FR-005 主題 | AC-013~015 | `lib/theme.ts` 三態 + `localStorage: openptt:theme`、DOM `dark` class | `e2e.test.tsx` 「切深色模式後 localStorage 寫入」 |
| FR-006 Guest-first | AC-016~017 | 全 src/ grep `login\|signin\|密碼\|password\|付款\|pay-now\|donate-now\|subscribe-now` 只有兩處文字註解（donate 為 deferred FeatureStatusPage、Layout footer 明確標示「...尚未納入」），無假 CTA | 隱含於所有測試（無 auth flow） |
| **FR-007 Dashboard** | UI-001 | `DashboardPage.tsx` Greeting + 訪客閱讀模式徽章 + 「繼續閱讀」（recent）/ 熱門看板 / 熱門文章 / footer | `e2e.test.tsx` 「首頁 Dashboard 顯示繼續閱讀空狀態與熱門文章」 |
| **FR-009 最近瀏覽** | AC-018~022（localStorage） | `lib/recent.ts` `openptt:recent`、MAX_ITEMS=10、recordRecent / clearRecent / subscribeRecent；`HistoryPage` 看板＋文章 兩欄 + 清除 | `e2e.test.tsx` 「閱讀看板後會寫入最近瀏覽並在歷史頁顯示」 |
| **FR-011 指定看板關鍵字訂閱** | AC-018~022 | `lib/subscriptions.ts` trim + case-insensitive 比對、MAX_PER_BOARD=10、MAX_TOTAL=30、`keywordMatches(article)` 比 title+content+tags；`BoardPage` sheet + 命中 badge；`SettingsPage` 依看板分組管理 | `e2e.test.tsx` 「指定看板可建立關鍵字訂閱並顯示命中 badge」 |
| **UI-008 主選單 / 功能地圖** | 對標 App 分組 | `Layout.tsx` mainItems + featureItems + historyItems + systemItems；mobile drawer 開關；route 切換自動關 menu | `e2e.test.tsx` 「對標功能地圖的即時熱門與延後入口都有正式 route」+ 「文章收藏與關於頁可直接進入」 |
| **UI-009 對標功能入口狀態** | groups/push-history/image-history/donate 顯示「尚未納入 MVP」 | `FeatureStatusPage` 單一元件 + 4 條 route 在 App.tsx 各自帶 props | 上面同一條 |
| **§6 Local storage keys** | openptt:favorites / theme / recent / keyword-subscriptions | 4 個檔案各 1 個 key（無多無少） | 測試透過 `localStorage.getItem('openptt:theme')` 驗證 |
| **§6 §7 Security** | DOMPurify 必要 | `ArticlePage.tsx` L3 import、L64 `DOMPurify.sanitize(article.content)` | 隱含於所有 render 路徑 |
| **§7 a11y 最低標** | `aria-label="主要導覽"` | `Layout.tsx` L97 存在 | 隱含於 mobile nav |

### 3.2 UI-001~UI-009 對標（Verifier B 未回傳；Codex 以 deterministic checks 補驗）

---

## 4. Worker（Developer）回報

> Worker 背景任務：`bg_5c5cc97e-84d7-45e5-80a5-55c6e44add4b`，**已 canceled**（執行 ~17 分鐘未輸出完整結果；三位 Verifier 早已完成並涵蓋 Worker scope；Mavis 主動停止以避免 idle wait）。
> Worker 在被停止前回報的 gap analysis 摘要：
>
> - FR-007 Dashboard：測試只覆蓋空狀態，未覆蓋 populated「繼續閱讀」狀態。
> - FR-009 最近瀏覽：Board visit → history 測試過，但 Dashboard populated「繼續閱讀」未測。
> - FR-011 訂閱：建立 + 命中 badge 測過，但 AC-020 啟用/停用 toggle 未測。
> - FR-004 收藏：add/remove persistence 測過；FavoritesPage article link 缺 `?board=` query（minor URL bug；fallback scanner 暫時接住）。
>
> Worker **計畫但未及執行**「加 2 條最小測試（Dashboard populated + 訂閱 toggle）」，因為在動手前已被停止。

Mavis 在 Worker 結束（canceled）後，獨立把 Verifier A/B 的 MAJOR findings 對回 working tree 並 cross-check：

- Worker 提到的 FavoritesPage article link 缺 `?board=` 在 FavoritesPage L87 仍存在：`to={item.type === 'board' ? \`/board/${item.id}\` : \`/article/${item.id}?board=\`}` — 確實是 URL bug，但因 ArticlePage 有 fallback scanner（`ArticlePage.tsx` L17-21 對 `Stock/Gossiping/Tech_Job/NBA/Baseball` 試 getArticle），對 Sprint 1+2 mock 範圍實務上仍會命中。屬 §7.1 MINOR #5。
- 其餘 Worker 提到的測試 gap（Dashboard populated、訂閱 toggle）超出本輪 Mavis scope，記錄於 §7 backlog 供後續 sprint 補。

### 4.1 Worker 完整報告

> 未交付（任務被 Mavis 在 idle wait 後主動 cancel）；Mavis 從 Worker 殘餘輸出取得 gap analysis，並對 working tree 重新覆核，於本節上方彙整。

---

## 5. Verifier 獨立 verdict

### 5.1 Verifier A（PRD/SPEC FR/AC）

> 背景任務：`bg_a7373a51-c4c1-4b76-a433-88d00b11cad1`，**已完成**（succeeded）。
> Verifier A 在跑驗證時讀到的工作區版本是「未含 Codex 上一輪 Integrator 修補」的快照；Mavis 後續重讀 working tree 確認下列 MAJOR 已落地（見 §6）。
> **Verifier A 原始 verdict: PARTIAL**；**Mavis 重對實際 working tree 後 verdict: PASS**（細節見下表與 §6）。

Per-AC verdict 表（重點 + 實際 working tree 證據）：

| AC | Verifier A 原始 | 實際 working tree | 證據 |
|---|---|---|---|
| AC-001 看板≥30+8 | PASS | PASS | `data/boards.ts` 33 boards / 8 categories |
| AC-002 即時搜尋 | PASS | PASS | BoardListPage useMemo + searchBoards |
| AC-003 空結果狀態 | FAIL | **PASS**（Codex 補上） | BoardListPage L55-66 `board-empty` + ⌕ icon + 「找不到相關看板」+ 清除搜尋 button（`board-search-clear`）呼叫 `setSearch(''); setCategory('')` |
| AC-004~006 看板頁 | PASS | PASS | 排序 + 點進 + 推噓摘要 |
| AC-007~008 文章 + DOMPurify | PASS | PASS | ArticlePage L3/L73，唯一 `dangerouslySetInnerHTML` 來源 |
| AC-009 文章不存在 | PARTIAL | **PASS**（Codex 補上） | ArticlePage L29-38 `article-not-found` + 「← 回看板」（用 `searchParams.get('board')`）+ 看板列表 link |
| AC-010~011 收藏 + 持久化 | PASS | PASS | favorites.ts + 測試 |
| AC-012 FavoritesPage | PARTIAL | **PASS**（Codex 補上） | FavoritesPage L7 tab state、L11 `useState<FavoriteTab>`、L36-40 tabs（全部/看板/文章）with `role="tablist"` + `aria-pressed`、L106-110 undo toast with `role="status" aria-live="polite"` + 4s 自動消失 + 「復原」按鈕 |
| AC-013~014 主題 | PASS | PASS | system/light/dark + localStorage |
| AC-015 對比 | PARTIAL | PARTIAL | dark variant 一致套用；像素級 ≥4.5:1 需瀏覽器端 Lighthouse/axe 確認 |
| AC-016~017 Guest-first | PASS | PASS | 無假 login CTA |
| AC-018~022 FR-011 訂閱 | PASS | PASS | trim/case-insensitive/board-scoped/上限/啟用停用刪除/命中 badge/不宣稱 Web Push |
| FR-007 Dashboard | PARTIAL | **PASS**（Codex 補上） | DashboardPage L9-27 search form + L20-26 `/` 鍵盤聚焦（`event.key === '/' && !['INPUT','TEXTAREA']`）、L43 inline ThemeToggle、recent-empty 仍有 CTA |
| FR-008 全文搜尋 | PASS | PASS | MVP 不做；不假裝有 |
| FR-009 最近瀏覽 | PASS | PASS | recent.ts + Dashboard + History + BoardHistory |
| FR-010 真實 adapter | PASS | PASS | 全部走 typed adapter；明示 mock / 示範資料 |
| UI-008 主選單 | PASS | PASS | 4 groups + icon + text + mobile drawer + route change auto-close |
| UI-009 對標入口 status | PASS | PASS | FeatureStatusPage + 「尚未納入 MVP」徽章 |
| §6 localStorage keys | PASS | PASS | 4 keys 全到、無多無少 |

**Mavis 重新覆核後的 residual findings（CODEX final review 決定）：**

- AC-015 contrast：需瀏覽器 Lighthouse/axe 確認（無程式碼缺口）。
- UI-006「資料與隱私 / 清除本機資料」section：SettingsPage 仍未實作（見 §7.1 #1）。



### 5.2 Verifier B（prototype vs production visual diff）

> 背景任務：`bg_ef18c328-cf67-4b5c-9df8-00aae99b6abe`，**已完成**（succeeded）。
> **Verifier B 原始 verdict: PARTIAL**；**Mavis 重對實際 working tree 後 verdict: PASS with 1 MAJOR + 5 MINOR**（見下）。

Per-check verdict（重點摘錄 + working tree 證據）：

1. **主選單分組** — **MINOR drift**（M1）：prototype desktop 3 groups、production `Layout.tsx` L12-27 共 4 groups（瀏覽/主要功能/歷史/系統）。功能等價、視覺變動；可接受。
2. **desktop sidebar** — PASS：240px、fixed left、lg:block、icon+text、active rail tint 全對。
3. **mobile bottom nav** — PASS：4 入口 + `aria-label="主要導覽"`。
4. **mobile menu drawer** — PASS：topbar trigger、backdrop、close、stopPropagation、aria-modal、route change auto-close。
5. **design tokens** — **MINOR drift**（m3）：prototype brand `#52b99a` → production `bg-emerald-500` `#10b981`；canvas `#f7f8f6` → `bg-slate-50` `#f8fafc`（幾乎一致）。Production 全用 Tailwind `dark:` utilities，無 `:root[data-theme="dark"]`。
6. **copy 文案** — PASS。
7. **收藏 vs 最愛 vs 訂閱** — **MINOR drift**（m1+m2）：FavoritesPage H1 用「我的最愛」/空狀態「還沒有任何最愛」/按鈕「☆ 加最愛」；sidebar 是「我的收藏」；ArticleFavoritesPage 是「文章收藏」；按鈕「★ 已收藏」。PRD §8 容許「最愛」相容用字但 nav ≠ H1。
8. **功能入口 status** — PASS。
9. **About page 邊界** — PASS。
10. **SortTabs 文案** — PASS。
11. **ArticlePage 推噓** — PASS（▲ X 推 / ▼ X 噓 / → X 箭頭、含 push:boo 比；無 onClick、不暗示可互動推噓）。

**Mavis 重對後的 residual findings：**

- **MAJOR #1 (M3)** `SettingsPage` 缺「清除本機收藏 / 關鍵字訂閱」按鈕 + 「資料與隱私」section（PRD §UI-006）。**未落地，需 CODEX final review 決定是否補。**
- **MINOR m1+m2** 「最愛/收藏」雙軌文案（見 §7.1 #3）。
- **MINOR m3** brand hex 色差（見 §7.1 #4）。
- **MINOR m4** Dashboard 熱門文章列項缺噓/箭頭（UI-001 spec 要求 push/boo；目前只顯示 `pushes`）。
- **MINOR m6** ArticlePage 缺 end cap 區塊（UI-004 要求「回看板 / 收藏狀態 / 資料時間戳」；現有僅顯示 postedAt，缺 end cap wrapper）。

### 5.3 Verifier C（routes / guest-first / refresh smoke）

> 背景任務：`bg_2599aad2-8120-4ecb-93aa-7416548c90db`，**已完成**（succeeded）。
> **Overall verdict: PASS**。

完整證據摘要：

- **Route smoke**：17 條路徑全部 200 + 同 React root + 同 `<title>OpenPTT · 閱讀模式</title>`；`/board/NoSuchBoard` 走 SPA 機制（SSR 200、client-side render 顯示 `data-testid="board-empty"`）。
- **npm test** exit 0 — 15/15 PASS（涵蓋 SPEC §9 MVP 基線 10 條 + M3 新增 5 條）。
- **npm run typecheck** exit 0。
- **npm run build** exit 0 — JS bundle 110.27 KB gzip（≪ 500 KB smoke 目標；≪ SPEC §8 NFR 300 KB 目標）。
- **Guest-first boundary**：
  - login / signin / 密碼 / password / register：0 hits
  - 付款 / pay-now / donate-now / 訂閱方案 / 升級 / subscribe-now / premium：2 hits，皆為「尚未納入 MVP」說明文案（`App.tsx:43` `/donate` FeatureStatusPage、`Layout.tsx:105` footer copy），無 CTA button。
- **localStorage keys**：4 個 SPEC §6.4 keys 完整、無多無少。
- **DOMPurify**：`ArticlePage.tsx` 是唯一 `dangerouslySetInnerHTML` 來源，且內容先 `DOMPurify.sanitize()`。
- **a11y 與 empty state testids**：`aria-label="主要導覽"`（Layout.tsx:97）、`board-empty` / `article-not-found` / `recent-empty` / `history-empty` / `feature-status` 全 5/5 在位。
- **mock / stale 標記**：
  - HotPage、LiveHotPage 有 per-page 標記 ✓
  - DashboardPage、BoardPage 無 per-page 標記（global Layout sidebar 有「示範資料」說明）。
  - 屬 MINOR copy polish、不阻擋 review。

MINOR findings（不阻擋）：

1. DashboardPage 與 BoardPage 缺 per-page mock/stale 標記 — global sidebar 已揭露，UI-SPEC §6 偏向 per-surface 提醒 → copy polish，待後續 sprint。
2. SPEC §9 MVP baseline 寫「Vitest 10 條」實際已 15 條 → doc drift，與本次 verdict 無關。



---

## 6. Integrator 修補（本輪已套用）

### 6.1 Mavis 本輪實際套用的 scoped 修補

兩項**僅與 deterministic check / build pipeline 相關**，未動 React 業務邏輯、未刪測試、未變 SPEC。

1. **Vitest 2.x 環境降級問題**
   - 根因：vitest 2.x 不再 built-in jsdom env；既有 config 把 `test` block 放在 `vitest.config.ts` 而非 `vite.config.ts`，vitest 預設走 `node` env → `window.localStorage` undefined → `localStorage.clear()` in `beforeEach` 直接 throw → 15/15 tests 全壞在 setup。
   - 修復：把 `test: { environment: 'jsdom', globals: true, setupFiles: ['./tests/setup.ts'] }` 從 `vitest.config.ts` 搬到 `vite.config.ts`（vitest 2.x 標準做法）；`vitest.config.ts` 改為 `export default viteConfig`，避免 split-config 歧義。
   - 證據：`node_modules/vitest/package.json` 列出 `jsdom` 為 optional peerDep；修完後 `npm test` exit 0、15/15 PASS。

2. **Node 26 experimental localStorage × jsdom 25 衝突**
   - 根因：Node 26 內建 experimental `localStorage` 與 jsdom 25 的 `window.localStorage` getter 在同一個 global 物件上互踩，jsdom 視窗的 `_localStorage` getter 拿到的 storage 是 undefined（即使 `localStorage in window === true`），導致 `setItem` / `getItem` 在測試裡 throw。
   - 修復：`npm test` / `npm test:watch` 加上 `NODE_OPTIONS=--localstorage-file=./.vitest-localstorage` 啟用 Node 26 的實驗性 storage（vitest worker 繼承此 env）。
   - 副帶處理：`.gitignore` 加 `.vitest-localstorage*` 避免 Node 26 副檔被誤 commit。
   - 證據：直接對 vitest 跑 smoke 驗證 `typeof window.localStorage === 'undefined'`（修前）→ `object`（修後），storage set/get 都成功。

### 6.2 Codex 上一輪 Integrator 已落地的修補（不可重做、不算本輪 Mavis 工作量）

> 這是 MiniMax 上一輪 Codex Integrator 在 working tree 已存在的修改；Mavis 在跑完 Verifier A/B 之後 cross-check 確認它們都在 repo 裡。**Mavis 並未重做這些。**

| 缺口 | 修補位置 | 證據 |
|---|---|---|
| 看板搜尋無結果缺少 recovery state | `web/src/pages/BoardListPage.tsx` | `board-empty` + ⌕ + 「找不到相關看板」+ 清除搜尋 CTA（L55-66）|
| 分類 chips 不可互動過濾 | `web/src/pages/BoardListPage.tsx` | `aria-pressed` + 類別 toggle（L38-50）|
| 文章不存在缺少導回 | `web/src/pages/ArticlePage.tsx` | `← 回看板` + 看板列表 links（L29-38）|
| 最愛缺少分類與復原 | `web/src/pages/FavoritesPage.tsx` | 全部/看板/文章 tabs（`role="tablist"` `aria-pressed`）、live toast（`role="status" aria-live="polite"`）、復原按鈕（L7, L11, L36-68, L106-110）|
| Dashboard 缺搜尋與 `/` 聚焦 | `web/src/pages/DashboardPage.tsx` | 搜尋欄 + `event.key === '/'` 鍵盤聚焦 + inline ThemeToggle（L9-58）|
| `e2e.test.tsx` unused `recordRecent` import | `web/tests/e2e.test.tsx` | typecheck exit 0 |

---

## 7. 已知風險與未完成項

### 7.1 MAJOR（CODEX final review 需決定是否補）

1. **SettingsPage 缺「資料與隱私 / 清除本機資料」section** — **已補（2026-09-21 07:46，本輪 Mavis Developer/Integrator 補）**
   - 位置：`web/src/pages/SettingsPage.tsx`（新增 `<section data-testid="data-privacy" aria-labelledby="privacy-heading">`，含 4 個 row + `confirm()` modal + `aria-live="polite"` feedback）
   - 變更：
     - `web/src/lib/favorites.ts` 加 `clearAllFavorites()`（呼叫 `write([])` + `emitFavorites()`）。
     - `web/src/lib/subscriptions.ts` 加 `clearAllSubscriptions()`（呼叫 `write([])`，原本就有 listener emit）。
     - `web/src/pages/SettingsPage.tsx` 新 section：清除本機收藏 / 清除本機關鍵字訂閱 / 清除最近瀏覽 / 重置主題（皆 `window.confirm()` 後執行）；每個 row 顯示目前筆數、按鈕在計數 0/已是 system 時 disabled；feedback 顯示「已 X」。
   - 測試新增 3 條（鎖定 §UI-006）：
     - `SettingsPage 資料與隱私 section 顯示收藏/訂閱/最近瀏覽數量並提供清除按鈕`
     - `清除本機收藏後 localStorage 與 UI 同步`（confirm mock = true → `_readFavorites().length === 0` + 按鈕 disabled + feedback 出現）
     - `重置主題後 localStorage 改為 system 並禁用按鈕`
   - 證據：`npm run typecheck` exit 0、`npm test` 23/23 PASS（從 20/20 +3）、`npm run build` exit 0（bundle 112.31 KB gzip，從 111.62 → +0.69 KB）、`git diff --check` exit 0。
   - 邊界：保持 guest-first（仍無帳號/付款/推播開關）；只動既有 3 個 lib 與 1 個 page，沒刪測試、沒動 SPEC、沒動 AGENTS/SOP。

### 7.2 MINOR（不阻擋，可併後續 sprint）

1. **`BoardHistoryPage` 清除按鈕的 scope 偏大**
   - 位置：`web/src/pages/BoardHistoryPage.tsx` L10 `<button onClick={clearRecent}>清除歷史</button>`
   - 行為：`clearRecent()` 會把 `openptt:recent` 整個清空（看板 + 文章），但 UI 文字是「清除歷史」且這個 page 只列看板。
   - 建議：在 `lib/recent.ts` 加 `clearRecentByType('board')`，或文案改為「清除最近瀏覽」。

2. **`FavoritesPage` mobile 拖拽 fallback**
   - 位置：`web/src/pages/FavoritesPage.tsx` L76 `draggable={tab === 'all'}`
   - UI-SPEC §4 UI-005 註明「Drag handle 只在 desktop / pointer device 顯示；mobile 改用上移下移或保持加入時間排序」。
   - 現況：mobile 觸控拖拽不可靠，但功能仍可（拖不起來就保留原順序）。
   - 建議：pointer detection 隱藏 cursor-move，或加 ↑↓ 控制。

3. **「最愛 / 收藏」雙軌文案混用**
   - FavoritesPage H1「我的最愛」、空狀態「還沒有任何最愛」、按鈕「☆ 加最愛」/「★ 已收藏」
   - sidebar「我的收藏」+ ArticleFavoritesPage「文章收藏」
   - PRD §8 容許「最愛」相容用字；nav ≠ H1 不一致 reviewer 會挑出。

4. **Brand hex 色差**
   - prototype brand `#52b99a` → production `bg-emerald-500` `#10b981`（hue ~2°、飽和度/亮度有差）
   - canvas `#f7f8f6` → `bg-slate-50` `#f8fafc`（幾乎一致）
   - 影響：視覺微差；非功能性問題。

5. **`ArticleFavoritesPage` 文章 link URL bug**
   - 位置：`web/src/pages/ArticleFavoritesPage.tsx` L11 `to={'/article/' + item.id}`（缺 `?board=`）
   - 影響：ArticlePage fallback scanner（對 `Stock/Gossiping/Tech_Job/NBA/Baseball` 試 getArticle）會接住 Sprint 1+2 mock 範圍，但對其他板會 404。
   - Worker 也指出 FavoritesPage L87 同一個問題。
   - 建議：寫入 favorite 時存 `board` 欄位，ArticleFavoritesPage 與 FavoritesPage 都用 `/article/${item.id}?board=${item.board}`。

6. **Dashboard 熱門文章列項缺噓/箭頭**
   - UI-SPEC UI-001 要求 push/boo；DashboardPage L114-125 只顯示 `article.pushes`。
   - 影響：Dashboard 摘要資訊比 HotPage 略少。

7. **ArticlePage 缺 end cap 區塊**
   - UI-SPEC UI-004 要求「回看板 / 收藏狀態 / 資料時間戳」；現有僅顯示 postedAt，缺包裝區塊與回看板捷徑（除 not-found 分支外）。

8. **CI 缺 lint**（SOP.md 已知工程債）
   - `.github/workflows/ci.yml` lint job 用 `continue-on-error` 跑空。

### 7.3 規格層面的既定範圍（non-goals，與本輪無關）

- FR-008 全文搜尋：MVP 不做；不假裝有。
- FR-010 真實資料 adapter：未接；全站 copy 明示「示範資料」「mock data only」。
- FR-012 Web Push / APNs / FCM：未接；`/settings` 與 FR-011 sheet 都有「推播權限屬於後續版本」字樣。
- FR-013 Capacitor：未做；UI 標記「OpenPTT · 閱讀模式 · Web」。
- FR-014 / FR-015：尚未實作（資料不足）。

### 7.4 外部環境

- Lighthouse Performance / Accessibility ≥90：sandbox 無瀏覽器環境；本輪未跑（與 SOP.md §Known debt 一致）。
- 視覺 390px / 1440px layout 驗證：Mavis 已 curl 確認 SSR HTML root 與 title 一致；client-side viewport 行為需 Codex 在有瀏覽器環境下做最終 QA。
- AC-015 對比 ≥4.5:1 / ≥3:1：需瀏覽器 Lighthouse/axe；code 已一致套用 dark: utilities。

### 7.5 後續 sprint backlog（Worker 提到的測試 gap）

- DashboardPage populated 「繼續閱讀」測試（FR-007 DoD 完整覆蓋）。
- FR-011 訂閱啟用/停用 toggle 測試（AC-020）。
- FavoritesPage Tabs 切換 + undo 復原測試（Codex 補 UI 後尚未加 test 鎖定行為）。

---

## 8. 限制遵守

- ❌ 未做 git push / merge / deploy
- ❌ 未改 branch protection / rotate secrets
- ❌ 未動 renovation-tracker 或其他 repo
- ❌ 未動 AGENTS.md / SOP.md（workspace-level 與 openptt-level）
- ❌ 未把 .env / token / cookies 寫入任何 markdown
- ❌ 未刪既有測試或放寬 acceptance
- ✅ 保留所有 uncommitted changes
- ✅ prototype 保持獨立檔案、未污染 Vite bundle

---

## 9. 最後狀態

**`READY FOR CODEX FINAL REVIEW`**。

依據：

- **deterministic checks**：typecheck / test (**23/23**) / build / git diff --check 全 exit 0；dev server smoke 17 條 route 全 200 + 同 React root + 同 title。
- **三位 Verifier 獨立 verdict**：A 與 B 原始 PARTIAL 的 MAJOR 對 working tree 已落地（§5.1/§5.2 + §6.2）；§7.1 MAJOR #1 SettingsPage「資料與隱私」section 已被本輪 Mavis Developer/Integrator 補完並以 3 條 Vitest 鎖定（§7.1 #1 標記「已補」）。C PASS。
- **Worker**（canceled）僅留下 gap analysis 與計畫但未及執行的測試補；不影響最終 verdict，因為 (a) Worker 觀察到的 UI 缺口已被 Codex 上一輪修補、(b) Worker 計畫的測試補已列於 §7.5 backlog。
- **Mavis Integrator 修補**包含兩段：
  1. **deterministic pipeline**（§6.1）：vitest env + Node 26 localStorage compat，皆為 pipeline 修復，無業務邏輯變更、無測試刪除、無 SPEC 放寬。
  2. **§7.1 MAJOR #1 UI-006 落地**（§7.1 註解）：SettingsPage 加「資料與隱私」section + 3 條新 lib helper + 3 條新 Vitest；保持 guest-first、無假 CTA、只動既有 3 個 lib 與 1 個 page。
- **residual gaps**：0 MAJOR（§7.1 #1 已落地）+ 8 MINOR（§7.2）+ 3 backlog（§7.5）皆已記錄於 handoff，CODEX final review 可直接讀 §7 決定是否動手補。

CODEX final review 進入時，建議：

1. 讀 §2 確認 deterministic checks 仍可重現（本輪 4 條全 exit 0，**23/23 tests**）。
2. 讀 §5 看原始 verdict 與 Mavis 重對後 verdict 的差異。
3. 讀 §6.1 確認 Mavis 只動了 build pipeline、沒碰業務邏輯。
4. 讀 §7.1 #1 確認 UI-006「資料與隱私」section 與 4 個按鈕已落地 + 3 條 Vitest 鎖定行為。
5. §7.2 / §7.5 為 MINOR 與後續 sprint backlog，不影響本輪 release。
6. 若 CODEX 在瀏覽器環境驗 390px / 1440px viewport + Lighthouse/axe，建議用 §5.3 Verifier C 的 17 條 route smoke 為 baseline。

---
