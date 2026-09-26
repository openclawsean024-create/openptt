# OpenPTT · UI Specification v2.0

> 狀態：Sean confirmed; React release candidate implemented
> 更新日期：2026-09-27
> 對應產品規格：`PRD/SPEC.md` v4.3
> 首選原型：`prototype/openptt-global.html`（已確認並回寫 production UI）
> 比較版本：`prototype/openptt-redesign.html`

## 1. 設計方向

### 1.1 Design principle

OpenPTT 是閱讀產品，不是管理後台。介面應讓使用者在不登入、不學習快捷鍵的情況下，快速掃讀「接下來讀什麼、這是哪個板、這篇有多熱、何時發布、要不要繼續讀」。

### 1.1 Redesign thesis（v2.0）

競品研究將 OpenPTT 的差異收斂成「閱讀工作台」：

- **PTT Web** 的優勢是 web-first 搜尋、熱門入口、文章／作者上下文；OpenPTT 採用搜尋與上下文，但把首頁主次順序改成「繼續閱讀 → 熱門訊號 → 探索」。
- **Mo PTT** 的優勢是收藏、分類、歷史與快速回訪；OpenPTT 保留這些資訊架構，但不引入登入、發文、回文、推噓與信件等超出 MVP 的操作。
- **BePTT** 的優勢是功能廣度與過濾；OpenPTT 只把能降低掃讀成本的篩選留下，避免把首頁變成設定清單。
- **官方 PTT WebSocket / terminal** 的優勢是完整性；OpenPTT 明確選擇閱讀優先、來源狀態透明與 mobile 可讀性，不模擬終端機。

本次 redesign 的主要視覺假設：使用者回訪時首先需要「恢復閱讀上下文」，新使用者才需要「探索入口」。因此 dashboard 不再以多組等權卡片開始，而是以 `Continue reading`、`Signal feed`、`Reading queue` 三個層級組織。

### 1.2 Four principles

1. **Reading first**：文章標題、時間、推噓訊號是第一層；設定與次要 metadata 後置。
2. **Board context always visible**：文章頁保留看板 breadcrumb；列表不只顯示孤立標題。
3. **Signal, not decoration**：🔥、置頂、推噓比代表可採取的閱讀決策，不大量使用彩色裝飾。
4. **Guest by default**：不放登入 CTA；收藏、主題、資料來源說明可直接使用。

### 1.3 對標 App 的借鑑

對標截圖的價值在於「功能入口完整且集中」，不是首頁視覺。OpenPTT 保留以下功能資訊架構：熱門、收藏、看板搜尋、看板 / 閱讀歷史、設定與關鍵字訂閱；帳號、私人信件、推文歷史、圖片上傳紀錄、水球與贊助則維持 PRD 的 non-goal / deferred 邊界。

主選單在桌面以 sidebar 呈現，在 mobile 以 bottom nav + 可展開 menu 呈現；不要把帳號登入或不存在的推播權限做成假按鈕。

## 2. Visual language

### 2.1 Design tokens

| Token | Light | Dark | 用途 |
|---|---|---|---|
| `bg.canvas` | `#F7F8F6` | `#111615` | 頁面背景 |
| `bg.surface` | `#FFFFFF` | `#18201E` | 卡片、sidebar |
| `bg.muted` | `#EEF3F0` | `#202B28` | 次要區塊、selected |
| `ink.strong` | `#17332B` | `#F2F8F5` | 主標題、重要數字 |
| `ink.default` | `#40534C` | `#C6D2CD` | 內文 |
| `ink.muted` | `#7B8A84` | `#8E9F98` | metadata |
| `line` | `#DDE6E1` | `#2C3B36` | 分隔線、邊界 |
| `brand` | `#52B99A` | `#62C5A7` | primary action、active |
| `hot` | `#E87855` | `#FF9A76` | 熱門、推 |
| `boo` | `#CC6570` | `#F28B98` | 噓、負向 |
| `pin` | `#D8A63F` | `#F0C35C` | 置頂 |

