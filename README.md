# OpenPTT — 全平台 PTT 看板瀏覽器

OpenPTT 是一個開源的全平台 PTT 看板瀏覽器,以經典 iOS App「BePTT」為視覺與互動基準,目標是讓使用者不必打開 PTT BBS 也能在 Web / iOS / Android 上流暢地瀏覽看板、閱讀文章、切換分類、收藏常用板,並保留 PTT 原生使用者最熟悉的「推 / 噓 / → / 爆」等符號語感。

目前 repo 進入 **M3 React production increment**：Web 端已接上 reading-first shell、Dashboard、閱讀歷史與指定看板關鍵字訂閱；目前仍使用 mock/static data，iOS / Android、真實 PTT adapter、推播與搜尋索引另列後續 milestone。

---

## 狀態

- [x] **Sprint 1** — 5 個 P0 功能 + 5 個 E2E 測試(mock 5 個看板)
- [x] **Sprint 2** — 33 個 Ptt 看板 + Article metadata + 8 分類 + 3 排序 + 看板搜尋 + 5 新 E2E
- [x] **M3 increment** — React responsive shell + Dashboard + 閱讀歷史 + 指定看板關鍵字訂閱
- [ ] P2-6 效能(React.memo + 虛擬滾動)
- [ ] Capacitor iOS + Android 平台殼
- [ ] Sprint 3 真實 Ptt 爬蟲 / 推播 / search index

---

## Tech Stack

- **Vite 6** + **React 19** + **TypeScript strict** + **Tailwind v4**
- 測試:**Vitest 2.1** + **@testing-library/react 16**
- 字型:**Noto Sans TC**
- 路由:React Router v7
- HTML 安全:DOMPurify

---

## Quick Start

```bash
git clone https://github.com/openclawsean024-create/openptt.git
cd openptt/web
npm install
npm run dev      # http://localhost:5173
npm test         # 13/13 Vitest + RTL
npm run build    # tsc + vite build
```

> 第一次 clone 完若跳錯,確認 Node >= 20;`npm install` 會一併安裝 vitest / playwright 等 dev 工具。

---

## 專案結構

```
openptt/
├── PRD/
│   ├── SPEC.md                # Product Requirements Document v4.1
│   ├── UI-SPEC.md             # UI contract v1.1
│   └── CHANGELOG.md
├── prototype/
│   └── openptt.html           # 獨立可互動 HTML 視覺原型
├── SPRINT1_HANDOVER.md        # Sprint 1 移交紀錄
├── SPRINT2_GOAL.md            # Sprint 2 目標
├── web/
│   ├── README.md              # Web 子專案說明
│   ├── index.html             # Vite entry HTML
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   ├── src/
│   │   ├── App.tsx            # Router 根組件
│   │   ├── main.tsx           # React 入口
│   │   ├── index.css          # Tailwind v4 + 全域樣式
│   │   ├── components/
│   │   │   ├── Layout.tsx          # responsive shell + sidebar / mobile menu
│   │   │   └── ThemeToggle.tsx
│   │   ├── data/
│   │   │   ├── boards.ts      # 33 個 Ptt 看板 metadata
│   │   │   └── mock.ts        # 假文章資料
│   │   ├── lib/
│   │   │   ├── createStore.ts # 極簡 reactive store
│   │   │   ├── favorites.ts
│   │   │   ├── theme.ts
│   │   │   ├── useFavorites.ts
│   │   │   ├── recent.ts / useRecent.ts
│   │   │   └── subscriptions.ts / useSubscriptions.ts
│   │   └── pages/
│   │       ├── BoardListPage.tsx   # 看板列表 / 分類 / 搜尋
│   │       ├── BoardPage.tsx       # 單板文章列表
│   │       ├── ArticlePage.tsx     # 文章內文
│   │       ├── FavoritesPage.tsx   # 收藏板 / 文章
│   │       ├── DashboardPage.tsx
│   │       ├── HotPage.tsx
│   │       ├── HistoryPage.tsx
│   │       └── SettingsPage.tsx
│   └── tests/
│       ├── e2e.test.tsx       # 10 個 E2E (Vitest + RTL)
│       └── setup.ts
└── README.md                  # 你正在看的檔案
```

## 規格與 prototype

- [PRD/SPEC.md](PRD/SPEC.md)：產品範圍、FR/AC、資料契約、路線圖。
- [PRD/UI-SPEC.md](PRD/UI-SPEC.md)：視覺系統、responsive layout、screen/component contract、指定看板關鍵字訂閱 flow。
- [prototype/openptt.html](prototype/openptt.html)：直接以瀏覽器開啟即可操作；不依賴 npm、CDN 或外部圖片。

Prototype 目前示範：從看板頁建立關鍵字訂閱、在文章列表查看命中 badge、到設定頁啟用 / 停用 / 刪除訂閱。這是 local-only in-app flow，尚未接 Web Push。

M3 已依 prototype review 進入 production React；目前先完成高頻閱讀流程，延後功能仍以產品邊界控管，不宣稱登入、推播或付款已完成。

---

## 路線圖

延續「## 狀態」未勾選的剩餘工作:

- **P2-6 效能**:為 `BoardListPage` / `BoardPage` 加上 `React.memo`、對文章列表導入虛擬滾動,目標 Lighthouse Performance ≥ 90
- **Capacitor iOS + Android 殼**:把 `web/dist` 包進 Capacitor 專案,加入平台 plugin(SafeArea、StatusBar、Push),出 iOS TestFlight 與 Android APK
- **Sprint 3**:
  - 真實 Ptt 爬蟲(後端 service + 排程)
  - 推播(熱門看板新文 / 推爆通知)
  - 全文 search index(Meilisearch 或 Typesense)

---

## 貢獻 / License

歡迎開 issue / PR;本專案以 MIT License 釋出,細節見 `LICENSE`。


<!-- Last validated: 2026-09-06 by OpenClaw Overnight Dev -->
