import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Spinner from '../components/Spinner'
import { getRestrictionById, liftRestriction } from '../services/adminRestrictions'
import { getUserById } from '../services/adminUsers'
import { useAuth } from '../context/AuthContext'
import { useI18n } from '../context/I18nContext'

const restrictionTypesInfo = {
  messaging_ban: { ar: 'حظر المراسلة', en: 'Messaging Ban', icon: '💬', color: 'border-red-200 bg-red-50 text-red-700 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400' },
  posting_ban: { ar: 'حظر النشر', en: 'Posting Ban', icon: '📝', color: 'border-orange-200 bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:border-orange-900/50 dark:text-orange-400' },
  application_ban: { ar: 'حظر التقديم للمشاريع', en: 'Application Ban', icon: '📋', color: 'border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-400' },
  full_suspension: { ar: 'إيقاف الحساب بالكامل', en: 'Full Suspension', icon: '🚫', color: 'border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400' },
  matching: { ar: 'حظر التوفيق بين الشركاء', en: 'Matching Restriction', icon: '🔀', color: 'border-purple-200 bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:border-purple-900/50 dark:text-purple-400' },
  comments: { ar: 'حظر التعليقات', en: 'Comments Ban', icon: '💭', color: 'border-pink-200 bg-pink-50 text-pink-700 dark:bg-pink-950/30 dark:border-pink-900/50 dark:text-pink-400' },
}

const rolesMap = {
  guest: { ar: 'زائر', en: 'Guest' },
  regular_user: { ar: 'مستخدم عادي', en: 'Regular User' },
  moderator: { ar: 'مشرف', en: 'Moderator' },
  administrator: { ar: 'مدير النظام', en: 'Administrator' },
}

const accountStatusMap = {
  active: { ar: 'نشط', en: 'Active', color: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-400' },
  pending: { ar: 'قيد الانتظار', en: 'Pending', color: 'border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-400' },
  suspended: { ar: 'معطل مؤقتاً', en: 'Suspended', color: 'border-orange-200 bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:border-orange-900/50 dark:text-orange-400' },
  banned: { ar: 'محظور', en: 'Banned', color: 'border-red-200 bg-red-50 text-red-700 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400 font-bold' },
  deleted: { ar: 'محذوف', en: 'Deleted', color: 'border-[var(--border-color)] bg-[var(--bg-hover)] text-[var(--text-primary)] dark:bg-slate-900/30  dark:text-slate-400' },
}

const translations = {
  en: {
    backToRestrictions: 'Back to Restrictions',
    restrictionDetail: 'Restriction Detail',
    liftRestriction: 'Lift Restriction',
    lifting: 'Lifting...',
    notFound: 'Restriction not found.',
    failedLoad: 'Failed to load restriction details.',
    liftedSuccess: 'Restriction lifted successfully.',
    primaryData: 'Primary Restriction Data',
    type: 'Restriction Type',
    status: 'Status',
    duration: 'Duration',
    startsAt: 'Starts At',
    expiresAt: 'Expires At',
    liftedAt: 'Lifted At',
    reason: 'Reason',
    noReason: 'No reason was provided for this restriction.',
    restrictedUser: 'Restricted User Profile',
    role: 'Role',
    accountStatus: 'Account Status',
    viewProfile: 'View Profile',
    issuer: 'Issuer Details',
    issuerTitle: 'Restricting Administrator',
    username: 'Username',
    adminRole: 'Admin Role',
    permanent: 'Permanent',
    hours: 'Hours',
    hour: 'Hour',
    active: 'Active',
    expired: 'Expired',
    lifted: 'Lifted',
    inactive: 'Inactive',
    confirmLift: 'Are you sure you want to lift this restriction?',
  },
  ar: {
    backToRestrictions: 'العودة إلى العقوبات',
    restrictionDetail: 'تفاصيل العقوبة',
    liftRestriction: 'رفع العقوبة',
    lifting: 'جاري الرفع...',
    notFound: 'العقوبة غير موجودة.',
    failedLoad: 'فشل في تحميل تفاصيل العقوبة.',
    liftedSuccess: 'تم رفع العقوبة بنجاح.',
    primaryData: 'بيانات العقوبة الأساسية',
    type: 'نوع العقوبة',
    status: 'حالة العقوبة',
    duration: 'المدة',
    startsAt: 'تاريخ البدء',
    expiresAt: 'تاريخ الانتهاء',
    liftedAt: 'تاريخ الرفع',
    reason: 'السبب',
    noReason: 'لم يتم تقديم سبب لهذه العقوبة.',
    restrictedUser: 'المستخدم المعاقب',
    role: 'الدور',
    accountStatus: 'حالة الحساب',
    viewProfile: 'عرض الملف الشخصي الكامل',
    issuer: 'بيانات المسؤول',
    issuerTitle: 'المسؤول المصدر للعقوبة',
    username: 'اسم المستخدم',
    adminRole: 'دور المسؤول',
    permanent: 'دائمة',
    hours: 'ساعة',
    hour: 'ساعة',
    active: 'نشطة',
    expired: 'منتهية',
    lifted: 'تم رفعها',
    inactive: 'غير نشطة',
    confirmLift: 'هل أنت متأكد من أنك تريد رفع هذه العقوبة؟',
  }
}

function InfoRow({ labelAr, labelEn, children }) {
  const { locale } = useI18n()
  const label = locale === 'ar' ? labelAr : labelEn
  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs font-bold text-[var(--text-hint)] uppercase tracking-wider">
        {label}
      </div>
      <div className="text-sm font-semibold text-[var(--text-primary)] ">{children}</div>
    </div>
  )
}

