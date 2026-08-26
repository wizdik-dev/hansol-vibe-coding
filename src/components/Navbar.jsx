import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useData } from '../DataContext'

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000
  if (diff < 60) return '방금'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

export default function Navbar() {
  const { user, notifications, unreadCount, logout, markNotificationRead, markAllNotificationsRead, isAdmin } = useData()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handler = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  async function handleLogout() { await logout(); navigate('/') }

  function handleSearch(e) {
    e.preventDefault()
    const trimmed = searchVal.trim()
    navigate(trimmed ? `/?q=${encodeURIComponent(trimmed)}` : '/')
  }

  async function handleNotifClick(notif) {
    await markNotificationRead(notif.id)
    setNotifOpen(false)
    if (notif.link) navigate(notif.link)
  }

  async function handleMarkAll() { await markAllNotificationsRead() }

  const active = (path) => location.pathname === path

  const typeIcon = (type) => type === 'comment' ? 'chat_bubble' : type === 'like' ? 'favorite' : 'campaign'
  const typeColor = (type) => type === 'comment' ? 'text-secondary' : type === 'like' ? 'text-error' : 'text-primary'

  return (
    <nav className={`bg-surface-white/80 glass-nav border-b border-outline-variant fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'h-16 shadow-md' : 'h-20'}`}>
      <div className="flex justify-between items-center px-4 md:px-12 h-full w-full max-w-[1280px] mx-auto">
        {/* Logo + links */}
        <div className="flex items-center gap-10">
          <Link to="/" className="font-headline text-2xl font-bold text-deep-navy tracking-tight">Hansol Vibe Coding</Link>
          <div className="hidden md:flex gap-6 items-center">
            <Link to="/" className={`font-label text-sm transition-colors ${active('/') ? 'text-primary font-bold border-b-2 border-primary pb-0.5' : 'text-text-secondary hover:text-primary'}`}>갤러리</Link>
            <Link to="/rankings" className={`font-label text-sm transition-colors ${active('/rankings') ? 'text-primary font-bold border-b-2 border-primary pb-0.5' : 'text-text-secondary hover:text-primary'}`}>랭킹</Link>
            <Link to="/register" className={`font-label text-sm transition-colors ${active('/register') ? 'text-primary font-bold border-b-2 border-primary pb-0.5' : 'text-text-secondary hover:text-primary'}`}>등록</Link>
            {user && <Link to="/my/apps" className={`font-label text-sm transition-colors ${active('/my/apps') ? 'text-primary font-bold border-b-2 border-primary pb-0.5' : 'text-text-secondary hover:text-primary'}`}>내 앱</Link>}
            {isAdmin && (
              <Link to="/admin" className={`font-label text-sm transition-colors ${location.pathname.startsWith('/admin') ? 'text-error font-bold border-b-2 border-error pb-0.5' : 'text-error/70 hover:text-error'}`}>관리자</Link>
            )}
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="hidden lg:flex items-center bg-surface-container px-4 py-2 rounded-lg border border-transparent focus-within:border-primary transition-all">
            <span className="material-symbols-outlined text-outline text-[20px]">search</span>
            <input value={searchVal} onChange={e => setSearchVal(e.target.value)} className="bg-transparent border-none focus:ring-0 font-label text-sm w-52 placeholder:text-outline ml-2 outline-none" placeholder="앱 이름 또는 개발자 검색" />
          </form>

          {user ? (
            <>
              <div className="relative" ref={notifRef}>
                <button onClick={() => setNotifOpen(v => !v)} className="relative p-2 hover:bg-surface-container-low rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-primary">notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-error text-on-error font-label text-[10px] rounded-full flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-surface-white border border-outline-variant rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant bg-surface-container-low">
                      <span className="font-headline text-sm font-bold text-deep-navy">알림 {unreadCount > 0 && <span className="text-error">({unreadCount})</span>}</span>
                      {unreadCount > 0 && <button onClick={handleMarkAll} className="font-label text-xs text-primary hover:underline">모두 읽음</button>}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-outline-variant/50">
                      {notifications.length === 0 ? (
                        <div className="text-center py-8">
                          <span className="material-symbols-outlined text-3xl text-outline-variant">notifications_off</span>
                          <p className="font-label text-xs text-text-secondary mt-2">알림이 없습니다</p>
                        </div>
                      ) : notifications.slice(0, 10).map(n => (
                        <button key={n.id} onClick={() => handleNotifClick(n)} className={`w-full text-left px-4 py-3 hover:bg-surface-container-low transition-colors flex gap-3 items-start ${!n.isRead ? 'bg-primary/5' : ''}`}>
                          <span className={`material-symbols-outlined text-[18px] mt-0.5 flex-shrink-0 ${typeColor(n.type)}`}>{typeIcon(n.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-body text-xs text-on-surface leading-relaxed line-clamp-2">{n.message}</p>
                            <p className="font-label text-[10px] text-outline mt-1">{timeAgo(n.createdAt)}</p>
                          </div>
                          {!n.isRead && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link to="/my/bookmarks">
                <button className="p-2 hover:bg-surface-container-low rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-primary">bookmark</span>
                </button>
              </Link>
              <Link to="/my/profile">
                <button className="p-2 hover:bg-surface-container-low rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-primary">account_circle</span>
                </button>
              </Link>
              <button onClick={handleLogout} className="hidden md:block font-label text-sm text-text-secondary hover:text-primary px-3 py-1.5 rounded-lg hover:bg-surface-container-low transition-colors">로그아웃</button>
            </>
          ) : (
            <Link to="/login">
              <button className="bg-primary text-on-primary font-label text-sm font-bold px-5 py-2 rounded-lg hover:bg-primary-container transition-all">로그인</button>
            </Link>
          )}

          <button className="md:hidden p-2" onClick={() => setMenuOpen(v => !v)}>
            <span className="material-symbols-outlined text-primary">{menuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-surface-white border-t border-outline-variant shadow-lg">
          <div className="flex flex-col px-6 py-4 gap-3">
            <Link to="/" onClick={() => setMenuOpen(false)} className="font-label text-sm text-on-surface py-2">갤러리</Link>
            <Link to="/rankings" onClick={() => setMenuOpen(false)} className="font-label text-sm text-on-surface py-2">랭킹</Link>
            <Link to="/register" onClick={() => setMenuOpen(false)} className="font-label text-sm text-on-surface py-2">등록</Link>
            {user && <Link to="/my/apps" onClick={() => setMenuOpen(false)} className="font-label text-sm text-on-surface py-2">내 앱</Link>}
            {user && <Link to="/my/bookmarks" onClick={() => setMenuOpen(false)} className="font-label text-sm text-on-surface py-2">북마크</Link>}
            {user && <Link to="/my/profile" onClick={() => setMenuOpen(false)} className="font-label text-sm text-on-surface py-2">프로필</Link>}
            {user && <Link to="/my/stats" onClick={() => setMenuOpen(false)} className="font-label text-sm text-on-surface py-2">내 통계</Link>}
            {isAdmin && <Link to="/admin" onClick={() => setMenuOpen(false)} className="font-label text-sm text-error font-bold py-2">관리자 대시보드</Link>}
            {user && <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="text-left font-label text-sm text-error py-2">로그아웃</button>}
            {!user && <Link to="/login" onClick={() => setMenuOpen(false)} className="font-label text-sm text-primary font-bold py-2">로그인</Link>}
          </div>
        </div>
      )}
    </nav>
  )
}
