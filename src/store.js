// localStorage-based store — Phase 1 + 2 + 3

const KEYS = {
  USER: 'vibe_user',
  ACCOUNTS: 'vibe_accounts',           // { email: { passwordHash, id, role } }
  APPS: 'vibe_apps',
  LIKES: 'vibe_likes',
  BOOKMARKS: 'vibe_bookmarks',
  COMMENTS: 'vibe_comments',
  NOTIFICATIONS: 'vibe_notifications',
  NOTICES: 'vibe_notices',
  REPORTS: 'vibe_reports',
  APP_VIEWS: 'vibe_app_views',
  USER_LIKES_LOG: 'vibe_user_likes',
  BLOCKED_DOMAINS: 'vibe_blocked_domains',
}

// ── Seed data ────────────────────────────────────────────────────────────────
const SEED_APPS = [
  { id: '1', userId: 'seed', title: '매출 실적 자동 집계 대시보드', description: '월별·분기별 매출 데이터를 자동으로 집계하고 시각화하는 영업팀 전용 대시보드입니다. 목표 대비 달성률, 제품군별 매출 추이를 한눈에 확인할 수 있습니다.', category: '영업/마케팅', tags: ['Dashboard', 'Charts', 'Excel연동'], type: 'file', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80', externalUrl: '', embedMode: 'iframe', author: '김한솔 연구원', department: '영업전략팀', viewCount: 12402, status: 'approved', createdAt: '2024-12-01T09:00:00Z' },
  { id: '2', userId: 'seed', title: '원가 분석 자동화 툴', description: '생산 원가 데이터를 입력하면 BOM 기준으로 제품별 원가를 자동 산출합니다. 표준원가 대비 실제원가 차이 분석 리포트를 즉시 생성합니다.', category: '회계/재무', tags: ['원가계산', '자동화', 'BOM'], type: 'file', thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80', externalUrl: '', embedMode: 'iframe', author: '이재무', department: '원가회계팀', viewCount: 8341, status: 'approved', createdAt: '2024-11-15T10:00:00Z' },
  { id: '3', userId: 'seed', title: '발주 관리 시스템', description: '구매 요청부터 발주, 입고 확인까지 전 과정을 관리하는 웹 앱입니다. 공급업체별 납기 이행률 및 단가 추이를 실시간으로 모니터링합니다.', category: '구매/조달', tags: ['발주', 'SCM', '공급업체'], type: 'link', thumbnail: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80', externalUrl: 'https://example.com', embedMode: 'newtab', author: '박구매', department: '구매팀', viewCount: 5892, status: 'approved', createdAt: '2024-11-20T11:00:00Z' },
  { id: '4', userId: 'seed', title: '생산 계획 스케줄러', description: '설비 가동률, 인력 현황, 수주 잔량을 기반으로 최적 생산 일정을 자동 편성합니다. 드래그앤드롭으로 일정을 쉽게 조정할 수 있습니다.', category: '생산/제조', tags: ['스케줄링', 'Gantt', '설비관리'], type: 'file', thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&q=80', externalUrl: '', embedMode: 'iframe', author: '최생산', department: '생산관리팀', viewCount: 3201, status: 'approved', createdAt: '2024-11-10T08:00:00Z' },
  { id: '5', userId: 'seed', title: '물류 배송 현황 트래커', description: '전국 물류 거점의 배송 현황을 지도 기반으로 실시간 추적합니다. 배송 지연 알림과 경로 최적화 제안 기능을 포함합니다.', category: '물류/유통', tags: ['실시간', '지도', '배송추적'], type: 'file', thumbnail: 'https://images.unsplash.com/photo-1570472789696-82a51338b0e9?w=600&q=80', externalUrl: '', embedMode: 'iframe', author: '정물류', department: '물류운영팀', viewCount: 9876, status: 'approved', createdAt: '2024-10-28T14:00:00Z' },
  { id: '6', userId: 'seed', title: '마케팅 캠페인 ROI 분석기', description: '채널별 광고비 투입 대비 매출 기여도를 자동 산출합니다. A/B 테스트 결과 비교 및 예산 재배분 시뮬레이션 기능 제공.', category: '영업/마케팅', tags: ['ROI', '광고분석', '시뮬레이션'], type: 'link', thumbnail: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&q=80', externalUrl: 'https://example.com', embedMode: 'newtab', author: '한마케팅', department: '마케팅팀', viewCount: 2154, status: 'approved', createdAt: '2024-10-15T09:00:00Z' },
  { id: '7', userId: 'seed', title: '인사 평가 관리 시스템', description: '목표관리(MBO) 기반 인사평가 프로세스를 디지털화했습니다. 평가자/피평가자 간 목표 설정, 중간 점검, 최종 평가를 웹에서 처리합니다.', category: '인사/총무', tags: ['MBO', '평가관리', 'HR'], type: 'file', thumbnail: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&q=80', externalUrl: '', embedMode: 'iframe', author: '오인사', department: '인사팀', viewCount: 7432, status: 'approved', createdAt: '2024-10-05T11:00:00Z' },
  { id: '8', userId: 'seed', title: '품질 불량 분석 대시보드', description: '라인별 불량률, 불량 유형, 발생 시간대를 분석하여 근본 원인을 추적합니다. 파레토 차트와 관리도를 활용해 품질 개선 포인트를 시각화합니다.', category: '품질/안전', tags: ['QC', '파레토', '불량분석'], type: 'file', thumbnail: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80', externalUrl: '', embedMode: 'iframe', author: '윤품질', department: '품질관리팀', viewCount: 4321, status: 'pending', createdAt: '2024-09-20T10:00:00Z' },
  { id: '9', userId: 'seed', title: '고객 VOC 분류 자동화', description: '고객센터로 접수된 VOC(고객의 소리)를 AI로 자동 분류하고 담당 부서에 배분합니다. 유형별 처리 현황 및 응답 속도 통계를 제공합니다.', category: '고객서비스', tags: ['VOC', 'AI분류', '고객관리'], type: 'link', thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80', externalUrl: 'https://example.com', embedMode: 'iframe', author: '서고객', department: '고객서비스팀', viewCount: 1843, status: 'pending', createdAt: '2024-12-10T10:00:00Z' },
]

const SEED_LIKES = { '1': 1248, '2': 128, '3': 84, '4': 215, '5': 342, '6': 56, '7': 189, '8': 97, '9': 23 }

const SEED_COMMENTS = {
  '1': [
    { id: 'c1', userId: 'u_lee', author: '이서연', initials: '이', content: '자원 순환이라는 무거운 주제를 아이들의 시선에서 아주 쉽고 재미있게 풀어내신 것 같아요!', createdAt: '2024-12-20T09:00:00Z', parentId: null, likes: 12 },
    { id: 'c2', userId: 'u_park', author: '박준호', initials: '박', content: '한솔제지 브랜드 아이덴티티가 잘 녹아있네요. 앱 실행 속도도 빠르고 조작감도 매우 부드럽습니다.', createdAt: '2024-12-20T06:00:00Z', parentId: null, likes: 8 },
  ],
}

const SEED_NOTICES = [
  { id: 'n1', title: '바이브코딩 포털 오픈!', content: '한솔 바이브코딩 쇼케이스 포털이 공식 오픈했습니다. 여러분의 프로젝트를 등록해 주세요.', createdAt: '2024-12-01T09:00:00Z', authorId: 'admin' },
  { id: 'n2', title: '12월 우수 앱 선정 안내', content: '이번 달 우수 앱 TOP 5를 선정합니다. 12월 31일까지 등록된 앱 중 좋아요와 조회수를 기준으로 선정됩니다.', createdAt: '2024-12-10T10:00:00Z', authorId: 'admin' },
]

const SEED_BLOCKED = ['malware.com', 'phishing.net', 'spam.org']

// ── Helpers ──────────────────────────────────────────────────────────────────
function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)) }

export function ensureSeeded() {
  if (!localStorage.getItem(KEYS.APPS)) save(KEYS.APPS, SEED_APPS)
  if (!localStorage.getItem(KEYS.LIKES)) save(KEYS.LIKES, SEED_LIKES)
  if (!localStorage.getItem(KEYS.COMMENTS)) save(KEYS.COMMENTS, SEED_COMMENTS)
  if (!localStorage.getItem(KEYS.BOOKMARKS)) save(KEYS.BOOKMARKS, {})
  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) save(KEYS.NOTIFICATIONS, {})
  if (!localStorage.getItem(KEYS.NOTICES)) save(KEYS.NOTICES, SEED_NOTICES)
  if (!localStorage.getItem(KEYS.REPORTS)) save(KEYS.REPORTS, [])
  if (!localStorage.getItem(KEYS.APP_VIEWS)) save(KEYS.APP_VIEWS, {})
  if (!localStorage.getItem(KEYS.BLOCKED_DOMAINS)) save(KEYS.BLOCKED_DOMAINS, SEED_BLOCKED)
}

// ── Auth ─────────────────────────────────────────────────────────────────────

// 단순 해시 (SHA-256 없이 frontend-only 용도로 충분한 수준)
function hashPassword(password) {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 32bit 정수
  }
  return hash.toString(36) + btoa(password).split('').reverse().join('')
}

function getAccounts() { return load(KEYS.ACCOUNTS, {}) }
function saveAccounts(accounts) { save(KEYS.ACCOUNTS, accounts) }

export function getUser() { return load(KEYS.USER, null) }

export function login(email, password) {
  const emailTrimmed = email.trim().toLowerCase()

  if (!emailTrimmed.endsWith('@hansol.com')) {
    return { error: '한솔 이메일(@hansol.com)만 허용됩니다.' }
  }
  if (password.length < 6) {
    return { error: '비밀번호는 6자 이상이어야 합니다.' }
  }

  const accounts = getAccounts()
  const passwordHash = hashPassword(password)
  const isAdmin = emailTrimmed.startsWith('admin@')
  const userId = `u_${emailTrimmed.replace(/[@.]/g, '_')}`

  if (accounts[emailTrimmed]) {
    // 기존 계정 — 비밀번호 검증
    if (accounts[emailTrimmed].passwordHash !== passwordHash) {
      return { error: '비밀번호가 올바르지 않습니다.' }
    }
  } else {
    // 신규 계정 — 비밀번호 저장 (최초 가입)
    accounts[emailTrimmed] = { passwordHash, id: userId, role: isAdmin ? 'admin' : 'user' }
    saveAccounts(accounts)
  }

  const user = {
    id: userId,
    email: emailTrimmed,
    name: emailTrimmed.split('@')[0],
    department: '',
    position: '',
    bio: '',
    avatar: '',
    role: accounts[emailTrimmed].role,
  }
  save(KEYS.USER, user)
  return { user }
}

export function logout() { localStorage.removeItem(KEYS.USER) }

export function updateUser(data) {
  const user = { ...getUser(), ...data }
  save(KEYS.USER, user)
  return user
}

export function changePassword(currentPassword, newPassword) {
  const user = getUser()
  if (!user) return { error: '로그인이 필요합니다.' }
  if (newPassword.length < 6) return { error: '새 비밀번호는 6자 이상이어야 합니다.' }

  const accounts = getAccounts()
  const account = accounts[user.email]
  if (!account) return { error: '계정 정보를 찾을 수 없습니다.' }
  if (account.passwordHash !== hashPassword(currentPassword)) {
    return { error: '현재 비밀번호가 올바르지 않습니다.' }
  }

  accounts[user.email] = { ...account, passwordHash: hashPassword(newPassword) }
  saveAccounts(accounts)
  return { ok: true }
}

export function isAdmin() { return getUser()?.role === 'admin' }

// ── Apps ─────────────────────────────────────────────────────────────────────
export function getApps({ includeAll = false } = {}) {
  ensureSeeded()
  const all = load(KEYS.APPS, [])
  if (includeAll) return all
  return all.filter(a => a.status !== 'rejected')
}
export function getApp(id) { return load(KEYS.APPS, []).find(a => a.id === id) ?? null }
export function addApp(app) {
  const apps = load(KEYS.APPS, [])
  const newApp = { ...app, id: `app_${Date.now()}`, viewCount: 0, status: 'pending', createdAt: new Date().toISOString() }
  save(KEYS.APPS, [newApp, ...apps])
  return newApp
}
export function updateAppStatus(id, status) {
  const apps = load(KEYS.APPS, [])
  const idx = apps.findIndex(a => a.id === id)
  if (idx !== -1) { apps[idx] = { ...apps[idx], status }; save(KEYS.APPS, apps) }
}
export function deleteAppById(id) {
  save(KEYS.APPS, load(KEYS.APPS, []).filter(a => a.id !== id))
}
export function incrementView(id) {
  const apps = load(KEYS.APPS, [])
  const idx = apps.findIndex(a => a.id === id)
  if (idx !== -1) { apps[idx] = { ...apps[idx], viewCount: (apps[idx].viewCount || 0) + 1 }; save(KEYS.APPS, apps) }
  // daily view log
  const today = new Date().toISOString().slice(0, 10)
  const views = load(KEYS.APP_VIEWS, {})
  if (!views[id]) views[id] = {}
  views[id][today] = (views[id][today] || 0) + 1
  save(KEYS.APP_VIEWS, views)
}
export function getAppViewHistory(id, days = 14) {
  const views = load(KEYS.APP_VIEWS, {})
  const appViews = views[id] || {}
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (days - 1 - i))
    const key = d.toISOString().slice(0, 10)
    return { date: key.slice(5), count: appViews[key] || 0 }
  })
}

