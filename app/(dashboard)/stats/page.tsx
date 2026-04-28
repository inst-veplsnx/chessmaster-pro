'use client'

import { useEffect, useState, useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts'
import { TrendingUp, BarChart2, Target, Brain } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import {
  getRatingHistory,
  getGamesByTimeControl,
  getPuzzleProgress,
  type RatingPoint,
  type TimeControlCount,
  type PuzzleProgress,
} from '@/lib/supabase/queries'

const PIE_COLORS = ['#22c55e', '#6b7280', '#ef4444']
const CATEGORY_LABELS = {
  algorithm: 'Алгоритмы',
  system_design: 'System Design',
  debugging: 'Дебаггинг',
  behavioral: 'Поведенческие',
}

function SectionSkeleton() {
  return <div className="h-48 rounded-xl bg-secondary/40 animate-pulse" />
}

export default function StatsPage() {
  const { user, profile } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const [ratingHistory, setRatingHistory] = useState<RatingPoint[]>([])
  const [timeControls, setTimeControls] = useState<TimeControlCount[]>([])
  const [puzzleProgress, setPuzzleProgress] = useState<PuzzleProgress | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    Promise.all([
      getRatingHistory(supabase, user.id),
      getGamesByTimeControl(supabase, user.id),
      getPuzzleProgress(supabase, user.id),
    ])
      .then(([history, tc, progress]) => {
        setRatingHistory(history)
        setTimeControls(tc)
        setPuzzleProgress(progress)
      })
      .finally(() => setLoading(false))
  }, [supabase, user])

  const pieData = profile
    ? [
        { name: 'Победы', value: profile.games_won },
        { name: 'Ничьи', value: profile.games_drawn },
        { name: 'Поражения', value: profile.games_lost },
      ].filter((d) => d.value > 0)
    : []

  const readinessPct = puzzleProgress
    ? (() => {
        const cats = Object.values(puzzleProgress)
        const total = cats.reduce((s, c) => s + c.total, 0)
        const solved = cats.reduce((s, c) => s + c.solved, 0)
        return total === 0 ? 0 : Math.round((solved / total) * 100)
      })()
    : 0

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">Статистика</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ваш прогресс и аналитика</p>
        </div>
        <BarChart2 className="h-6 w-6 text-muted-foreground" />
      </div>

      {/* Rating history */}
      <Card className="border-border/60 bg-card/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            История рейтинга
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <SectionSkeleton />
          ) : ratingHistory.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Сыграйте несколько рейтинговых партий
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={ratingHistory}>
                <defs>
                  <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(v: any) => [v, 'Рейтинг'] as any}
                />
                <Area
                  type="monotone"
                  dataKey="rating"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#ratingGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Win/Loss/Draw pie */}
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Победы / Ничьи / Поражения
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading || !profile ? (
              <SectionSkeleton />
            ) : profile.games_played === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">Нет партий</p>
            ) : (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Победы', value: profile.games_won, color: 'bg-green-500' },
                    { label: 'Ничьи', value: profile.games_drawn, color: 'bg-gray-500' },
                    { label: 'Поражения', value: profile.games_lost, color: 'bg-red-500' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-bold ml-auto">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Games by time control */}
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              По контролю времени
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <SectionSkeleton />
            ) : timeControls.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">Нет партий</p>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={timeControls} barSize={32}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="time_control"
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    tickLine={false}
                    axisLine={false}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    formatter={(v: any) => [v, 'Партий'] as any}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Interview readiness */}
      <Card className="border-border/60 bg-card/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Interview Readiness
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading || !puzzleProgress ? (
            <SectionSkeleton />
          ) : (
            <>
              <div className="flex items-center gap-4">
                <span className="text-5xl font-bold text-primary">{readinessPct}%</span>
                <div>
                  <p className="text-sm font-medium">Готовность к интервью</p>
                  <p className="text-xs text-muted-foreground">
                    {Object.values(puzzleProgress).reduce((s, c) => s + c.solved, 0)} из{' '}
                    {Object.values(puzzleProgress).reduce((s, c) => s + c.total, 0)} задач решено
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {(
                  Object.entries(puzzleProgress) as [
                    keyof typeof CATEGORY_LABELS,
                    { solved: number; total: number },
                  ][]
                ).map(([cat, { solved, total }]) => {
                  const pct = total > 0 ? Math.round((solved / total) * 100) : 0
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{CATEGORY_LABELS[cat]}</span>
                        <span className="text-muted-foreground">
                          {solved}/{total}
                        </span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
