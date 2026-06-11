import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useData } from '../DataContext'
import { validateAttachment } from '../store'

const CATEGORIES = ['회계/재무', '영업/마케팅', '구매/조달', '생산/제조', '물류/유통', '인사/총무', '기획/전략', 'IT/시스템', '품질/안전', '고객서비스', '기타']
const TAG_OPTIONS = ['Vercel', 'Streamlit', '기타']

function EditModal({ app, onClose, onSave }) {
  const { uploadAttachment, deleteAttachment, updateAppAttachments } = useData()
  const [form, setForm] = useState({
    title: app.title || '',
    description: app.description || '',
    category: app.category || CATEGORIES[0],
    tags: Array.isArray(app.tags) ? app.tags : [],
  })
  const [saving, setSaving] = useState(false)
  const [existingAttachments, setExistingAttachments] = useState(app.attachments || [])
  const [newAttachments, setNewAttachments] = useState([])
  const [uploadProgress, setUploadProgress] = useState({})
  const [isDragging, setIsDragging] = useState(false)

  function toggleTag(tag) {
    setForm(f => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
    }))
  }

  function addFiles(files) {
    const items = files.map(file => {
      const v = validateAttachment(file)
      return { file, name: file.name, size: file.size, error: v.error || null }
    })
    setNewAttachments(prev => {
      const names = new Set(prev.map(a => a.name))
      return [...prev, ...items.filter(a => !names.has(a.name))]
    })
  }

  function handleNewFiles(e) {
    addFiles(Array.from(e.target.files || []))
    e.target.value = ''
  }

  async function handleRemoveExisting(att) {
    await deleteAttachment(att.path)
    const updated = existingAttachments.filter(a => a.path !== att.path)
    setExistingAttachments(updated)
    await updateAppAttachments(app.id, updated)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.description.trim()) return
    setSaving(true)
    const validNew = newAttachments.filter(a => !a.error)
    const uploaded = []
    for (const a of validNew) {
      const info = await uploadAttachment(app.id, a.file, pct =>
        setUploadProgress(p => ({ ...p, [a.name]: pct }))
      )
      uploaded.push(info)
    }
    await onSave({ ...form, attachments: [...existingAttachments, ...uploaded] })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-surface-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-outline-variant">
          <h2 className="font-headline text-xl font-bold text-deep-navy">앱 수정</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-container rounded transition-colors">
            <span className="material-symbols-outlined text-text-secondary">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block font-label text-sm text-primary mb-2">프로젝트 이름 *</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary p-3 font-body text-sm outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block font-label text-sm text-primary mb-2">프로젝트 설명 *</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary p-3 font-body text-sm outline-none transition-all resize-none"
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block font-label text-sm text-primary mb-2">카테고리</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary p-3 font-body text-sm outline-none"
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-label text-sm text-primary mb-2">기술 태그</label>
            <div className="flex gap-2">
              {TAG_OPTIONS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-full font-label text-sm font-bold border-2 transition-all ${form.tags.includes(tag) ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant text-text-secondary hover:border-primary hover:text-primary'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          {/* 첨부파일 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-label text-sm text-primary">첨부파일</label>
              <label className="cursor-pointer flex items-center gap-1 font-label text-xs text-primary hover:underline">
                <span className="material-symbols-outlined text-[14px]">add</span>파일 추가
                <input type="file" multiple accept=".xlsx,.xls,.csv,.pdf,.pptx,.ppt,.docx,.doc,.txt,.zip,.png,.jpg,.jpeg" onChange={handleNewFiles} className="sr-only" />
              </label>
            </div>
            <div
              className={`rounded-lg border-2 border-dashed transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-outline-variant'}`}
              onDragEnter={e => { e.preventDefault(); e.stopPropagation(); setIsDragging(true) }}
              onDragOver={e => { e.preventDefault(); e.stopPropagation(); setIsDragging(true) }}
              onDragLeave={e => { e.preventDefault(); e.stopPropagation(); setIsDragging(false) }}
              onDrop={e => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); addFiles(Array.from(e.dataTransfer.files || [])) }}
            >
            <div className="space-y-1.5 max-h-40 overflow-y-auto p-2">
              {isDragging && <div className="text-center py-1 font-label text-xs text-primary font-bold">여기에 놓으세요</div>}
              {existingAttachments.map((att, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg border border-outline-variant bg-surface-container-low">
                  <span className="material-symbols-outlined text-primary text-[16px] flex-shrink-0">
                    {att.name?.match(/\.(xlsx?|csv)$/i) ? 'table_chart' : att.name?.match(/\.pdf$/i) ? 'picture_as_pdf' : 'description'}
                  </span>
                  <span className="font-label text-xs text-deep-navy flex-1 truncate">{att.name}</span>
                  <button type="button" onClick={() => handleRemoveExisting(att)} className="p-0.5 text-error hover:opacity-70 flex-shrink-0">
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                  </button>
                </div>
              ))}
              {newAttachments.map((a, i) => (
                <div key={i} className={`flex items-center gap-2 p-2 rounded-lg border ${a.error ? 'border-error/40 bg-error/5' : 'border-outline-variant bg-surface-container-low'}`}>
                  <span className="material-symbols-outlined text-primary text-[16px] flex-shrink-0">attach_file</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-label text-xs text-deep-navy truncate">{a.name}</p>
                    {a.error ? <p className="font-label text-xs text-error">{a.error}</p>
                      : uploadProgress[a.name] != null
                        ? <div className="mt-0.5 h-1 bg-surface-container rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${uploadProgress[a.name]}%` }} /></div>
                        : null}
                  </div>
                  <button type="button" onClick={() => setNewAttachments(p => p.filter(x => x.name !== a.name))} className="p-0.5 text-text-secondary hover:text-error flex-shrink-0">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </div>
              ))}
              {existingAttachments.length === 0 && newAttachments.length === 0 && !isDragging && (
                <p className="font-label text-xs text-outline py-2 text-center">파일을 드래그하거나 위에서 추가하세요</p>
              )}
            </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary text-on-primary font-label text-sm font-bold py-3 rounded-lg hover:bg-primary-container transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <span className="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />}
              {saving ? '저장 중...' : '저장하기'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-outline-variant text-text-secondary font-label text-sm rounded-lg hover:bg-surface-container-low transition-all"
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function MyApps({ mode = 'apps' }) {
  const navigate = useNavigate()
  const { user, apps: allApps, userBookmarks, updateApp, deleteApp } = useData()
  const [editingApp, setEditingApp] = useState(null)

  const apps = useMemo(() => {
    if (!user) return []
    if (mode === 'apps') return allApps.filter(a => a.userId === user.id)
    return allApps.filter(a => userBookmarks.has(a.id))
  }, [mode, user, allApps, userBookmarks])

  if (!user) { navigate('/login'); return null }

  async function handleSave(form) {
    await updateApp(editingApp.id, form)
  }

  async function handleDelete(app) {
    if (!window.confirm(`"${app.title}" 앱을 삭제하시겠습니까?`)) return
    await deleteApp(app.id)
  }

  return (
    <>
      {editingApp && (
        <EditModal
          app={editingApp}
          onClose={() => setEditingApp(null)}
          onSave={handleSave}
        />
      )}

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
        ) : mode === 'apps' ? (
          <div className="space-y-3">
            {apps.map(app => (
              <div key={app.id} className="bg-surface-white border border-outline-variant rounded-xl p-4 flex items-center gap-4 hover:border-primary/40 transition-all">
                <Link to={`/apps/${app.id}`} className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                  <img src={app.thumbnail} alt={app.title} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/apps/${app.id}`} className="font-headline text-base font-bold text-deep-navy hover:text-primary transition-colors truncate block">
                    {app.title}
                  </Link>
                  <p className="font-body text-xs text-text-secondary mt-0.5 line-clamp-1">{app.description}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="font-label text-xs text-text-secondary">{app.category}</span>
                    {app.tags?.length > 0 && (
                      <div className="flex gap-1">
                        {app.tags.map(t => (
                          <span key={t} className="bg-primary/10 text-primary font-label text-xs px-2 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    )}
                    <span className="flex items-center gap-1 font-label text-xs text-text-secondary ml-auto">
                      <span className="material-symbols-outlined text-[12px]">visibility</span>{(app.viewCount || 0).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 font-label text-xs text-error">
                      <span className="material-symbols-outlined text-[12px]">favorite</span>{(app.likeCount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setEditingApp(app)}
                    className="flex items-center gap-1.5 px-3 py-2 font-label text-xs text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(app)}
                    className="flex items-center gap-1.5 px-3 py-2 font-label text-xs text-error border border-error/30 rounded-lg hover:bg-error/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {apps.map(app => (
              <Link key={app.id} to={`/apps/${app.id}`} className="group bg-surface-white border border-outline-variant rounded-xl overflow-hidden hover:border-primary hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="aspect-video overflow-hidden bg-surface-container">
                  <img src={app.thumbnail} alt={app.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <h3 className="font-headline text-base font-bold text-deep-navy group-hover:text-primary transition-colors truncate">{app.title}</h3>
                  <p className="font-body text-xs text-text-secondary mt-1 line-clamp-2">{app.description}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
