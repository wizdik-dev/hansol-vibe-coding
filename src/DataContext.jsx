import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore'
import { auth, db } from './firebase'
import {
  seedIfNeeded, login, signup, fbLogout, updateUserProfile, changePassword,
  addApp, updateAppStatus, updateApp, deleteApp, incrementView,
  toggleLike, toggleBookmark,
  addComment, deleteComment, getComments,
  pushNotification, markNotificationRead, markAllNotificationsRead,
  getNotices, addNotice, deleteNotice,
  getReports, addReport, resolveReport,
  getBlockedDomains, addBlockedDomain, removeBlockedDomain, isDomainBlocked,
  getUsers, adminDeleteUser, adminSendPasswordReset, adminSetRole, adminUpdateUserDepartment,
  computeRankings, computeMyStats, computeAdminStats,
  validateFile, validateAttachment, uploadAttachment, deleteAttachment, updateAppAttachments,
  uploadHtmlFile,
  getEducationBatches, addEducationBatch, removeEducationBatch, reorderEducationBatches,
  getEducationBatchesWithDefault, setDefaultEducationBatch, saveEducationBatches,
} from './store'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [apps, setApps] = useState([])
  const [userLikes, setUserLikes] = useState(new Set())
  const [userBookmarks, setUserBookmarks] = useState(new Set())
  const [notifications, setNotifications] = useState([])

  // Seed data on first load
  useEffect(() => { seedIfNeeded().catch(console.error) }, [])

  // Firebase Auth state
  useEffect(() => {
    return onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userDoc = await getDoc(doc(db, 'users', fbUser.uid))
        if (userDoc.exists()) {
          setUser({ id: fbUser.uid, ...userDoc.data() })
        } else {
          setUser({ id: fbUser.uid, email: fbUser.email, name: fbUser.email.split('@')[0], role: 'user' })
        }
      } else {
        setUser(null)
      }
      setAuthLoading(false)
    })
  }, [])

  // Apps real-time subscription
  useEffect(() => {
    return onSnapshot(
      query(collection(db, 'apps'), orderBy('createdAt', 'desc')),
      snap => setApps(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      err => console.error('apps snapshot error:', err)
    )
  }, [])

  // User-specific subscriptions (likes, bookmarks, notifications)
  useEffect(() => {
    if (!user?.id) {
      setUserLikes(new Set())
      setUserBookmarks(new Set())
      setNotifications([])
      return
    }

    const unsubLikes = onSnapshot(doc(db, 'userLikes', user.id), snap => {
      setUserLikes(new Set(snap.data()?.appIds || []))
    })

    const unsubBookmarks = onSnapshot(
      collection(db, 'users', user.id, 'bookmarks'),
      snap => setUserBookmarks(new Set(snap.docs.map(d => d.id)))
    )

    const unsubNotifs = onSnapshot(
      query(collection(db, 'users', user.id, 'notifications'), orderBy('createdAt', 'desc'), limit(20)),
      snap => setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )

    return () => { unsubLikes(); unsubBookmarks(); unsubNotifs() }
  }, [user?.id])

  const unreadCount = notifications.filter(n => !n.isRead).length

  // ── Auth actions ──────────────────────────────────────────────────────────
  async function handleLogin(email, password) { return login(email, password) }
  async function handleSignup(email, password, profile) { return signup(email, password, profile) }
  async function handleLogout() { await fbLogout() }

  async function handleUpdateUser(data) {
    if (!user) return
    await updateUserProfile(user.id, data)
    setUser(prev => ({ ...prev, ...data }))
  }

  async function handleChangePassword(currentPwd, newPwd) {
    return changePassword(currentPwd, newPwd)
  }

  // ── App actions ───────────────────────────────────────────────────────────
  async function handleAddApp(appData) { return addApp(appData) }
  async function handleUpdateAppStatus(id, status) { await updateAppStatus(id, status) }
  async function handleUpdateApp(id, data) { await updateApp(id, data) }
  async function handleDeleteApp(id) { await deleteApp(id) }
  async function handleIncrementView(id) { await incrementView(id) }

  // ── Social actions ────────────────────────────────────────────────────────
  async function handleToggleLike(appId) {
    if (!user) return false
    const currentlyLiked = userLikes.has(appId)
    const newLiked = await toggleLike(appId, user.id, currentlyLiked)
    if (newLiked) {
      const app = apps.find(a => a.id === appId)
      if (app && app.userId && app.userId !== user.id && app.userId !== 'seed') {
        const milestones = [10, 50, 100, 500, 1000]
        const newCount = (app.likeCount || 0) + 1
        if (milestones.includes(newCount)) {
          await pushNotification(app.userId, 'like', `"${app.title}" 앱이 좋아요 ${newCount}개를 달성했습니다!`, `/apps/${appId}`)
        }
      }
    }
    return newLiked
  }

  async function handleToggleBookmark(appId) {
    if (!user) return false
    return toggleBookmark(appId, user.id, userBookmarks.has(appId))
  }

  async function handleAddComment(appId, content, parentId = null) {
    if (!user) return null
    const comment = await addComment(appId, content, parentId, user)
    const app = apps.find(a => a.id === appId)
    if (app && app.userId && app.userId !== user.id && app.userId !== 'seed') {
      await pushNotification(app.userId, 'comment', `"${app.title}" 앱에 ${user.name}님이 댓글을 남겼습니다: "${content.slice(0, 30)}"`, `/apps/${appId}`)
    }
    return comment
  }

  async function handleDeleteComment(appId, commentId) { await deleteComment(appId, commentId) }

  async function handleMarkNotifRead(id) {
    if (!user) return
    await markNotificationRead(user.id, id)
  }

  async function handleMarkAllNotifRead() {
    if (!user) return
    await markAllNotificationsRead(user.id, notifications)
  }

  async function handleAddReport(targetId, targetType, reason) {
    if (!user) return
    await addReport(targetId, targetType, reason, user)
  }

  // ── Computed ──────────────────────────────────────────────────────────────
  function getRankings() { return computeRankings(apps) }

  function getMyStats() {
    if (!user) return null
    return computeMyStats(apps, user.id)
  }

  async function getAdminStats() {
    const reports = await getReports()
    return computeAdminStats(apps, reports)
  }

  const value = {
    user, authLoading, apps, userLikes, userBookmarks, notifications, unreadCount,
    isAdmin: user?.role === 'admin',

    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    updateUser: handleUpdateUser,
    changePassword: handleChangePassword,

    addApp: handleAddApp,
    updateAppStatus: handleUpdateAppStatus,
    updateApp: handleUpdateApp,
    deleteApp: handleDeleteApp,
    incrementView: handleIncrementView,

    toggleLike: handleToggleLike,
    toggleBookmark: handleToggleBookmark,

    getComments,
    addComment: handleAddComment,
    deleteComment: handleDeleteComment,

    markNotificationRead: handleMarkNotifRead,
    markAllNotificationsRead: handleMarkAllNotifRead,

    addReport: handleAddReport,
    getReports,
    resolveReport,

    getNotices,
    addNotice,
    deleteNotice,

    getBlockedDomains,
    addBlockedDomain,
    removeBlockedDomain,
    isDomainBlocked,

    getUsers,
    adminDeleteUser,
    adminSendPasswordReset,
    adminSetRole,
    adminUpdateUser: updateUserProfile,
    adminUpdateUserDepartment,

    getRankings,
    getMyStats,
    getAdminStats,

    validateFile, validateAttachment, uploadAttachment, deleteAttachment, updateAppAttachments,
    uploadHtmlFile,
    getEducationBatches, addEducationBatch, removeEducationBatch, reorderEducationBatches,
    getEducationBatchesWithDefault, setDefaultEducationBatch, saveEducationBatches,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