// ── Likes ────────────────────────────────────────────────────────────────────
export function getLikeCount(appId) { ensureSeeded(); return (load(KEYS.LIKES, {}))[appId] ?? 0 }
export function getUserLikes() { return load(KEYS.USER_LIKES_LOG, []) }
export function toggleLike(appId) {
  const likes = load(KEYS.LIKES, {})
  const userLikes = getUserLikes()
  const liked = userLikes.includes(appId)
  const newCount = liked ? Math.max(0, (likes[appId] ?? 0) - 1) : (likes[appId] ?? 0) + 1
  save(KEYS.USER_LIKES_LOG, liked ? userLikes.filter(id => id !== appId) : [...userLikes, appId])
  save(KEYS.LIKES, { ...likes, [appId]: newCount })
  // 알림: 10, 50, 100, 500, 1000개 달성
  if (!liked) {
    const milestones = [10, 50, 100, 500, 1000]
    if (milestones.includes(newCount)) {
      const app = getApp(appId)
      if (app && app.userId !== 'seed') {
        pushNotification(app.userId, 'like', `"${app.title}" 앱이 좋아요 ${newCount}개를 달성했습니다! 🎉`, `/apps/${appId}`)
      }
    }
  }
  return !liked
}

// ── Bookmarks ────────────────────────────────────────────────────────────────
export function getUserBookmarks() { ensureSeeded(); return load(KEYS.BOOKMARKS, {}) }
export function toggleBookmark(appId) {
  const bm = getUserBookmarks()
  if (bm[appId]) { delete bm[appId] } else { bm[appId] = true }
  save(KEYS.BOOKMARKS, bm)
  return !!bm[appId]
}

