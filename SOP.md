# OpenPTT — 專案 SOP

## 規格對齊狀態（2026-09-23）

- ✅ `PRD/SPEC.md`：MVP v4.1，涵蓋目前 Sprint 1–2 已實作能力、對標 App 功能拆解與指定看板關鍵字訂閱。
- ✅ `PRD/UI-SPEC.md`：UI v1.1，定義資訊架構、design tokens、響應式版面、狀態、元件契約與訂閱 flow。
- ✅ `prototype/openptt.html`：獨立、無 build dependency 的視覺與互動原型，含閱讀歷史與關鍵字訂閱管理。
- 🔄 production Web UI 已進入 M4：看板文章頁與文章全文已接入 server-side PTT adapter；其餘 Dashboard 聚合、推播與搜尋索引仍分批推進。

## 技術棧

- Vite 6 + React 19 + TypeScript strict
- React Router 7、Tailwind CSS 4、DOMPurify
- Vitest 2 + Testing Library；資料目前為 static/mock

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

- Dashboard 跨板真實聚合、全文搜尋、通知、Capacitor shell 尚未實作。
- 關鍵字訂閱已接入 React production UI，仍是 local-only in-app 命中提示，尚未接 Web Push。
- 現有 CI 的 lint job 以 `continue-on-error` 執行，且 repo 暫無 lint script；這是工程債，不視為 lint 通過。
- `web/public/dashboard.html` 是舊的設計草稿；新工作應以 `prototype/openptt.html` 與 `PRD/UI-SPEC.md` 為準。
