import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useData } from '../DataContext'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid,
} from 'recharts'

function StatCard({ icon, label, value, sub, color = 'text-primary' }) {
  return (
    <div className="bg-surface-white border border-outline-variant rounded-xl p-6">
      <div className={`flex items-center gap-2 mb-3 ${color}`}>
        <span className="material-symbols-outlined">{icon}</span>
        <span className="font-label text-xs text-text-secondary">{label}</span>
      </div>
      <p className="font-headline text-3xl font-extrabold text-deep-navy">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      {sub && <p className="font-label text-xs text-text-secondary mt-1">{sub}</p>}
    </div>
  )
}

export default function MyStats() {
  const navigate = useNavigate()
  const { user, getMyStats } = useData()
  const stats = useMemo(() => getMyStats(), [getMyStats])

  if (!user) { navigate('/login'); return null }
  if (!stats) return null

  return (
    <main className="max-w-[1280px] mx-auto px-4 md:px-12 py-16">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-headline text-4xl font-extrabold text-deep-navy">내 통계</h1>
          <p className="font-body text-sm text-text-secondary mt-2">내 앱의 조회수·좋아요 추이를 확인합니다.</p>
        </div>
        <Link to="/my/apps" className="font-label text-sm text-text-secondary hover:text-primary flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">apps</span>내 앱
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard icon="apps" label="등록 앱 수" value={stats.totalApps} />
        <StatCard icon="visibility" label="총 조회수" value={stats.totalViews} sub="누적 조회" />
        <StatCard icon="favorite" label="총 좋아요" value={stats.totalLikes} color="text-error" />
      </div>

      {stats.totalApps === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-outline-variant rounded-2xl">
          <span className="material-symbols-outlined text-6xl text-outline-variant">insert_chart</span>
          <p className="font-headline text-xl text-text-secondary mt-4">아직 등록한 앱이 없습니다</p>
          <Link to="/register">
            <button className="mt-6 bg-primary text-on-primary font-label text-sm font-bold px-8 py-3 rounded-lg hover:bg-primary-container transition-all">첫 앱 등록하기</button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* View trend */}
          <div className="bg-surface-white border border-outline-variant rounded-xl p-6">
            <h3 className="font-headline text-lg font-bold text-deep-navy mb-1">최근 14일 조회수 추이</h3>
            <p className="font-label text-xs text-text-secondary mb-5">앱 상세 페이지 방문 기록 기준</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={stats.history} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <defs>
                  <linearGradient id="viewGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#005d97" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#005d97" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} interval={1} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #c0c7d2' }} />
                <Area type="monotone" dataKey="views" stroke="#005d97" strokeWidth={2} fill="url(#viewGrad)" dot={{ r: 3, fill: '#005d97' }} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* App-level stats */}
          <div className="bg-surface-white border border-outline-variant rounded-xl p-6">
            <h3 className="font-headline text-lg font-bold text-deep-navy mb-5">앱별 성과</h3>
            <div className="space-y-3">
              {stats.apps.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).map(app => (
                <Link key={app.id} to={`/apps/${app.id}`} className="group flex items-center gap-4 p-4 rounded-xl border border-outline-variant hover:border-primary transition-all">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                    <img src={app.thumbnail} alt={app.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-headline text-sm font-bold text-deep-navy group-hover:text-primary transition-colors truncate">{app.title}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex-1 bg-surface-container-low rounded-full h-1.5 overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(100, ((app.viewCount || 0) / Math.max(...stats.apps.map(a => a.viewCount || 1))) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 flex-shrink-0 text-right">
                    <div>
                      <p className="font-headline text-lg font-bold text-deep-navy">{(app.viewCount || 0).toLocaleString()}</p>
                      <p className="font-label text-xs text-text-secondary">조회</p>
                    </div>
                    <div>
                      <p className="font-headline text-lg font-bold text-error">{(app.likeCount || 0).toLocaleString()}</p>
                      <p className="font-label text-xs text-text-secondary">좋아요</p>
                    </div>
                    <div>
                      <span className={`font-label text-xs px-2 py-0.5 rounded-full ${app.status === 'approved' ? 'bg-primary/10 text-primary' : 'bg-yellow-100 text-yellow-800'}`}>
                        {app.status === 'approved' ? '승인' : '대기'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Bar chart per app */}
          {stats.apps.length > 0 && (
            <div className="bg-surface-white border border-outline-variant rounded-xl p-6">
              <h3 className="font-headline text-lg font-bold text-deep-navy mb-5">앱별 조회수 비교</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.apps.map(a => ({ name: a.title.slice(0, 10), views: a.viewCount || 0, likes: a.likeCount || 0 }))} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e2e2" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #c0c7d2' }} />
                  <Bar dataKey="views" name="조회수" fill="#005d97" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="likes" name="좋아요" fill="#ba1a1a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
