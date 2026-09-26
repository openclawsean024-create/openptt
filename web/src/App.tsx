import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import BoardListPage from './pages/BoardListPage'
import BoardPage from './pages/BoardPage'
import ArticlePage from './pages/ArticlePage'
import FavoritesPage from './pages/FavoritesPage'
import DashboardPage from './pages/DashboardPage'
import HotPage from './pages/HotPage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'
import LiveHotPage from './pages/LiveHotPage'
import BoardHistoryPage from './pages/BoardHistoryPage'
import ArticleFavoritesPage from './pages/ArticleFavoritesPage'
import FeatureStatusPage from './pages/FeatureStatusPage'
import AboutPage from './pages/AboutPage'
import QueuePage from './pages/QueuePage'
import { useThemeStore } from './lib/theme'

export default function App() {
  const initTheme = useThemeStore((s) => s.init)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/boards" element={<BoardListPage />} />
        <Route path="/board/:boardName" element={<BoardPage />} />
        <Route path="/article/:articleId" element={<ArticlePage />} />
        <Route path="/fav" element={<FavoritesPage />} />
        <Route path="/queue" element={<QueuePage />} />
        <Route path="/hot" element={<HotPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/live-hot" element={<LiveHotPage />} />
        <Route path="/board-history" element={<BoardHistoryPage />} />
        <Route path="/article-favorites" element={<ArticleFavoritesPage />} />
        <Route path="/groups" element={<FeatureStatusPage eyebrow="GROUPS" title="分組討論" description="保留對標 App 的功能入口，但目前尚未建立帳號與社交層。" reason="跨看板群組、成員權限與同步資料需要另外定義；目前先用收藏與關鍵字訂閱完成個人閱讀整理。" />} />
        <Route path="/push-history" element={<FeatureStatusPage eyebrow="PUSH HISTORY" title="推文歷史" description="保留對標 App 的入口，但 OpenPTT MVP 暫不支援登入後的互動紀錄。" reason="推文歷史需要帳號、發文與推文事件資料；目前產品只提供閱讀與收藏。" />} />
        <Route path="/image-history" element={<FeatureStatusPage eyebrow="IMAGE HISTORY" title="圖片上傳紀錄" description="保留功能地圖位置，避免把尚未存在的上傳能力做成假功能。" reason="OpenPTT 現階段是閱讀器，不提供圖片上傳與個人媒體管理。" />} />
        <Route path="/donate" element={<FeatureStatusPage eyebrow="SUPPORT" title="贊助" description="對標 App 的贊助入口先保留在功能地圖中。" reason="目前沒有付費、捐款或帳務流程，避免建立不可用的付款承諾。" />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Layout>
  )
}