// ── Comments ─────────────────────────────────────────────────────────────────
export function getComments(appId) { ensureSeeded(); return (load(KEYS.COMMENTS, {}))[appId] ?? [] }
export function addComment(appId, content, parentId = null) {
  const user = getUser()
  if (!user) return null
  const all = load(KEYS.COMMENTS, {})
  const comment = { id: `cm_${Date.now()}`, userId: user.id, author: user.name, initials: user.name.charAt(0).toUpperCase(), content, parentId, createdAt: new Date().toISOString(), likes: 0 }
  all[appId] = [comment, ...(all[appId] ?? [])]
  save(KEYS.COMMENTS, all)
  // 알림: 앱 작성자에게
  const app = getApp(appId)
  if (app && app.userId !== user.id && app.userId !== 'seed') {
    pushNotification(app.userId, 'comment', `"${app.title}" 앱에 ${user.name}님이 댓글을 남겼습니다: "${content.slice(0, 30)}..."`, `/apps/${appId}`)
  }
  return comment
}
export function deleteComment(appId, commentId) {
  const user = getUser()
  const all = load(KEYS.COMMENTS, {})
  all[appId] = (all[appId] ?? []).filter(c => !(c.id === commentId && c.userId === user?.id))
  save(KEYS.COMMENTS, all)
}

