import React, { Component, Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'

// ─── Static imports (load immediately — public-facing pages) ───────────────
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import LandingPage from './pages/LandingPage'
import ProtectedRoute, { StageRoute } from './components/ProtectedRoute'
import Layout from './components/Layout'

// ─── Lazy imports (loaded on-demand — authenticated/heavy pages) ───────────
const Dashboard            = lazy(() => import('./pages/Dashboard'))
const EmailVerify          = lazy(() => import('./pages/EmailVerify'))
const VerifyEmailGate      = lazy(() => import('./pages/VerifyEmailGate'))
const ResetPassword        = lazy(() => import('./pages/ResetPassword'))
const DiscoverPeople       = lazy(() => import('./pages/DiscoverPeople'))
const PublicProfile        = lazy(() => import('./pages/PublicProfile'))
const Profile              = lazy(() => import('./pages/Profile'))
const EditProfile          = lazy(() => import('./pages/EditProfile'))
const Projects             = lazy(() => import('./pages/Projects'))
const ProjectDetails       = lazy(() => import('./pages/ProjectDetails'))
const MyProjects           = lazy(() => import('./pages/MyProjects'))
const CreateProject        = lazy(() => import('./pages/CreateProject'))
const EditProject          = lazy(() => import('./pages/EditProject'))
const MyApplications       = lazy(() => import('./pages/MyApplications'))
const ProjectApplications  = lazy(() => import('./pages/ProjectApplications'))
const Connections          = lazy(() => import('./pages/Connections'))
const Invitations          = lazy(() => import('./pages/Invitations'))
const IdentityVerification = lazy(() => import('./pages/IdentityVerification'))
const Notifications        = lazy(() => import('./pages/Notifications'))
const Messaging            = lazy(() => import('./pages/Messaging'))
const Conversation         = lazy(() => import('./pages/Conversation'))
const MyReports            = lazy(() => import('./pages/MyReports'))
const SubmitReport         = lazy(() => import('./pages/SubmitReport'))
const ReportDetail         = lazy(() => import('./pages/ReportDetail'))

// Admin — grouped into their own lazy chunks
const AdminVerifications      = lazy(() => import('./pages/AdminVerifications'))
const AdminVerificationDetail = lazy(() => import('./pages/AdminVerificationDetail'))
const AdminReports            = lazy(() => import('./pages/AdminReports'))
const AdminReportDetail       = lazy(() => import('./pages/AdminReportDetail'))
const AdminModeration         = lazy(() => import('./pages/AdminModeration'))
const AdminModerationLog      = lazy(() => import('./pages/AdminModerationLog'))
const AdminRestrictions       = lazy(() => import('./pages/AdminRestrictions'))
const AdminRestrictionDetail  = lazy(() => import('./pages/AdminRestrictionDetail'))
const AdminRestrictUser       = lazy(() => import('./pages/AdminRestrictUser'))
const AdminUsers              = lazy(() => import('./pages/AdminUsers'))
const AdminUserDetail         = lazy(() => import('./pages/AdminUserDetail'))
const AdminSettings           = lazy(() => import('./pages/AdminSettings'))
const AdminSettingDetail      = lazy(() => import('./pages/AdminSettingDetail'))
const AdminActionLogs         = lazy(() => import('./pages/AdminActionLogs'))
const AdminActionLogDetail    = lazy(() => import('./pages/AdminActionLogDetail'))
const AdminSystemLogs         = lazy(() => import('./pages/AdminSystemLogs'))
const AdminSystemLogDetail    = lazy(() => import('./pages/AdminSystemLogDetail'))

// ─── Suspense fallback spinner ─────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-page)]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
        <p className="text-sm font-medium text-[var(--text-secondary)]">Loading...</p>
      </div>
    </div>
  )
}

// ─── Route helpers (key-based remount on param change) ─────────────────────
function ProjectDetailsRoute() {
  const { id } = useParams()
  return <ProjectDetails key={id} />
}

function EditProjectRoute() {
  const { id } = useParams()
  return <EditProject key={id} />
}

function ProjectApplicationsRoute() {
  const { id } = useParams()
  return <ProjectApplications key={id} />
}

