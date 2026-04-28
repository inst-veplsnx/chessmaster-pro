'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Game } from '@/lib/supabase/types'

interface GameHistoryTableProps {
  games: Game[]
  userId: string
  onLoadMore: () => void
  hasMore: boolean
}

function getResult(game: Game, userId: string): 'win' | 'loss' | 'draw' {
  if (game.result === 'draw') return 'draw'
  const isWhite = game.white_id === userId
  if (game.result === 'white') return isWhite ? 'win' : 'loss'
  if (game.result === 'black') return isWhite ? 'loss' : 'win'
  return 'draw'
}

function getRatingDelta(game: Game, userId: string): number | null {
  const isWhite = game.white_id === userId
  const before = isWhite ? game.white_rating_before : game.black_rating_before
  const after = isWhite ? game.white_rating_after : game.black_rating_after
  if (before == null || after == null) return null
  return after - before
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

const RESULT_LABELS = {
  win: { label: 'Победа', class: 'text-green-500' },
  loss: { label: 'Поражение', class: 'text-red-500' },
  draw: { label: 'Ничья', class: 'text-muted-foreground' },
}

export function GameHistoryTable({ games, userId, onLoadMore, hasMore }: GameHistoryTableProps) {
  if (games.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-6">Нет сыгранных партий</p>
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left p-3 font-medium text-muted-foreground">Результат</th>
              <th className="text-left p-3 font-medium text-muted-foreground hidden sm:table-cell">
                Дебют
              </th>
              <th className="text-left p-3 font-medium text-muted-foreground">Рейтинг Δ</th>
              <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">
                Контроль
              </th>
              <th className="text-left p-3 font-medium text-muted-foreground">Дата</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => {
              const result = getResult(game, userId)
              const delta = getRatingDelta(game, userId)
              const { label, class: cls } = RESULT_LABELS[result]

              return (
                <tr
                  key={game.id}
                  className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors"
                >
                  <td className="p-3">
                    <span className={`font-medium ${cls}`}>{label}</span>
                  </td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">
                    {game.opening_name ?? '—'}
                  </td>
                  <td className="p-3">
                    {delta == null ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <span className={delta >= 0 ? 'text-green-500' : 'text-red-500'}>
                        {delta >= 0 ? '+' : ''}
                        {delta}
                      </span>
                    )}
                  </td>
                  <td className="p-3 hidden md:table-cell">
                    <Badge variant="outline" className="text-xs font-mono">
                      {game.time_control}
                    </Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">{formatDate(game.created_at)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="text-center">
          <Button variant="outline" size="sm" onClick={onLoadMore}>
            Загрузить ещё
          </Button>
        </div>
      )}
    </div>
  )
}
