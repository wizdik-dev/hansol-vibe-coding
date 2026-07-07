import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useData } from '../DataContext'
import { uploadHtmlFile } from '../store'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const COLORS = ['#005d97', '#286292', '#0077bc', '#94c8fe', '#cfe5ff', '#9bcbff']
const CATEGORIES = ['회계/재무', '영업/마케팅', '구매/조달', '생산/제조', '물류/유통', '인사/총무', '기획/전략', 'IT/시스템', '품질/안전', '고객서비스', '기타']
const TAG_OPTIONS = ['Vercel', 'Streamlit', '기타']

function normalizeUrl(url) {
  if (!url) return url
  if (/^https?:\/\//i.test(url)) return url
  return 'https://' + url
}

function AppEditModal({ app, onClose, onSave }) {
  const [form, setForm] = useState({
    title: app.title || '',
    description: app.description || '',
    category: app.category || CATEGORIES[0],
    tags: Array.isArray(app.tags) ? app.tags : [],
    externalUrl: app.externalUrl || '',
  })
  const [saving, setSaving] = useState(false)
  const [newHtmlFile, setNewHtmlFile] = useState(null)
  const [htmlUploadProgress, setHtmlUploadProgress] = useState(null)
  const [isDraggingHtml, setIsDraggingHtml] = useState(false)

  function toggleTag(tag) {
    setForm(f => ({ ...f, tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag] }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) return
    setSaving(true)
    let saveData = { ...form, externalUrl: normalizeUrl(form.externalUrl) }
    if (app.type === 'file' && newHtmlFile) {
      const result = await uploadHtmlFile(app.id, newHtmlFile, pct => setHtmlUploadProgress(pct))
      saveData.fileUrl = result.url
    }
    await onSave(saveData)
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-surface-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-outline-variant">
          <h2 className="font-headline text-xl font-bold text-deep-navy">앱 수정 (관리자)</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-container rounded transition-colors">
            <span className="material-symbols-outlined text-text-secondary">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block font-label text-sm text-primary mb-2">프로젝트 이름 *</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary p-3 font-body text-sm outline-none transition-all" required />
          </div>
          <div>
            <label className="block font-label text-sm text-primary mb-2">프로젝트 설명 *</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary p-3 font-body text-sm outline-none transition-all resize-none" rows={4} required />
          </div>
          <div>
            <label className="block font-label text-sm text-primary mb-2">카테고리</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary p-3 font-body text-sm outline-none">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-label text-sm text-primary mb-2">기술 태그</label>
            <div className="flex gap-2">
              {TAG_OPTIONS.map(tag => (
                <button key={tag} type="button" onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full font-label text-sm font-bold border-2 transition-all ${form.tags.includes(tag) ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant text-text-secondary hover:border-primary hover:text-primary'}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
          {app.type === 'file' && (
            <div>
              <label className="block font-label text-sm text-primary mb-2">HTML 파일 교체</label>
              {app.fileUrl && !newHtmlFile && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-surface-container rounded-lg">
                  <span className="material-symbols-outlined text-[16px] text-primary">html</span>
                  <span className="font-label text-xs text-text-secondary flex-1">현재 파일 등록됨</span>
                </div>
              )}
              {newHtmlFile && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-primary/5 border border-primary/30 rounded-lg">
                  <span className="material-symbols-outlined text-[16px] text-primary">html</span>
                  <span className="font-label text-xs text-primary truncate flex-1">{newHtmlFile.name}</span>
                  <button type="button" onClick={() => setNewHtmlFile(null)} className="text-text-secondary hover:text-error transition-colors">
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              )}
              {htmlUploadProgress !== null && htmlUploadProgress < 100 && (
                <div className="mb-2 h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all" style={{ width: `${htmlUploadProgress}%` }} />
                </div>
              )}
              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${isDraggingHtml ? 'border-primary bg-primary/5' : 'border-outline-variant'}`}
                onDragEnter={e => { e.preventDefault(); e.stopPropagation(); setIsDraggingHtml(true) }}
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); setIsDraggingHtml(true) }}
                onDragLeave={e => { e.preventDefault(); e.stopPropagation(); setIsDraggingHtml(false) }}
                onDrop={e => {
                  e.preventDefault(); e.stopPropagation(); setIsDraggingHtml(false)
                  const file = e.dataTransfer.files[0]
                  if (file && file.name.endsWith('.html')) setNewHtmlFile(file)
                }}
              >
                <span className="material-symbols-outlined text-2xl text-outline mb-1">upload_file</span>
                <p className="font-label text-xs text-text-secondary mb-2">{isDraggingHtml ? '여기에 놓으세요' : 'HTML 파일을 드래그하거나'}</p>
                <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-on-primary font-label text-xs font-bold rounded-lg hover:bg-deep-navy transition-colors">
                  <span className="material-symbols-outlined text-[14px]">folder_open</span>
                  파일 선택
                  <input type="file" accept=".html" className="sr-only"
                    onChange={e => { if (e.target.files[0]) setNewHtmlFile(e.target.files[0]); e.target.value = '' }} />
                </label>
              </div>
            </div>
          )}
          {app.type === 'link' && (
            <div>
              <label className="block font-label text-sm text-primary mb-2">외부 링크 URL</label>
              <input value={form.externalUrl} onChange={e => setForm(f => ({ ...f, externalUrl: e.target.value }))}
                className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary p-3 font-body text-sm outline-none transition-all" placeholder="https://" />
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 bg-primary text-on-primary font-label text-sm font-bold py-3 rounded-lg hover:bg-primary-container transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {saving && <span className="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />}
              {saving ? '저장 중...' : '저장하기'}
            </button>
            <button type="button" onClick={onClose}
              className="px-6 py-3 border border-outline-variant text-text-secondary font-label text-sm rounded-lg hover:bg-surface-container-low transition-all">
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

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
  const { user, isAdmin, apps: allApps, deleteApp, updateApp,
    getReports, resolveReport, getNotices, addNotice, deleteNotice,
    getAdminStats, getBlockedDomains, addBlockedDomain, removeBlockedDomain,
    getUsers, adminDeleteUser, adminSendPasswordReset,
    getEducationBatches, addEducationBatch, removeEducationBatch, reorderEducationBatches,
    getEducationBatchesWithDefault, setDefaultEducationBatch, saveEducationBatches } = useData()

  const [section, setSection] = useState('stats')
  const [reports, setReports] = useState([])
  const [notices, setNotices] = useState([])
  const [stats, setStats] = useState(null)
  const [blocked, setBlocked] = useState([])
  const [users, setUsers] = useState([])
  const [noticeForm, setNoticeForm] = useState({ title: '', content: '' })
  const [newDomain, setNewDomain] = useState('')
  const [appFilter, setAppFilter] = useState('all')
  const [pwResetMsg, setPwResetMsg] = useState('')
  const [editingApp, setEditingApp] = useState(null)
  const [educationBatches, setEducationBatches] = useState([])
  const [defaultBatch, setDefaultBatch] = useState('')
  const [newBatch, setNewBatch] = useState('')
  const [newBatchColor, setNewBatchColor] = useState('#10b981')
  const [editingBatchIdx, setEditingBatchIdx] = useState(null)
  const [editingBatchVal, setEditingBatchVal] = useState('')
  const [editingBatchColor, setEditingBatchColor] = useState('')

  async function handleEditSave(form) {
    await updateApp(editingApp.id, form)
    setEditingApp(null)
  }

  async function refreshBatches() {
    const { batches, defaultBatch: db_ } = await getEducationBatchesWithDefault()
    setEducationBatches(batches); setDefaultBatch(db_)
  }

  async function handleAddBatch() {
    const name = newBatch.trim()
    if (!name || educationBatches.some(b => b.name === name)) return
    await addEducationBatch(name, newBatchColor)
    setNewBatch('')
    setNewBatchColor('#10b981')
    await refreshBatches()
  }

  async function handleRemoveBatch(name) {
    if (!window.confirm(`'${name}'을(를) 삭제하시겠습니까?`)) return
    await removeEducationBatch(name)
    if (defaultBatch === name) await setDefaultEducationBatch('')
    await refreshBatches()
  }

  async function handleSaveBatchEdit(idx) {
    const newVal = editingBatchVal.trim()
    if (!newVal) { setEditingBatchIdx(null); return }
    const oldName = educationBatches[idx].name
    const updated = educationBatches.map((b, i) => i === idx ? { name: newVal, color: editingBatchColor } : b)
    await saveEducationBatches(updated)
    if (defaultBatch === oldName && newVal !== oldName) await setDefaultEducationBatch(newVal)
    setEditingBatchIdx(null)
    await refreshBatches()
  }

  async function handleBatchColorChange(idx, color) {
    const updated = educationBatches.map((b, i) => i === idx ? { ...b, color } : b)
    await saveEducationBatches(updated)
    setEducationBatches(updated)
  }

  async function handleSetDefault(name) {
    const next = defaultBatch === name ? '' : name
    await setDefaultEducationBatch(next)
    setDefaultBatch(next)
  }

  async function handleBulkSetBatch(batchName) {
    if (!window.confirm(`교육 차수가 없는 모든 과제를 '${batchName}'으로 일괄 설정하시겠습니까?`)) return
    const targets = allApps.filter(a => !a.educationBatch)
    await Promise.all(targets.map(a => updateApp(a.id, { educationBatch: batchName })))
    window.alert(`${targets.length}개 과제에 '${batchName}'이(가) 적용되었습니다.`)
  }

  useEffect(() => {
    if (!isAdmin) navigate('/')
  }, [isAdmin])

  const refresh = useCallback(async () => {
    const [r, n, s, b, u, ebData] = await Promise.all([
      getReports(), getNotices(), getAdminStats(), getBlockedDomains(), getUsers(), getEducationBatchesWithDefault(),
    ])
    setReports(r); setNotices(n); setStats(s); setBlocked(b); setUsers(u)
    setEducationBatches(ebData.batches); setDefaultBatch(ebData.defaultBatch)
  }, [getReports, getNotices, getAdminStats, getBlockedDomains, getUsers, getEducationBatchesWithDefault])

  useEffect(() => { if (isAdmin) refresh() }, [isAdmin])

  if (!isAdmin || !stats) return null

  const apps = allApps

  async function handleDelete(id) {
    if (window.confirm('정말 삭제하시겠습니까?')) { await deleteApp(id) }
  }
  async function handleResolve(id) { await resolveReport(id); refresh() }
  async function handleNotice(e) {
    e.preventDefault()
    if (!noticeForm.title || !noticeForm.content) return
    await addNotice(noticeForm.title, noticeForm.content)
    setNoticeForm({ title: '', content: '' })
    refresh()
  }
  async function handleDeleteNotice(id) { await deleteNotice(id); refresh() }
  async function handleBlockDomain() {
    if (!newDomain.trim()) return
    await addBlockedDomain(newDomain.trim())
    setNewDomain('')
    refresh()
  }
  async function handleRemoveDomain(d) { await removeBlockedDomain(d); refresh() }
  async function handleDeleteUser(uid) {
    if (!window.confirm('사용자를 삭제하시겠습니까? 복구할 수 없습니다.')) return
    await adminDeleteUser(uid)
    refresh()
  }
  async function handlePasswordReset(email) {
    await adminSendPasswordReset(email)
    setPwResetMsg(`${email} 로 비밀번호 재설정 이메일을 발송했습니다.`)
    setTimeout(() => setPwResetMsg(''), 4000)
  }

  const filteredApps = apps.filter(a => appFilter === 'all' ? true : a.status === appFilter)

  const navItems = [
    { id: 'stats', icon: 'bar_chart', label: '통계 대시보드' },
    { id: 'apps', icon: 'apps', label: '앱 관리' },
    { id: 'users', icon: 'group', label: `유저 관리 (${users.length}명)` },
    { id: 'reports', icon: 'flag', label: `신고 관리 (${stats?.pendingReports ?? 0}개)` },
    { id: 'notices', icon: 'campaign', label: '공지사항' },
    { id: 'education', icon: 'school', label: `교육 차수 관리 (${educationBatches.length}개)` },
    { id: 'security', icon: 'security', label: '보안 설정' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {editingApp && (
        <AppEditModal
          app={editingApp}
          onClose={() => setEditingApp(null)}
          onSave={handleEditSave}
        />
      )}
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon="apps" label="전체 앱" value={stats.totalApps} />
                  <StatCard icon="group" label="가입 유저" value={users.length} />
                  <StatCard icon="visibility" label="총 조회수" value={stats.totalViews} />
                  <StatCard icon="favorite" label="총 좋아요" value={stats.totalLikes} color="text-error" />
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
                <span className="font-label text-xs text-text-secondary">{apps.length}개 등록됨</span>
                <div className="bg-surface-white border border-outline-variant rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-container-low border-b border-outline-variant">
                      <tr>
                        <th className="text-left px-4 py-3 font-label text-xs text-text-secondary">앱명</th>
                        <th className="text-left px-4 py-3 font-label text-xs text-text-secondary hidden md:table-cell">카테고리</th>
                        <th className="text-left px-4 py-3 font-label text-xs text-text-secondary hidden md:table-cell">등록자</th>
                        <th className="text-left px-4 py-3 font-label text-xs text-text-secondary hidden md:table-cell">조회/좋아요</th>
                        <th className="text-right px-4 py-3 font-label text-xs text-text-secondary">액션</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/50">
                      {apps.map(app => (
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
                          <td className="px-4 py-3 hidden md:table-cell"><span className="font-label text-xs text-text-secondary">{app.author} · {app.department}</span></td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="font-label text-xs text-text-secondary">{(app.viewCount||0).toLocaleString()} / {(app.likeCount||0).toLocaleString()}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => setEditingApp(app)} className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors" title="수정">
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                              </button>
                              <button onClick={() => handleDelete(app.id)} className="p-1.5 text-error hover:bg-error/10 rounded transition-colors" title="삭제">
                                <span className="material-symbols-outlined text-[16px]">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {apps.length === 0 && <p className="text-center py-10 font-body text-sm text-text-secondary">앱이 없습니다.</p>}
                </div>
              </div>
            )}

            {/* ─── 유저 관리 ─── */}
            {section === 'users' && (
              <div className="space-y-4">
                {pwResetMsg && (
                  <div className="bg-primary/10 text-primary font-label text-sm p-3 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">mark_email_read</span>{pwResetMsg}
                  </div>
                )}
                <span className="font-label text-xs text-text-secondary">{users.length}명 가입</span>
                <div className="bg-surface-white border border-outline-variant rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-container-low border-b border-outline-variant">
                      <tr>
                        <th className="text-left px-4 py-3 font-label text-xs text-text-secondary">이름</th>
                        <th className="text-left px-4 py-3 font-label text-xs text-text-secondary hidden md:table-cell">이메일</th>
                        <th className="text-left px-4 py-3 font-label text-xs text-text-secondary hidden md:table-cell">소속팀</th>
                        <th className="text-left px-4 py-3 font-label text-xs text-text-secondary hidden md:table-cell">역할</th>
                        <th className="text-right px-4 py-3 font-label text-xs text-text-secondary">액션</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/50">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xs flex-shrink-0">
                                {u.name?.charAt(0)?.toUpperCase() || '?'}
                              </div>
                              <span className="font-label text-xs text-deep-navy">{u.name || '(미설정)'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell"><span className="font-label text-xs text-text-secondary">{u.email}</span></td>
                          <td className="px-4 py-3 hidden md:table-cell"><span className="font-label text-xs text-text-secondary">{u.department || '—'}</span></td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className={`font-label text-xs px-2 py-0.5 rounded-full ${u.role === 'admin' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                              {u.role === 'admin' ? '관리자' : '일반'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handlePasswordReset(u.email)}
                                className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                                title="비밀번호 재설정 이메일 발송"
                              >
                                <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                              </button>
                              {u.role !== 'admin' && (
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="p-1.5 text-error hover:bg-error/10 rounded transition-colors"
                                  title="유저 삭제"
                                >
                                  <span className="material-symbols-outlined text-[16px]">person_remove</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && <p className="text-center py-10 font-body text-sm text-text-secondary">가입된 유저가 없습니다.</p>}
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
                        <button onClick={() => handleResolve(r.id)} className="flex-shrink-0 font-label text-xs bg-primary text-on-primary px-4 py-2 rounded-lg hover:bg-primary-container transition-colors">처리 완료</button>
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

            {/* ─── 교육 차수 관리 ─── */}
            {section === 'education' && (
              <div className="space-y-6">
                <div className="bg-surface-white border border-outline-variant rounded-xl p-6">
                  <h3 className="font-headline text-lg font-bold text-deep-navy mb-2">교육 차수 관리</h3>
                  <p className="font-body text-sm text-text-secondary mb-5">앱 등록 시 선택할 교육 차수 목록을 관리합니다.</p>
                  {educationBatches.length > 0 && (
                    <div className="mb-6 p-4 bg-surface-container-low rounded-lg">
                      <p className="font-label text-xs text-text-secondary mb-3">교육 차수 미설정 과제 일괄 적용</p>
                      <div className="flex flex-wrap gap-2">
                        {educationBatches.map(b => (
                          <button key={b.name} onClick={() => handleBulkSetBatch(b.name)}
                            style={{ borderColor: b.color, color: b.color }}
                            className="px-4 py-1.5 border rounded-full font-label text-xs hover:opacity-70 transition-opacity">
                            {b.name} 으로 일괄 적용
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* 새 차수 추가 */}
                  <div className="flex gap-3 mb-6 items-end">
                    <div className="flex-1">
                      <label className="block font-label text-xs text-text-secondary mb-1">차수 이름</label>
                      <input
                        value={newBatch}
                        onChange={e => setNewBatch(e.target.value)}
                        className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary p-3 font-label text-sm outline-none"
                        placeholder="새 교육 차수 입력 (예: 4차교육)"
                        onKeyDown={e => e.key === 'Enter' && handleAddBatch()}
                      />
                    </div>
                    <div>
                      <label className="block font-label text-xs text-text-secondary mb-1">색상</label>
                      <input type="color" value={newBatchColor} onChange={e => setNewBatchColor(e.target.value)}
                        className="w-12 h-11 rounded-lg border border-outline-variant cursor-pointer p-0.5 bg-transparent" />
                    </div>
                    <button onClick={handleAddBatch} className="bg-primary text-on-primary font-label text-sm font-bold px-5 py-3 rounded-lg hover:bg-deep-navy transition-colors">추가</button>
                  </div>
                  <div className="space-y-2">
                    {educationBatches.length === 0 && (
                      <p className="font-body text-sm text-outline italic">등록된 교육 차수가 없습니다.</p>
                    )}
                    {educationBatches.map((batch, idx) => (
                      <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg ${defaultBatch === batch.name ? 'border' : 'bg-surface-container-low'}`}
                        style={defaultBatch === batch.name ? { backgroundColor: batch.color + '15', borderColor: batch.color + '50' } : {}}>
                        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: batch.color }} />
                        {editingBatchIdx === idx ? (
                          <>
                            <input
                              value={editingBatchVal}
                              onChange={e => setEditingBatchVal(e.target.value)}
                              className="flex-1 bg-surface-white border-b-2 border-primary px-2 py-1 font-label text-sm outline-none"
                              onKeyDown={e => { if (e.key === 'Enter') handleSaveBatchEdit(idx); if (e.key === 'Escape') setEditingBatchIdx(null) }}
                              autoFocus
                            />
                            <input type="color" value={editingBatchColor} onChange={e => setEditingBatchColor(e.target.value)}
                              className="w-9 h-9 rounded border border-outline-variant cursor-pointer p-0.5 bg-transparent flex-shrink-0" />
                            <button onClick={() => handleSaveBatchEdit(idx)} className="text-primary hover:opacity-70 transition-opacity">
                              <span className="material-symbols-outlined text-[18px]">check</span>
                            </button>
                            <button onClick={() => setEditingBatchIdx(null)} className="text-text-secondary hover:opacity-70 transition-opacity">
                              <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 font-label text-sm text-on-surface">{batch.name}</span>
                            {defaultBatch === batch.name && (
                              <span className="font-label text-xs px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: batch.color }}>기본값</span>
                            )}
                            <button onClick={() => handleSetDefault(batch.name)} className="hover:opacity-70 transition-opacity text-outline" title={defaultBatch === batch.name ? '기본값 해제' : '기본값으로 설정'}
                              style={defaultBatch === batch.name ? { color: batch.color } : {}}>
                              <span className="material-symbols-outlined text-[18px]">{defaultBatch === batch.name ? 'star' : 'star_border'}</span>
                            </button>
                            <button onClick={() => { setEditingBatchIdx(idx); setEditingBatchVal(batch.name); setEditingBatchColor(batch.color) }} className="text-primary hover:opacity-70 transition-opacity" title="수정">
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button onClick={() => handleRemoveBatch(batch.name)} className="text-error hover:opacity-70 transition-opacity" title="삭제">
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
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
                        <button onClick={() => handleRemoveDomain(d)} className="hover:opacity-70 transition-opacity">
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
