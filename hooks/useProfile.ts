'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getProfileByUsername, getGamesByUser, getActivityHeatmap } from '@/lib/supabase/queries'
import type { Game, Profile } from '@/lib/supabase/types'

const PAGE_SIZE = 10

export interface HeatmapDay {
  day: string
  count: number
}

export function useProfile(username: string) {
  const supabase = useMemo(() => createClient(), [])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [recentGames, setRecentGames] = useState<Game[]>([])
  const [heatmapData, setHeatmapData] = useState<HeatmapDay[]>([])
  const [totalGames, setTotalGames] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!username) return
    setLoading(true)
    setError(null)

    getProfileByUsername(supabase, username)
      .then(async (p) => {
        if (!p) {
          setError('Пользователь не найден')
          return
        }
        setProfile(p)

        const [{ games, count }, heatmap] = await Promise.all([
          getGamesByUser(supabase, p.id, 0, PAGE_SIZE),
          getActivityHeatmap(supabase, p.id),
        ])

        setRecentGames(games)
        setTotalGames(count)
        setHeatmapData(heatmap)
        setPage(0)
      })
      .catch(() => setError('Ошибка загрузки профиля'))
      .finally(() => setLoading(false))
  }, [supabase, username])

  const loadMoreGames = useCallback(async () => {
    if (!profile) return
    const nextPage = page + 1
    const { games } = await getGamesByUser(supabase, profile.id, nextPage, PAGE_SIZE)
    setRecentGames((prev) => [...prev, ...games])
    setPage(nextPage)
  }, [supabase, profile, page])

  const hasMoreGames = recentGames.length < totalGames

  return {
    profile,
    recentGames,
    heatmapData,
    totalGames,
    loading,
    error,
    loadMoreGames,
    hasMoreGames,
  }
}
