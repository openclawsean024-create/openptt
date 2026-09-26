# OpenPTT — Global reading experience

日期：2026-09-24 · 狀態：獨立視覺候選，待 Sean review

唯一交付：`prototype/openptt-global.html` 與本文件。既有 SPEC / UI-SPEC 為閱讀基線；本文件只記錄候選方向與差異，不覆寫 canonical 規格。正式 React、部署與 MiniMax 均不在本次範圍。

## Design thesis

**The public conversation. 讓公共討論成為值得停留的閱讀體驗。**

把 PTT 的文字密度、看板文化與多種觀點保留下來，讓搜尋、掃讀、深入閱讀與回訪構成清楚的產品路徑。國際化指可延伸的品牌系統、清楚的資訊層級、可信的狀態與不同裝置上的完整操作；不以增加英文或行銷大字取代產品功能。

本候選採 editorial reader：冷白紙面、近黑文字、電光藍識別、細分隔線、開放式文章列。品牌符號是兩個錯位的開放括號，代表不同聲音與一個未完的對話。首頁用一篇明確標示的示範選讀建立閱讀焦點，旁列三篇熱門；下方進入可篩選文章流。頁首水平導覽取代上一版寬側欄；手機使用五個可見的底部入口。原型內容與作者均為虛構示範，不冒充真實 PTT 發文。

視覺改動相對 UI-SPEC v2.0：全新 tokens、水平 masthead、較小圓角、無卡片陰影、內容分欄與文章閱讀 sheet。保留 reading-first、guest-first、本機收藏、推噓唯讀與透明來源原則。閱讀佇列為使用者此次明確要求的候選能力，不宣稱已納入正式 FR。

## 競品取捨與公開來源

查核於 2026-09-24；以下是公開功能描述，不是登入後實測或效能評測。

