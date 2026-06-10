import React from 'react'

export default function SkeletonCard(){
  return (
    <div className="animate-pulse bg-[var(--bg-surface)] p-4 rounded shadow">
      <div className="h-6 bg-[var(--border-color)] rounded w-3/4 mb-3"></div>
      <div className="h-3 bg-[var(--border-color)] rounded w-full mb-2"></div>
      <div className="h-3 bg-[var(--border-color)] rounded w-5/6 mb-4"></div>
      <div className="flex gap-2">
        <div className="h-8 bg-[var(--border-color)] rounded w-20"></div>
        <div className="h-8 bg-[var(--border-color)] rounded w-24"></div>
      </div>
    </div>
  )
}
