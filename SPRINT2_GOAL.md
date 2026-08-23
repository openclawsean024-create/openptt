# OpenPTT Sprint 2 — 真實 Ptt 看板完整化 + 風暴優化

## 背景
- Sprint 1(2026-08-09 完成):5 個看板 mock + 5 個 P0 + TypeScript strict + 5/5 E2E
- Sprint 2 目標:擴展到 Ptt 真實的 50+ 看板 + 真實文章 metadata

## 範圍
- **P2-1 真實看板清單**(50+ 個)Ptt 主要看板
  - 來源:Ptt 公開的「看板列表」資料(會用 mock 但格式真實)
  - 包含:看板名、分類、文章數、今日新文、人氣
  - 排序:熱門 / 分類 / 字母
  - 搜尋(按看板名)
- **P2-2 文章 metadata 擴展**
  - 作者 ID + nickname
  - 發文時間精確到秒
  - IP 地區(從作者 ID 推斷)
  - 標籤分類(Re: / Fw: / [新聞] / [爆卦] 等)
  - 推噓比(推 / 噓)
- **P2-3 文章列表排序**
  - 最新(時間倒序)— Sprint 1 已做
  - **熱門**(推文數倒序)— 新增
  - **板主推薦**(mock flag)— 新增
- **P2-4 搜尋**
  - 全文搜尋 title + content(前端 grep 即可,MVP)
- **P2-5 看板分類樹**
  - 完整分類:財經 / 體育 / 娛樂 / 科技 / 感情 / 校園 ...(Ptt 真的分類)
- **P2-6 效能優化**
  - Memo component 減少 re-render
  - 虛擬滾動(如果文章多)— MVP 可跳過,OBSERVE

## 技術決策
- 沿用 Sprint 1 棧(Vite + React 19 + TS strict + Tailwind v4)
- 真實資料來源:`src/data/boards.ts`(靜態)— Sprint 3 才能真實爬 Ptt
- 搜尋:前端 grep,Sprint 3+ 換真實 search index

## 不引入
- ❌ 真實 Ptt 爬蟲(Sprint 3)
- ❌ 全文 search index(Meilisearch / Typesense)
- ❌ 推播(Sprint 3+)

## 驗收標準
- [ ] 至少 30 個看板(>= 30 條 entry in BOARDS)
- [ ] 看板分類樹(8+ 個分類)
- [ ] 文章列表 3 種排序可切換
- [ ] 看板搜尋(輸入即時過濾)
- [ ] TypeScript strict `tsc --noEmit` exit 0
- [ ] 至少 5+ 個 E2E 全綠(原 5 + 新增 2-3)
- [ ] Lighthouse Performance >= 90(待本機跑)

## 失敗處理(沿用 SOP)
3 輪連續失敗 → 停下、回報、建議 X / Y

## 產出
1. 本機 `openptt/src/data/boards.ts` 30+ 看板
2. Sprint 1 5 個 E2E + 新增 2-3 個
3. README 更新
4. Notion row 更新(Sprint 2 進度)

---

*由 Hermes Agent for Sean*
*Sprint 2 from 2026-08-09 M1*
