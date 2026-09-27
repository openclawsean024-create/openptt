# OpenPTT — 專案 SOP

## 規格對齊狀態（2026-09-27）

- ✅ `PRD/SPEC.md`：v4.4，新增 FR-016 閱讀佇列、FR-017 完整 PTT 看板目錄與 production release 驗收條件。
- ✅ `PRD/UI-SPEC.md`：UI v2.1，已由 Sean 確認並落地 React production UI，補齊完整目錄同步、動態看板路由與高對比 empty state。
- ✅ `prototype/openptt.html`：獨立、無 build dependency 的視覺與互動原型，含閱讀歷史與關鍵字訂閱管理。
- ✅ `prototype/openptt-global.html`：本次確認的 international editorial reader 原型；production UI 已依此實作。
- ✅ production Web UI M4 第一階段：看板文章頁與文章全文已接入 server-side PTT adapter；PTT 出口受限時有 reader-proxy fallback、每小時 CDN cache 與 mock fallback。
- ✅ production M4.5 release（FR-018 / AC-038..AC-043 / UI-018a..UI-018j）：`/api/ptt/cross-board` typed server route + `fetchCrossBoardFeed` client adapter + `useCrossBoardFeed` hook 已整合進 DashboardPage、HotPage、LiveHotPage；PTT 全部失敗回退 mock snapshot 並顯示 stale banner，部分失敗以 `partial=true` 與「部分看板失敗」標示；沿用 1 小時 CDN cache 與 reader-proxy fallback。production smoke 與三向同步已完成。
- ✅ production M4.6 bounded article search（FR-008 / AC-044..AC-047）：`/api/ptt/search` 以既有 PTT index-page adapter 提供 query validation、bounded fan-out、ranked snippets、source/partial/stale metadata 與 mock fallback；`fetchSearch`、`useArticleSearch` 與 `/search` 已接入，Dashboard 全域搜尋改導向文章搜尋。這是 bounded slice，不宣稱 Meilisearch/Typesense 全站永久全文索引；production smoke 與三向同步已完成。

## 技術棧

- Vite 6 + React 19 + TypeScript strict
- React Router 7、Tailwind CSS 4、DOMPurify
- Vitest 2 + Testing Library；跨板熱門以 server-side adapter + typed client 為主，mock snapshot 僅作 fallback。

## Canonical 驗證命令

在 repo 根目錄執行：

```bash
cd web
npm ci
npm run typecheck
npm test
npm run build
```

補充檢查：

```bash
git diff --check
```

目前 `package.json` 沒有 `lint` script，因此不自行臆測 lint 命令；新增 lint 前必須一併更新本檔與 CI。

## 原型驗證

- `prototype/openptt.html` 必須能以瀏覽器直接開啟，不依賴 npm、CDN 或外部圖片。
- 互動 smoke：側欄切換、搜尋、分類篩選、排序、開板、開文章、收藏、主題切換、手機底部導覽。
- 原型只驗證 UI flow，不計入 production TypeScript / E2E 覆蓋率。

## 部署

production deploy target 為 Vercel。現有 workflow 位於 `.github/workflows/ci.yml`；手動驗證可從 `web/` 執行 `npx vercel deploy --prod --yes --project openptt`。部署後必須完成 production HTTP route smoke 與 workspace 三向對齊流程。

## Known debt

- 跨板聚合（FR-018）已完成 production typed 整合；尚未做 source-priority 排序、看板權重與 stale 推播。
- 全文搜尋目前完成 FR-008 bounded index-page slice；外部持久化 search index（Meilisearch / Typesense）仍未接入。
- 全文搜尋、Capacitor shell、Web Push 尚未實作。
- 關鍵字訂閱已接入 React production UI，仍是 local-only in-app 命中提示，尚未接 Web Push。
- 現有 CI 的 lint job 以 `continue-on-error` 執行，且 repo 暫無 lint script；這是工程債，不視為 lint 通過。
- `web/public/dashboard.html` 是舊的設計草稿；新工作應以 `prototype/openptt.html` 與 `PRD/UI-SPEC.md` 為準。