// ── Notifications ─────────────────────────────────────────────────────────────
function pushNotification(userId, type, message, link) {
  const all = load(KEYS.NOTIFICATIONS, {})
  if (!all[userId]) all[userId] = []
  all[userId] = [{ id: `nf_${Date.now()}`, type, message, link, isRead: false, createdAt: new Date().toISOString() }, ...all[userId]].slice(0, 50)
  save(KEYS.NOTIFICATIONS, all)
}
export function getNotifications() {
  const user = getUser()
  if (!user) return []
  const all = load(KEYS.NOTIFICATIONS, {})
  return all[user.id] ?? []
}
export function getUnreadCount() { return getNotifications().filter(n => !n.isRead).length }
export function markAllRead() {
  const user = getUser()
  if (!user) return
  const all = load(KEYS.NOTIFICATIONS, {})
  if (all[user.id]) { all[user.id] = all[user.id].map(n => ({ ...n, isRead: true })); save(KEYS.NOTIFICATIONS, all) }
}
export function markRead(id) {
  const user = getUser()
  if (!user) return
  const all = load(KEYS.NOTIFICATIONS, {})
  if (all[user.id]) { all[user.id] = all[user.id].map(n => n.id === id ? { ...n, isRead: true } : n); save(KEYS.NOTIFICATIONS, all) }
}

