import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getUser, getApps, getUserBookmarks } from '../store'
import AppCard from '../components/AppCard'

export default function MyApps({ mode = 'apps' }) {
  const navigate = useNavigate()
  const user = getUser()
  const [apps, setApps] = useState([])

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    if (mode === 'apps') {
      setApps(getApps().filter(a => a.userId === user.id))
    } else {
      const bm = getUserBookmarks()
      setApps(getApps().filter(a => bm[a.id]))
    }
  }, [mode, user])

  if (!user) return null

  return (
    <main className="max-w-[1280px] mx-auto px-4 md:px-12 py-16">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-headline text-4xl font-extrabold text-deep-navy">
            {mode === 'apps' ? '내 앱' : '북마크'}
          </h1>
          <p className="font-body text-sm text-text-secondary mt-2">
            {mode === 'apps' ? '등록한 앱 목록입니다.' : '저장한 앱 목록입니다.'}
          </p>
        </div>
        {mode === 'apps' && (
          <Link to="/register">
            <button className="bg-primary text-on-primary font-label text-sm font-bold px-6 py-3 rounded-lg hover:bg-primary-container transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">add</span>
              새 앱 등록
            </button>
          </Link>
        )}
      </div>

      {apps.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-outline-variant rounded-xl">
          <span className="material-symbols-outlined text-6xl text-outline-variant">
            {mode === 'apps' ? 'apps' : 'bookmark'}
          </span>
          <p className="font-headline text-xl text-text-secondary mt-4">
            {mode === 'apps' ? '아직 등록한 앱이 없습니다.' : '저장한 앱이 없습니다.'}
          </p>
          {mode === 'apps' && (
            <Link to="/register">
              <button className="mt-6 bg-primary text-on-primary font-label text-sm font-bold px-8 py-3 rounded-lg hover:bg-primary-container transition-all">
                첫 앱 등록하기
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {apps.map(app => <AppCard key={app.id} app={app} />)}
        </div>
      )}
    </main>
  )
}
