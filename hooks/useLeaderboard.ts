'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getLeaderboard } from '@/lib/supabase/queries'
import type { LeaderboardEntry } from '@/lib/supabase/types'

export type LeaderboardTab = 'rapid' | 'blitz' | 'bullet' | 'puzzle'

export function useLeaderboard() {
  const supabase = useMemo(() => createClient(), [])
  const [tab, setTab] = useState<LeaderboardTab>('rapid')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getLeaderboard(supabase, tab)
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [supabase, tab])

  return { entries, loading, tab, setTab }
}
