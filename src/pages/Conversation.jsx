import React from 'react'
import { useParams } from 'react-router-dom'

export default function Conversation(){
  const { id } = useParams()

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Conversation</h2>
      <p className="text-gray-700">Conversation ID: {id}</p>
      <p className="mt-4 text-sm text-gray-600">This conversation view is a placeholder until messaging endpoints are available in the backend spec.</p>
    </div>
  )
}