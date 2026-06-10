import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../store'

// 이메일 기준으로 기존 계정인지 판단
function isExistingAccount(email) {
  try {
    const accounts = JSON.parse(localStorage.getItem('vibe_accounts') || '{}')
    return !!accounts[email.trim().toLowerCase()]
  } catch {
    return false
  }
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isReturning, setIsReturning] = useState(null) // null=미확인, true=기존, false=신규
  const navigate = useNavigate()

  // 이메일이 @hansol.com 이고 6자 이상일 때 계정 존재 여부 확인
  useEffect(() => {
    const trimmed = email.trim().toLowerCase()
    if (trimmed.endsWith('@hansol.com') && trimmed.length > 11) {
      setIsReturning(isExistingAccount(trimmed))
    } else {
      setIsReturning(null)
    }
    setError('')
  }, [email])

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    // 신규 계정이면 비밀번호 확인 검사
    if (isReturning === false && password !== confirmPassword) {
      setError('비밀번호 확인이 일치하지 않습니다.')
      return
    }

    const result = login(email, password)
    if (result.error) { setError(result.error); return }
    navigate('/')
  }

  const isNewAccount = isReturning === false
  const isKnownAccount = isReturning === true

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="font-headline text-3xl font-bold text-deep-navy">Vibe Coding</Link>
          <p className="font-body text-sm text-text-secondary mt-2">바이브코딩 쇼케이스 포털에 오신 것을 환영합니다</p>
        </div>

        <div className="bg-surface-white border border-outline-variant rounded-xl p-8 shadow-sm">
          {/* 헤더 — 상태에 따라 변경 */}
          <div className="mb-6">
            <h2 className="font-headline text-2xl font-bold text-deep-navy">
              {isNewAccount ? '회원 가입' : isKnownAccount ? '로그인' : '시작하기'}
            </h2>
            {isNewAccount && (
              <p className="font-body text-xs text-success mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">person_add</span>
                처음 사용하시는 계정입니다. 비밀번호를 설정하세요.
              </p>
            )}
            {isKnownAccount && (
              <p className="font-body text-xs text-text-secondary mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">verified_user</span>
                등록된 계정입니다. 비밀번호를 입력하세요.
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 이메일 */}
            <div>
              <label className="block font-label text-sm text-primary mb-2">이메일</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@hansol.com"
                  className="w-full bg-surface-container-low border-0 border-b-2 border-outline-variant focus:border-primary p-3 font-body text-sm outline-none transition-all rounded-t-lg pr-10"
                  required
                />
                {isReturning !== null && (
                  <span className={`material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] ${isKnownAccount ? 'text-success' : 'text-warning'}`}>
                    {isKnownAccount ? 'check_circle' : 'info'}
                  </span>
                )}
              </div>
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block font-label text-sm text-primary mb-2">
                {isNewAccount ? '새 비밀번호' : '비밀번호'}
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
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* 비밀번호 확인 — 신규 계정일 때만 표시 */}
            {isNewAccount && (
              <div>
                <label className="block font-label text-sm text-primary mb-2">비밀번호 확인</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호를 다시 입력하세요"
                    className={`w-full bg-surface-container-low border-0 border-b-2 p-3 font-body text-sm outline-none transition-all rounded-t-lg pr-10 ${
                      confirmPassword && password !== confirmPassword
                        ? 'border-error'
                        : confirmPassword && password === confirmPassword
                        ? 'border-success'
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

            {/* 에러 메시지 */}
            {error && (
              <div className="bg-error-container text-on-error-container font-label text-sm p-3 rounded-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary text-on-primary font-label text-sm font-bold py-3 rounded-lg hover:bg-primary-container transition-all mt-2"
            >
              {isNewAccount ? '가입 및 로그인' : '로그인'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-outline-variant space-y-2">
            <p className="font-body text-sm text-text-secondary text-center">
              * 한솔 사내 이메일(<span className="font-label text-primary">@hansol.com</span>)만 사용 가능합니다
            </p>
            <p className="font-label text-xs text-outline text-center">
              최초 로그인 시 입력한 비밀번호로 계정이 생성됩니다
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
