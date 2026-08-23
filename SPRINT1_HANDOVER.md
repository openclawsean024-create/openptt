# Sprint 1 Handover — OpenPTT M1 Web PWA

> 本機接手 sprint 1 後段工作。沙箱(我這邊)能做的都做完了,剩下 push / Vercel / Notion 必須本機跑。

**撰寫日期**:2026-08-22
**沙箱狀態**:GitHub + Notion token 都壞了,sandbox 不能 push。

---

## ✅ 沙箱已完成(可驗證)

- ✅ **PRD v3.0**:`openptt/PRD/SPEC.md`(25,733 bytes,15 章)
- ✅ **Web code**:`openptt/web/`(22 個原始檔,不含 node_modules)
  - **5 個 P0 功能** 全部實作
  - **TypeScript strict** ✅
  - **5 個 E2E 測試** ✅(vitest + RTL)
  - **dev server** ✅(sandbox 跑過 HTTP 200)
- ✅ **GitHub repo 建好**:`openclawsean024-create/openptt`(private)
  - **但 repo 還是空的**(只有初始 commit,沒有 web/ code)
  - 因為 sandbox push 失敗

---

## ❌ 沙箱沒做完(本機接手)

- ❌ GitHub push(web/ code 還沒進去)
- ❌ Vercel preview deploy
- ❌ Lighthouse 驗收(需瀏覽器)
- ❌ Notion 進度 digest 更新

---

## 🚦 本機接手 SOP(5 步)

### Step 1:確認你的 GitHub token 能用(本機直接驗證)

```bash
# 在本機 terminal 跑(不要在 Hermes sandbox)
curl -sS -H "Authorization: Bearer ***" https://api.github.com/user
```

- ✅ 看到 `{"login":"openclawsean024-create",...}` → 繼續
- ❌ Bad credentials → 你的 GitHub 那邊 revoke 了,需要去 https://github.com/settings/tokens 重申請

**只把 `login` 那行貼給我看就好**(token 不要 paste)。

---

### Step 2:進到 openptt 目錄 + git init

```bash
cd /Volumes/MyDsik\(APFS\)/Hermes\ Agent/Hermes\ Project/openptt

git init

# 確認你看到什麼
git status
```

應該看到 `PRD/`、`web/`、還有 `SPRINT1_HANDOVER.md`、`AGENTS.md`(這個我之前從 GitHub 拉下來時沒在,但其他 repo 有)、`README.md`等檔案。

---

### Step 3:加 .gitignore + 第一次 commit

```bash
cat > .gitignore << 'EOF'
node_modules/
.DS_Store
.env.env.local
*.logdist/
.vite/
EOF

git add .
git commit -m "feat(web): Sprint 1 — 5 個 P0 功能 (Web PWA 看板瀏覽器)

- P0-1 看板列表瀏覽(分類樹 + 熱門 Top 20)
- P0-2 文章列表(分頁 20/頁 + 排序)
- P0-3 文章內文(DOMPurify sanitize + 推噓 + lazy load)
- P0-4 我的最愛(localStorage + 拖拽排序)
- P0-5 深色模式(系統偵測 + 手動 + 持久化)

Tech: Vite 6 + React 19 + TypeScript strict + Tailwind v4
Test: Vitest + RTL, 5/5 E2E 全綠
All 5 boards: Stock / Gossiping / Tech_Job / NBA / Baseball"
```

---

### Step 4:push 到 GitHub

```bash
# 假設 repo 已經建好(https://github.com/new)
# Repository name: openptt
# ⚠️ 不要勾 Add README / Add .gitignore / Choose a license(我們已經有)

git remote add origin https://github.com/openclawsean024-create/openptt.git

git branch -M main
git push -u origin main
```

如果 repo 還沒建,先去 https://github.com/new 建一個空的(private)。

---

### Step 5:部署到 Vercel

**如果 vercel CLI 還沒裝**:

```bash
npm install -g vercel
```

**然後**:

```bash
cd /Volumes/MyDsik\(APFS\)/Hermes\ Agent/Hermes\ Project/openptt/web

# 第一次 deploy 會問你 login,follow 指示
npx vercel

# 之後 prod deploy
npx vercel --prod --yes
```

跑完會給你一個 URL,像 `https://openptt-xxx.vercel.app`。

---

## 🎯 Goal 驗收對應表

| Goal 驗收項 | 沙箱狀態 | 本機要做什麼 |
|---|---|---|
| 1.1 dev server | ✅ | (已完成) |
| 1.2 首頁 < 1.5s | ⚠️ 待驗 | 本機跑 Lighthouse |
| 1.3 Lighthouse ≥ 90 | ⚠️ 待驗 | 本機跑 `lighthouse http://localhost:5173 --view` |
| 1.4~1.7 P0 功能 | ✅ | (已完成) |
| 1.8 TypeScript strict | ✅ | (已完成) |
| 1.9 5 E2E 全綠 | ✅ | (已完成) |
| 2.1 Vercel preview URL HTTP 200 | ❌ | Step 5 |
| 2.2 preview URL 跑 dev 驗收 | ❌ | 在 Vercel URL 上跑一遍 |
| 2.3 4 surface 對齊 | ❌ | 把 SHA / Vercel URL 填進 Notion |
| 3.1 Notion 狀態「開發中」| ❌ | Notion 寫入(需 write integration)|
| 3.2 更新日期 = 今天 | ❌ | 同上 |
| 3.3 進度 digest 5 個 ✅ + URL + SHA + 問題 | ❌ | 同上 |
| 3.4 規格計劃書 URL 對 | ✅ | `https://github.com/openclawsean024-create/openptt/blob/main/PRD/SPEC.md` |

---

## 📤 跑完後,跟我說什麼

給我這三樣,我可以幫你做 Notion 進度 digest(如果 Notion token 修好的話):

1. **GitHub HEAD commit SHA**(從 https://github.com/openclawsean024-create/openptt 看)
2. **Vercel preview URL**
3. **Lighthouse 分數**

---

## 🚨 不要 paste token 到 Telegram

不管你是用 curl / Postman / 瀏覽器驗證,**token 值不要出現在這個對話歷史**。已多次提醒,這次不再重複。

---

**問 Hermes**:跟 Hermes 說「**M1 第 X 步完成了,這是結果**」(給 HEAD SHA / Vercel URL / Lighthouse 分數),token 部分用 `***` 蓋掉或刪掉。