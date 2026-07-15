import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../DataContext'
import { handleThumbnailError } from '../utils/thumbnail'

const MEDAL = ['🥇', '🥈', '🥉', '4', '5']

function RankCard({ app, rank, showScore = false }) {
  return (
    <Link to={`/apps/${app.id}`} className="group flex items-center gap-4 p-4 rounded-xl hover:bg-surface-container-low transition-all border border-transparent hover:border-primary/30">
      <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
        <span className="text-2xl">{rank <= 3 ? MEDAL[rank - 1] : <span className="font-headline text-lg font-bold text-outline">{rank}</span>}</span>
      </div>
      <div className="w-16 h-12 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
        <img src={app.thumbnail} alt={app.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" loading="lazy" onError={handleThumbnailError} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-headline text-sm font-bold text-deep-navy group-hover:text-primary transition-colors truncate">{app.title}</p>
        <p className="font-label text-xs text-text-secondary truncate">{app.author} · {app.department}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 font-label text-xs text-error">
            <span className="material-symbols-outlined text-[12px]">favorite</span>{(app.likeCount || 0).toLocaleString()}
          </span>
          <span className="flex items-center gap-1 font-label text-xs text-text-secondary">
            <span className="material-symbols-outlined text-[12px]">visibility</span>{(app.viewCount || 0).toLocaleString()}
          </span>
          {showScore && <span className="font-label text-xs text-primary font-bold">점수 {Math.round(app.score).toLocaleString()}</span>}
        </div>
      </div>
      <div className="flex-shrink-0">
        <span className={`font-label text-xs px-2 py-0.5 rounded-full ${app.type === 'file' ? 'bg-deep-navy/10 text-deep-navy' : 'bg-primary/10 text-primary'}`}>
          {app.type === 'file' ? 'HTML' : 'LINK'}
        </span>
      </div>
    </Link>
  )
}

export default function Rankings() {
  const { getRankings } = useData()
  const [tab, setTab] = useState('weekly')
  const { weekly, allTime, trending, byDept } = useMemo(() => getRankings(), [getRankings])

  const tabs = [
    { id: 'weekly', label: '주간 TOP 5', icon: 'local_fire_department' },
    { id: 'alltime', label: '전체 인기', icon: 'emoji_events' },
    { id: 'trending', label: '트렌딩', icon: 'trending_up' },
    { id: 'dept', label: '부서별', icon: 'corporate_fare' },
  ]

  return (
    <main className="max-w-[1280px] mx-auto px-4 md:px-12 py-16">
      {/* Hero */}
      <div className="mb-12 text-left">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full text-primary font-label text-xs mb-4">
          <span className="material-symbols-outlined text-[16px]">emoji_events</span>
          LEADERBOARD
        </div>
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-deep-navy mb-3">랭킹 & 큐레이션</h1>
        <p className="font-body text-base text-text-secondary">좋아요 × 2 + 조회수 × 0.5 점수로 산정되며, 실시간으로 반영됩니다.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-8 border-b border-outline-variant pb-0">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-3 font-label text-sm font-bold whitespace-nowrap border-b-2 transition-all -mb-px ${tab === t.id ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-on-surface hover:border-outline-variant'}`}
          >
            <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Weekly TOP 5 */}
      {tab === 'weekly' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* #1 Featured */}
          {weekly[0] && (
            <Link to={`/apps/${weekly[0].id}`} className="group lg:col-span-2 relative overflow-hidden rounded-2xl border border-outline-variant hover:border-primary transition-all hover:shadow-2xl">
              <div className="aspect-[21/9] relative overflow-hidden bg-surface-container">
                <img src={weekly[0].thumbnail} alt={weekly[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90" onError={handleThumbnailError} />
                <div className="absolute inset-0 bg-gradient-to-t from-deep-navy/90 via-deep-navy/40 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-primary text-on-primary font-label text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-2">
                    <span className="text-lg">🥇</span> 이번 주 1위
                  </span>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <h2 className="font-headline text-2xl md:text-3xl font-extrabold text-surface-white mb-2">{weekly[0].title}</h2>
                  <p className="font-body text-sm text-surface-white/80 line-clamp-2">{weekly[0].description}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-1.5 text-surface-white font-label text-sm">
                      <span className="material-symbols-outlined text-[16px] text-error">favorite</span>{(weekly[0].likeCount || 0).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1.5 text-surface-white/70 font-label text-sm">
                      <span className="material-symbols-outlined text-[16px]">visibility</span>{(weekly[0].viewCount || 0).toLocaleString()}
                    </span>
                    <span className="text-primary-fixed font-label text-sm font-bold">점수 {Math.round(weekly[0].score).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* 2~5위 */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {weekly.slice(1).map((app, i) => (
              <RankCard key={app.id} app={app} rank={i + 2} showScore />
            ))}
          </div>
        </div>
      )}

      {/* All-time */}
      {tab === 'alltime' && (
        <div className="bg-surface-white border border-outline-variant rounded-2xl overflow-hidden">
          <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant">
            <p className="font-label text-xs text-text-secondary">전체 기간 인기 앱 TOP 10</p>
          </div>
          <div className="divide-y divide-outline-variant/50 p-3">
            {allTime.map((app, i) => <RankCard key={app.id} app={app} rank={i + 1} showScore />)}
          </div>
        </div>
      )}

      {/* Trending */}
      {tab === 'trending' && (
        <div>
          <p className="font-body text-sm text-text-secondary mb-6">조회수 기반 트렌딩 앱입니다.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {trending.map((app, i) => (
              <Link key={app.id} to={`/apps/${app.id}`} className="group bg-surface-white border border-outline-variant rounded-xl overflow-hidden hover:border-primary hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="aspect-video relative overflow-hidden bg-surface-container">
                  <img src={app.thumbnail} alt={app.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" onError={handleThumbnailError} />
                  <div className="absolute top-3 left-3 bg-primary text-on-primary font-label text-xs px-2.5 py-1 rounded-full font-bold">
                    #{i + 1} 트렌딩
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-headline text-base font-bold text-deep-navy group-hover:text-primary transition-colors">{app.title}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 font-label text-xs text-text-secondary">
                      <span className="material-symbols-outlined text-[14px]">visibility</span>{(app.viewCount || 0).toLocaleString()} 조회
                    </span>
                    <span className="flex items-center gap-1 font-label text-xs text-error">
                      <span className="material-symbols-outlined text-[14px]">favorite</span>{(app.likeCount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* By dept */}
      {tab === 'dept' && (
        <div>
          <p className="font-body text-sm text-text-secondary mb-6">부서별 베스트 앱과 참여 현황입니다.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {byDept.map(({ dept, best, count }) => (
              <div key={dept} className="bg-surface-white border border-outline-variant rounded-xl p-6 hover:border-primary transition-all hover:shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-headline text-lg font-bold text-deep-navy">{dept}</h3>
                    <p className="font-label text-xs text-text-secondary">{count}개 앱 등록</p>
                  </div>
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">corporate_fare</span>
                  </div>
                </div>
                {best && (
                  <Link to={`/apps/${best.id}`} className="group flex items-center gap-3 p-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                      <img src={best.thumbnail} alt={best.title} className="w-full h-full object-cover" onError={handleThumbnailError} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-label text-xs font-bold text-deep-navy group-hover:text-primary truncate">{best.title}</p>
                      <p className="font-label text-xs text-outline">점수 {Math.round(best.score)}</p>
                    </div>
                    <span className="font-label text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Best</span>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
