import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, where, increment, arrayUnion, arrayRemove,
  serverTimestamp, writeBatch, Timestamp, runTransaction,
} from 'firebase/firestore'
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider,
  fetchSignInMethodsForEmail, sendPasswordResetEmail,
} from 'firebase/auth'
import { auth, db, storage } from './firebase'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll } from 'firebase/storage'

// ── Seed data ────────────────────────────────────────────────────────────────
const SEED_APPS = [
  { id: '1', userId: 'seed', title: '매출 실적 자동 집계 대시보드', description: '월별·분기별 매출 데이터를 자동으로 집계하고 시각화하는 영업팀 전용 대시보드입니다. 목표 대비 달성률, 제품군별 매출 추이를 한눈에 확인할 수 있습니다.', category: '영업/마케팅', tags: ['Dashboard', 'Charts', 'Excel연동'], type: 'file', thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80', externalUrl: '', author: '김한솔 연구원', department: '영업전략팀', viewCount: 12402, likeCount: 1248, status: 'approved', createdAt: '2024-12-01T09:00:00Z' },
  { id: '2', userId: 'seed', title: '원가 분석 자동화 툴', description: '생산 원가 데이터를 입력하면 BOM 기준으로 제품별 원가를 자동 산출합니다. 표준원가 대비 실제원가 차이 분석 리포트를 즉시 생성합니다.', category: '회계/재무', tags: ['원가계산', '자동화', 'BOM'], type: 'file', thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80', externalUrl: '', author: '이재무', department: '원가회계팀', viewCount: 8341, likeCount: 128, status: 'approved', createdAt: '2024-11-15T10:00:00Z' },
  { id: '3', userId: 'seed', title: '발주 관리 시스템', description: '구매 요청부터 발주, 입고 확인까지 전 과정을 관리하는 웹 앱입니다. 공급업체별 납기 이행률 및 단가 추이를 실시간으로 모니터링합니다.', category: '구매/조달', tags: ['발주', 'SCM', '공급업체'], type: 'link', thumbnail: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80', externalUrl: 'https://example.com', author: '박구매', department: '구매팀', viewCount: 5892, likeCount: 84, status: 'approved', createdAt: '2024-11-20T11:00:00Z' },
  { id: '4', userId: 'seed', title: '생산 계획 스케줄러', description: '설비 가동률, 인력 현황, 수주 잔량을 기반으로 최적 생산 일정을 자동 편성합니다. 드래그앤드롭으로 일정을 쉽게 조정할 수 있습니다.', category: '생산/제조', tags: ['스케줄링', 'Gantt', '설비관리'], type: 'file', thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&q=80', externalUrl: '', author: '최생산', department: '생산관리팀', viewCount: 3201, likeCount: 215, status: 'approved', createdAt: '2024-11-10T08:00:00Z' },
  { id: '5', userId: 'seed', title: '물류 배송 현황 트래커', description: '전국 물류 거점의 배송 현황을 지도 기반으로 실시간 추적합니다. 배송 지연 알림과 경로 최적화 제안 기능을 포함합니다.', category: '물류/유통', tags: ['실시간', '지도', '배송추적'], type: 'file', thumbnail: 'https://images.unsplash.com/photo-1570472789696-82a51338b0e9?w=600&q=80', externalUrl: '', author: '정물류', department: '물류운영팀', viewCount: 9876, likeCount: 342, status: 'approved', createdAt: '2024-10-28T14:00:00Z' },
  { id: '6', userId: 'seed', title: '마케팅 캠페인 ROI 분석기', description: '채널별 광고비 투입 대비 매출 기여도를 자동 산출합니다. A/B 테스트 결과 비교 및 예산 재배분 시뮬레이션 기능 제공.', category: '영업/마케팅', tags: ['ROI', '광고분석', '시뮬레이션'], type: 'link', thumbnail: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&q=80', externalUrl: 'https://example.com', author: '한마케팅', department: '마케팅팀', viewCount: 2154, likeCount: 56, status: 'approved', createdAt: '2024-10-15T09:00:00Z' },
  { id: '7', userId: 'seed', title: '인사 평가 관리 시스템', description: '목표관리(MBO) 기반 인사평가 프로세스를 디지털화했습니다. 평가자/피평가자 간 목표 설정, 중간 점검, 최종 평가를 웹에서 처리합니다.', category: '인사/총무', tags: ['MBO', '평가관리', 'HR'], type: 'file', thumbnail: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&q=80', externalUrl: '', author: '오인사', department: '인사팀', viewCount: 7432, likeCount: 189, status: 'approved', createdAt: '2024-10-05T11:00:00Z' },
  { id: '8', userId: 'seed', title: '품질 불량 분석 대시보드', description: '라인별 불량률, 불량 유형, 발생 시간대를 분석하여 근본 원인을 추적합니다. 파레토 차트와 관리도를 활용해 품질 개선 포인트를 시각화합니다.', category: '품질/안전', tags: ['QC', '파레토', '불량분석'], type: 'file', thumbnail: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80', externalUrl: '', author: '윤품질', department: '품질관리팀', viewCount: 4321, likeCount: 97, status: 'approved', createdAt: '2024-09-20T10:00:00Z' },
  { id: '9', userId: 'seed', title: '고객 VOC 분류 자동화', description: '고객센터로 접수된 VOC(고객의 소리)를 AI로 자동 분류하고 담당 부서에 배분합니다. 유형별 처리 현황 및 응답 속도 통계를 제공합니다.', category: '고객서비스', tags: ['VOC', 'AI분류', '고객관리'], type: 'link', thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80', externalUrl: 'https://example.com', author: '서고객', department: '고객서비스팀', viewCount: 1843, likeCount: 23, status: 'approved', createdAt: '2024-12-10T10:00:00Z' },
]

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

// ── Seed initialization ───────────────────────────────────────────────────────
export async function seedIfNeeded() {
  const settingsRef = doc(db, 'settings', 'seed')
  const settingsDoc = await getDoc(settingsRef)
  if (settingsDoc.exists() && settingsDoc.data().initialized) return

  const batch = writeBatch(db)

  for (const app of SEED_APPS) {
    const { id, createdAt, ...appData } = app
    batch.set(doc(db, 'apps', id), {
      ...appData,
      createdAt: Timestamp.fromDate(new Date(createdAt)),
    })
  }

  for (const [appId, comments] of Object.entries(SEED_COMMENTS)) {
    for (const comment of comments) {
      const { id, ...commentData } = comment
      batch.set(doc(db, 'apps', appId, 'comments', id), commentData)
    }
  }

  for (const notice of SEED_NOTICES) {
    const { id, ...noticeData } = notice
    batch.set(doc(db, 'notices', id), noticeData)
  }

  batch.set(doc(db, 'settings', 'blockedDomains'), { domains: SEED_BLOCKED })
  batch.set(settingsRef, { initialized: true })

  await batch.commit()
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export async function checkEmailExists(email) {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email.trim().toLowerCase())
    return methods.length > 0
  } catch {
    return false
  }
}

export async function login(email, password) {
  const emailTrimmed = email.trim().toLowerCase()
  if (!emailTrimmed.endsWith('@hansol.com')) return { error: '한솔 이메일(@hansol.com)만 허용됩니다.' }
  if (password.length < 6) return { error: '비밀번호는 6자 이상이어야 합니다.' }

  try {
    const { user: fbUser } = await signInWithEmailAndPassword(auth, emailTrimmed, password)
    const userRef = doc(db, 'users', fbUser.uid)
    const userDoc = await getDoc(userRef)
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        email: emailTrimmed,
        name: emailTrimmed.split('@')[0],
        department: '', position: '', bio: '', avatar: '',
        role: 'user',
        createdAt: serverTimestamp(),
      })
    }
    return { ok: true }
  } catch (err) {
    if (['auth/user-not-found', 'auth/wrong-password', 'auth/invalid-credential'].includes(err.code)) {
      return { error: '이메일 또는 비밀번호가 올바르지 않습니다.' }
    }
    return { error: err.message }
  }
}

export async function signup(email, password, profile = {}) {
  const emailTrimmed = email.trim().toLowerCase()
  if (!emailTrimmed.endsWith('@hansol.com')) return { error: '한솔 이메일(@hansol.com)만 허용됩니다.' }
  if (password.length < 6) return { error: '비밀번호는 6자 이상이어야 합니다.' }

  try {
    const { user: fbUser } = await createUserWithEmailAndPassword(auth, emailTrimmed, password)
    await setDoc(doc(db, 'users', fbUser.uid), {
      email: emailTrimmed,
      name: profile.name || emailTrimmed.split('@')[0],
      department: profile.department || '', position: '', bio: '', avatar: '',
      role: 'user',
      createdAt: serverTimestamp(),
    })
    return { ok: true }
  } catch (err) {
    if (err.code === 'auth/email-already-in-use') return { error: '이미 등록된 이메일입니다. 로그인을 시도해보세요.' }
    return { error: err.message }
  }
}

export async function fbLogout() { await signOut(auth) }

export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, 'users', uid), data)
}

export async function changePassword(currentPassword, newPassword) {
  if (newPassword.length < 6) return { error: '새 비밀번호는 6자 이상이어야 합니다.' }
  try {
    const fbUser = auth.currentUser
    const credential = EmailAuthProvider.credential(fbUser.email, currentPassword)
    await reauthenticateWithCredential(fbUser, credential)
    await updatePassword(fbUser, newPassword)
    return { ok: true }
  } catch (err) {
    if (['auth/wrong-password', 'auth/invalid-credential'].includes(err.code)) {
      return { error: '현재 비밀번호가 올바르지 않습니다.' }
    }
    return { error: err.message }
  }
}

// ── Apps ─────────────────────────────────────────────────────────────────────
export async function addApp(appData) {
  const ref = await addDoc(collection(db, 'apps'), {
    ...appData,
    likeCount: 0,
    viewCount: 0,
    status: 'approved',
    createdAt: serverTimestamp(),
  })
  return { id: ref.id, ...appData, likeCount: 0, viewCount: 0, status: 'approved' }
}

export async function updateAppStatus(id, status) {
  await updateDoc(doc(db, 'apps', id), { status })
}

export async function updateApp(id, data) {
  await updateDoc(doc(db, 'apps', id), { ...data, updatedAt: serverTimestamp() })
}

export async function deleteApp(id) {
  // 댓글 서브컬렉션 삭제
  const comments = await getDocs(collection(db, 'apps', id, 'comments'))
  if (!comments.empty) {
    const batch = writeBatch(db)
    comments.docs.forEach(d => batch.delete(d.ref))
    await batch.commit()
  }
  // Storage 파일 삭제 (HTML 파일 + 첨부파일 + 썸네일, 실패해도 앱 삭제는 진행)
  for (const folder of [`htmlfiles/${id}`, `attachments/${id}`, `thumbnails/${id}`]) {
    try {
      const res = await listAll(ref(storage, folder))
      await Promise.all(res.items.map(item => deleteObject(item).catch(() => {})))
    } catch (_) {}
  }
  await deleteDoc(doc(db, 'apps', id))
}

export async function incrementView(id) {
  await updateDoc(doc(db, 'apps', id), { viewCount: increment(1) })
}

// ── Likes ─────────────────────────────────────────────────────────────────────
export async function toggleLike(appId, userId) {
  const userLikesRef = doc(db, 'userLikes', userId)
  const appRef = doc(db, 'apps', appId)
  return runTransaction(db, async tx => {
    const [likesDoc, appDoc] = await Promise.all([tx.get(userLikesRef), tx.get(appRef)])
    const appIds = likesDoc.data()?.appIds || []
    const currentCount = appDoc.data()?.likeCount || 0
    const liked = appIds.includes(appId)
    if (liked) {
      tx.set(userLikesRef, { appIds: arrayRemove(appId) }, { merge: true })
      tx.update(appRef, { likeCount: Math.max(0, currentCount - 1) })
      return false
    } else {
      tx.set(userLikesRef, { appIds: arrayUnion(appId) }, { merge: true })
      tx.update(appRef, { likeCount: currentCount + 1 })
      return true
    }
  })
}

// ── Bookmarks ─────────────────────────────────────────────────────────────────
export async function toggleBookmark(appId, userId, currentlyBookmarked) {
  const ref = doc(db, 'users', userId, 'bookmarks', appId)
  if (currentlyBookmarked) { await deleteDoc(ref); return false }
  await setDoc(ref, { createdAt: serverTimestamp() })
  return true
}

// ── Comments ─────────────────────────────────────────────────────────────────
export async function getComments(appId) {
  const snap = await getDocs(query(collection(db, 'apps', appId, 'comments'), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function addComment(appId, content, parentId, user) {
  const comment = {
    userId: user.id, author: user.name,
    initials: (user.name || '?').charAt(0).toUpperCase(),
    content, parentId: parentId || null,
    createdAt: new Date().toISOString(), likes: 0,
  }
  const ref = await addDoc(collection(db, 'apps', appId, 'comments'), comment)
  return { id: ref.id, ...comment }
}

export async function deleteComment(appId, commentId) {
  await deleteDoc(doc(db, 'apps', appId, 'comments', commentId))
}

// ── Notifications ─────────────────────────────────────────────────────────────
export async function pushNotification(userId, type, message, link) {
  await addDoc(collection(db, 'users', userId, 'notifications'), {
    type, message, link, isRead: false, createdAt: new Date().toISOString(),
  })
}

export async function markNotificationRead(userId, notifId) {
  await updateDoc(doc(db, 'users', userId, 'notifications', notifId), { isRead: true })
}

export async function markAllNotificationsRead(userId, notifications) {
  const batch = writeBatch(db)
  notifications.filter(n => !n.isRead).forEach(n => {
    batch.update(doc(db, 'users', userId, 'notifications', n.id), { isRead: true })
  })
  await batch.commit()
}

// ── Notices ───────────────────────────────────────────────────────────────────
export async function getNotices() {
  const snap = await getDocs(query(collection(db, 'notices'), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function addNotice(title, content) {
  const ref = await addDoc(collection(db, 'notices'), {
    title, content, createdAt: new Date().toISOString(), authorId: 'admin',
  })
  return { id: ref.id, title, content, createdAt: new Date().toISOString() }
}

export async function deleteNotice(id) { await deleteDoc(doc(db, 'notices', id)) }

// ── Users (admin) ─────────────────────────────────────────────────────────────
export async function getUsers() {
  const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function adminDeleteUser(uid) {
  await deleteDoc(doc(db, 'users', uid))
}

export async function adminSetRole(uid, role) {
  await updateDoc(doc(db, 'users', uid), { role })
}

export async function adminUpdateUserDepartment(uid, department) {
  await updateDoc(doc(db, 'users', uid), { department })
  const snap = await getDocs(query(collection(db, 'apps'), where('userId', '==', uid)))
  if (snap.empty) return
  const batch = writeBatch(db)
  snap.docs.forEach(d => batch.update(d.ref, { department }))
  await batch.commit()
}

export async function adminSendPasswordReset(email) {
  await sendPasswordResetEmail(auth, email)
}

// ── Reports ───────────────────────────────────────────────────────────────────
export async function getReports() {
  const snap = await getDocs(query(collection(db, 'reports'), orderBy('createdAt', 'desc')))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function addReport(targetId, targetType, reason, user) {
  await addDoc(collection(db, 'reports'), {
    reporterId: user.id, reporterName: user.name,
    targetId, targetType, reason, status: 'pending',
    createdAt: new Date().toISOString(),
  })
}

export async function resolveReport(id) {
  await updateDoc(doc(db, 'reports', id), { status: 'resolved' })
}

// ── Blocked Domains ───────────────────────────────────────────────────────────
export async function getBlockedDomains() {
  const snap = await getDoc(doc(db, 'settings', 'blockedDomains'))
  return snap.data()?.domains || []
}

export async function addBlockedDomain(domain) {
  await setDoc(doc(db, 'settings', 'blockedDomains'), { domains: arrayUnion(domain) }, { merge: true })
}

export async function removeBlockedDomain(domain) {
  await updateDoc(doc(db, 'settings', 'blockedDomains'), { domains: arrayRemove(domain) })
}

// ── Education Batches ─────────────────────────────────────────────────────────
const DEFAULT_BATCH_COLORS = ['#10b981','#0ea5e9','#8b5cf6','#f97316','#ec4899','#14b8a6','#f59e0b','#ef4444']

function normalizeBatches(raw) {
  const defaults = ['1차교육', '2차교육', '3차교육']
  const list = raw || defaults
  return list.map((b, i) =>
    typeof b === 'string'
      ? { name: b, color: DEFAULT_BATCH_COLORS[i % DEFAULT_BATCH_COLORS.length] }
      : b
  )
}

export async function getEducationBatches() {
  const snap = await getDoc(doc(db, 'settings', 'educationBatches'))
  return normalizeBatches(snap.data()?.batches)
}

export async function getEducationBatchesWithDefault() {
  const snap = await getDoc(doc(db, 'settings', 'educationBatches'))
  const data = snap.data() || {}
  return {
    batches: normalizeBatches(data.batches),
    defaultBatch: data.defaultBatch || '',
  }
}

export async function setDefaultEducationBatch(name) {
  await setDoc(doc(db, 'settings', 'educationBatches'), { defaultBatch: name }, { merge: true })
}

export async function saveEducationBatches(batches) {
  await setDoc(doc(db, 'settings', 'educationBatches'), { batches }, { merge: true })
}

export async function addEducationBatch(name, color) {
  const { batches } = await getEducationBatchesWithDefault()
  const newColor = color || DEFAULT_BATCH_COLORS[batches.length % DEFAULT_BATCH_COLORS.length]
  await saveEducationBatches([...batches, { name, color: newColor }])
}

export async function removeEducationBatch(name) {
  const { batches } = await getEducationBatchesWithDefault()
  await saveEducationBatches(batches.filter(b => b.name !== name))
}

// 차수 이름 변경/삭제 시 기존 앱들의 educationBatch 필드를 일괄 갱신
export async function updateAppsEducationBatch(oldName, newName) {
  const snap = await getDocs(query(collection(db, 'apps'), where('educationBatch', '==', oldName)))
  if (snap.empty) return
  const batch = writeBatch(db)
  snap.docs.forEach(d => batch.update(d.ref, { educationBatch: newName }))
  await batch.commit()
}

export async function reorderEducationBatches(batches) {
  await saveEducationBatches(batches)
}

export function isDomainBlocked(url, blockedDomains) {
  try {
    const host = new URL(url).hostname.replace('www.', '')
    return (blockedDomains || []).some(d => host.includes(d))
  } catch { return false }
}

// ── Rankings ─────────────────────────────────────────────────────────────────
export function computeRankings(apps) {
  const approved = apps.filter(a => a.status === 'approved')
  const now = Date.now()
  const sevenDays = 7 * 24 * 60 * 60 * 1000
  const scored = approved.map(a => {
    const likeCount = a.likeCount ?? 0
    const score = likeCount * 2 + (a.viewCount || 0) * 0.5
    const createdAt = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
    const isRecent = (now - createdAt.getTime()) < sevenDays
    return { ...a, likeCount, score, isRecent }
  })
  return {
    weekly: [...scored].filter(a => a.isRecent || a.score > 50).sort((a, b) => b.score - a.score).slice(0, 5),
    allTime: [...scored].sort((a, b) => b.score - a.score).slice(0, 10),
    trending: [...scored].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5),
    byDept: Object.entries(
      scored.reduce((acc, a) => { const d = a.department || '기타'; if (!acc[d]) acc[d] = []; acc[d].push(a); return acc }, {})
    ).map(([dept, list]) => ({ dept, best: list.sort((a, b) => b.score - a.score)[0], count: list.length }))
      .sort((a, b) => b.count - a.count).slice(0, 6),
  }
}

// ── Stats ─────────────────────────────────────────────────────────────────────
export function computeMyStats(apps, userId) {
  const myApps = apps.filter(a => a.userId === userId)
  return {
    totalApps: myApps.length,
    totalViews: myApps.reduce((s, a) => s + (a.viewCount || 0), 0),
    totalLikes: myApps.reduce((s, a) => s + (a.likeCount || 0), 0),
    apps: myApps,
  }
}

export function computeAdminStats(apps, reports) {
  const catMap = apps.reduce((acc, a) => { acc[a.category] = (acc[a.category] || 0) + 1; return acc }, {})
  const tagMap = apps.flatMap(a => a.tags || []).reduce((acc, t) => { acc[t] = (acc[t] || 0) + 1; return acc }, {})
  const deptMap = apps.reduce((acc, a) => { const d = a.department || '기타'; acc[d] = (acc[d] || 0) + 1; return acc }, {})
  return {
    totalApps: apps.length,
    approvedApps: apps.filter(a => a.status === 'approved').length,
    pendingApps: apps.filter(a => a.status === 'pending').length,
    totalViews: apps.reduce((s, a) => s + (a.viewCount || 0), 0),
    totalLikes: apps.reduce((s, a) => s + (a.likeCount || 0), 0),
    pendingReports: (reports || []).filter(r => r.status === 'pending').length,
    categories: Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    tags: Object.entries(tagMap).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value })),
    departments: Object.entries(deptMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
  }
}

// ── File Validation ────────────────────────────────────────────────────────────
const ALLOWED_EXTS = ['.html', '.css', '.js', '.zip']
const MAX_SIZE = { single: 10 * 1024 * 1024, zip: 50 * 1024 * 1024 }
export function validateFile(file) {
  const ext = '.' + file.name.split('.').pop().toLowerCase()
  if (!ALLOWED_EXTS.includes(ext)) return { error: `허용되지 않는 확장자입니다. 허용: ${ALLOWED_EXTS.join(', ')}` }
  const maxSize = ext === '.zip' ? MAX_SIZE.zip : MAX_SIZE.single
  if (file.size > maxSize) return { error: `파일 크기 초과: ${ext === '.zip' ? '50MB' : '10MB'} 이하여야 합니다.` }
  return { ok: true }
}

// ── Thumbnails (Firebase Storage) ─────────────────────────────────────────────
// 외부 링크(EXTERNAL) 앱의 썸네일은 microlink.io 스크린샷 API가 반환한 URL을 그대로 쓰면 안 됨.
// microlink 쪽 CDN이 약 한 달 뒤 이미지를 자동 삭제(flush)해서 403이 나기 때문에,
// 캡처한 이미지를 반드시 우리 Firebase Storage로 재호스팅해서 영구 URL을 사용한다.
const STREAMLIT_DEFAULT_THUMBNAIL = '/streamlit-default.svg'

function isStreamlitUrl(url) {
  return /streamlit\.app|streamlit\.io/i.test(url || '')
}

export function uploadThumbnail(appId, blob, contentType = 'image/png') {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, `thumbnails/${appId}/thumbnail_${Date.now()}.png`)
    const task = uploadBytesResumable(storageRef, blob, { contentType })
    task.on('state_changed', null, reject, async () => {
      const url = await getDownloadURL(task.snapshot.ref)
      resolve(url)
    })
  })
}

// 외부 URL을 microlink로 캡처한 뒤 Firebase Storage에 업로드해 영구 썸네일 URL을 반환한다.
// Streamlit 링크는 캡처 시도 없이 기본 썸네일을 바로 반환한다.
export async function captureAndUploadThumbnail(appId, externalUrl) {
  if (isStreamlitUrl(externalUrl)) return STREAMLIT_DEFAULT_THUMBNAIL

  const params = new URLSearchParams({ url: externalUrl, screenshot: 'true', meta: 'false' })
  const res = await fetch(`https://api.microlink.io/?${params.toString()}`)
  if (!res.ok) throw new Error('microlink API 오류')
  const json = await res.json()
  const imgUrl = json?.data?.screenshot?.url
  if (!imgUrl) throw new Error('스크린샷 URL을 가져오지 못했습니다')

  const imgRes = await fetch(imgUrl)
  if (!imgRes.ok) throw new Error('스크린샷 다운로드 실패')
  const blob = await imgRes.blob()
  return uploadThumbnail(appId, blob)
}

// ── Attachments (Firebase Storage) ────────────────────────────────────────────
const ATTACHMENT_ALLOWED = ['.xlsx', '.xls', '.csv', '.pdf', '.pptx', '.ppt', '.docx', '.doc', '.txt', '.md', '.zip', '.png', '.jpg', '.jpeg']
const ATTACHMENT_MAX_MB = 60

export function validateAttachment(file) {
  const ext = '.' + file.name.split('.').pop().toLowerCase()
  if (!ATTACHMENT_ALLOWED.includes(ext)) return { error: `지원하지 않는 형식입니다. (Excel, PDF, PPT, Word, CSV, 이미지 등)` }
  if (file.size > ATTACHMENT_MAX_MB * 1024 * 1024) return { error: `첨부파일은 ${ATTACHMENT_MAX_MB}MB 이하여야 합니다.` }
  return { ok: true }
}

export function uploadAttachment(appId, file, onProgress) {
  return new Promise((resolve, reject) => {
    const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._\-가-힣]/g, '_')}`
    const storageRef = ref(storage, `attachments/${appId}/${safeName}`)
    const task = uploadBytesResumable(storageRef, file, { contentType: file.type })
    task.on('state_changed',
      snap => onProgress && onProgress(Math.round(snap.bytesTransferred / snap.totalBytes * 100)),
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref)
        resolve({ name: file.name, url, size: file.size, type: file.type, path: task.snapshot.ref.fullPath })
      }
    )
  })
}

export async function deleteAttachment(path) {
  try { await deleteObject(ref(storage, path)) } catch (_) {}
}

export async function updateAppAttachments(appId, attachments) {
  await updateDoc(doc(db, 'apps', appId), { attachments })
}

export function uploadHtmlFile(appId, file, onProgress) {
  return new Promise((resolve, reject) => {
    const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._\-가-힣]/g, '_')}`
    const storageRef = ref(storage, `htmlfiles/${appId}/${safeName}`)
    const task = uploadBytesResumable(storageRef, file, { contentType: 'text/html' })
    task.on('state_changed',
      snap => onProgress && onProgress(Math.round(snap.bytesTransferred / snap.totalBytes * 100)),
      reject,
      async () => {
        const url = await getDownloadURL(task.snapshot.ref)
        resolve({ url, path: task.snapshot.ref.fullPath })
      }
    )
  })
}

