import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useData } from '../DataContext'

export default function Profile() {
  const navigate = useNavigate()
  const { user, apps: allApps, userLikes, updateUser, changePassword } = useData()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: user?.name || '', department: user?.department || '', position: user?.position || '', bio: user?.bio || '' })
  const [saved, setSaved] = useState(false)

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwMsg, setPwMsg] = useState(null)
  const [showPw, setShowPw] = useState(false)

  const myApps = useMemo(() => allApps.filter(a => a.userId === user?.id), [allApps, user])
  const likedApps = useMemo(() => allApps.filter(a => userLikes.has(a.id)), [allApps, userLikes])

  async function handlePasswordChange(e) {
    e.preventDefault()
    if (pwForm.next !== pwForm.confirm) {
      setPwMsg({ type: 'error', text: '새 비밀번호 확인이 일치하지 않습니다.' })
      return
    }
    const result = await changePassword(pwForm.current, pwForm.next)
    if (result.error) {
      setPwMsg({ type: 'error', text: result.error })
    } else {
      setPwMsg({ type: 'ok', text: '비밀번호가 변경되었습니다.' })
      setPwForm({ current: '', next: '', confirm: '' })
      setTimeout(() => setPwMsg(null), 3000)
    }
  }

  if (!user) { navigate('/login'); return null }

  async function handleSave(e) {
    e.preventDefault()
    await updateUser(form)
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <main className="max-w-[1280px] mx-auto px-4 md:px-12 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile card */}
        <aside className="lg:col-span-4">
          <div className="bg-surface-white border border-outline-variant rounded-xl p-8 sticky top-24">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-on-primary font-headline text-3xl font-bold mb-4">
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
              <h2 className="font-headline text-2xl font-bold text-deep-navy">{user.name}</h2>
              <p className="font-label text-xs text-outline mt-1">{user.email}</p>
              {user.department && <p className="font-body text-sm text-text-secondary mt-1">{user.department} {user.position && `· ${user.position}`}</p>}
              {user.bio && <p className="font-body text-sm text-on-surface-variant mt-3 leading-relaxed">{user.bio}</p>}
            </div>
            <div className="mt-6 pt-6 border-t border-outline-variant grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="font-headline text-2xl font-bold text-primary">{myApps.length}</p>
                <p className="font-label text-xs text-text-secondary">등록 앱</p>
              </div>
              <div className="text-center">
                <p className="font-headline text-2xl font-bold text-primary">{likedApps.length}</p>
                <p className="font-label text-xs text-text-secondary">좋아요한 앱</p>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <Link to="/my/apps" className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-primary text-xl">apps</span>
                <span className="font-label text-sm text-on-surface">내 앱 목록</span>
              </Link>
              <Link to="/my/bookmarks" className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-primary text-xl">bookmark</span>
                <span className="font-label text-sm text-on-surface">북마크</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Main */}
        <section className="lg:col-span-8 space-y-6">
          {/* Edit form */}
          <div className="bg-surface-white border border-outline-variant rounded-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline text-xl font-bold text-deep-navy">프로필 설정</h3>
              {!editing && (
                <button onClick={() => setEditing(true)} className="font-label text-sm text-primary flex items-center gap-1 hover:underline">
                  <span className="material-symbols-outlined text-sm">edit</span> 편집
                </button>
              )}
            </div>
            {saved && (
              <div className="bg-primary/10 text-primary font-label text-sm p-3 rounded-lg mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                프로필이 저장되었습니다.
              </div>
            )}
            <form onSubmit={handleSave} className="space-y-5">
              {[
                { field: 'name', label: '이름', placeholder: '홍길동' },
                { field: 'department', label: '부서', placeholder: '미래전략팀' },
                { field: 'position', label: '직책', placeholder: '연구원' },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className="block font-label text-sm text-primary mb-2">{label}</label>
                  <input
                    value={form[field]}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                    disabled={!editing}
                    className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary p-3 font-body text-sm outline-none transition-all disabled:opacity-60"
                    placeholder={placeholder}
                  />
                </div>
              ))}
              <div>
                <label className="block font-label text-sm text-primary mb-2">한 줄 자기소개</label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  disabled={!editing}
                  className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary p-3 font-body text-sm outline-none transition-all disabled:opacity-60"
                  placeholder="코드로 세상을 바꾸는 개발자입니다."
                  rows={3}
                />
              </div>
              {editing && (
                <div className="flex gap-3 pt-2">
                  <button type="submit" className="bg-primary text-on-primary px-8 py-3 rounded-lg font-label text-sm font-bold hover:bg-primary-container transition-all">저장</button>
                  <button type="button" onClick={() => setEditing(false)} className="border border-outline-variant px-8 py-3 rounded-lg font-label text-sm text-text-secondary hover:bg-surface-container-low transition-all">취소</button>
                </div>
              )}
            </form>
          </div>

          {/* 비밀번호 변경 */}
          <div className="bg-surface-white border border-outline-variant rounded-xl p-8">
            <h3 className="font-headline text-xl font-bold text-deep-navy mb-6">비밀번호 변경</h3>
            {pwMsg && (
              <div className={`font-label text-sm p-3 rounded-lg mb-4 flex items-center gap-2 ${pwMsg.type === 'ok' ? 'bg-primary/10 text-primary' : 'bg-error-container text-on-error-container'}`}>
                <span className="material-symbols-outlined text-sm">{pwMsg.type === 'ok' ? 'check_circle' : 'error'}</span>
                {pwMsg.text}
              </div>
            )}
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {[
                { field: 'current', label: '현재 비밀번호', placeholder: '현재 비밀번호 입력' },
                { field: 'next', label: '새 비밀번호', placeholder: '6자 이상' },
                { field: 'confirm', label: '새 비밀번호 확인', placeholder: '새 비밀번호 다시 입력' },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className="block font-label text-sm text-primary mb-2">{label}</label>
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={pwForm[field]}
                    onChange={e => setPwForm(f => ({ ...f, [field]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary p-3 font-body text-sm outline-none transition-all"
                    required
                  />
                </div>
              ))}
              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="show-pw" checked={showPw} onChange={e => setShowPw(e.target.checked)} className="accent-primary" />
                <label htmlFor="show-pw" className="font-label text-xs text-text-secondary cursor-pointer">비밀번호 표시</label>
              </div>
              <button type="submit" className="bg-primary text-on-primary px-8 py-3 rounded-lg font-label text-sm font-bold hover:bg-primary-container transition-all">
                비밀번호 변경
              </button>
            </form>
          </div>

          {/* Recent apps */}
          {myApps.length > 0 && (
            <div className="bg-surface-white border border-outline-variant rounded-xl p-8">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-headline text-xl font-bold text-deep-navy">최근 등록한 앱</h3>
                <Link to="/my/apps" className="font-label text-sm text-primary hover:underline">전체 보기</Link>
              </div>
              <div className="space-y-3">
                {myApps.slice(0, 3).map(app => (
                  <Link key={app.id} to={`/apps/${app.id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-low transition-colors group">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                      <img src={app.thumbnail} alt={app.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-label text-sm font-bold text-deep-navy group-hover:text-primary transition-colors truncate">{app.title}</p>
                      <p className="font-label text-xs text-text-secondary">{app.category} · {app.type === 'file' ? 'HTML' : '외부링크'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-label text-xs text-text-secondary">{app.viewCount?.toLocaleString() ?? 0} 조회</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
