import React from 'react'
import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Register from './pages/Register'
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
      <Route path="/forgot-password" element={<ForgotPassword/>} />
      <Route path="/reset-password" element={<ResetPassword/>} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard/></Layout></ProtectedRoute>} />
      <Route path="/projects" element={<ProtectedRoute><Layout><Projects/></Layout></ProtectedRoute>} />
      <Route path="/projects/create" element={<ProtectedRoute><Layout><CreateProject/></Layout></ProtectedRoute>} />
      <Route path="/projects/:id/edit" element={<ProtectedRoute><Layout><EditProjectRoute/></Layout></ProtectedRoute>} />
      <Route path="/projects/:id" element={<ProtectedRoute><Layout><ProjectDetailsRoute/></Layout></ProtectedRoute>} />
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
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
