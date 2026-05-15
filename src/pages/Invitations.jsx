import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getInvitations, respondToInvitation, withdrawInvitation } from '../services/invitations'

export default function Invitations() {
  const { user } = useAuth()
  const [received, setReceived] = useState([])
  const [sent, setSent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('received')
  const [processing, setProcessing] = useState(null)

  useEffect(() => {
    loadInvitations()
  }, [])

  const loadInvitations = async () => {
    setLoading(true)
    setError(null)
    try {
      const allInvitations = await getInvitations()
      let all = Array.isArray(allInvitations) ? allInvitations : []
      
      const sentInvitations = all.filter(inv => {
          return inv.inviter?.id === user?.id || inv.sender_id === user?.id || inv.sender?.id === user?.id
      })
      const receivedInvitations = all.filter(inv => {
          return inv.inviter?.id !== user?.id && inv.sender_id !== user?.id && inv.sender?.id !== user?.id
      })

      setSent(sentInvitations)
      setReceived(receivedInvitations)
    } catch (err) {
      setError(err?.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRespond = async (id, responseType) => {
    setProcessing(id)
    try {
      await respondToInvitation(id, responseType)
      setReceived(prev => prev.filter(inv => inv.id !== id))
    } catch (err) {
      alert('Failed to respond to invitation')
    } finally {
      setProcessing(null)
    }
  }

  const handleWithdraw = async (id) => {
    if (!confirm('Withdraw this invitation?')) return
    setProcessing(id)
    try {
      await withdrawInvitation(id)
      setSent(prev => prev.filter(inv => inv.id !== id))
    } catch (err) {
      alert('Failed to withdraw invitation')
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Invitations</h1>
        <p className="text-gray-600 mt-1">Manage your project invitations</p>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'received'
              ? 'border-b-2 border-indigo-500 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Received ({received.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'sent'
              ? 'border-b-2 border-indigo-500 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Sent ({sent.length})
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {activeTab === 'received' && (
        <div>
          {received.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No received invitations</h3>
              <p className="text-gray-500">Invitations you receive will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {received.map(inv => (
                <div key={inv.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {inv.inviter?.full_name || inv.sender?.full_name || 'Someone'} invited you
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Project: <Link to={`/projects/${inv.project?.id || inv.project_id}`} className="text-indigo-600 hover:underline">{inv.project?.title || inv.project?.name || `Project ${inv.project?.id || inv.project_id}`}</Link>
                      </p>
                      <p className="text-xs text-gray-500 mt-1 capitalize">Role/Type: {(inv.invitation_type || inv.role || 'Member').replace('_', ' ')}</p>
                    </div>
                    {(inv.status === 'pending' || !inv.status) ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleRespond(inv.id, 'accepted')}
                          disabled={processing === inv.id}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                        >
                          {processing === inv.id ? '...' : '✓ Accept'}
                        </button>
                        <button
                          onClick={() => handleRespond(inv.id, 'declined')}
                          disabled={processing === inv.id}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                        >
                          {processing === inv.id ? '...' : '✕ Decline'}
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 capitalize">{inv.status}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'sent' && (
        <div>
          {sent.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📤</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sent invitations</h3>
              <p className="text-gray-500">Invitations you send will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sent.map(inv => (
                <div key={inv.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        You invited {inv.invitee?.full_name || inv.recipient?.full_name || 'someone'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Project: <Link to={`/projects/${inv.project?.id || inv.project_id}`} className="text-indigo-600 hover:underline">{inv.project?.title || inv.project?.name || `Project ${inv.project?.id || inv.project_id}`}</Link>
                      </p>
                      <p className="text-xs text-gray-500 mt-1 capitalize">Role/Type: {(inv.invitation_type || inv.role || 'Member').replace('_', ' ')}</p>
                    </div>
                    {(inv.status === 'pending' || !inv.status) ? (
                      <button
                        onClick={() => handleWithdraw(inv.id)}
                        disabled={processing === inv.id}
                        className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                      >
                        {processing === inv.id ? '...' : 'Withdraw'}
                      </button>
                    ) : (
                      <span className="text-sm text-gray-500 capitalize">{inv.status}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
