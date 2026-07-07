import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useData } from '../DataContext'
import { adminSendPasswordReset } from '../store'

export default function Login() {
  const { login, signup } = useData()
  const navigate = useNavigate()

  const [mode, setMode] = useState('login') // 'login' | 'signup' | 'reset'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  async function handleResetPassword(e) {
    e.preventDefault()
    if (!email.trim()) { setError('이메일을 입력해주세요.'); return }
    setLoading(true)
    setError('')
    try {
      await adminSendPasswordReset(email.trim())
      setResetSent(true)
    } catch {
      setError('이메일 발송에 실패했습니다. 가입된 이메일인지 확인해주세요.')
    }
    setLoading(false)
  }

  function switchMode(m) {
    setMode(m)
    setError('')
    setConfirmPassword('')
    setResetSent(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (mode === 'signup') {
      if (password !== confirmPassword) { setError('비밀번호 확인이 일치하지 않습니다.'); return }
      if (!name.trim()) { setError('이름을 입력해주세요.'); return }
      if (!department.trim()) { setError('소속팀을 입력해주세요.'); return }
    }

    setLoading(true)
    const fn = mode === 'signup' ? signup : login
    const extra = mode === 'signup' ? { name: name.trim(), department: department.trim() } : undefined
    const result = await fn(email, password, extra)
    setLoading(false)

    if (result.error) { setError(result.error); return }
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="font-headline text-3xl font-bold text-deep-navy">Vibe Coding</Link>
          <p className="font-body text-sm text-text-secondary mt-2">바이브코딩 쇼케이스 포털에 오신 것을 환영합니다</p>
        </div>

        <div className="bg-surface-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          {/* 탭 */}
          <div className="flex border-b border-outline-variant">
            {[['login', '로그인'], ['signup', '신규 가입']].map(([m, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`flex-1 py-4 font-label text-sm font-bold transition-colors border-b-2 -mb-px ${mode === m ? 'text-primary border-primary' : 'text-text-secondary border-transparent hover:text-on-surface'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 비밀번호 찾기 화면 */}
          {mode === 'reset' && (
            <div className="p-8 space-y-5">
              {resetSent ? (
                <div className="text-center space-y-4">
                  <span className="material-symbols-outlined text-5xl text-primary">mark_email_read</span>
                  <p className="font-headline text-lg font-bold text-deep-navy">이메일을 확인해주세요</p>
                  <p className="font-body text-sm text-text-secondary">{email}로 비밀번호 재설정 링크를 발송했습니다.</p>
                  <button type="button" onClick={() => switchMode('login')} className="font-label text-sm text-primary hover:underline">
                    로그인으로 돌아가기
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <p className="font-body text-sm text-text-secondary">가입하신 이메일을 입력하시면 비밀번호 재설정 링크를 보내드립니다.</p>
                  <div>
                    <label className="block font-label text-sm text-primary mb-2">이메일</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@hansol.com"
                      className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary p-3 font-body text-sm outline-none transition-all rounded-t-lg"
                      required
                    />
                  </div>
                  {error && (
                    <div className="bg-error-container text-on-error-container font-label text-sm p-3 rounded-lg flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">error</span>
                      {error}
                    </div>
                  )}
                  <button type="submit" disabled={loading}
                    className="w-full bg-primary text-on-primary font-label text-sm font-bold py-3 rounded-lg hover:bg-primary-container transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                    {loading && <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />}
                    재설정 이메일 발송
                  </button>
                  <button type="button" onClick={() => switchMode('login')} className="w-full font-label text-sm text-text-secondary hover:text-primary transition-colors">
                    ← 로그인으로 돌아가기
                  </button>
                </form>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className={`p-8 space-y-5 ${mode === 'reset' ? 'hidden' : ''}`}>
            {/* 이메일 */}
            <div>
              <label className="block font-label text-sm text-primary mb-2">이메일</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@hansol.com"
                className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary p-3 font-body text-sm outline-none transition-all rounded-t-lg"
                required
              />
            </div>

            {/* 신규 가입: 이름/소속팀 */}
            {mode === 'signup' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label text-sm text-primary mb-2">성함 *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="홍길동"
                    className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary p-3 font-body text-sm outline-none transition-all rounded-t-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-label text-sm text-primary mb-2">소속팀 *</label>
                  <input
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    placeholder="미래전략팀"
                    className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary p-3 font-body text-sm outline-none transition-all rounded-t-lg"
                    required
                  />
                </div>
              </div>
            )}

            {/* 비밀번호 */}
            <div>
              <label className="block font-label text-sm text-primary mb-2">
                {mode === 'signup' ? '새 비밀번호' : '비밀번호'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="6자 이상"
                  className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary p-3 font-body text-sm outline-none transition-all rounded-t-lg pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary"
                >
                  <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* 비밀번호 찾기 링크 — 로그인만 */}
            {mode === 'login' && (
              <div className="text-right -mt-2">
                <button type="button" onClick={() => switchMode('reset')} className="font-label text-xs text-text-secondary hover:text-primary transition-colors">
                  비밀번호를 잊으셨나요?
                </button>
              </div>
            )}

            {/* 비밀번호 확인 — 신규 가입만 */}
            {mode === 'signup' && (
              <div>
                <label className="block font-label text-sm text-primary mb-2">비밀번호 확인</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호를 다시 입력하세요"
                    className={`w-full bg-surface-container-low border-0 border-b-2 p-3 font-body text-sm outline-none transition-all rounded-t-lg pr-10 ${
                      confirmPassword && password !== confirmPassword ? 'border-error'
                      : confirmPassword && password === confirmPassword ? 'border-success'
                      : 'border-outline-variant focus:border-primary'
                    }`}
                    required
                  />
                  {confirmPassword && (
                    <span className={`material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] ${password === confirmPassword ? 'text-success' : 'text-error'}`}>
                      {password === confirmPassword ? 'check_circle' : 'cancel'}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* 에러 */}
            {error && (
              <div className="bg-error-container text-on-error-container font-label text-sm p-3 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-on-primary font-label text-sm font-bold py-3 rounded-lg hover:bg-primary-container transition-all mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />}
              {mode === 'signup' ? '가입 및 로그인' : '로그인'}
            </button>
          </form>

          <div className="px-8 pb-8 pt-0 space-y-2 text-center">
            <p className="font-body text-sm text-text-secondary">
              * 한솔 사내 이메일(<span className="font-label text-primary">@hansol.com</span>)만 사용 가능합니다
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="font-label text-sm text-text-secondary hover:text-primary transition-colors">
            ← 갤러리로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
}
