import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useData } from '../DataContext'

function timeAgo(val) {
  if (!val) return ''
  const date = val?.toDate ? val.toDate() : new Date(val)
  const diff = (Date.now() - date.getTime()) / 1000
  if (isNaN(diff)) return ''
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}

export default function AppDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, apps, userLikes, userBookmarks, toggleLike, toggleBookmark,
    getComments, addComment, deleteComment, addReport, incrementView } = useData()
  const [app, setApp] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [reportModal, setReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')

  const liked = userLikes.has(id)
  const likeCount = app?.likeCount ?? 0
  const bookmarked = userBookmarks.has(id)

  useEffect(() => {
    if (apps.length > 0) {
      const found = apps.find(a => a.id === id)
      if (!found) { navigate('/'); return }
      setApp(found)
    }
  }, [id, apps])

  useEffect(() => {
    let cancelled = false
    getComments(id).then(setComments)
    // 짧은 지연 후 호출 — StrictMode 이중 실행 시 두 번째 호출 전 cleanup으로 취소
    const timer = setTimeout(() => {
      if (!cancelled) incrementView(id)
    }, 300)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [id])

  if (!app) return null

  const relatedApps = apps.filter(a => a.id !== id && a.status !== 'rejected' && a.tags?.some(t => app.tags?.includes(t))).slice(0, 3)

  async function handleLike() {
    if (!user) { navigate('/login'); return }
    await toggleLike(id)
  }

  async function handleBookmark() {
    if (!user) { navigate('/login'); return }
    await toggleBookmark(id)
  }

  async function handleComment(e) {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    if (!commentText.trim()) return
    const c = await addComment(id, commentText)
    if (c) { setComments(await getComments(id)); setCommentText('') }
  }

  async function handleReply(e) {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    if (!replyText.trim()) return
    await addComment(id, replyText, replyTo)
    setComments(await getComments(id))
    setReplyTo(null)
    setReplyText('')
  }

  async function handleDelete(commentId) {
    await deleteComment(id, commentId)
    setComments(await getComments(id))
  }

  function handleRun() {
    if (app.type === 'link') {
      window.open(app.externalUrl, '_blank', 'noopener,noreferrer')
    } else if (app.fileUrl) {
      window.open(app.fileUrl, '_blank', 'noopener,noreferrer')
    } else if (app.fileContent) {
      // 기존 Firestore 저장 방식 하위 호환
      const blob = new Blob([app.fileContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const win = window.open(url, '_blank', 'noopener')
      if (win) setTimeout(() => URL.revokeObjectURL(url), 10000)
    }
  }

  async function handleReport(e) {
    e.preventDefault()
    if (!reportReason.trim()) return
    await addReport(id, 'app', reportReason)
    setReportModal(false)
    setReportReason('')
    alert('신고가 접수되었습니다. 관리자가 검토합니다.')
  }

  const topComments = comments.filter(c => !c.parentId)
  const replies = (parentId) => comments.filter(c => c.parentId === parentId)

  return (
    <>
      {/* Report modal */}
      {reportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setReportModal(false)}>
          <div className="bg-surface-white rounded-xl p-8 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-headline text-xl font-bold text-deep-navy mb-2">앱 신고</h3>
            <p className="font-body text-sm text-text-secondary mb-5">신고 사유를 입력해주세요. 관리자가 검토 후 처리합니다.</p>
            <form onSubmit={handleReport} className="space-y-4">
              <textarea value={reportReason} onChange={e => setReportReason(e.target.value)} className="w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary p-3 font-body text-sm outline-none resize-none rounded-t-lg" placeholder="신고 사유를 입력하세요" rows={3} required />
              <div className="flex gap-3">
                <button type="button" onClick={() => setReportModal(false)} className="flex-1 border border-outline-variant py-2.5 rounded-lg font-label text-sm text-text-secondary hover:bg-surface-container-low">취소</button>
                <button type="submit" className="flex-1 bg-error text-on-error py-2.5 rounded-lg font-label text-sm font-bold hover:bg-error/80">신고 제출</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="max-w-[1280px] mx-auto px-4 md:px-12 py-8">
        {/* Breadcrumb */}
        <nav className="flex gap-2 font-label text-xs text-text-secondary mb-8">
          <Link to="/" className="hover:text-primary">홈</Link>
          <span>/</span>
          <Link to="/" className="hover:text-primary">갤러리</Link>
          <span>/</span>
          <span className="text-primary font-bold">{app.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main */}
          <section className="lg:col-span-8 flex flex-col gap-5">
            {/* Preview */}
            <div className="relative w-full aspect-video bg-surface-white rounded-xl overflow-hidden border border-outline-variant shadow-sm group">
              <img
                src={app.thumbnail || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80'}
                alt={app.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleRun}
                  className="bg-primary text-on-primary px-8 py-3 rounded-full font-headline text-lg flex items-center gap-3 shadow-lg hover:bg-primary-container transition-all"
                >
                  <span className="material-symbols-outlined filled">play_arrow</span>
                  앱 실행하기
                </button>
              </div>
            </div>

            {/* Interaction bar */}
            <div className="flex justify-between items-center bg-surface-white p-4 rounded-xl border border-outline-variant">
              <div className="flex gap-2">
                <button onClick={handleLike} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${liked ? 'text-error bg-error-container/30' : 'text-text-secondary hover:bg-surface-container-low hover:text-primary'}`}>
                  <span className={`material-symbols-outlined ${liked ? 'filled' : ''}`}>favorite</span>
                  <span className="font-label text-sm">{likeCount.toLocaleString()}</span>
                </button>
                <button onClick={handleBookmark} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${bookmarked ? 'text-primary bg-primary/10' : 'text-text-secondary hover:bg-surface-container-low hover:text-primary'}`}>
                  <span className={`material-symbols-outlined ${bookmarked ? 'filled' : ''}`}>bookmark</span>
                  <span className="font-label text-sm">저장</span>
                </button>
                {user && (
                  <button onClick={() => setReportModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-text-secondary hover:bg-error/10 hover:text-error">
                    <span className="material-symbols-outlined">flag</span>
                    <span className="font-label text-sm">신고</span>
                  </button>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {app.tags?.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-surface-container text-primary font-label text-xs rounded">{tag}</span>
                ))}
              </div>
            </div>

            {/* Description */}
            <article className="bg-surface-white p-8 rounded-xl border border-outline-variant space-y-6">
              <header>
                <h1 className="font-headline text-4xl font-extrabold text-deep-navy mb-4">{app.title}</h1>
                <div className="flex items-center gap-4 border-b border-outline-variant pb-5">
                  <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center font-bold text-deep-navy text-lg">
                    {app.author?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-label text-sm text-text-primary font-bold">{app.author}</p>
                    <p className="font-label text-xs text-text-secondary">{app.department} · {timeAgo(app.createdAt)}</p>
                  </div>
                </div>
              </header>
              <div className="font-body text-base text-on-surface-variant leading-relaxed whitespace-pre-line">
                {app.description}
              </div>
              <div className="flex flex-wrap gap-3 pt-4 border-t border-outline-variant">
                <div className="flex items-center gap-2">
                  <span className="font-label text-xs text-outline uppercase">카테고리</span>
                  <span className="font-label text-xs text-primary font-bold">{app.category}</span>
                </div>
                <div className="w-px bg-outline-variant" />
                <div className="flex items-center gap-2">
                  <span className="font-label text-xs text-outline uppercase">유형</span>
                  <span className="font-label text-xs text-primary font-bold">{app.type === 'file' ? 'HTML 파일' : '외부 링크'}</span>
                </div>
              </div>
            </article>

            {/* Comments */}
            <section className="bg-surface-white p-8 rounded-xl border border-outline-variant">
              <h3 className="font-headline text-xl font-bold text-deep-navy mb-6">
                피드백 및 댓글 <span className="text-primary font-normal">({topComments.length})</span>
              </h3>
              {/* Comment input */}
              <form onSubmit={handleComment} className="mb-8">
                <textarea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  className="w-full min-h-[100px] p-4 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary rounded-t-lg outline-none resize-none font-body text-sm transition-colors"
                  placeholder={user ? "프로젝트에 대한 소중한 피드백을 남겨주세요." : "댓글을 남기려면 로그인하세요."}
                  readOnly={!user}
                />
                <div className="flex justify-end p-2 bg-surface-container-low rounded-b-lg border-t border-outline-variant/30">
                  <button type="submit" className="bg-deep-navy text-on-primary px-5 py-2 rounded font-label text-sm hover:bg-primary transition-colors">
                    {user ? '댓글 등록' : '로그인'}
                  </button>
                </div>
              </form>

              {/* Comment list */}
              <div className="space-y-6">
                {topComments.length === 0 && (
                  <p className="text-center font-body text-sm text-outline py-8">첫 댓글을 남겨보세요!</p>
                )}
                {topComments.map(comment => (
                  <div key={comment.id} className="border-b border-outline-variant pb-6 last:border-0">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-surface-container-high flex-shrink-0 flex items-center justify-center font-bold text-primary">
                        {comment.initials}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-label text-sm text-text-primary font-bold">{comment.author}</span>
                          <span className="font-label text-xs text-text-secondary">{timeAgo(comment.createdAt)}</span>
                          {user?.id === comment.userId && (
                            <button onClick={() => handleDelete(comment.id)} className="font-label text-xs text-error hover:underline ml-auto">삭제</button>
                          )}
                        </div>
                        <p className="font-body text-sm text-on-surface-variant">{comment.content}</p>
                        <button onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)} className="font-label text-xs text-primary flex items-center gap-1 hover:underline">
                          <span className="material-symbols-outlined text-[14px]">reply</span> 답글 달기
                        </button>

                        {/* Replies */}
                        {replies(comment.id).map(reply => (
                          <div key={reply.id} className="ml-6 mt-3 flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-surface-container flex-shrink-0 flex items-center justify-center font-bold text-secondary text-sm">
                              {reply.initials}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-label text-xs font-bold">{reply.author}</span>
                                <span className="font-label text-xs text-text-secondary">{timeAgo(reply.createdAt)}</span>
                                {user?.id === reply.userId && (
                                  <button onClick={() => handleDelete(reply.id)} className="font-label text-xs text-error hover:underline ml-auto">삭제</button>
                                )}
                              </div>
                              <p className="font-body text-sm text-on-surface-variant mt-1">{reply.content}</p>
                            </div>
                          </div>
                        ))}

                        {/* Reply input */}
                        {replyTo === comment.id && (
                          <form onSubmit={handleReply} className="ml-6 mt-3 flex gap-2">
                            <input
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              placeholder="답글 입력..."
                              className="flex-1 bg-surface-container-low border-b-2 border-outline-variant focus:border-primary p-2 font-body text-sm outline-none"
                            />
                            <button type="submit" className="bg-primary text-on-primary px-4 py-2 rounded font-label text-xs hover:bg-primary-container transition-colors">등록</button>
                            <button type="button" onClick={() => setReplyTo(null)} className="text-outline px-2 py-2 font-label text-xs hover:text-on-surface">취소</button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </section>

          {/* Sidebar */}
          <aside className="lg:col-span-4 flex flex-col gap-5">
            <div className="bg-surface-white p-6 rounded-xl border border-outline-variant shadow-sm">
              <h4 className="font-label text-xs text-primary uppercase tracking-widest mb-5">Project Metadata</h4>
              <div className="space-y-4">
                <div>
                  <span className="font-label text-xs text-text-secondary block mb-1">Category</span>
                  <span className="font-body text-sm text-deep-navy font-bold">{app.category}</span>
                </div>
                <div>
                  <span className="font-label text-xs text-text-secondary block mb-1">Tech Stack</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {app.tags?.map(t => (
                      <span key={t} className="font-label text-xs px-2 py-0.5 bg-surface-container-low text-primary border border-outline-variant rounded">{t}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-label text-xs text-text-secondary block mb-1">작성자</span>
                  <span className="font-body text-sm text-deep-navy">{app.author}</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-outline-variant">
                <button
                  onClick={handleRun}
                  className="w-full bg-primary text-on-primary py-3.5 rounded-lg font-headline text-base hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
                >
                  <span className="material-symbols-outlined filled">rocket_launch</span>
                  앱 실행하기
                </button>
              </div>
              <div className="mt-5">
                <div className="p-3 bg-surface-container-low rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-sm">visibility</span>
                    <span className="font-label text-xs text-text-secondary">조회수</span>
                  </div>
                  <span className="font-label text-sm font-bold text-deep-navy">{(app.viewCount || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Attachments */}
            {app.attachments?.length > 0 && (
              <div className="bg-surface-white p-6 rounded-xl border border-outline-variant">
                <h4 className="font-headline text-base font-bold text-deep-navy mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">attach_file</span>
                  첨부파일
                </h4>
                <div className="space-y-2">
                  {app.attachments.map((att, i) => (
                    <a key={i} href={att.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-outline-variant hover:border-primary hover:bg-primary/5 transition-all group"
                    >
                      <span className="material-symbols-outlined text-primary text-[22px] flex-shrink-0">
                        {att.name?.match(/\.(xlsx?|csv)$/i) ? 'table_chart' : att.name?.match(/\.pdf$/i) ? 'picture_as_pdf' : att.name?.match(/\.pptx?$/i) ? 'slideshow' : 'description'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-label text-xs font-bold text-deep-navy group-hover:text-primary transition-colors truncate">{att.name}</p>
                        <p className="font-label text-xs text-text-secondary">{att.size ? `${(att.size / 1024 / 1024).toFixed(2)} MB` : ''}</p>
                      </div>
                      <span className="material-symbols-outlined text-text-secondary group-hover:text-primary text-[18px] flex-shrink-0">download</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Related */}
            {relatedApps.length > 0 && (
              <div className="bg-surface-white p-6 rounded-xl border border-outline-variant">
                <h4 className="font-headline text-lg font-bold text-deep-navy mb-5">관련된 앱</h4>
                <div className="space-y-4">
                  {relatedApps.map(ra => (
                    <Link key={ra.id} to={`/apps/${ra.id}`} className="group flex gap-3 items-center">
                      <div className="w-14 h-14 rounded-lg bg-surface-container-high overflow-hidden flex-shrink-0">
                        <img src={ra.thumbnail} alt={ra.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <p className="font-label text-sm text-deep-navy font-bold group-hover:text-primary transition-colors">{ra.title}</p>
                        <p className="font-label text-xs text-text-secondary">{ra.author}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </>
  )
}
