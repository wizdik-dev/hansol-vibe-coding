import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { addApp, getUser, validateFile, isDomainBlocked } from '../store'
import html2canvas from 'html2canvas'

const CATEGORIES = ['회계/재무', '영업/마케팅', '구매/조달', '생산/제조', '물류/유통', '인사/총무', '기획/전략', 'IT/시스템', '품질/안전', '고객서비스', '기타']

export default function Register() {
  const navigate = useNavigate()
  const user = getUser()
  const [step, setStep] = useState(1)
  const [type, setType] = useState('file')
  const [form, setForm] = useState({ title: '', description: '', category: 'Web Development', tags: '', externalUrl: '', embedMode: 'iframe', authorName: user?.name || '', authorDepartment: user?.department || '' })
  const [thumbnail, setThumbnail] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState('')
  const [sourceFile, setSourceFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [fileError, setFileError] = useState('')
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [capturingThumb, setCapturingThumb] = useState(false)
  const captureIframeRef = useRef(null)

  if (!user) { navigate('/login'); return null }

  async function captureUrlThumbnail(url) {
    if (!url) return
    setCapturingThumb(true)
    setThumbnailPreview('')
    try {
      const api = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`
      const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false`)
      if (!res.ok) throw new Error('API 오류')
      const json = await res.json()
      const imgUrl = json?.data?.screenshot?.url
      if (imgUrl) {
        setThumbnailPreview(imgUrl)
      }
    } catch (err) {
      console.warn('URL 썸네일 캡처 실패:', err)
    } finally {
      setCapturingThumb(false)
    }
  }

  async function captureHtmlThumbnail(htmlContent) {
    setCapturingThumb(true)
    setThumbnailPreview('')
    try {
      // 화면 밖 숨겨진 iframe 생성
      const iframe = document.createElement('iframe')
      iframe.style.cssText = 'position:fixed;left:-9999px;top:0;width:1280px;height:720px;border:none;pointer-events:none;'
      iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin')
      document.body.appendChild(iframe)

      await new Promise((resolve, reject) => {
        iframe.onload = resolve
        iframe.onerror = reject
        iframe.srcdoc = htmlContent
      })

      // JS(차트 등) 렌더링 대기
      await new Promise(r => setTimeout(r, 1800))

      const canvas = await html2canvas(iframe.contentDocument.body, {
        width: 1280,
        height: 720,
        scale: 0.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        foreignObjectRendering: false,
      })

      document.body.removeChild(iframe)
      setThumbnailPreview(canvas.toDataURL('image/jpeg', 0.85))
    } catch (err) {
      console.warn('썸네일 캡처 실패:', err)
      // 실패 시 기본 이미지 유지 (빈 상태)
    } finally {
      setCapturingThumb(false)
    }
  }

  // 드롭존 외부에서 브라우저 기본 파일 드롭(페이지 이동) 방지
  useEffect(() => {
    const prevent = e => {
      // 드롭존 div 내부 이벤트는 건드리지 않음 (이미 stopPropagation 처리됨)
      e.preventDefault()
    }
    document.addEventListener('dragover', prevent)
    document.addEventListener('drop', prevent)
    return () => {
      document.removeEventListener('dragover', prevent)
      document.removeEventListener('drop', prevent)
    }
  }, [])

  function update(field, value) { setForm(f => ({ ...f, [field]: value })) }

  function validateStep2() {
    const e = {}
    if (!form.title.trim()) e.title = '프로젝트 이름을 입력해주세요'
    if (!form.description.trim()) e.description = '설명을 입력해주세요'
    if (!form.authorName.trim()) e.authorName = '등록자 이름을 입력해주세요'
    if (!form.authorDepartment.trim()) e.authorDepartment = '소속팀을 입력해주세요'
    if (type === 'link') {
      if (!form.externalUrl.trim()) { e.externalUrl = '외부 URL을 입력해주세요' }
      else if (isDomainBlocked(form.externalUrl)) { e.externalUrl = '차단된 도메인입니다. 다른 URL을 사용해주세요.' }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleThumbnail(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setFileError('썸네일은 5MB 이하여야 합니다.'); return }
    setFileError('')
    setThumbnail(file)
    const reader = new FileReader()
    reader.onload = ev => setThumbnailPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  function handleSourceFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    processSourceFile(file)
  }

  function processSourceFile(file) {
    const result = validateFile(file)
    if (result.error) { setFileError(result.error); setSourceFile(null); return }
    setFileError('')
    setSourceFile(file)

    // HTML 파일이면 자동 썸네일 캡처
    if (file.name.endsWith('.html') || file.type === 'text/html') {
      const reader = new FileReader()
      reader.onload = ev => captureHtmlThumbnail(ev.target.result)
      reader.readAsText(file, 'utf-8')
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (capturingThumb) return // 캡처 완료 대기

    function doSubmit(fileContent) {
      const newApp = addApp({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        type,
        externalUrl: form.externalUrl.trim(),
        embedMode: form.embedMode,
        fileContent: fileContent || null,
        thumbnail: thumbnailPreview || `https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80`,
        author: form.authorName.trim(),
        department: form.authorDepartment.trim(),
        userId: user.id,
      })
      navigate(`/apps/${newApp.id}`)
    }

    if (type === 'file' && sourceFile) {
      const reader = new FileReader()
      reader.onload = ev => doSubmit(ev.target.result)
      reader.readAsText(sourceFile, 'utf-8')
    } else {
      doSubmit(null)
    }
  }

  return (
    <main className="max-w-[1280px] mx-auto px-4 md:px-12 py-16">
      <header className="mb-16">
        <h1 className="font-headline text-5xl font-extrabold text-deep-navy mb-4">앱 등록하기</h1>
        <p className="font-body text-lg text-text-secondary max-w-2xl">당신의 혁신적인 코딩 프로젝트를 Vibe Coding 쇼케이스에 공유하세요.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-outline-variant">
            {[['1', '유형 선택'], ['2', '정보 입력'], ['3', '최종 업로드']].map(([n, label]) => (
              <div key={n} className="flex items-center gap-2 md:gap-3">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-label text-sm font-bold ${parseInt(n) === step ? 'border-primary text-primary' : parseInt(n) < step ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant text-outline'}`}>
                  {parseInt(n) < step ? <span className="material-symbols-outlined text-sm">check</span> : n}
                </div>
                <span className={`font-headline text-sm md:text-base font-semibold hidden sm:block ${parseInt(n) === step ? 'text-deep-navy' : 'text-outline'}`}>{label}</span>
                {n !== '3' && <div className="h-px bg-outline-variant flex-1 mx-2 md:mx-6 hidden md:block w-12 lg:w-20" />}
              </div>
            ))}
          </div>

          <div className="bg-surface-white border border-outline-variant p-8 rounded-xl shadow-sm">
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="font-headline text-xl font-semibold text-deep-navy">프로젝트의 배포 방식을 선택해 주세요.</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { value: 'file', icon: 'html', title: 'HTML 업로드', desc: '정적 웹사이트를 ZIP 또는 단일 HTML로 업로드합니다. (.html .css .js .zip / 최대 50MB)' },
                    { value: 'link', icon: 'link', title: '외부 링크 연결', desc: 'GitHub Pages, Vercel, Railway 등 배포된 라이브 URL을 등록합니다.' },
                  ].map(opt => (
                    <label key={opt.value} className={`flex flex-col items-center p-8 border-2 cursor-pointer rounded-xl transition-all ${type === opt.value ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary bg-surface-container-low'}`}>
                      <input type="radio" name="type" value={opt.value} checked={type === opt.value} onChange={() => setType(opt.value)} className="sr-only" />
                      <span className="material-symbols-outlined text-4xl text-primary mb-3">{opt.icon}</span>
                      <span className="font-headline text-lg font-semibold mb-2">{opt.title}</span>
                      <span className="text-center font-label text-xs text-text-secondary">{opt.desc}</span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end pt-4">
                  <button onClick={() => setStep(2)} className="px-8 py-3 bg-primary text-on-primary font-label text-sm font-bold rounded-lg hover:bg-deep-navy transition-all flex items-center gap-2">
                    다음 단계 <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="font-headline text-xl font-semibold text-deep-navy">기본 정보를 상세히 입력해 주세요.</h3>
                <div>
                  <label className="block font-label text-sm text-primary mb-2">프로젝트 이름 *</label>
                  <input value={form.title} onChange={e => update('title', e.target.value)} className="w-full bg-surface-container-low border-0 border-b-2 border-outline focus:border-primary p-3 font-body text-sm outline-none transition-all" placeholder="예: 혁신적인 AI 이미지 분석 도구" />
                  {errors.title && <p className="font-label text-xs text-error mt-1">{errors.title}</p>}
                </div>
                <div>
                  <label className="block font-label text-sm text-primary mb-2">프로젝트 설명 *</label>
                  <textarea value={form.description} onChange={e => update('description', e.target.value)} className="w-full bg-surface-container-low border-0 border-b-2 border-outline focus:border-primary p-3 font-body text-sm outline-none transition-all" placeholder="프로젝트의 주요 기능과 사용된 기술을 설명해 주세요." rows={4} />
                  {errors.description && <p className="font-label text-xs text-error mt-1">{errors.description}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-label text-sm text-primary mb-2">등록자 이름 *</label>
                    <input value={form.authorName} onChange={e => update('authorName', e.target.value)} className="w-full bg-surface-container-low border-0 border-b-2 border-outline focus:border-primary p-3 font-body text-sm outline-none transition-all" placeholder="홍길동" />
                    {errors.authorName && <p className="font-label text-xs text-error mt-1">{errors.authorName}</p>}
                  </div>
                  <div>
                    <label className="block font-label text-sm text-primary mb-2">소속팀 *</label>
                    <input value={form.authorDepartment} onChange={e => update('authorDepartment', e.target.value)} className="w-full bg-surface-container-low border-0 border-b-2 border-outline focus:border-primary p-3 font-body text-sm outline-none transition-all" placeholder="고객서비스팀" />
                    {errors.authorDepartment && <p className="font-label text-xs text-error mt-1">{errors.authorDepartment}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-label text-sm text-primary mb-2">카테고리</label>
                    <select value={form.category} onChange={e => update('category', e.target.value)} className="w-full bg-surface-container-low border-0 border-b-2 border-outline focus:border-primary p-3 font-body text-sm outline-none">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-label text-sm text-primary mb-2">기술 태그 (쉼표로 구분)</label>
                    <input value={form.tags} onChange={e => update('tags', e.target.value)} className="w-full bg-surface-container-low border-0 border-b-2 border-outline focus:border-primary p-3 font-body text-sm outline-none transition-all" placeholder="React, Python, Tailwind" />
                  </div>
                </div>
                {type === 'link' && (
                  <div>
                    <label className="block font-label text-sm text-primary mb-2">외부 URL *</label>
                    <input value={form.externalUrl} onChange={e => update('externalUrl', e.target.value)} type="url" className="w-full bg-surface-container-low border-0 border-b-2 border-outline focus:border-primary p-3 font-body text-sm outline-none transition-all" placeholder="https://your-app.vercel.app" />
                    {errors.externalUrl && <p className="font-label text-xs text-error mt-1">{errors.externalUrl}</p>}
                    <div className="flex gap-4 mt-4">
                      {[['iframe', 'iframe 임베드'], ['newtab', '새 탭으로 열기']].map(([v, l]) => (
                        <label key={v} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="embedMode" value={v} checked={form.embedMode === v} onChange={() => update('embedMode', v)} className="text-primary" />
                          <span className="font-label text-xs">{l}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-between pt-4">
                  <button onClick={() => setStep(1)} className="px-8 py-3 border border-primary text-primary font-label text-sm font-bold rounded-lg hover:bg-surface-container-low transition-all">이전</button>
                  <button onClick={() => {
                    if (validateStep2()) {
                      setStep(3)
                      if (type === 'link' && form.externalUrl.trim() && !thumbnailPreview) {
                        captureUrlThumbnail(form.externalUrl.trim())
                      }
                    }
                  }} className="px-8 py-3 bg-primary text-on-primary font-label text-sm font-bold rounded-lg hover:bg-deep-navy transition-all">다음 단계</button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="font-headline text-xl font-semibold text-deep-navy">미디어 및 소스 파일을 업로드해 주세요.</h3>

                {/* File security notice */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3">
                  <span className="material-symbols-outlined text-primary text-[20px] flex-shrink-0 mt-0.5">security</span>
                  <div>
                    <p className="font-label text-xs font-bold text-primary mb-1">파일 보안 정책</p>
                    <p className="font-label text-xs text-text-secondary">허용 형식: .html .css .js .zip · 최대 크기: ZIP 50MB / 단일 파일 10MB · 업로드된 앱은 sandbox iframe으로 격리 실행됩니다.</p>
                  </div>
                </div>

                {fileError && (
                  <div className="bg-error-container text-on-error-container font-label text-sm p-3 rounded-lg flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">error</span>{fileError}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-label text-sm text-primary">썸네일 이미지 (16:9 추천, 최대 5MB)</label>
                    {thumbnailPreview && !capturingThumb && (
                      <button type="button" onClick={() => setThumbnailPreview('')} className="font-label text-xs text-error hover:underline flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">delete</span>초기화
                      </button>
                    )}
                  </div>
                  <label className={`w-full border-2 border-dashed bg-surface-container-low p-10 text-center transition-all cursor-pointer group block rounded-xl ${capturingThumb ? 'border-primary/50 pointer-events-none' : 'border-outline-variant hover:border-primary'}`}>
                    {capturingThumb ? (
                      <div className="flex flex-col items-center gap-3 py-2">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="font-label text-sm text-primary font-bold">
                          {type === 'link' ? '외부 사이트 스크린샷 캡처 중...' : 'HTML 첫 화면 캡처 중...'}
                        </p>
                        <p className="font-label text-xs text-text-secondary">
                          {type === 'link' ? '페이지를 불러오는 중입니다 (수초 소요)' : '차트/스크립트 렌더링을 기다리는 중입니다'}
                        </p>
                      </div>
                    ) : thumbnailPreview ? (
                      <div className="relative">
                        <img src={thumbnailPreview} alt="preview" className="max-h-48 mx-auto rounded-lg shadow-md" />
                        {type === 'file' && sourceFile?.name.endsWith('.html') && (
                          <div className="mt-3 flex items-center justify-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-success">auto_awesome</span>
                            <span className="font-label text-xs text-success">HTML에서 자동 캡처됨</span>
                          </div>
                        )}
                        {type === 'link' && (
                          <div className="mt-3 flex items-center justify-center gap-1.5">
                            <span className="material-symbols-outlined text-[14px] text-success">screenshot_monitor</span>
                            <span className="font-label text-xs text-success">외부 사이트 자동 캡처됨</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-5xl text-outline group-hover:text-primary mb-3 block">image</span>
                        <p className="font-body text-sm text-text-secondary">이미지를 드래그하거나 클릭하여 업로드하세요</p>
                        <p className="font-label text-xs text-outline-variant mt-1">JPG, PNG, GIF (최대 5MB)</p>
                        {type === 'file' && (
                          <p className="font-label text-xs text-primary/70 mt-2 flex items-center justify-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                            HTML 파일 업로드 시 자동으로 캡처됩니다
                          </p>
                        )}
                        {type === 'link' && (
                          <p className="font-label text-xs text-primary/70 mt-2 flex items-center justify-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">screenshot_monitor</span>
                            URL 입력 후 다음 단계로 이동하면 자동 캡처됩니다
                          </p>
                        )}
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleThumbnail} className="sr-only" />
                  </label>
                </div>

                {type === 'file' && (
                  <div>
                    <label className="block font-label text-sm text-primary mb-2">프로젝트 소스 파일 (HTML / ZIP)</label>
                    <div
                      className={`w-full border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
                        isDraggingOver
                          ? 'border-primary bg-primary/5 scale-[1.01]'
                          : 'border-outline-variant hover:border-primary bg-surface-container-low'
                      }`}
                      onClick={() => document.getElementById('sourceFileInput').click()}
                      onDragEnter={e => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(true) }}
                      onDragOver={e => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(true) }}
                      onDragLeave={e => { e.preventDefault(); e.stopPropagation(); setIsDraggingOver(false) }}
                      onDrop={e => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsDraggingOver(false)
                        const file = e.dataTransfer.files?.[0]
                        if (file) processSourceFile(file)
                      }}
                    >
                      {sourceFile ? (
                        <div className="flex flex-col items-center gap-2">
                          <span className="material-symbols-outlined text-4xl text-primary">check_circle</span>
                          <p className="font-label text-sm text-primary font-bold">{sourceFile.name}</p>
                          <p className="font-label text-xs text-text-secondary">{(sourceFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          <button type="button" onClick={e => { e.stopPropagation(); setSourceFile(null) }} className="font-label text-xs text-error hover:underline mt-1">파일 제거</button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 pointer-events-none">
                          <span className="material-symbols-outlined text-5xl text-outline mb-1 block">
                            {isDraggingOver ? 'download' : 'cloud_upload'}
                          </span>
                          <p className="font-body text-sm text-text-secondary">
                            {isDraggingOver ? '여기에 놓으세요' : '클릭하거나 파일을 드래그하여 업로드'}
                          </p>
                          <p className="font-label text-xs text-outline-variant mt-1">ZIP, HTML, JS · ZIP 최대 50MB / 단일 파일 최대 10MB</p>
                        </div>
                      )}
                      <input id="sourceFileInput" type="file" accept=".html,.zip,.js,.css" onChange={handleSourceFile} className="sr-only" />
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <button type="button" onClick={() => setStep(2)} className="px-8 py-3 border border-primary text-primary font-label text-sm font-bold rounded-lg hover:bg-surface-container-low transition-all">이전</button>
                  <button type="submit" className="px-8 py-3 bg-primary text-on-primary font-label text-sm font-bold rounded-lg hover:bg-deep-navy transition-all shadow-lg hover:scale-105">
                    최종 등록하기
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Sidebar preview */}
        <aside className="lg:col-span-4">
          <div className="sticky top-28 space-y-5">
            {/* Live preview card — mirrors how the app card looks in the gallery */}
            <div className="bg-surface-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 pt-5 pb-3 flex items-center gap-2 border-b border-outline-variant">
                <span className="material-symbols-outlined text-primary text-[18px]">visibility</span>
                <span className="font-headline text-base text-deep-navy font-semibold">갤러리 카드 미리보기</span>
              </div>

              {/* Thumbnail area — always shows an image */}
              <div className="aspect-video relative overflow-hidden bg-surface-container">
                <img
                  src={
                    thumbnailPreview ||
                    (form.category === 'AI / ML'
                      ? 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80'
                      : form.category === 'Data Science'
                      ? 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80'
                      : form.category === 'Educational'
                      ? 'https://images.unsplash.com/photo-1509966756634-9c23dd6e6815?w=600&q=80'
                      : 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80')
                  }
                  alt="미리보기"
                  className="w-full h-full object-cover transition-all duration-500"
                />
                {/* Type badge */}
                <div className="absolute top-3 right-3">
                  <span className={`${type === 'file' ? 'bg-deep-navy/80' : 'bg-primary/80'} backdrop-blur-md text-on-primary font-label text-xs px-3 py-1 rounded-full uppercase`}>
                    {type === 'file' ? 'HTML' : 'EXTERNAL'}
                  </span>
                </div>
                {/* Thumbnail upload hint overlay when no thumbnail */}
                {!thumbnailPreview && (
                  <div className="absolute inset-0 bg-black/20 flex items-end p-3">
                    <span className="font-label text-[10px] text-white/80 bg-black/40 px-2 py-1 rounded backdrop-blur-sm">
                      썸네일 업로드 시 여기에 표시됩니다
                    </span>
                  </div>
                )}
              </div>

              {/* Card body */}
              <div className="p-4 flex flex-col gap-2.5">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-headline text-base font-semibold text-deep-navy leading-tight line-clamp-2 flex-1">
                    {form.title || <span className="text-outline italic font-normal text-sm">프로젝트 이름을 입력하세요</span>}
                  </h3>
                  <div className="flex items-center gap-1 text-text-secondary flex-shrink-0">
                    <span className="material-symbols-outlined text-[18px]">favorite</span>
                    <span className="font-label text-xs">0</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-secondary-fixed flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[12px] text-deep-navy">person</span>
                  </div>
                  <span className="font-label text-xs text-text-secondary truncate">
                    {form.authorName || <span className="italic text-outline">이름</span>}
                    {form.authorDepartment && <span className="text-outline"> · {form.authorDepartment}</span>}
                  </span>
                </div>

                {form.tags ? (
                  <div className="flex gap-1.5 flex-wrap">
                    {form.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3).map(t => (
                      <span key={t} className="bg-surface-container px-2 py-0.5 rounded font-label text-xs text-on-surface-variant">{t}</span>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-1.5">
                    <span className="bg-surface-container px-2 py-0.5 rounded font-label text-xs text-outline italic">태그</span>
                  </div>
                )}
              </div>

              {/* Meta info */}
              <div className="px-4 pb-4 pt-1 border-t border-outline-variant/50 flex justify-between items-center">
                <span className="font-label text-xs text-text-secondary">{type === 'file' ? 'HTML 업로드' : '외부 링크'}</span>
                <span className={`font-label text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800`}>대기중</span>
              </div>
            </div>

            {/* Security info */}
            <div className="bg-surface-white border border-outline-variant p-5 rounded-xl">
              <h4 className="font-label text-xs font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">shield</span> 등록 후 안내
              </h4>
              <ul className="space-y-2">
                {['관리자 승인 후 갤러리에 공개됩니다', '앱은 sandbox iframe으로 안전하게 격리 실행됩니다', '부적절한 콘텐츠는 관리자에 의해 삭제될 수 있습니다'].map(txt => (
                  <li key={txt} className="flex items-start gap-2 font-label text-xs text-text-secondary">
                    <span className="material-symbols-outlined text-primary text-[12px] mt-0.5">check</span>{txt}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-deep-navy text-on-primary p-6 rounded-xl shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-10"><span className="material-symbols-outlined text-[100px]">help_center</span></div>
              <h4 className="font-headline text-lg mb-2 relative z-10">도움이 필요하신가요?</h4>
              <p className="font-body text-sm opacity-80 mb-4 relative z-10">등록 가이드라인을 확인하거나 관리자에게 문의해 보세요.</p>
              <a href="#" className="inline-flex items-center gap-1 font-label text-sm hover:underline relative z-10">가이드라인 보기 <span className="material-symbols-outlined text-sm">open_in_new</span></a>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
