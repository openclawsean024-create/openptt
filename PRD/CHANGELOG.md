# openptt · CHANGELOG

## M3 — 2026-09-21 · React production increment

- 修正 \`web/index.html\`，根入口正式掛載 Vite React app，不再導向舊 dashboard 草稿。
- 依核准 prototype 接入 responsive reading-first shell、Dashboard、熱門文章、閱讀歷史與設定頁。
- 新增 \`openptt:recent\` 最近瀏覽資料層與 \`openptt:keyword-subscriptions\` 指定看板關鍵字訂閱資料層。
- 看板頁支援關鍵字建立、命中 badge、啟用 / 停用 / 刪除；設定頁提供分看板管理。
- 補齊對標功能地圖的即時熱門、看板歷史、文章收藏、關於與延後功能狀態 route。
- 補齊看板空狀態／分類篩選、文章不存在 recovery、最愛 tabs + undo toast、Dashboard 搜尋與 `/` 快捷鍵。
- SettingsPage 補上 UI-006「資料與隱私」區塊：收藏、關鍵字訂閱、最近瀏覽清除與主題重置，均保留確認流程與 aria-live feedback。
- React 測試由 10 件增加至 23 件；typecheck、build、route smoke 與 `git diff --check` 通過。

## v4.1 — 2026-09-21 · 指定看板關鍵字訂閱

**新增**：
- `FR-011`：每筆訂閱綁定一個看板與一個關鍵字，支援啟用、停用、刪除與 localStorage 持久化。
- 關鍵字比對文章標題、內文與 tags；同一看板不允許重複啟用相同關鍵字。
- `UI-007`：看板頁 subscription sheet、設定頁管理清單、文章命中 badge 與上限 / empty / disabled states。
- HTML prototype 可操作建立訂閱、查看命中提示與管理訂閱。

**邊界**：
- v4.1 規格階段只補產品與 prototype flow；M3 已接入 React production UI，仍未接 Web Push / APNs / FCM。
- 「關鍵字訂閱」是免費的本機閱讀偏好，不等於付費訂閱方案。

## v4.0 — 2026-09-21 · PRD / UI alignment

**新增**：
- 重整 `PRD/SPEC.md`，補足 MVP 邊界、Persona、可觀測指標、FR/AC、資料契約、NFR、風險與 milestone。
- 新增 `PRD/UI-SPEC.md`，定義 reading-first visual system、responsive layout、screen/component contract、loading/empty/error/stale states 與 accessibility checklist。
- 新增 `prototype/openptt.html`，作為與 Sean 確認後才進 React UI 實作的獨立視覺原型。

**刻意不做**：
- 本次不修改 `web/src/` production UI、不部署、不 push；prototype review 後才進 M3。

> 維護：Hermes Agent for Sean
> 原始版本：v3.0（15 章，2026-08-09）；本 CHANGELOG 為 v3.0.2 fleet 升級版

---

## v3.0.2 — 2026-09-06 · Sean 10-repo-fleet fleet 升級

> v3.0.2 完成於 2026-09-06 by Sean 10-repo-fleet

**升級內容**：
- 規格書全面重寫為 9 章 v3.0.2 等級（SPEC v3.0 契約 §1–§19 套用）
- FR 清單擴展為 13 條（含 Sprint 3 計劃）
- 部署契約改為 Vercel（沿用 fleet 統一 deploy target）
- 加入 Definition of Done / Out of Scope / 環境變數 / 降級策略

**基礎建設**：
- 新增 `.github/workflows/ci.yml`（4 jobs: lint / test / build / deploy-to-Vercel）
- PRD/CHANGELOG.md（本檔）

**既有功能**（Sprint 1+2 已實作）：
- FR-001 看板列表 33 個 + 8 分類
- FR-002 文章列表 3 種排序（time/hot/pin）
- FR-003 文章內文 + DOMPurify
- FR-004 我的最愛 localStorage
- FR-005 深色模式（系統偵測 + 手動切換）
- FR-006 看板搜尋（即時過濾 + 類別過濾）
- FR-007 Article metadata（作者、IP、標籤、推噓比）

**驗證**：
- 10/10 Vitest E2E 全綠
- TypeScript strict tsc --noEmit exit 0
- Vite build 綠（280.91 kB / gzip 93.18 kB）
- 7 條驗收項全 ✅（Lighthouse 待本機跑）

**Backlog**（未實作，不影響 v3.0.2 完成）：
- FR-008 全文搜尋
- FR-009 推播（Web Push / APNs / FCM）
- FR-010 多板 Dashboard 拖拽
- FR-011 虛擬滾動 react-window
- FR-012 Capacitor iOS / Android
- FR-013 真實 Ptt 爬蟲

---

## v3.0 — 2026-08-09 · Hermes Agent 原始規格

**15 章完整規格**：
1. 產品概述（問題陳述 / Personas / Value Prop / KPIs / Non-Goals）
2. 使用者場景與流程（Mermaid + User Stories + Edge Cases）
3. 功能性需求（P0/P1/P2 + Acceptance Criteria）
4. 系統設計（Tech Stack / 架構圖 / 資料模型 / API）
5. 非功能性需求（性能 / 安全 / 降級 / 擴展性）
6. Definition of Done
7. 風險與決策（Risk Table + 4 條 ADR）
8. 里程碑與 Sprint 拆解
9. 變現路徑 + 定價心理學
10. 附錄（競品分析 / 技術棧對照 / Sprint 1 驗收）

---

## v2.x — Sprint 1+2 實作（2026-08-09 → 2026-09-05）

**Sprint 1**（5 個 P0 + 5 個 E2E）：
- P0-1 看板列表瀏覽
- P0-2 文章列表
- P0-3 文章內文
- P0-4 我的最愛
- P0-5 深色模式

**Sprint 2**（33 看板 + 5 個新 E2E）：
- P2-1 真實看板清單（33 個）
- P2-2 Article metadata 擴展
- P2-3 文章列表 3 種排序
- P2-4 看板搜尋
- P2-5 看板分類樹 8 個

---

*本 CHANGELOG 為 fleet 統一格式升級版，原始 Sprint 紀錄見 `SPRINT1_HANDOVER.md` 與 `SPRINT2_GOAL.md`。*
