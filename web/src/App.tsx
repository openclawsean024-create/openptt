import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout'
import BoardListPage from './pages/BoardListPage'
import BoardPage from './pages/BoardPage'
import ArticlePage from './pages/ArticlePage'
import FavoritesPage from './pages/FavoritesPage'
import { useThemeStore } from './lib/theme'

export default function App() {
  const initTheme = useThemeStore((s) => s.init)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<BoardListPage />} />
        <Route path="/board/:boardName" element={<BoardPage />} />
        <Route path="/article/:articleId" element={<ArticlePage />} />
        <Route path="/fav" element={<FavoritesPage />} />
      </Routes>
    </Layout>
  )
}