// ─── Error Boundary ────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-red-500 p-8">
          <div className="bg-slate-800 p-6 rounded-xl border border-red-900 max-w-2xl w-full">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <pre className="text-xs whitespace-pre-wrap">{this.state.error?.toString()}</pre>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ─── App ───────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public / Auth — static, load immediately */}
          <Route path="/"                        element={<LandingPage />} />
          <Route path="/login"                   element={<Login />} />
          <Route path="/register"                element={<Register />} />
          <Route path="/forgot-password"         element={<ForgotPassword />} />
          <Route path="/auth/email/verify/:token" element={<EmailVerify />} />
          <Route path="/reset-password"          element={<ResetPassword />} />
          <Route path="/reset-password/:token"   element={<ResetPassword />} />

          {/* ── Onboarding Stage Gates ─────────────────────────────────── */}
          {/* Stage 1 — public: handles ?token= auto-verify OR check-inbox gate */}
          <Route path="/verify-email" element={<VerifyEmailGate />} />
          {/* Stage 2: email verified but role is still 'guest' */}
          <Route
            path="/verify-identity"
            element={
              <StageRoute forStage="guest">
                <IdentityVerification />
              </StageRoute>
            }
          />

          {/* Dashboard */}
          <Route path="/home"      element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/dashboard" element={<Navigate to="/home" replace />} />

          {/* Projects */}
          <Route path="/projects"                    element={<Layout><Projects /></Layout>} />
          <Route path="/projects/create"             element={<ProtectedRoute><Layout><CreateProject /></Layout></ProtectedRoute>} />
          <Route path="/projects/:id/edit"           element={<Layout><EditProjectRoute /></Layout>} />
          <Route path="/projects/:id"                element={<Layout><ProjectDetailsRoute /></Layout>} />
          <Route path="/projects/:id/applications"   element={<ProtectedRoute><Layout><ProjectApplicationsRoute /></Layout></ProtectedRoute>} />
          <Route path="/my-projects"                 element={<ProtectedRoute><Layout><MyProjects /></Layout></ProtectedRoute>} />

          {/* Profile */}
          <Route path="/profile"      element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
          <Route path="/profile/edit" element={<ProtectedRoute><Layout><EditProfile /></Layout></ProtectedRoute>} />

          {/* Applications */}
          <Route path="/applications/mine" element={<ProtectedRoute><Layout><MyApplications /></Layout></ProtectedRoute>} />

          {/* Network */}
          <Route path="/discover"     element={<ProtectedRoute><Layout><DiscoverPeople /></Layout></ProtectedRoute>} />
          <Route path="/users/:id"    element={<ProtectedRoute><Layout><PublicProfile /></Layout></ProtectedRoute>} />
          <Route path="/connections"  element={<ProtectedRoute><Layout><Connections /></Layout></ProtectedRoute>} />
          <Route path="/invitations"  element={<ProtectedRoute><Layout><Invitations /></Layout></ProtectedRoute>} />

          {/* Messaging */}
          <Route path="/messages"     element={<ProtectedRoute><Layout><Messaging /></Layout></ProtectedRoute>} />
          <Route path="/messages/:id" element={<ProtectedRoute><Layout><Conversation /></Layout></ProtectedRoute>} />

          {/* Misc */}
          <Route path="/verification"   element={<ProtectedRoute><Layout><IdentityVerification /></Layout></ProtectedRoute>} />
          <Route path="/notifications"  element={<ProtectedRoute><Layout><Notifications /></Layout></ProtectedRoute>} />

          {/* Reports */}
          <Route path="/reports"         element={<ProtectedRoute><Layout><MyReports /></Layout></ProtectedRoute>} />
          <Route path="/reports/submit"  element={<ProtectedRoute><Layout><SubmitReport /></Layout></ProtectedRoute>} />
          <Route path="/reports/:id"     element={<ProtectedRoute><Layout><ReportDetail /></Layout></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin/verifications"        element={<ProtectedRoute><Layout><AdminVerifications /></Layout></ProtectedRoute>} />
          <Route path="/admin/verifications/:id"    element={<ProtectedRoute><Layout><AdminVerificationDetail /></Layout></ProtectedRoute>} />
          <Route path="/admin/reports"              element={<ProtectedRoute><Layout><AdminReports /></Layout></ProtectedRoute>} />
          <Route path="/admin/reports/:id"          element={<ProtectedRoute><Layout><AdminReportDetail /></Layout></ProtectedRoute>} />
          <Route path="/admin/moderation"           element={<ProtectedRoute><Layout><AdminModeration /></Layout></ProtectedRoute>} />
          <Route path="/admin/moderation/log"       element={<ProtectedRoute><Layout><AdminModerationLog /></Layout></ProtectedRoute>} />
          <Route path="/admin/restrictions"         element={<ProtectedRoute><Layout><AdminRestrictions /></Layout></ProtectedRoute>} />
          <Route path="/admin/restrictions/:id"     element={<ProtectedRoute><Layout><AdminRestrictionDetail /></Layout></ProtectedRoute>} />
          <Route path="/admin/restrict-user"        element={<ProtectedRoute><Layout><AdminRestrictUser /></Layout></ProtectedRoute>} />
          <Route path="/admin/users"                element={<ProtectedRoute><Layout><AdminUsers /></Layout></ProtectedRoute>} />
          <Route path="/admin/users/:id"            element={<ProtectedRoute><Layout><AdminUserDetail /></Layout></ProtectedRoute>} />
          <Route path="/admin/settings"             element={<ProtectedRoute><Layout><AdminSettings /></Layout></ProtectedRoute>} />
          <Route path="/admin/settings/:key"        element={<ProtectedRoute><Layout><AdminSettingDetail /></Layout></ProtectedRoute>} />
          <Route path="/admin/action-logs"          element={<ProtectedRoute><Layout><AdminActionLogs /></Layout></ProtectedRoute>} />
          <Route path="/admin/action-logs/:id"      element={<ProtectedRoute><Layout><AdminActionLogDetail /></Layout></ProtectedRoute>} />
          <Route path="/admin/system-logs"          element={<ProtectedRoute><Layout><AdminSystemLogs /></Layout></ProtectedRoute>} />
          <Route path="/admin/system-logs/:id"      element={<ProtectedRoute><Layout><AdminSystemLogDetail /></Layout></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
