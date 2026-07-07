import { Link } from 'react-router-dom'
import { useData } from '../DataContext'

const BATCH_COLORS = [
  'bg-emerald-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-amber-500',
  'bg-teal-500',
  'bg-rose-500',
  'bg-cyan-500',
]

function batchColor(name) {
  if (!name) return BATCH_COLORS[0]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return BATCH_COLORS[hash % BATCH_COLORS.length]
}

export default function AppCard({ app, onAuthRequired }) {
  const { user, userLikes, userBookmarks, toggleLike, toggleBookmark } = useData()

  const liked = userLikes.has(app.id)
  const likeCount = app.likeCount ?? 0
  const bookmarked = userBookmarks.has(app.id)

  async function handleLike(e) {
    e.preventDefault()
    if (!user) { onAuthRequired?.(); return }
    await toggleLike(app.id)
  }

  async function handleBookmark(e) {
    e.preventDefault()
    if (!user) { onAuthRequired?.(); return }
    await toggleBookmark(app.id)
  }

  return (
    <article className="bg-surface-white border border-outline-variant rounded-xl overflow-hidden group hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <Link to={`/apps/${app.id}`}>
        <div className="aspect-video relative overflow-hidden bg-surface-container">
          <img
            src={app.thumbnail || 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80'}
            alt={app.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            {app.educationBatch && (
              <span className={`${batchColor(app.educationBatch)} text-white font-label text-xs font-bold px-3 py-1 rounded-full shadow-sm`}>
                {app.educationBatch}
              </span>
            )}
            <span className={`${app.type === 'file' ? 'bg-violet-600' : 'bg-sky-500'} text-white font-label text-xs font-bold px-3 py-1 rounded-full shadow-sm uppercase`}>
              {app.type === 'file' ? 'HTML' : 'EXTERNAL'}
            </span>
          </div>
        </div>
      </Link>
      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start gap-2">
          <Link to={`/apps/${app.id}`}>
            <h3 className="font-headline text-base font-semibold text-deep-navy leading-tight group-hover:text-primary transition-colors line-clamp-2">{app.title}</h3>
          </Link>
          <button onClick={handleLike} className={`flex items-center gap-1 flex-shrink-0 ${liked ? 'text-error' : 'text-text-secondary hover:text-error'} transition-colors`}>
            <span className={`material-symbols-outlined text-[20px] ${liked ? 'filled' : ''}`}>favorite</span>
            <span className="font-label text-xs">{likeCount}</span>
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-secondary-fixed flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[14px] text-deep-navy">person</span>
          </div>
          <span className="font-label text-xs text-text-secondary truncate">{app.author}</span>
          {app.department && <span className="font-label text-xs text-outline">· {app.department}</span>}
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex gap-1.5 flex-wrap">
            {app.tags?.slice(0, 2).map(tag => (
              <span key={tag} className="bg-surface-container px-2 py-0.5 rounded font-label text-xs text-on-surface-variant">{tag}</span>
            ))}
          </div>
          <button onClick={handleBookmark} className={`${bookmarked ? 'text-primary' : 'text-outline hover:text-primary'} transition-colors`}>
            <span className={`material-symbols-outlined text-[18px] ${bookmarked ? 'filled' : ''}`}>bookmark</span>
          </button>
        </div>
      </div>
    </article>
  )
}
