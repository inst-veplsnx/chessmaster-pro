'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { usePuzzles, type CategoryFilter } from '@/hooks/usePuzzles'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { UpgradePrompt } from '@/components/subscription/UpgradePrompt'
import type { InterviewCategory } from '@/lib/supabase/types'

const CATEGORIES: {
  key: InterviewCategory | 'all'
  label: string
  color: string
  icon: string
}[] = [
  { key: 'all', label: 'Все', color: 'bg-primary/15 text-primary', icon: '♟️' },
  { key: 'algorithm', label: 'Алгоритмы', color: 'bg-blue-500/15 text-blue-400', icon: '⚙️' },
  {
    key: 'system_design',
    label: 'System Design',
    color: 'bg-purple-500/15 text-purple-400',
    icon: '🏗️',
  },
  { key: 'debugging', label: 'Дебаггинг', color: 'bg-red-500/15 text-red-400', icon: '🐛' },
  { key: 'behavioral', label: 'Поведенческие', color: 'bg-teal-500/15 text-teal-400', icon: '🤝' },
]

const CATEGORY_LABELS: Record<InterviewCategory, string> = {
  algorithm: 'Алгоритмы',
  system_design: 'System Design',
  debugging: 'Дебаггинг',
  behavioral: 'Поведенческие',
}

function DifficultyDots({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${i < level ? 'bg-primary' : 'bg-secondary'}`}
        />
      ))}
    </div>
  )
}

function PuzzlesSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="h-14 rounded-xl bg-secondary/50" />
      ))}
    </div>
  )
}

export default function PuzzlesPage() {
  const { user, loading: authLoading } = useAuth()
  const { puzzles, progress, loading, category, setCategory, readinessPct } = usePuzzles(user?.id)
  const { isPro, puzzleLimit } = useSubscription()
  const isLoading = authLoading || loading

  const visiblePuzzles = isPro ? puzzles : puzzles.slice(0, puzzleLimit)
  const lockedCount = isPro ? 0 : Math.max(0, puzzles.length - puzzleLimit)

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">Задачи для интервью</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Алгоритмические паттерны через шахматные позиции
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{readinessPct}%</p>
          <p className="text-xs text-muted-foreground">Interview Readiness</p>
        </div>
      </div>

      <Progress value={readinessPct} className="h-2" />

      {/* Category cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {CATEGORIES.filter((c) => c.key !== 'all').map(({ key, label, icon }) => {
          const cat = key as InterviewCategory
          const prog = progress[cat]
          const pct = prog.total > 0 ? Math.round((prog.solved / prog.total) * 100) : 0
          return (
            <button
              key={key}
              onClick={() => setCategory(key as CategoryFilter)}
              className={`rounded-xl border text-left p-4 transition-all ${
                category === key
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-border/60 bg-card/60 hover:bg-card'
              }`}
            >
              <span className="text-2xl">{icon}</span>
              <p className="mt-2 text-sm font-semibold">{label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{prog.total} задач</p>
              <Progress value={pct} className="mt-2 h-1" />
              <p className="mt-1 text-[10px] text-muted-foreground">{pct}% решено</p>
            </button>
          )
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 flex-wrap">
        {CATEGORIES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setCategory(key as CategoryFilter)}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
              category === key
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Puzzle list */}
      {isLoading ? (
        <PuzzlesSkeleton />
      ) : puzzles.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">Нет задач в этой категории</p>
      ) : (
        <div className="space-y-2">
          {visiblePuzzles.map(({ puzzle, solved }) => (
            <Link
              key={puzzle.id}
              href={`/puzzles/${puzzle.id}`}
              className="flex items-center gap-4 rounded-xl border border-border/60 bg-card/60 px-4 py-3 hover:bg-card transition-colors"
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  solved ? 'bg-green-500/15 text-green-400' : 'bg-secondary text-muted-foreground'
                }`}
              >
                {solved ? '✓' : <span className="text-xs">{puzzle.difficulty}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{puzzle.title}</p>
                <p className="text-xs text-muted-foreground">
                  {puzzle.interview_category ? CATEGORY_LABELS[puzzle.interview_category] : ''}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <DifficultyDots level={puzzle.difficulty} />
                {solved && (
                  <Badge
                    variant="outline"
                    className="text-[10px] text-green-400 border-green-500/30"
                  >
                    Решено
                  </Badge>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          ))}

          {lockedCount > 0 && (
            <UpgradePrompt feature="puzzles" variant="banner" lockedCount={lockedCount} />
          )}
        </div>
      )}
    </div>
  )
}