### 2.2 Typography

- Font stack：`Noto Sans TC`, `PingFang TC`, `system-ui`, sans-serif。
- Display：32/40, weight 750；desktop page title 不超過 2 行。
- H2：20/28, weight 700。
- Article title：16/25 desktop、15/23 mobile；最多顯示 2 行，全文頁不截斷。
- Body：15/26；article body 16/30，最大閱讀寬度 720px。
- Metadata：12/18，使用 `ink.muted`。
- 數字（推噓、訂閱）：`ui-monospace` 或 tabular numerals，方便掃讀。

### 2.3 Shape / elevation

- Card radius：16px；control radius：10px；pill：999px。
- 主要 card 使用 1px `line`，不使用厚重陰影。
- Hover：背景變成 `bg.muted`；active：品牌色邊界或左側 3px rail。
- Focus：2px brand outline + 2px offset，不能只靠顏色變化。

## 3. Layout contract

### 3.1 Breakpoints

| Viewport | Layout | 行為 |
|---|---|---|
| `< 768px` | Mobile | sidebar 隱藏；bottom nav 固定；單欄；content padding 16px。 |
| `768–1199px` | Tablet | 64px icon rail 或可收合 sidebar；列表單欄；卡片兩欄視空間。 |
| `≥ 1200px` | Desktop | 240px sidebar + 1fr content；content max-width 1180px。 |

### 3.2 App shell

```text
Desktop
┌──────────────┬───────────────────────────────────────┐
│ OpenPTT      │ topbar: context / search / theme       │
│ nav          ├───────────────────────────────────────┤
│              │ page content (max 1180)                │
│ source note  │                                       │
└──────────────┴───────────────────────────────────────┘

Mobile
┌───────────────────────────────────────────────────────┐
│ topbar: menu / OpenPTT / theme                         │
├───────────────────────────────────────────────────────┤
│ content                                               │
├───────────────────────────────────────────────────────┤
│ Home · Boards · Hot · Favorites                        │
└───────────────────────────────────────────────────────┘
```

## 4. Screen specifications

### UI-001｜首頁 / Dashboard

**目的**：讓回訪使用者 5 秒內繼續閱讀，讓新使用者看到可探索入口。

**區塊順序**：

1. Greeting + `訪客閱讀模式` 狀態 + compact theme control。
2. Search field：placeholder「搜尋看板或文章」；按 `/` 聚焦。
3. `繼續閱讀`：最近看板 / 最近文章；首次使用顯示「從看板列表開始」CTA。
4. `熱門看板`：4 張 board cards，顯示 board name、category、subscriber、hot badge。
5. `熱門文章`：5 列 article rows，顯示 title、board、time、push/boo。
6. Footer：資料來源、mock/stale 狀態、版本。

**Loading**：每區塊 skeleton，不整頁 spinner。
**Empty**：寫出下一個可行動作，不能只放「沒有資料」。

### UI-002｜看板列表

**目的**：用搜尋或分類快速找到板。

- Page header：`看板列表` + `33 個看板`。
- Search input full width；搜尋文字即時更新結果數。
- Category chips：可水平捲動；active chip 使用 brand tint + `aria-pressed`。
- Board card：name、description、category、subscriber、hot badge、favorite button。
- Desktop：3 欄；tablet：2 欄；mobile：單欄、卡片 min-height 88px。
- 無結果：圖示 +「找不到相關看板」+ 清除搜尋按鈕。

### UI-003｜看板頁 / Article list

**目的**：在保留 board context 的狀態下高密度掃讀文章。

- Breadcrumb：`看板列表 / Stock`。
- Board header：board name、description、subscriber、favorite button。
- Board header 同列提供 `＋ 關鍵字訂閱`；按下後開啟該看板範圍的 subscription sheet，不離開看板。
- Segmented sort：`最新` / `熱門` / `板主推薦`；mobile 可橫向捲動。
- Article row：badge stack → title → author/time → right aligned push/boo/arrow counters。
- Hot row 有左側 hot rail；pin row 有 pin badge；兩者不疊加過多背景色。
- Pagination / load more 放在列表結尾，操作後保留 scroll context。