export default function AdminRestrictionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { locale, isRTL } = useI18n()

  const dict = translations[locale] || translations.en

  const [item, setItem] = useState(null)
  const [targetUser, setTargetUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await getRestrictionById(id)
        setItem(data)
        
        // Dynamic fetch for the restricted user profile to obtain current role & account_status
        const targetUserId = data.target_user_id || data.target_user?.id || data.user?.id
        if (targetUserId) {
          try {
            const uProfile = await getUserById(targetUserId)
            setTargetUser(uProfile)
          } catch (err) {
            console.error('Failed to fetch target user profile dynamically:', err)
          }
        }
      } catch (err) {
        console.error(err)
        setMessage({ type: 'error', text: dict.failedLoad })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, user?.id, locale])

  const handleLift = async () => {
    if (!confirm(dict.confirmLift)) return
    setProcessing(true)
    setMessage(null)
    try {
      await liftRestriction(id)
      setMessage({ type: 'success', text: dict.liftedSuccess })
      
      // Reload restriction detail and user profile instead of navigating back immediately
      const updatedData = await getRestrictionById(id)
      setItem(updatedData)
      const targetUserId = updatedData.target_user_id || updatedData.target_user?.id || updatedData.user?.id
      if (targetUserId) {
        const uProfile = await getUserById(targetUserId)
        setTargetUser(uProfile)
      }
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message || dict.failedLoad })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>
  if (!item) return <div className="p-8 text-rose-600 font-bold">{dict.notFound}</div>

  const typeKey = `${item.restriction_type || item.type || ''}`.toLowerCase()
  const typeData = restrictionTypesInfo[typeKey] || { ar: typeKey, en: typeKey, icon: '🔒', color: 'badge-slate' }

  // Derive restriction status based on is_active, is_expired, is_permanent, and lifted_at
  const getRestrictionStatus = () => {
    if (item.lifted_at) {
      return { label: dict.lifted, color: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-400' }
    }
    if (item.is_expired || (item.expires_at && new Date(item.expires_at) < new Date())) {
      return { label: dict.expired, color: 'border-[var(--border-color)] bg-[var(--bg-hover)] text-[var(--text-primary)] dark:bg-slate-900/30  dark:text-slate-400' }
    }
    if (item.is_permanent) {
      return { label: dict.permanent, color: 'border-rose-300 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400 font-extrabold' }
    }
    if (item.is_active || item.status?.toLowerCase() === 'active') {
      return { label: dict.active, color: 'border-red-200 bg-red-50 text-red-700 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-400' }
    }
    return { label: dict.expired, color: 'border-[var(--border-color)] bg-[var(--bg-hover)] text-[var(--text-primary)] dark:bg-slate-900/30  dark:text-slate-400' }
  }

  const statusInfo = getRestrictionStatus()
  const isActive = (item.is_active || item.status?.toLowerCase() === 'active') && !item.lifted_at && !item.is_expired

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US') + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    } catch (e) {
      return dateStr
    }
  }

  // Dynamic user mapping details
  const displayName = targetUser?.full_name || item.target_user?.full_name || item.target_user?.name || item.user?.full_name || 'Unknown User'
  const displayUsername = targetUser?.username || item.target_user?.username || item.user?.username || 'Unknown'
  const profilePicture = targetUser?.profile_picture_url || item.target_user?.profile_picture_url || item.user?.profile_picture_url
  const initials = displayName.charAt(0).toUpperCase()

  const userRole = targetUser?.role || 'regular_user'
  const mappedRole = rolesMap[userRole] || { ar: userRole, en: userRole }

  const userStatus = targetUser?.account_status || 'active'
  const mappedStatus = accountStatusMap[userStatus] || { ar: userStatus, en: userStatus, color: 'border-[var(--border-color)] bg-[var(--bg-hover)] text-[var(--text-primary)]' }

  return (
    <div className="max-w-6xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[var(--border-color)]  pb-4">
        <div>
          <Link to="/admin/restrictions" className="text-sm text-brand-primary font-bold flex items-center gap-1 mb-2 hover:underline">
            <span className={isRTL ? 'rotate-180 inline-block' : ''}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </span>
            {dict.backToRestrictions}
          </Link>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]  family-cairo">{dict.restrictionDetail}</h1>
        </div>
        <div className="flex items-center gap-3">
          {isActive && (
            <button
              onClick={handleLift}
              disabled={processing}
              className="btn-danger px-4 py-2 text-sm shadow-brand-primary/20 flex items-center gap-2"
            >
              {processing ? <Spinner /> : (
                <span>{dict.liftRestriction}</span>
              )}
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-2 ${message.type === 'error' ? 'bg-rose-50 border border-rose-200 text-rose-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>
          {message.text}
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Primary Restriction Details (بيانات العقوبة الأساسية) */}
        <div className="lg:col-span-2 card p-6 space-y-6 border-t-4 border-t-indigo-500">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-[var(--border-color)] ">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{typeData.icon}</span>
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]  family-cairo">{dict.primaryData}</h3>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.color} family-cairo`}>
              {statusInfo.label}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoRow labelAr="نوع العقوبة" labelEn="Restriction Type">
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${typeData.color}`}>
                {typeData[locale] || typeData.en}
              </span>
            </InfoRow>

            <InfoRow labelAr="المدة" labelEn="Duration">
              {item.is_permanent ? (
                <span className="text-rose-600 font-bold">{dict.permanent}</span>
              ) : (
                <span>{item.duration_hours ? `${item.duration_hours} ${dict.hours}` : '-'}</span>
              )}
            </InfoRow>

            <InfoRow labelAr="تاريخ البدء" labelEn="Starts At">
              <span className="font-mono text-[var(--text-primary)] dark:text-slate-300">
                {formatDate(item.starts_at || item.created_at || item.restricted_at)}
              </span>
            </InfoRow>

            <InfoRow labelAr="تاريخ الانتهاء" labelEn="Expires At">
              <span className="font-mono text-[var(--text-primary)] dark:text-slate-300">
                {item.is_permanent ? (
                  <span className="text-rose-600 font-bold">{dict.permanent}</span>
                ) : (
                  formatDate(item.expires_at)
                )}
              </span>
            </InfoRow>

            {item.lifted_at && (
              <div className="col-span-1 md:col-span-2">
                <InfoRow labelAr="تاريخ الرفع" labelEn="Lifted At">
                  <span className="font-mono text-emerald-600 font-bold">
                    {formatDate(item.lifted_at)}
                  </span>
                </InfoRow>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[var(--border-color)] ">
            <div className="text-xs font-bold text-[var(--text-hint)] uppercase tracking-wider mb-2">
              {dict.reason}
            </div>
            <div className="p-4 bg-[var(--bg-hover)] dark:bg-slate-900/50 rounded-xl border border-[var(--border-color)]  text-[var(--text-primary)] dark:text-slate-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {item.reason || dict.noReason}
            </div>
          </div>
        </div>

        {/* Side Stack for User and Admin details */}
        <div className="space-y-6">
          
          {/* Card 2: Restricted User Data (بيانات المستخدم المعاقب) */}
          <div className="card p-6 space-y-4 border-t-4 border-t-amber-500">
            <div className="pb-3 border-b border-[var(--border-color)] ">
              <h3 className="text-md font-bold text-[var(--text-primary)]  family-cairo">{dict.restrictedUser}</h3>
            </div>

            <div className="flex items-center gap-3">
              {profilePicture ? (
                <img 
                  src={profilePicture} 
                  alt={displayName} 
                  className="w-12 h-12 rounded-full object-cover border-2 border-[var(--border-color)] " 
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-bold text-[var(--text-primary)]  text-sm truncate">{displayName}</p>
                <p className="text-xs text-[var(--text-hint)] font-mono truncate" dir="ltr">@{displayUsername}</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="text-[var(--text-hint)] font-bold">{dict.role}:</span>
                <span className="font-semibold text-[var(--text-primary)] dark:text-slate-300 bg-[var(--bg-hover)] dark:bg-slate-900/50 px-2 py-0.5 rounded border border-[var(--border-color)] ">
                  {mappedRole[locale] || mappedRole.en}
                </span>
              </div>
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="text-[var(--text-hint)] font-bold">{dict.accountStatus}:</span>
                <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold ${mappedStatus.color}`}>
                  {mappedStatus[locale] || mappedStatus.en}
                </span>
              </div>
            </div>
            
            <div className="pt-2">
              <Link 
                to={`/admin/users/${item.target_user_id || item.target_user?.id || item.user?.id}`} 
                className="w-full btn-secondary text-xs py-2 flex items-center justify-center gap-1"
              >
                <span>{dict.viewProfile}</span>
              </Link>
            </div>
          </div>

          {/* Card 3: Restricted By Admin (بيانات المسؤول الذي أصدر العقوبة) */}
          <div className="card p-6 space-y-4 border-t-4 border-t-rose-500">
            <div className="pb-3 border-b border-[var(--border-color)] ">
              <h3 className="text-md font-bold text-[var(--text-primary)]  family-cairo font-semibold">{dict.issuerTitle}</h3>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center text-lg text-rose-500 shrink-0">
                🛡️
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[var(--text-primary)]  text-sm truncate" dir="ltr">
                  @{item.restricted_by?.username || 'Unknown'}
                </p>
                <p className="text-[10px] text-[var(--text-hint)] font-sans">{dict.username}</p>
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2 text-xs pt-2 border-t border-slate-50 dark:border-slate-900">
              <span className="text-[var(--text-hint)] font-bold">{dict.adminRole}:</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2.5 py-0.5 rounded-full border border-rose-100 dark:border-rose-900/30">
                {item.restricted_by?.role || 'Administrator'}
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