// ── Notices (공지사항) ────────────────────────────────────────────────────────
export function getNotices() { ensureSeeded(); return load(KEYS.NOTICES, []) }
export function addNotice(title, content) {
  const notices = getNotices()
  const n = { id: `nc_${Date.now()}`, title, content, createdAt: new Date().toISOString(), authorId: 'admin' }
  save(KEYS.NOTICES, [n, ...notices])
  // 전체 알림
  const allNfs = load(KEYS.NOTIFICATIONS, {})
  // 현재 앱 사용자들에게 (userId 모아서)
  const userIds = [...new Set(load(KEYS.APPS, []).map(a => a.userId).filter(id => id !== 'seed'))]
  userIds.forEach(uid => { if (!allNfs[uid]) allNfs[uid] = []; allNfs[uid] = [{ id: `nf_${Date.now()}_${uid}`, type: 'notice', message: `공지: ${title}`, link: '/admin/notices', isRead: false, createdAt: new Date().toISOString() }, ...allNfs[uid]] })
  save(KEYS.NOTIFICATIONS, allNfs)
  return n
}
export function deleteNotice(id) { save(KEYS.NOTICES, getNotices().filter(n => n.id !== id)) }

// ── Reports ────────────────────────────────────────────────────────────────────
export function getReports() { ensureSeeded(); return load(KEYS.REPORTS, []) }
export function addReport(targetId, targetType, reason) {
  const user = getUser()
  if (!user) return
  const reports = getReports()
  reports.push({ id: `rp_${Date.now()}`, reporterId: user.id, reporterName: user.name, targetId, targetType, reason, status: 'pending', createdAt: new Date().toISOString() })
  save(KEYS.REPORTS, reports)
}
export function resolveReport(id) {
  save(KEYS.REPORTS, getReports().map(r => r.id === id ? { ...r, status: 'resolved' } : r))
}

// ── Rankings ──────────────────────────────────────────────────────────────────
export function getRankings() {
  const apps = getApps().filter(a => a.status === 'approved')
  const likes = load(KEYS.LIKES, {})
  const now = Date.now()
  const sevenDays = 7 * 24 * 60 * 60 * 1000
  const scored = apps.map(a => {
    const likeCount = likes[a.id] ?? 0
    const score = likeCount * 2 + (a.viewCount || 0) * 0.5
    const isRecent = (now - new Date(a.createdAt).getTime()) < sevenDays
    return { ...a, likeCount, score, isRecent }
  })
  return {
    weekly: [...scored].filter(a => a.isRecent || a.score > 50).sort((a, b) => b.score - a.score).slice(0, 5),
    allTime: [...scored].sort((a, b) => b.score - a.score).slice(0, 10),
    trending: [...scored].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5),
    byDept: Object.entries(
      scored.reduce((acc, a) => { const d = a.department || '기타'; if (!acc[d]) acc[d] = []; acc[d].push(a); return acc }, {})
    ).map(([dept, list]) => ({ dept, best: list.sort((a, b) => b.score - a.score)[0], count: list.length })).sort((a, b) => b.count - a.count).slice(0, 6),
  }
}

