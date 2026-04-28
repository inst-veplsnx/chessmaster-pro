'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function ProfilePage() {
  const { profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && profile?.username) {
      router.replace(`/profile/${profile.username}`)
    }
  }, [loading, profile, router])

  return (
    <div className="flex items-center justify-center h-full">
      <div className="h-8 w-8 rounded-full bg-secondary animate-pulse" />
    </div>
  )
}
