# OpenPTT · UI redesign research

> 日期：2026-09-24
> 範圍：OpenPTT prototype v2.0 的資訊架構、閱讀流與競品對標
> 狀態：供 Sean review；尚未回寫正式 React UI

## 1. 對標範圍

本次只對標「公開內容瀏覽與回訪」的體驗，不把所有競品功能都當成 OpenPTT 的 scope。

| 對象 | 可借鑑的強項 | OpenPTT 的取捨 |
|---|---|---|
| [PTT Web](https://www.pttweb.cc/) | 看板熱門、最新文章、文章搜尋、作者查詢、討論串與 canonical URL 等 web-first 導航。 | 採用搜尋、熱門訊號與文章上下文；不在首頁堆滿進階搜尋工具，先保留閱讀節奏。 |
| [官方 PTT Web](https://www.ptt.cc/index.html) | 免登入快速閱讀、完整 PTT WebSocket / terminal 能力與原生 BBS 完整性。 | OpenPTT 不複製 terminal；維持閱讀器定位，對來源與 stale 狀態透明。 |
| [Mo PTT](https://apps.apple.com/tw/app/mo-ptt/id804745434?platform=ipad) | 收藏、分類群組、熱門看板、歷史回訪、主題與手勢等高頻回訪能力。 | 採用收藏、歷史、主題與集中導覽；不引入登入、發文、回文、推噓、信件等非 MVP 操作。 |
| [BePTT](https://apps.apple.com/tw/app/beptt/id1522407507) | 訪客瀏覽、看板分類、熱門、文章搜尋、分享／收藏與瀏覽紀錄等完整功能地圖。 | 採用「功能入口完整但狀態透明」；不把尚未實作的帳號、私人信件、推文紀錄做成假功能。 |

## 2. 主要設計結論

### 2.1 首頁由「功能總覽」改成「閱讀工作台」

競品都有很多入口，但 OpenPTT 的差異不在功能數量。回訪者真正需要的是：

1. 回到上次離開的文章。
2. 掃讀有足夠訊號的文章。
3. 快速跳回固定看板。

因此 v2.0 首頁順序為：`繼續閱讀 → 閱讀訊號 → 追蹤中的看板`，把設定與功能狀態移到導覽與系統頁。

### 2.2 Article row 是最小閱讀決策單位

文章列同時保留板名、標題、摘要、作者／時間、推噓／箭頭與收藏。熱度使用短條加數字，不使用大面積彩色卡片，讓使用者可以在一個掃讀單位內決定「讀／略過／稍後讀」。

### 2.3 右欄承接回訪，不做第二個 dashboard

desktop 右欄只放閱讀佇列、最近看板與資料來源狀態。它是上下文工具，不是另一組等權內容；mobile 則改為內容下方區塊，避免窄螢幕雙欄壓縮。

### 2.4 把「完整功能地圖」和「目前可用」分開

OpenPTT 仍可保留熱門、收藏、歷史、設定與關於等入口，但每個入口都必須對應真實狀態。登入、站內信、發文、回文、推噓、Web Push、付費與社交群組不應以可點擊的假流程出現。

## 3. v2.0 prototype 驗收重點

- [x] Desktop：sidebar + reading feed + reading queue。
- [x] Mobile：單欄內容、44px 觸控目標、bottom navigation 的響應式 CSS。
- [x] 搜尋：看板、文章、作者文字過濾；空結果可理解。
- [x] 訊號切換：為你整理／最新／最熱的視覺狀態。
- [x] 收藏：文章列與 reader sheet 都可切換。
- [x] Reader：保留板名、來源、推噓摘要、文章內容與返回入口。
- [x] Theme：light / dark 的語意 token 切換。
- [x] Data boundary：明示示範資料、adapter、同步時間與不提供的互動能力。

## 4. 尚待 Sean 決定

- 首頁 hero 是否保留「今日閱讀節奏」數字，或改成更純粹的最近閱讀狀態。
- `閱讀佇列` 是否作為正式資料模型，或先沿用收藏文章作為 MVP 的稍後閱讀入口。
- 競品的討論串／作者搜尋要在 OpenPTT 哪個 milestone 進入正式 spec；本次 prototype 只保留視覺位置，不宣稱已實作。