// ── Stats (통계) ──────────────────────────────────────────────────────────────
export function getMyStats() {
  const user = getUser()
  if (!user) return null
  const myApps = load(KEYS.APPS, []).filter(a => a.userId === user.id)
  const likes = load(KEYS.LIKES, {})
  const views = load(KEYS.APP_VIEWS, {})
  // 앱별 일별 조회수 히스토리 (최근 14일)
  const days = 14
  const history = Array.from({ length: days }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (days - 1 - i))
    const key = d.toISOString().slice(0, 10)
    return {
      date: key.slice(5),
      views: myApps.reduce((sum, a) => sum + ((views[a.id] || {})[key] || 0), 0),
      likes: 0,
    }
  })
  return {
    totalApps: myApps.length,
    totalViews: myApps.reduce((s, a) => s + (a.viewCount || 0), 0),
    totalLikes: myApps.reduce((s, a) => s + (likes[a.id] || 0), 0),
    history,
    apps: myApps.map(a => ({ ...a, likeCount: likes[a.id] || 0 })),
  }
}
export function getAdminStats() {
  const all = load(KEYS.APPS, [])
  const likes = load(KEYS.LIKES, {})
  const catMap = all.reduce((acc, a) => { acc[a.category] = (acc[a.category] || 0) + 1; return acc }, {})
  const tagMap = all.flatMap(a => a.tags || []).reduce((acc, t) => { acc[t] = (acc[t] || 0) + 1; return acc }, {})
  const deptMap = all.reduce((acc, a) => { const d = a.department || '기타'; acc[d] = (acc[d] || 0) + 1; return acc }, {})
  const days = 30
  const views = load(KEYS.APP_VIEWS, {})
  const monthlyTrend = Array.from({ length: days }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (days - 1 - i))
    const key = d.toISOString().slice(0, 10)
    return { date: key.slice(5), views: all.reduce((s, a) => s + ((views[a.id] || {})[key] || 0), 0) }
  })
  return {
    totalApps: all.length,
    approvedApps: all.filter(a => a.status === 'approved').length,
    pendingApps: all.filter(a => a.status === 'pending').length,
    totalViews: all.reduce((s, a) => s + (a.viewCount || 0), 0),
    totalLikes: Object.values(likes).reduce((s, v) => s + v, 0),
    pendingReports: getReports().filter(r => r.status === 'pending').length,
    categories: Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    tags: Object.entries(tagMap).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value })),
    departments: Object.entries(deptMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    monthlyTrend,
  }
}

// ── Blocked Domains ───────────────────────────────────────────────────────────
export function getBlockedDomains() { ensureSeeded(); return load(KEYS.BLOCKED_DOMAINS, []) }
export function addBlockedDomain(domain) { const list = getBlockedDomains(); if (!list.includes(domain)) { list.push(domain); save(KEYS.BLOCKED_DOMAINS, list) } }
export function removeBlockedDomain(domain) { save(KEYS.BLOCKED_DOMAINS, getBlockedDomains().filter(d => d !== domain)) }
export function isDomainBlocked(url) {
  try { const host = new URL(url).hostname.replace('www.', ''); return getBlockedDomains().some(d => host.includes(d)) } catch { return false }
}

// ── File Validation ────────────────────────────────────────────────────────────
const ALLOWED_EXTS = ['.html', '.css', '.js', '.zip']
const ALLOWED_MIME = ['text/html', 'text/css', 'application/javascript', 'text/javascript', 'application/zip', 'application/x-zip-compressed']
const MAX_SIZE = { single: 10 * 1024 * 1024, zip: 50 * 1024 * 1024 }
export function validateFile(file) {
  const ext = '.' + file.name.split('.').pop().toLowerCase()
  if (!ALLOWED_EXTS.includes(ext)) return { error: `허용되지 않는 확장자입니다. 허용: ${ALLOWED_EXTS.join(', ')}` }
  const maxSize = ext === '.zip' ? MAX_SIZE.zip : MAX_SIZE.single
  if (file.size > maxSize) return { error: `파일 크기 초과: ${ext === '.zip' ? '50MB' : '10MB'} 이하여야 합니다.` }
  return { ok: true }
}
