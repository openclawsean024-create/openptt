# AGENTS.md — OpenPTT 專案開發指引

## 規格來源

- 產品規格：`PRD/SPEC.md`
- UI 規格：`PRD/UI-SPEC.md`
- 可互動視覺原型：`prototype/openptt.html`
- 現況與驗收證據：`STATUS.md`

任何功能或 UI 變更，先找到對應的 `FR` / `AC` / `UI` 編號；若沒有對應編號，先更新規格再改程式。

## 本版產品邊界

- OpenPTT 是「純閱讀」的跨平台 PTT 瀏覽器；MVP 不做 PTT 登入、發文、回文、推噓、信箱或私人訊息。
- `web/` 是現行 Web PWA；`prototype/` 是獨立的設計溝通原型，不直接作為 production bundle。
- 資料來源在真實爬蟲完成前使用 mock/static data；不得在前端偷偷宣稱資料為即時真實資料。
- 不加入帳號、資料庫、付費、推播、原生 Capacitor 殼或第三方追蹤，除非先更新 PRD 並取得明確 milestone 授權。

## 開發流程

1. Planner：只讀檢視 PRD、UI-SPEC、現況程式與測試，提出 bounded plan。
2. Developer：以最小可驗證 increment 實作，更新對應測試與文件。
3. Deterministic checks：先跑 `SOP.md` 的 typecheck、test、build 與文件檢查。
4. QA / Final review：只讀，依 AC 回報證據、回歸與未解風險。
5. Integrator：只修正已確認的 blocker；不得為了變綠而刪測試或放寬檢查。

## 禁止事項

- 不在 agent session 內 merge、push、部署、修改 branch protection 或提交 secrets。
- 不修改 workspace 層級或其他專案的 `AGENTS.md`。
- 不提交 `.env`、token、cookies、private key、`node_modules/`、`web/dist/` 或超過 50MB 的 binary。
- 不把 prototype 的 mock 互動誤當成 production 功能完成證據。

## Commit 慣例

使用 `<type>(scope): <FR / AC / UI ref> <說明>`，例如：

```text
feat(board): FR-002 AC-002 implement board article sorting
docs(ui): UI-001 add responsive board reader specification
```