### UI-004｜文章頁 / Reader

**目的**：提供安靜、可長時間閱讀的內容層。

- Breadcrumb back link 永遠存在。
- Title + tag badges + hot/pin indicator。
- Author row：author、IP region、published time、favorite action。
- Push summary：推、噓、箭頭與 ratio；不暗示使用者可互動推噓。
- Article body max 720px；paragraph spacing 16px；連結有 underline。
- End cap：回到看板、收藏狀態、資料時間戳。
- 不存在：顯示「找不到這篇文章」+ 回看板 / 看板列表。

### UI-007｜指定看板關鍵字訂閱

**目的**：讓使用者只追蹤某個看板裡與自己相關的字詞，不必反覆手動搜尋。

- 入口只從看板頁出現，表單標題必須帶看板名稱，例如「訂閱 Stock 的關鍵字」。
- 欄位：關鍵字 input、說明「會比對標題、內文與標籤」、`建立訂閱` primary action。
- 同一看板已存在的 keyword 以 chip / list 顯示，提供啟用切換與刪除。
- 建立成功：sheet 關閉、看板 header 顯示「已訂閱 N 個關鍵字」，並出現 in-app toast。
- 文章命中：文章 row 顯示 `命中：關鍵字` badge；prototype 顯示示範提示，不宣稱已送出 Web Push。
- 空狀態：說明「只會在這個看板內比對」，提供第一個 keyword 的 input focus。
- 驗證：空字串不可送出；trim 後相同 keyword 不可重複；大小寫視為相同。
- 上限：MVP 每個看板最多 10 筆、全站最多 30 筆；超過時顯示可操作的上限說明。

### UI-005｜我的收藏

- Tabs：`全部` / `看板` / `文章`。
- Item row 需顯示 type label，不能只顯示 title。
- Drag handle 只在 desktop / pointer device 顯示；mobile 改用上移下移或保持加入時間排序。
- Remove 是 secondary destructive action；移除後顯示 undo toast（React 實作時加入）。
- Empty：解釋如何從板或文章頁收藏。

### UI-006｜設定與主題

- Theme segmented control：系統 / 淺色 / 深色。
- 顯示「只儲存在本機」與「清除本機收藏 / 關鍵字訂閱」兩段說明。
- `關鍵字訂閱` 區塊可依看板分組管理，提供啟用 / 停用與刪除。
- 明示「目前只提供站內命中提示；推播權限將於後續版本處理」。
- 不放尚未存在的帳號、付費設定或假的推播開關。

### UI-008｜主選單 / 功能地圖

**目的**：吸收對標 App 的「主選單是功能索引」優點，讓重度使用者不必猜功能藏在哪裡。

- `瀏覽`：首頁、看板列表、熱門文章、我的收藏、分組討論、即時熱門、看板歷史。
- `歷史`：閱讀歷史（P1）、推文歷史、文章收藏、圖片上傳紀錄；後三者以明確的「尚未納入 MVP」狀態呈現。
- `系統`：設定、贊助、關於；設定包含關鍵字訂閱管理與本機資料清除。
- 每個 menu item 要有 icon + 文字；不能只靠 icon。
- 帳號切換、私人信件、水球與發文能力不建立假入口；在關於頁與 menu note 說明產品邊界。
- mobile menu 以 topbar menu trigger 開啟 drawer；route 切換後自動關閉，保留 bottom nav 作為四個高頻入口。

### UI-009｜對標功能入口狀態

prototype 必須讓使用者看見完整功能地圖，但每個入口都要標示真實狀態：

