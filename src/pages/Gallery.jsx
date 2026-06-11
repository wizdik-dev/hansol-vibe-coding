import { useState, useMemo } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import AppCard from '../components/AppCard'
import { useData } from '../DataContext'

const CATEGORIES = ['전체', '회계/재무', '영업/마케팅', '구매/조달', '생산/제조', '물류/유통', '인사/총무', '기획/전략', 'IT/시스템', '품질/안전', '고객서비스', '기타']
const SORTS = [
  { value: 'newest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'likes', label: '좋아요순' },
]

export default function Gallery() {
  const { user, apps: allApps } = useData()
  const [searchParams, setSearchParams] = useSearchParams()
  const [category, setCategory] = useState('전체')
  const [sort, setSort] = useState('newest')
  const [type, setType] = useState('전체')
  const [authModal, setAuthModal] = useState(false)
  const navigate = useNavigate()

  const q = searchParams.get('q') || ''

  const apps = useMemo(() => {
    let list = allApps.filter(a => a.status !== 'rejected')
    if (q) list = list.filter(a =>
      a.title.toLowerCase().includes(q.toLowerCase()) ||
      a.description?.toLowerCase().includes(q.toLowerCase()) ||
      a.tags?.some(t => t.toLowerCase().includes(q.toLowerCase())) ||
      a.author?.toLowerCase().includes(q.toLowerCase())
    )
    if (category !== '전체') list = list.filter(a => a.category === category)
    if (type === 'HTML') list = list.filter(a => a.type === 'file')
    if (type === '외부링크') list = list.filter(a => a.type === 'link')
    if (sort === 'newest') list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    if (sort === 'popular') list = [...list].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    return list
  }, [q, category, type, sort])

  return (
    <>
      {/* Hero */}
      <section className="relative h-[420px] md:h-[480px] w-full overflow-hidden flex items-center bg-surface-white">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-surface-white via-primary-fixed/30 to-secondary-fixed/40" />
        <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-12 w-full">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full text-primary font-label text-xs">
              <span className="material-symbols-outlined text-[16px]">terminal</span>
              <span>HANSOL PAPER · VIBE CODING</span>
            </div>
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-deep-navy tracking-tight leading-tight">
              한솔제지<br />Vibe Coding 포탈
            </h1>
            <p className="font-body text-base text-text-secondary max-w-lg">
              임직원이 바이브코딩으로 직접 개발한 아이디어를 공유하고,<br />함께 활용하는 사내 혁신 플랫폼입니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link to={user ? '/register' : '/login'}>
                <button className="bg-primary text-on-primary px-8 py-3 font-label text-sm font-bold rounded-lg hover:bg-primary-container transition-all hover:scale-105 shadow-md">
                  지금 등록하기
                </button>
              </Link>
              <button
                onClick={() => document.getElementById('gallery-grid')?.scrollIntoView({ behavior: 'smooth' })}
                className="border border-primary text-primary px-8 py-3 font-label text-sm font-bold rounded-lg hover:bg-primary/5 transition-all"
              >
                전체 둘러보기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <section className="bg-surface-white border-y border-outline-variant sticky top-16 md:top-20 z-40">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 md:pb-0">
            {['전체', 'HTML', '외부링크'].map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-5 py-1.5 rounded-full font-label text-xs font-bold whitespace-nowrap transition-colors ${type === t ? 'bg-primary text-on-primary' : 'bg-surface-container text-text-secondary hover:bg-surface-container-high'}`}
              >
                {t}
              </button>
            ))}
            <div className="w-px h-5 bg-outline-variant mx-1" />
            {CATEGORIES.filter(c => c !== '전체').map(c => (
              <button
                key={c}
                onClick={() => setCategory(c === category ? '전체' : c)}
                className={`px-5 py-1.5 rounded-full font-label text-xs whitespace-nowrap transition-colors ${category === c ? 'bg-secondary text-on-secondary' : 'bg-surface-container text-text-secondary hover:bg-surface-container-high'}`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="bg-transparent border-none focus:ring-0 font-label text-sm text-primary font-bold cursor-pointer outline-none"
            >
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            {q && (
              <button
                onClick={() => setSearchParams({})}
                className="font-label text-xs text-error flex items-center gap-1 hover:underline"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
                "{q}" 검색 취소
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section id="gallery-grid" className="max-w-[1280px] mx-auto px-4 md:px-12 py-16">
        {q && (
          <p className="font-body text-sm text-text-secondary mb-6">
            "<span className="text-primary font-bold">{q}</span>" 검색 결과 — {apps.length}개
          </p>
        )}
        {apps.length === 0 ? (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-6xl text-outline-variant">search_off</span>
            <p className="font-headline text-xl text-text-secondary mt-4">검색 결과가 없습니다</p>
            <p className="font-body text-sm text-outline mt-2">다른 키워드나 필터를 사용해 보세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {apps.map(app => (
              <AppCard key={app.id} app={app} onAuthRequired={() => setAuthModal(true)} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-deep-navy text-on-primary py-20 relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12">
          <div className="max-w-3xl flex flex-col items-start gap-4">
            <h2 className="font-headline text-4xl md:text-5xl font-extrabold">우리 팀의 아이디어를 <br />함께 나눠요.</h2>
            <p className="font-body text-base opacity-80 max-w-xl">동료의 아이디어에서 업무 힌트를 얻고, 나의 결과물도 공유해보세요.</p>
            <Link to={user ? '/register' : '/login'}>
              <button className="mt-2 bg-primary-fixed text-on-primary-fixed px-10 py-4 font-label text-sm font-bold rounded-lg hover:bg-primary-fixed-dim transition-all hover:scale-105 shadow-xl">
                아이디어 등록하기
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Auth modal */}
      {authModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setAuthModal(false)}>
          <div className="bg-surface-white rounded-xl p-8 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-headline text-xl font-bold text-deep-navy mb-2">로그인이 필요합니다</h3>
            <p className="font-body text-sm text-text-secondary mb-6">좋아요 및 북마크 기능은 로그인 후 이용 가능합니다.</p>
            <div className="flex gap-3">
              <button onClick={() => setAuthModal(false)} className="flex-1 border border-outline-variant py-2.5 rounded-lg font-label text-sm text-text-secondary hover:bg-surface-container-low transition-colors">취소</button>
              <button onClick={() => { setAuthModal(false); navigate('/login') }} className="flex-1 bg-primary text-on-primary py-2.5 rounded-lg font-label text-sm font-bold hover:bg-primary-container transition-colors">로그인</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
