import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  getUser, getApps, updateAppStatus, deleteAppById,
  getReports, resolveReport, getNotices, addNotice, deleteNotice,
  getAdminStats, getBlockedDomains, addBlockedDomain, removeBlockedDomain,
} from '../store'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const COLORS = ['#005d97', '#286292', '#0077bc', '#94c8fe', '#cfe5ff', '#9bcbff']

function StatCard({ icon, label, value, color = 'text-primary' }) {
  return (
    <div className="bg-surface-white border border-outline-variant rounded-xl p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center ${color}`}>
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <div>
        <p className="font-label text-xs text-text-secondary">{label}</p>
        <p className="font-headline text-2xl font-bold text-deep-navy">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      </div>
    </div>
  )
}

export default function Admin() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = getUser()

  useEffect(() => {
    if (!user || user.role !== 'admin') navigate('/')
  }, [])

  if (!user || user.role !== 'admin') return null

  const [section, setSection] = useState('stats')
  const [apps, setApps] = useState(() => getApps({ includeAll: true }))
  const [reports, setReports] = useState(() => getReports())
  const [notices, setNotices] = useState(() => getNotices())
  const [stats, setStats] = useState(() => getAdminStats())
  const [blocked, setBlocked] = useState(() => getBlockedDomains())
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '' })
  const [newDomain, setNewDomain] = useState('')
  const [appFilter, setAppFilter] = useState('all')

  function refresh() {
    setApps(getApps({ includeAll: true }))
    setReports(getReports())
    setNotices(getNotices())
    setStats(getAdminStats())
    setBlocked(getBlockedDomains())
  }

  function handleStatus(id, status) { updateAppStatus(id, status); refresh() }
  function handleDelete(id) { if (window.confirm('정말 삭제하시겠습니까?')) { deleteAppById(id); refresh() } }
  function handleResolve(id) { resolveReport(id); refresh() }
  function handleNotice(e) {
    e.preventDefault()
    if (!noticeForm.title || !noticeForm.content) return
    addNotice(noticeForm.title, noticeForm.content)
    setNoticeForm({ title: '', content: '' })
    refresh()
  }
  function handleDeleteNotice(id) { deleteNotice(id); refresh() }
  function handleBlockDomain() {
    if (!newDomain.trim()) return
    addBlockedDomain(newDomain.trim())
    setNewDomain('')
    refresh()
  }

  const filteredApps = apps.filter(a => appFilter === 'all' ? true : a.status === appFilter)

  const navItems = [
    { id: 'stats', icon: 'bar_chart', label: '통계 대시보드' },
    { id: 'apps', icon: 'apps', label: `앱 관리 (${stats.pendingApps}개 대기)` },
    { id: 'reports', icon: 'flag', label: `신고 관리 (${stats.pendingReports}개)` },
    { id: 'notices', icon: 'campaign', label: '공지사항' },
    { id: 'security', icon: 'security', label: '보안 설정' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1280px] mx-auto px-4 md:px-12 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-error/10 text-error font-label text-xs px-3 py-1 rounded-full mb-3">
              <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
              ADMIN
            </div>
            <h1 className="font-headline text-3xl font-extrabold text-deep-navy">관리자 대시보드</h1>
          </div>
          <Link to="/" className="font-label text-sm text-text-secondary hover:text-primary flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span>갤러리로
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar nav */}
          <aside className="lg:w-56 flex-shrink-0">
            <nav className="bg-surface-white border border-outline-variant rounded-xl overflow-hidden">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 font-label text-sm text-left transition-colors border-l-2 ${section === item.id ? 'bg-primary/5 text-primary border-primary font-bold' : 'text-on-surface border-transparent hover:bg-surface-container-low'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* ─── 통계 대시보드 ─── */}
            {section === 'stats' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                  <StatCard icon="apps" label="전체 앱" value={stats.totalApps} />
                  <StatCard icon="check_circle" label="승인된 앱" value={stats.approvedApps} color="text-primary" />
                  <StatCard icon="pending" label="승인 대기" value={stats.pendingApps} color="text-error" />
                  <StatCard icon="visibility" label="총 조회수" value={stats.totalViews} />
                  <StatCard icon="favorite" label="총 좋아요" value={stats.totalLikes} color="text-error" />
                  <StatCard icon="flag" label="미처리 신고" value={stats.pendingReports} color="text-error" />
                </div>

                {/* Monthly trend */}
                <div className="bg-surface-white border border-outline-variant rounded-xl p-6">
                  <h3 className="font-headline text-lg font-bold text-deep-navy mb-4">최근 30일 조회수 추이</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.monthlyTrend} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                      <XAxis dataKey="date" tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} interval={4} />
                      <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #c0c7d2' }} />
                      <Bar dataKey="views" fill="#005d97" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category chart */}
                  <div className="bg-surface-white border border-outline-variant rounded-xl p-6">
                    <h3 className="font-headline text-lg font-bold text-deep-navy mb-4">카테고리 분포</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={stats.categories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                          {stats.categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Tag cloud */}
                  <div className="bg-surface-white border border-outline-variant rounded-xl p-6">
                    <h3 className="font-headline text-lg font-bold text-deep-navy mb-4">인기 태그 TOP 10</h3>
                    <div className="flex flex-wrap gap-2">
                      {stats.tags.map(t => (
                        <span key={t.name} className="font-label text-xs px-3 py-1.5 rounded-full border border-outline-variant" style={{ fontSize: `${Math.min(14, 10 + t.value)}px`, background: '#f0f7ff', color: '#005d97' }}>
                          #{t.name} <span className="opacity-60">({t.value})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── 앱 관리 ─── */}
            {section === 'apps' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {[['all', '전체'], ['pending', '대기중'], ['approved', '승인됨'], ['rejected', '반려됨']].map(([v, l]) => (
                    <button key={v} onClick={() => setAppFilter(v)} className={`px-4 py-1.5 rounded-full font-label text-xs font-bold transition-colors ${appFilter === v ? 'bg-primary text-on-primary' : 'bg-surface-container text-text-secondary hover:bg-surface-container-high'}`}>{l}</button>
                  ))}
                  <span className="font-label text-xs text-text-secondary ml-auto">{filteredApps.length}개</span>
                </div>
                <div className="bg-surface-white border border-outline-variant rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-container-low border-b border-outline-variant">
                      <tr>
                        <th className="text-left px-4 py-3 font-label text-xs text-text-secondary">앱명</th>
                        <th className="text-left px-4 py-3 font-label text-xs text-text-secondary hidden md:table-cell">카테고리</th>
                        <th className="text-left px-4 py-3 font-label text-xs text-text-secondary hidden md:table-cell">작성자</th>
                        <th className="text-left px-4 py-3 font-label text-xs text-text-secondary">상태</th>
                        <th className="text-right px-4 py-3 font-label text-xs text-text-secondary">액션</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/50">
                      {filteredApps.map(app => (
                        <tr key={app.id} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded overflow-hidden bg-surface-container flex-shrink-0">
                                <img src={app.thumbnail} alt="" className="w-full h-full object-cover" />
                              </div>
                              <Link to={`/apps/${app.id}`} className="font-label text-xs text-deep-navy hover:text-primary truncate max-w-[120px]">{app.title}</Link>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell"><span className="font-label text-xs text-text-secondary">{app.category}</span></td>
                          <td className="px-4 py-3 hidden md:table-cell"><span className="font-label text-xs text-text-secondary">{app.author}</span></td>
                          <td className="px-4 py-3">
                            <span className={`font-label text-xs px-2 py-0.5 rounded-full ${app.status === 'approved' ? 'bg-primary/10 text-primary' : app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-error/10 text-error'}`}>
                              {app.status === 'approved' ? '승인' : app.status === 'pending' ? '대기' : '반려'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {app.status !== 'approved' && <button onClick={() => handleStatus(app.id, 'approved')} className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors" title="승인"><span className="material-symbols-outlined text-[16px]">check_circle</span></button>}
                              {app.status !== 'rejected' && <button onClick={() => handleStatus(app.id, 'rejected')} className="p-1.5 text-orange-500 hover:bg-orange-50 rounded transition-colors" title="반려"><span className="material-symbols-outlined text-[16px]">block</span></button>}
                              <button onClick={() => handleDelete(app.id)} className="p-1.5 text-error hover:bg-error/10 rounded transition-colors" title="삭제"><span className="material-symbols-outlined text-[16px]">delete</span></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredApps.length === 0 && <p className="text-center py-10 font-body text-sm text-text-secondary">앱이 없습니다.</p>}
                </div>
              </div>
            )}

            {/* ─── 신고 관리 ─── */}
            {section === 'reports' && (
              <div className="space-y-3">
                {reports.length === 0 && <p className="text-center py-16 font-body text-sm text-text-secondary">처리할 신고가 없습니다.</p>}
                {reports.map(r => (
                  <div key={r.id} className={`bg-surface-white border rounded-xl p-5 ${r.status === 'resolved' ? 'border-outline-variant opacity-60' : 'border-error/30'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-label text-xs px-2 py-0.5 rounded-full ${r.targetType === 'app' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>{r.targetType === 'app' ? '앱 신고' : '댓글 신고'}</span>
                          <span className={`font-label text-xs ${r.status === 'resolved' ? 'text-primary' : 'text-error'}`}>{r.status === 'resolved' ? '처리완료' : '미처리'}</span>
                        </div>
                        <p className="font-body text-sm text-on-surface"><span className="font-bold">{r.reporterName}</span>님의 신고 · ID: {r.targetId}</p>
                        <p className="font-body text-sm text-text-secondary mt-1">사유: {r.reason}</p>
                      </div>
                      {r.status !== 'resolved' && (
                        <button onClick={() => { resolveReport(r.id); refresh() }} className="flex-shrink-0 font-label text-xs bg-primary text-on-primary px-4 py-2 rounded-lg hover:bg-primary-container transition-colors">처리 완료</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ─── 공지사항 ─── */}
            {section === 'notices' && (
              <div className="space-y-6">
                <form onSubmit={handleNotice} className="bg-surface-white border border-outline-variant rounded-xl p-6 space-y-4">
                  <h3 className="font-headline text-lg font-bold text-deep-navy">공지사항 작성</h3>
                  <input
                    value={noticeForm.title}
                    onChange={e => setNoticeForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary p-3 font-body text-sm outline-none"
                    placeholder="공지 제목"
                    required
                  />
                  <textarea
                    value={noticeForm.content}
                    onChange={e => setNoticeForm(f => ({ ...f, content: e.target.value }))}
                    className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary p-3 font-body text-sm outline-none resize-none"
                    placeholder="공지 내용을 입력하세요. 등록 시 전체 사용자에게 알림이 발송됩니다."
                    rows={4}
                    required
                  />
                  <button type="submit" className="bg-primary text-on-primary font-label text-sm font-bold px-8 py-3 rounded-lg hover:bg-primary-container transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">campaign</span>전체 발송
                  </button>
                </form>
                <div className="space-y-3">
                  {notices.map(n => (
                    <div key={n.id} className="bg-surface-white border border-outline-variant rounded-xl p-5 flex items-start justify-between gap-4">
                      <div>
                        <p className="font-headline text-base font-bold text-deep-navy">{n.title}</p>
                        <p className="font-body text-sm text-text-secondary mt-1 line-clamp-2">{n.content}</p>
                        <p className="font-label text-xs text-outline mt-2">{new Date(n.createdAt).toLocaleDateString('ko-KR')}</p>
                      </div>
                      <button onClick={() => handleDeleteNotice(n.id)} className="flex-shrink-0 p-2 text-error hover:bg-error/10 rounded transition-colors">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── 보안 설정 ─── */}
            {section === 'security' && (
              <div className="space-y-6">
                <div className="bg-surface-white border border-outline-variant rounded-xl p-6">
                  <h3 className="font-headline text-lg font-bold text-deep-navy mb-2">도메인 블랙리스트</h3>
                  <p className="font-body text-sm text-text-secondary mb-5">외부 링크 등록 시 차단할 도메인을 관리합니다.</p>
                  <div className="flex gap-3 mb-5">
                    <input
                      value={newDomain}
                      onChange={e => setNewDomain(e.target.value)}
                      className="flex-1 bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary p-3 font-label text-sm outline-none"
                      placeholder="차단할 도메인 입력 (예: malware.com)"
                      onKeyDown={e => e.key === 'Enter' && handleBlockDomain()}
                    />
                    <button onClick={handleBlockDomain} className="bg-error text-on-error font-label text-sm font-bold px-5 py-2 rounded-lg hover:bg-error/80 transition-colors">차단 추가</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {blocked.map(d => (
                      <span key={d} className="flex items-center gap-2 bg-error/10 text-error font-label text-xs px-3 py-1.5 rounded-full">
                        <span className="material-symbols-outlined text-[12px]">block</span>
                        {d}
                        <button onClick={() => { removeBlockedDomain(d); refresh() }} className="hover:opacity-70 transition-opacity">
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-surface-white border border-outline-variant rounded-xl p-6">
                  <h3 className="font-headline text-lg font-bold text-deep-navy mb-2">파일 업로드 정책</h3>
                  <div className="space-y-3">
                    {[
                      ['허용 확장자', '.html, .css, .js, .zip'],
                      ['단일 파일 최대 크기', '10 MB'],
                      ['ZIP 파일 최대 크기', '50 MB'],
                      ['iframe sandbox', 'allow-scripts allow-forms (allow-same-origin 제외)'],
                      ['이메일 도메인 제한', '@hansol.com'],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-start gap-4 py-3 border-b border-outline-variant/50 last:border-0">
                        <span className="font-label text-xs text-text-secondary w-40 flex-shrink-0">{k}</span>
                        <span className="font-label text-xs text-primary font-bold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