| 入口 | prototype 行為 | 產品決策 |
|---|---|---|
| 熱門文章 / 即時熱門 | 以 mock feed 展示排序、更新時間與重新整理 toast | 採用，P1 |
| 看板歷史 / 文章收藏 | 由閱讀與收藏資料導向可操作清單 | 採用，P1 |
| 分組討論 | 顯示延後原因與收藏 / 關鍵字訂閱替代路徑 | 延後，P2 |
| 推文歷史 / 圖片上傳紀錄 / 贊助 | 顯示保留入口與「尚未納入 MVP」說明 | 不虛構功能 |
| 關於 | 顯示 mock、localStorage、未接 adapter / 推播等邊界 | 採用，P1 |

## 5. Component contract

| 元件 | Props / state | 必備行為 |
|---|---|---|
| `AppShell` | active route, theme | responsive nav、focus order、mobile bottom nav |
| `SearchField` | value, onChange, placeholder | label、clear、`/` shortcut、empty state |
| `BoardCard` | board, isFavorite, onFavorite | whole card 可進板；favorite button stop propagation |
| `BoardHeader` | board, isFavorite | context、subscription、收藏狀態 |
| `KeywordSubscriptionSheet` | board, subscriptions, onSave | keyword validation、duplicate guard、limit copy、focus trap |
| `KeywordSubscriptionList` | subscriptions, onToggle, onRemove | 依 board 分組、enabled state、empty state |
| `KeywordMatchBadge` | keyword | 顯示命中關鍵字，不只用顏色傳達 |
| `SortTabs` | value, options, onChange | keyboard arrow / selected semantics |
| `ArticleRow` | article, board | title link、badges、push summary、hover/focus |
| `PushSummary` | pushes, boos, arrows, ratio | 顏色 + 文字並用，不依賴顏色唯一傳達 |
| `FavoriteButton` | pressed, onClick | `aria-pressed`、tooltip、44px hit area |
| `EmptyState` | title, description, action | 提供下一步 action |
| `Toast` | message, intent, undo? | live region、3–5 秒自動消失、可手動關閉 |

## 6. Interaction states

每個 data-driven surface 必須明確處理：

| State | UI 規則 |
|---|---|
| Loading | skeleton 保留最終高度；避免 layout shift。 |
| Success | 顯示來源 / 更新時間；mock 階段標記 `示範資料`。 |
| Empty | 說明原因 + 單一 primary next action。 |
| Error | 人話錯誤 + retry；不顯示 stack trace。 |
| Stale | amber status「資料可能已過期」+ timestamp。 |
| Saved | favorite button 變為已收藏 + toast；不跳轉頁面。 |
| Unsaved | return / refresh 不應遺失已成功寫入的 local state。 |
| Subscription saved | 關閉 sheet、顯示數量與 in-app toast；localStorage 寫入失敗時保留目前畫面並提示。 |
| Subscription match | 文章列顯示 `命中：keyword`；不要顯示「已推播」等未驗證訊息。 |
| Subscription disabled | 保留 keyword 但不標記命中；可一鍵重新啟用。 |
| Subscription limit | 阻止建立並說明目前 board / global 上限與刪除入口。 |
| Dark | 所有 semantic tokens 一起切換；不可只把背景變黑。 |

## 7. Accessibility checklist

- 頁面只有一個 `h1`；section 使用連續 heading hierarchy。
- icon-only button 必須有 `aria-label`；favorite 使用 `aria-pressed`。
- 搜尋、排序、分類篩選均可用鍵盤完成；focus 不被 sticky header / bottom nav 遮住。
- body text contrast 目標 ≥ 4.5:1；large text ≥ 3:1。
- 色彩訊號旁同步提供文字或 icon label，例如「🔥 熱門」「📌 置頂」。
- 文章列表 row 不以整個 `div` 偽裝 button；可互動元素使用原生 link / button。
- mobile bottom nav 具 `aria-label="主要導覽"`，active item 有 `aria-current="page"`。

## 8. Copy rules