| 產品 / 來源 | 可確認的公開能力 | 本候選採用 | 本候選不擴張的部分 |
|---|---|---|---|
| [官方 PTT Web](https://www.ptt.cc/bbs/Taiwan/index1.html) | 看板文章列表、上/下頁、最新頁、文章搜尋入口 | 板名、作者、發布時間、原站看板連結保留在閱讀上下文 | 不模擬 BBS 終端機；本次直讀 Tech_Job 頁遇到 403，不據此宣稱已驗證全文 |
| [PTT Web](https://www.pttweb.cc/) / [搜尋說明](https://www.pttweb.cc/ptt-search) | 熱門、最新、收藏、最近瀏覽、板名與文章查詢、討論串 | 易發現的探索、熱門、搜尋與收藏入口；排序規則明示 | 原型只搜尋內嵌示範資料，不宣稱建立全站索引，不提供刪文查找 |
| [Mo PTT 開發者功能介紹](https://apps.apple.com/tw/app/mo-ptt/id804745434?platform=ipad) | 訪客閱讀、黑白主題、關注看板熱門文、最愛與分類、返回操作 | 單手導航、明確返回、系統/淺/深主題、本機收藏 | 不引入登入、發文、推文、站內信 |
| [BePTT 開發者功能介紹](https://apps.apple.com/tw/app/beptt/id1522407507) | 訪客、分類與熱門板、標題/作者/推文數搜尋、文章收藏與閱讀紀錄、過濾 | 標題/作者/內文搜尋與分類交集、收藏類型分離、回訪 | 不引入帳號管理、黑名單治理、ANSI 模式、圖片上傳 |

視覺系統自行設計，未取用競品截圖、圖示、品牌色或佈局。熱門僅按示範文章的推數排序，並非推薦演算法或真實即時排名。

## Visual system / tokens

| Semantic token | Light | Dark | 契約 |
|---|---|---|---|
| canvas | `#F5F6F8` | `#101216` | 外圍紙面 |
| surface | `#FFFFFF` | `#181B21` | 主要閱讀面 |
| ink | `#17191F` | `#F2F3F7` | 標題、內文 |
| muted | `#606675` | `#A8AFBD` | 輔助文字，不能以低透明度減損可讀性 |
| line | `#DCE0E7` | `#353A46` | 非互動分隔線 |
| control | `#858D9D` | `#788293` | input / select 可見邊界 |
| brand | `#2448E5` | `#9BADFF` | 選中、連結、focus |
| brand-fill | `#2448E5` | `#2448E5` | 白字 primary / 主題選讀面 |
| soft | `#EEF1FF` | `#242E50` | 選中背景 |
| warning | `#825106` | `#F3C47A` | 同時搭配過期文字 |
| danger | `#A8324E` | `#FF9CB2` | 來源失敗與噓摘要；不可單靠顏色 |

Type：system-ui / PingFang TC / Microsoft JhengHei；不下載字型。品牌英文使用系統 sans，字距 -0.055em；中文標題維持正常字距。Display 36–56px / 1.2；文章列 18–21px / 1.5；reader 18px / 1.95（可調 16 / 18 / 20）；metadata 12–13px。數字採 tabular-nums。Spacing 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64；control radius 6px，主選讀面 8px，其餘列表不使用卡片容器。只有 modal 使用投影。

主內容 max-width 1280px；≥1100px 首頁主區 + 280px 輔助欄；768–1099px 主區單欄、輔助欄兩欄；<768px 單欄、搜尋第二列、底部五入口 + safe area。Reader 桌面右側 760px drawer，手機 100dvh sheet。所有主動作至少 44×44px。

## 元件與狀態契約

| 元件 | 對應規格 | Inputs / state | 行為 |
|---|---|---|---|
| Masthead / MobileNav | UI-001/008、FR-006 | route、counts | 首頁、探索、熱門、收藏、佇列；aria-current；hash navigation 支援前進/返回 |
| Search / Filters | FR-001/008、AC-002/003 | query、category、board、sort | 即時交集；搜尋目前區域；清除搜尋與全部條件；空結果可恢復；`/` 聚焦，不攔截輸入框打字 |
| FeaturedReading | UI-001、FR-007 | curated fixture | 單一選讀、清楚標示示範；一擊進文章；不虛构讀者量或閱讀進度 |
| BoardDirectory | UI-002、AC-001 | 32 boards / 8 categories | 名稱、描述、分類、收藏；沒有內嵌文章的板顯示「此原型尚無該板範例」而非來源空板 |
| ArticleRow | UI-003、AC-004/006 | article、saved、queued | 板名、類型、標題、摘要、發布時間、作者、唯讀推/噓/箭頭；收藏與佇列可獨立操作 |
| Reader | UI-004、AC-007/009 | articleId、fontSize、sourceState | 原生 dialog、背景 inert、Escape、返回焦點、保留列表位置；段落內文與唯讀示範留言；原站連結只稱「開啟 PTT 看板」 |
| Library | UI-005、FR-004 | articleIds、boardNames、type | 看板/文章分離，新增與移除即時同步；全新瀏覽器為真空狀態 |
| Queue | 本次要求 G-QUEUE | ordered articleIds | 加入、移除、上/下移、已讀移除、復原；無重複；全新瀏覽器為空 |
| Theme | UI-006、AC-013/014 | system/light/dark | 全 tokens 切換、儲存選擇、system 監聽偏好變化 |
| SourceBoundary | FR-010、AC-026/028 | fixture mode、fetchedAt、staleAt | 全頁示範標籤；來源面板可預覽快取有效/過期/失敗/載入；時間固定且明示情境，不偽裝同步成功 |
| Toast / storage | UI §6、SPEC §6.4 | message、undo、persist result | 單一委派 listener；role=status；失敗回 memory，顯示本次不保留；只使用獨立 global prototype namespace |

所有示範文字先 escape 再插入 template；沒有外部 HTML 或 fetch。正式 adapter 接線時仍需既有 DOMPurify，原型 escape 不是正式 AC-008 的替代證據。localStorage 值須型別、ID 與枚舉校驗，避免舊版/損壞資料阻斷閱讀。只保存收藏/佇列/最近閱讀 ID、主題與字級；不碰現有 production storage。

## Freshness boundary

`source=mock` 是此 HTML 的固定真實身份，任何情境都不會變成真實 PTT。固定示範快照 2026-09-24 09:00 +08:00，staleAt 10:00；快取有效情境的時鐘為 09:20，過期情境為 11:20。來源失敗保留內嵌內容並顯示 fallback；重試只重新播放模擬載入，再回到先前情境，不改寫 fetchedAt。載入狀態可取消。個別示範文章另帶過期標記；不以總體狀態掩蓋個別 stale。

## Review gate

1. 視覺：Sean 在桌面與手機評估品牌、字體、首頁內容權重、reader 舒適度、深淺色；確認候選才進入正式 UI 工作。
2. 互動：首頁→文章；探索→板→文章；搜尋+分類+排序；收藏重新開啟保留；佇列加入/排序/完成/復原；Escape / Tab / 返回；空狀態、損壞 storage、stale/error。
3. 原型技術：單 HTML、零 CDN、零圖片請求、零外部 script/font；JS syntax、檔案限定、響應式/瀏覽器 smoke；記錄 command output / exit code，不用「模型說通過」代替證據。
4. 正式 implementation 尚待：跨板聚合資料、來源權限/內容規則、全文索引、React routing、真實 sanitizer、production localStorage migration、Safari/Firefox/Edge、螢幕閱讀器與 axe/Lighthouse、效能與真機驗證。未完成這些不宣稱可正式上線。
5. 本次不涵蓋原 UI-SPEC 全部能力：keyword subscription、收藏拖曳排序、完整 recent 管理與 server pagination 保留既有產品，後續移植不能刪掉；本候選不假造未展示功能的完成證據。

## 驗證紀錄

僅評估此獨立原型，不能當成正式 React 的驗收。

```text
$ git diff --check
exit 0

$ awk '/<script>/{flag=1;next}/<\/script>/{flag=0}flag' prototype/openptt-global.html | node --check
exit 0
```

瀏覽器 smoke（本機 HTTP preview）：

- `openptt-global.html` 正常載入，桌面 editorial layout 可見。
- 搜尋 `NBA` 後，文章流收斂為 1 篇結果。
- 文章 title 開啟 reader dialog；Escape／關閉按鈕可退出。
- 主題切換後 `html[data-theme="dark"]` 生效。
- Console warnings/errors：空。
- Responsive CSS 已包含 `< 720px` 的單欄、reader full-height 與五項 mobile bottom nav；真機 Safari / Firefox / Edge、axe、Lighthouse 仍待正式 UI 階段驗證。
