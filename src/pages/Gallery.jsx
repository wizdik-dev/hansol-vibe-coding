import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import AppCard from '../components/AppCard'
import { useData } from '../DataContext'
import { getEducationBatches } from '../store'

const PAGE_SIZE = 12

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
  const [batch, setBatch] = useState('전체')
  const [batchColorMap, setBatchColorMap] = useState({})
  const [batchList, setBatchList] = useState([])

  useEffect(() => {
    getEducationBatches().then(batches => {
      const map = {}
      batches.forEach(b => { map[b.name] = b.color })
      setBatchColorMap(map)
      setBatchList(batches)
    })
  }, [])
  const [authModal, setAuthModal] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const loaderRef = useRef(null)
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
    if (batch !== '전체') list = list.filter(a => a.educationBatch === batch)
    if (sort === 'newest') list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    if (sort === 'popular') list = [...list].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    return list
  }, [allApps, q, category, type, batch, sort])

  // 필터/정렬 변경 시 visibleCount 리셋
  useEffect(() => { setVisibleCount(PAGE_SIZE) }, [q, category, type, batch, sort])

  const visibleApps = apps.slice(0, visibleCount)
  const hasMore = visibleCount < apps.length

  // IntersectionObserver로 무한 스크롤
  useEffect(() => {
    const el = loaderRef.current
    if (!el) return
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setVisibleCount(prev => prev + PAGE_SIZE)
      }
    }, { threshold: 0.1 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [apps, hasMore])

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
      <section className="bg-surface-white border-y border-outline-variant sticky top-16 z-40">
        <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {['전체', 'HTML', '외부링크'].map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-4 py-1.5 rounded-full font-label text-xs font-bold whitespace-nowrap transition-colors ${type === t ? 'bg-primary text-on-primary' : 'bg-surface-container text-text-secondary hover:bg-surface-container-high'}`}
                >
                  {t}
                </button>
              ))}
              {batchList.length > 0 && <div className="w-px h-4 bg-outline-variant mx-0.5 flex-shrink-0" />}
              {batchList.length > 0 && (
                <button
                  onClick={() => setBatch('전체')}
                  className={`px-4 py-1.5 rounded-full font-label text-xs font-bold whitespace-nowrap transition-colors ${batch === '전체' ? 'bg-primary text-on-primary' : 'bg-surface-container text-text-secondary hover:bg-surface-container-high'}`}
                >
                  전체
                </button>
              )}
              {batchList.map(b => (
                <button
                  key={b.name}
                  onClick={() => setBatch(batch === b.name ? '전체' : b.name)}
                  className="px-4 py-1.5 rounded-full font-label text-xs font-bold whitespace-nowrap transition-all"
                  style={batch === b.name
                    ? { backgroundColor: b.color, color: '#fff' }
                    : { backgroundColor: b.color + '18', color: b.color }}
                >
                  {b.name}
                </button>
              ))}
              <div className="w-px h-4 bg-outline-variant mx-0.5 flex-shrink-0" />
              <span className="material-symbols-outlined text-[15px] text-outline flex-shrink-0">category</span>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="bg-transparent border-none focus:ring-0 font-label text-xs text-text-secondary font-bold cursor-pointer outline-none whitespace-nowrap"
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c === '전체' ? '카테고리' : c}</option>)}
              </select>
              {(category !== '전체' || type !== '전체' || batch !== '전체') && (
                <button
                  onClick={() => { setCategory('전체'); setType('전체'); setBatch('전체') }}
                  className="font-label text-xs text-error flex items-center gap-0.5 hover:underline whitespace-nowrap"
                >
                  <span className="material-symbols-outlined text-[13px]">close</span>
                  초기화
                </button>
              )}
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="bg-transparent border-none focus:ring-0 font-label text-sm text-primary font-bold cursor-pointer outline-none"
              >
                {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              {q && (
                <button onClick={() => setSearchParams({})} className="font-label text-xs text-error flex items-center gap-1 hover:underline whitespace-nowrap">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                  검색 취소
                </button>
              )}
            </div>
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
        {!user ? (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-6xl text-outline-variant">lock</span>
            <p className="font-headline text-xl text-text-secondary mt-4">로그인 후 이용 가능합니다</p>
            <p className="font-body text-sm text-outline mt-2">임직원 로그인 후 등록된 과제를 둘러보세요.</p>
            <Link to="/login">
              <button className="mt-6 bg-primary text-on-primary px-8 py-3 font-label text-sm font-bold rounded-lg hover:bg-primary-container transition-all">
                로그인하기
              </button>
            </Link>
          </div>
        ) : apps.length === 0 ? (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-6xl text-outline-variant">search_off</span>
            <p className="font-headline text-xl text-text-secondary mt-4">검색 결과가 없습니다</p>
            <p className="font-body text-sm text-outline mt-2">다른 키워드나 필터를 사용해 보세요.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleApps.map(app => (
                <AppCard key={app.id} app={app} onAuthRequired={() => setAuthModal(true)} batchColorMap={batchColorMap} />
              ))}
            </div>
            {hasMore && (
              <div ref={loaderRef} className="flex justify-center py-10">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {!hasMore && apps.length > PAGE_SIZE && (
              <p className="text-center font-label text-xs text-outline mt-10">전체 {apps.length}개 과제를 모두 불러왔습니다.</p>
            )}
          </>
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