- 產品名固定寫 `OpenPTT`，不要混用 Openptt / Open PTT。
- `收藏` 用於使用者行為，`最愛` 僅作相容既有路由或測試文案。
- `最新 / 熱門 / 板主推薦` 與 production sort value `time / hot / pin` 一一對應。
- `訂閱` 固定指「指定看板的關鍵字訂閱」；`推播` 只指後續 Web Push / APNs / FCM channel。
- 所有資料來源旁標記 `示範資料` 或 `最後更新於 ...`；不要用「即時」描述 mock。
- 錯誤訊息避免責怪使用者，例如「找不到這篇文章」而非「文章 ID 錯誤」。

## 9. Prototype handoff

### 9.1 v2.0 redesign screens

`prototype/openptt-global.html` 是本次 review 的首選 candidate；`prototype/openptt-redesign.html` 保留作為上一個方向的比較版本，兩者都與既有 `prototype/openptt.html` 並存，避免 Sean 確認前影響已驗收 reference。

首選版本採 editorial reader system：冷白紙面、近黑文字、電光藍識別、水平 masthead、開放式文章列與右側 reader drawer。它刻意避開上一版的米白綠卡片 dashboard，並以可延伸的語意 token、來源狀態與跨裝置互動作為產品化基線。

- Desktop：240px 導覽 + 主要閱讀流 + 288px reading queue；主要文章列表不再用四欄 board card 作為首頁視覺焦點。
- Header：全域搜尋、資料來源 freshness、主題切換與訪客狀態集中在一列，縮短從搜尋到閱讀的距離。
- 首頁：`Continue reading`（恢復上下文）、`Signal feed`（熱門／最新切換）、`Your boards`（收藏看板）按閱讀優先級排列。
- Article row：板名、標題、摘要、作者／時間、推噓摘要與收藏動作同一掃讀單位；熱度用短條與文字並列，不依賴大面積彩色卡片。
- 右欄：閱讀佇列、最近看板與資料狀態；mobile 改為內容下方的 queue section，避免窄螢幕雙欄壓縮。
- Mobile：topbar + 內容流 + 五項 bottom nav（閱讀桌、看板、熱門、收藏、佇列）；主要觸控目標至少 44px，搜尋與 filter chips 可水平滑動。
- Prototype interaction：搜尋過濾、feed tab、board filter、收藏 toggle、文章 reader sheet、主題切換、mobile bottom nav。

### 9.2 Review gate（已完成）

- Sean 已於 2026-09-26 確認本候選方向，正式 React UI 已由 MiniMax 實作並由 QA 重新驗證。
- production UI 位於 `web/src/`；prototype 仍保留作為視覺與互動溝通材料，不直接作為 production bundle。
- 本次 release candidate 新增 FR-016 閱讀佇列，規格與自動化測試已同步補齊。

### 9.3 Release candidate evidence

- `npm run typecheck`、`npm test`、`npm run build`、`git diff --check` 均通過。
- Browser smoke 已驗證首頁搜尋、文章 route、加入／移除閱讀佇列與 `/queue` 頁面。
- Production deploy、Lighthouse / axe 與三向對齊屬本次 release gate，完成後才標記為已上線。

`prototype/openptt.html` 是本規格的可操作 reference，覆蓋：

- UI-001 首頁、UI-002 看板列表、UI-003 看板頁、UI-004 文章閱讀、UI-005 收藏、UI-007 關鍵字訂閱、UI-008 主選單、UI-009 功能入口狀態。
- desktop sidebar、mobile bottom nav、mobile menu drawer、theme toggle、搜尋、分類、排序、開板、開文章、收藏與 toast。
- prototype 以看板頁 subscription sheet、設定頁管理清單與文章命中 badge 示範關鍵字訂閱 flow。
- prototype 以 sidebar / mobile navigation 對應對標 App 的完整功能地圖；採用項目可操作，延後項目以狀態頁說明，不複製其帳號與社交功能。
- 原型使用內嵌 CSS / JS 與 mock data，無 CDN、無外部圖片、無 production API。

Prototype review 後，M3 再把 token、layout、component contract 搬到 `web/src/`；在 review 前不修改正式 React UI 以避免兩套未核准方向並存。
