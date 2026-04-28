'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getPuzzles, getPuzzleProgress } from '@/lib/supabase/queries'
import type { PuzzleWithStatus, PuzzleProgress } from '@/lib/supabase/queries'
import type { InterviewCategory } from '@/lib/supabase/types'

export type CategoryFilter = InterviewCategory | 'all'

const EMPTY_PROGRESS: PuzzleProgress = {
  algorithm: { solved: 0, total: 0 },
  system_design: { solved: 0, total: 0 },
  debugging: { solved: 0, total: 0 },
  behavioral: { solved: 0, total: 0 },
}

export function usePuzzles(userId: string | undefined) {
  const supabase = useMemo(() => createClient(), [])
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [puzzles, setPuzzles] = useState<PuzzleWithStatus[]>([])
  const [progress, setProgress] = useState<PuzzleProgress>(EMPTY_PROGRESS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }
    setLoading(true)

    Promise.all([getPuzzles(supabase, userId, category), getPuzzleProgress(supabase, userId)])
      .then(([puzzleList, prog]) => {
        setPuzzles(puzzleList)
        setProgress(prog)
      })
      .catch(() => {
        setPuzzles([])
      })
      .finally(() => setLoading(false))
  }, [supabase, userId, category])

  const readinessPct = (() => {
    const cats = Object.values(progress)
    const total = cats.reduce((s, c) => s + c.total, 0)
    const solved = cats.reduce((s, c) => s + c.solved, 0)
    return total === 0 ? 0 : Math.round((solved / total) * 100)
  })()

  return { puzzles, progress, loading, category, setCategory, readinessPct }
}
