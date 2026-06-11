import { Routes, Route } from 'react-router-dom'
import { useData } from './DataContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Gallery from './pages/Gallery'
import AppDetail from './pages/AppDetail'
import Register from './pages/Register'
import Login from './pages/Login'
import MyApps from './pages/MyApps'
import Profile from './pages/Profile'
import Rankings from './pages/Rankings'
import Admin from './pages/Admin'
import MyStats from './pages/MyStats'

export default function App() {
  const { authLoading } = useData()

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-label text-sm text-text-secondary">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 pt-16 md:pt-20">
        <Routes>
          <Route path="/" element={<Gallery />} />
          <Route path="/apps/:id" element={<AppDetail />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/my/apps" element={<MyApps mode="apps" />} />
          <Route path="/my/bookmarks" element={<MyApps mode="bookmarks" />} />
          <Route path="/my/profile" element={<Profile />} />
          <Route path="/my/stats" element={<MyStats />} />
          <Route path="/rankings" element={<Rankings />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}
