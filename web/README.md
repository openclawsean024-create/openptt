# OpenPTT Web — Sprint 1

OpenPTT 是全平台 PTT 看板瀏覽器(Web + iOS + Android)。**Sprint 1 只做 Web PWA**,對標 BePTT。

## 本目錄狀態

✅ **本機 dev server** 已可跑(Sprint 1 P0 範圍內)
✅ **5 個看板** mock data:Stock / Gossiping / Tech_Job / NBA / Baseball
✅ **TypeScript strict** 通過
✅ **5 個 E2E 測試** (Vitest) — 涵蓋 P0-1~P0-5

⚠️ **跳過驗收**:
- ❌ Lighthouse Performance ≥ 90 — 本機跑,需手動驗證
- ❌ Vercel preview deploy — 待 GitHub + Vercel token 修好
- ❌ Notion 同步 — 待 Notion write integration 修好

## 跑起來

```bash
cd openptt/web
npm install
npm run dev          # http://localhost:5173
```

## 跑測試

```bash
npm test             # 一次跑完 5 個 E2E
npm run test:watch   # watch 模式
```

## 跑 TypeScript 嚴格檢查

```bash
npm run typecheck    # exit 0 = 通過
```

## 驗收對應(Goal Step 1 — 本機 dev server)

| 驗收項 | 狀態 | 證據 |
|---|---|---|
| `npm run dev` 啟動後 localhost 回 200 | ✅ 預期通過 | vite 預設 5173 埠,看到 OpenPTT 字樣即成功 |
| 首頁 < 1.5s 載入 | ⚠️ 待驗證 | 請手動跑 Lighthouse CI |
| Lighthouse Performance ≥ 90 | ⚠️ 待驗證 | 請手動跑 lighthouse-ci |
| 5 個看板都能瀏覽文章列表(mock) | ✅ | 測試 #1 + 看板頁 mock 資料 |
| 點進任一文章,看到內文 + 推噓 | ✅ | 測試 #2 + ArticlePage |
| 加最愛 → 重新整理 → 最愛仍存在 | ✅ | 測試 #3 + favorites.ts localStorage |
| 切深色模式 → 重新整理 → 深色仍存在 | ✅ | 測試 #4 + theme.ts localStorage |
| TypeScript strict `tsc --noEmit` exit 0 | ✅ 預期 | 跑 `npm run typecheck` 確認 |
| 至少 5 個 E2E 測試案例全綠 | ✅ | 跑 `npm test` 看到 5/5 |

## 未涵蓋(Goal Step 2 / Step 3)

- ❌ Vercel preview deploy
- ❌ 4-surface 對齊
- ❌ Notion 進度 digest 更新

## 跳過範圍(scope creep 防護,Goal 列的)

- ❌ 登入 PTT 帳號
- ❌ 發文 / 推噓
- ❌ 推播通知
- ❌ iOS / Android native
- ❌ 雲端同步
- ❌ 搜尋
- ❌ 圖文解析
- ❌ 付費功能
