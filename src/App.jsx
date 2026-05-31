import React from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Register from './pages/Register'
import EmailVerify from './pages/EmailVerify'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import DiscoverPeople from './pages/DiscoverPeople'
import PublicProfile from './pages/PublicProfile'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Profile from './pages/Profile'
import EditProfile from './pages/EditProfile'
import Projects from './pages/Projects'
import ProjectDetails from './pages/ProjectDetails'
import MyProjects from './pages/MyProjects'
import CreateProject from './pages/CreateProject'
import EditProject from './pages/EditProject'
import MyApplications from './pages/MyApplications'
import ProjectApplications from './pages/ProjectApplications'
import Connections from './pages/Connections'
import Invitations from './pages/Invitations'
import IdentityVerification from './pages/IdentityVerification'
import Notifications from './pages/Notifications'
import Messaging from './pages/Messaging'
import Conversation from './pages/Conversation'
import AdminVerifications from './pages/AdminVerifications'
import AdminVerificationDetail from './pages/AdminVerificationDetail'
import AdminReports from './pages/AdminReports'
import AdminReportDetail from './pages/AdminReportDetail'
import AdminModeration from './pages/AdminModeration'
import AdminModerationLog from './pages/AdminModerationLog'
import AdminRestrictions from './pages/AdminRestrictions'
import AdminRestrictionDetail from './pages/AdminRestrictionDetail'
import AdminRestrictUser from './pages/AdminRestrictUser'
import AdminUsers from './pages/AdminUsers'
import AdminUserDetail from './pages/AdminUserDetail'
import AdminSettings from './pages/AdminSettings'
import AdminSettingDetail from './pages/AdminSettingDetail'
import AdminActionLogs from './pages/AdminActionLogs'
import AdminActionLogDetail from './pages/AdminActionLogDetail'
import AdminSystemLogs from './pages/AdminSystemLogs'
import AdminSystemLogDetail from './pages/AdminSystemLogDetail'

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

export default function App(){
  return (
    <Routes>
      <Route path="/login" element={<Login/>} />
      <Route path="/register" element={<Register/>} />
      <Route path="/auth/email/verify/:token" element={<EmailVerify/>} />
      <Route path="/forgot-password" element={<ForgotPassword/>} />
      <Route path="/reset-password" element={<ResetPassword/>} />
      <Route path="/reset-password/:token" element={<ResetPassword/>} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard/></Layout></ProtectedRoute>} />
      <Route path="/projects" element={<Layout><Projects/></Layout>} />
      <Route path="/projects/create" element={<ProtectedRoute><Layout><CreateProject/></Layout></ProtectedRoute>} />
      <Route path="/projects/:id/edit" element={<Layout><EditProjectRoute/></Layout>} />
      <Route path="/projects/:id" element={<Layout><ProjectDetailsRoute/></Layout>} />
      <Route path="/projects/:id/applications" element={<ProtectedRoute><Layout><ProjectApplicationsRoute/></Layout></ProtectedRoute>} />
      <Route path="/my-projects" element={<ProtectedRoute><Layout><MyProjects/></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><Profile/></Layout></ProtectedRoute>} />
      <Route path="/profile/edit" element={<ProtectedRoute><Layout><EditProfile/></Layout></ProtectedRoute>} />
      <Route path="/applications/mine" element={<ProtectedRoute><Layout><MyApplications/></Layout></ProtectedRoute>} />
      <Route path="/discover" element={<ProtectedRoute><Layout><DiscoverPeople/></Layout></ProtectedRoute>} />
      <Route path="/users/:id" element={<ProtectedRoute><Layout><PublicProfile/></Layout></ProtectedRoute>} />
      <Route path="/connections" element={<ProtectedRoute><Layout><Connections/></Layout></ProtectedRoute>} />
      <Route path="/invitations" element={<ProtectedRoute><Layout><Invitations/></Layout></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><Layout><Messaging/></Layout></ProtectedRoute>} />
      <Route path="/messages/:id" element={<ProtectedRoute><Layout><Conversation/></Layout></ProtectedRoute>} />
      <Route path="/verification" element={<ProtectedRoute><Layout><IdentityVerification/></Layout></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Layout><Notifications/></Layout></ProtectedRoute>} />
      <Route path="/admin/verifications" element={<ProtectedRoute><Layout><AdminVerifications/></Layout></ProtectedRoute>} />
      <Route path="/admin/verifications/:id" element={<ProtectedRoute><Layout><AdminVerificationDetail/></Layout></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute><Layout><AdminReports/></Layout></ProtectedRoute>} />
      <Route path="/admin/reports/:id" element={<ProtectedRoute><Layout><AdminReportDetail/></Layout></ProtectedRoute>} />
      <Route path="/admin/moderation" element={<ProtectedRoute><Layout><AdminModeration/></Layout></ProtectedRoute>} />
      <Route path="/admin/moderation/log" element={<ProtectedRoute><Layout><AdminModerationLog/></Layout></ProtectedRoute>} />
      <Route path="/admin/restrictions" element={<ProtectedRoute><Layout><AdminRestrictions/></Layout></ProtectedRoute>} />
      <Route path="/admin/restrictions/:id" element={<ProtectedRoute><Layout><AdminRestrictionDetail/></Layout></ProtectedRoute>} />
      <Route path="/admin/restrict-user" element={<ProtectedRoute><Layout><AdminRestrictUser/></Layout></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute><Layout><AdminUsers/></Layout></ProtectedRoute>} />
      <Route path="/admin/users/:id" element={<ProtectedRoute><Layout><AdminUserDetail/></Layout></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute><Layout><AdminSettings/></Layout></ProtectedRoute>} />
      <Route path="/admin/settings/:key" element={<ProtectedRoute><Layout><AdminSettingDetail/></Layout></ProtectedRoute>} />
      <Route path="/admin/action-logs" element={<ProtectedRoute><Layout><AdminActionLogs/></Layout></ProtectedRoute>} />
      <Route path="/admin/action-logs/:id" element={<ProtectedRoute><Layout><AdminActionLogDetail/></Layout></ProtectedRoute>} />
      <Route path="/admin/system-logs" element={<ProtectedRoute><Layout><AdminSystemLogs/></Layout></ProtectedRoute>} />
      <Route path="/admin/system-logs/:id" element={<ProtectedRoute><Layout><AdminSystemLogDetail/></Layout></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
