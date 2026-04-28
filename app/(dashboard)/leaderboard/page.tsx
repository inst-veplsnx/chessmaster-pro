'use client'

import { Trophy, Crown, Medal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { useAuth } from '@/hooks/useAuth'
import type { LeaderboardTab } from '@/hooks/useLeaderboard'

const TABS: { key: LeaderboardTab; label: string }[] = [
  { key: 'rapid', label: 'Рапид' },
  { key: 'blitz', label: 'Блиц' },
  { key: 'bullet', label: 'Пуля' },
  { key: 'puzzle', label: 'Задачи' },
]

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />
  if (rank === 2) return <Medal className="h-4 w-4 text-slate-300" />
  if (rank === 3) return <Medal className="h-4 w-4 text-amber-600" />
  return <span className="text-sm font-mono text-muted-foreground">{rank}</span>
}

function PodiumSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-2xl border border-border/60 p-4 text-center animate-pulse">
          <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-secondary" />
          <div className="h-4 w-16 mx-auto rounded bg-secondary mt-1" />
          <div className="h-6 w-12 mx-auto rounded bg-secondary mt-1" />
        </div>
      ))}
    </div>
  )
}

export default function LeaderboardPage() {
  const { entries, loading, tab, setTab } = useLeaderboard()
  const { profile: myProfile } = useAuth()

  const top3 = entries.slice(0, 3)

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">Таблица лидеров</h1>
          <p className="mt-1 text-sm text-muted-foreground">Топ игроков по рейтингу Эло</p>
        </div>
        <Trophy className="h-6 w-6 text-yellow-400" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-border/60 bg-card/60 p-1">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === key
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      {loading ? (
        <PodiumSkeleton />
      ) : top3.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {top3.map((p, i) => (
            <div
              key={p.username}
              className={`rounded-2xl border p-4 text-center ${
                i === 0
                  ? 'border-yellow-500/30 bg-yellow-500/5'
                  : i === 1
                    ? 'border-slate-400/30 bg-slate-400/5'
                    : 'border-amber-700/30 bg-amber-700/5'
              }`}
            >
              <Avatar className="mx-auto mb-2 h-12 w-12">
                {p.avatar_url && <AvatarImage src={p.avatar_url} />}
                <AvatarFallback className="bg-secondary text-sm font-bold">
                  {p.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <RankBadge rank={p.rank} />
              <p className="mt-1 text-sm font-semibold truncate">{p.display_name ?? p.username}</p>
              <p className="text-lg font-bold text-primary">{p.rating}</p>
              <p className="text-xs text-muted-foreground">{p.games_played} партий</p>
            </div>
          ))}
        </div>
      ) : null}

      {/* Full table */}
      {!loading && entries.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/60">
          <div className="border-b border-border/60 px-4 py-3">
            <div className="grid grid-cols-12 gap-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              <span className="col-span-1 text-center">#</span>
              <span className="col-span-6">Игрок</span>
              <span className="col-span-2 text-right">Рейтинг</span>
              <span className="col-span-3 text-right">Партий</span>
            </div>
          </div>
          <div className="divide-y divide-border/40">
            {entries.map((p) => {
              const isMe = myProfile?.username === p.username
              return (
                <div
                  key={p.username}
                  className={`grid grid-cols-12 items-center gap-2 px-4 py-3 transition-colors ${
                    isMe ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-secondary/30'
                  }`}
                >
                  <div className="col-span-1 flex justify-center">
                    <RankBadge rank={p.rank} />
                  </div>
                  <div className="col-span-6 flex items-center gap-2.5">
                    <Avatar className="h-8 w-8 shrink-0">
                      {p.avatar_url && <AvatarImage src={p.avatar_url} />}
                      <AvatarFallback className="bg-secondary text-xs font-bold">
                        {p.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {p.display_name ?? p.username}
                        {isMe && (
                          <Badge
                            variant="outline"
                            className="ml-2 text-[9px] border-primary/40 text-primary"
                          >
                            Вы
                          </Badge>
                        )}
                      </p>
                      <p className="text-[10px] text-muted-foreground">@{p.username}</p>
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="font-mono text-sm font-bold">{p.rating}</span>
                  </div>
                  <div className="col-span-3 text-right">
                    <span className="font-mono text-sm text-muted-foreground">
                      {p.games_played}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center">
          <Trophy className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
          <p className="font-semibold">Пока нет игроков</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Сыграйте несколько партий, чтобы попасть в рейтинг
          </p>
        </div>
      )}
    </div>
  )
}
