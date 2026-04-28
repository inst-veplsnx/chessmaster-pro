'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import {
  Swords,
  Brain,
  Users,
  ChevronRight,
  RefreshCw,
  Clock,
  Loader2,
  BarChart3,
  Handshake,
  Trophy,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChessTimer, TIME_CONTROLS } from '@/components/chess/ChessTimer'
import { CapturedPieces } from '@/components/chess/CapturedPieces'
import { useChessGame } from '@/hooks/useChessGame'
import { useSettings } from '@/hooks/useSettings'
import { useStockfish } from '@/hooks/useStockfish'
import { DIFFICULTY_LEVELS } from '@/lib/stockfish/difficulty'
import { parseSquare } from '@/lib/engine/board'
import { cn } from '@/lib/utils'
import type { Move } from '@/lib/engine/types'

const ChessBoard = dynamic(
  () => import('@/components/chess/ChessBoard').then((m) => m.ChessBoard),
  {
    ssr: false,
    loading: () => <div className="aspect-square w-full animate-pulse rounded-xl bg-muted" />,
  }
)

type Mode = 'local' | 'ai' | 'online'
type TCKey = keyof typeof TIME_CONTROLS

const MODES = [
  { key: 'local' as Mode, icon: Swords, label: 'Против себя', desc: 'Два игрока за одним экраном' },
  {
    key: 'ai' as Mode,
    icon: Brain,
    label: 'Против AI',
    desc: 'Stockfish 18, 20 уровней',
    badge: 'Популярно',
  },
  {
    key: 'online' as Mode,
    icon: Users,
    label: 'Онлайн',
    desc: 'Живые партии',
    badge: 'Новое',
  },
]

const TC_OPTIONS: { key: TCKey; label: string; sub: string }[] = [
  { key: 'bullet', label: 'Пуля', sub: '1+0' },
  { key: 'blitz', label: 'Блиц', sub: '3+2' },
  { key: 'rapid', label: 'Рапид', sub: '10+0' },
  { key: 'classical', label: 'Классика', sub: '30+0' },
]

// AI accepts draw if position is within ±100 centipawns (balanced)
function drawAccepted(evaluation: number | null): boolean {
  if (evaluation === null) return true
  return Math.abs(evaluation) <= 100
}

// Convert UCI move string "e2e4" / "e7e8q" to Move object using legal moves
function uciToMove(legalMoves: Move[], uci: string): Move | null {
  const from = parseSquare(uci.slice(0, 2))
  const to = parseSquare(uci.slice(2, 4))
  const promoChar = uci[4]
  const promoMap: Record<string, Move['promotion']> = {
    q: 'queen',
    r: 'rook',
    b: 'bishop',
    n: 'knight',
  }
  const promotion = promoChar ? promoMap[promoChar] : undefined
  return legalMoves.find((m) => m.from === from && m.to === to && m.promotion === promotion) ?? null
}

export default function PlayPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('local')
  const [selectedTC, setSelectedTC] = useState<TCKey>('rapid')
  const [diffLevel, setDiffLevel] = useState(10)
  const [started, setStarted] = useState(false)
  const { settings } = useSettings()
  const stockfish = useStockfish()

  const game = useChessGame(TIME_CONTROLS[selectedTC])

  // AI move trigger
  useEffect(() => {
    if (mode !== 'ai' || !started) return
    const result = game.result
    const isOver =
      result.status === 'checkmate' ||
      result.status === 'stalemate' ||
      result.status === 'draw' ||
      game.timeWhite <= 0 ||
      game.timeBlack <= 0

    // AI plays as black
    if (game.gameState.turn !== 'black' || isOver || stockfish.isThinking) return

    const fen = game.gameState.toFEN()
    stockfish.getBestMove(fen, diffLevel).then((res) => {
      if (!res || res.move === '(none)' || res.move === 'none') return
      const legalMoves = game.gameState.getLegalMoves()
      const move = uciToMove(legalMoves, res.move)
      if (move) game.handleMove(move)
    })
  }, [game.gameState.turn, started, mode]) // eslint-disable-line react-hooks/exhaustive-deps

  function startGame(m: Mode, tc: TCKey, level: number) {
    if (m === 'online') {
      router.push('/play/online')
      return
    }
    setMode(m)
    setSelectedTC(tc)
    setDiffLevel(level)
    game.resetGame(TIME_CONTROLS[tc])
    setStarted(true)
  }

  if (!started) {
    return <ModeSelector onStart={startGame} />
  }

  const result = game.result
  const isOver =
    result.status === 'checkmate' ||
    result.status === 'stalemate' ||
    result.status === 'draw' ||
    game.timeWhite <= 0 ||
    game.timeBlack <= 0

  const isAiTurn = mode === 'ai' && game.gameState.turn === 'black' && !isOver
  const isInteractive = !isOver && !(mode === 'ai' && game.gameState.turn === 'black')

  return (
    <div className="flex h-full flex-col gap-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="font-mono text-xs">
            {TC_OPTIONS.find((t) => t.key === selectedTC)?.label} ·{' '}
            {TC_OPTIONS.find((t) => t.key === selectedTC)?.sub}
          </Badge>
          <Badge variant="outline" className="capitalize text-xs">
            {mode === 'local' ? 'Двое' : mode === 'ai' ? `vs AI (ур. ${diffLevel})` : 'Онлайн'}
          </Badge>
          {isAiTurn && (
            <Badge className="gap-1 text-xs bg-primary/15 text-primary border-primary/30">
              <Loader2 className="h-3 w-3 animate-spin" />
              AI думает…
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={() => setStarted(false)}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Новая партия
        </Button>
      </div>

      {/* Board area */}
      <div className="flex flex-1 flex-col items-center justify-start gap-4 overflow-auto p-4 lg:flex-row lg:items-start lg:justify-center lg:p-6">
        {/* Board column */}
        <div className="w-full max-w-[520px] space-y-2">
          <PlayerRow
            label={mode === 'ai' ? 'Stockfish' : 'Чёрные'}
            color="black"
            captured={game.capturedByWhite}
            opponentCaptured={game.capturedByBlack}
          />
          <ChessBoard
            gameState={game.gameState}
            boardTheme={settings.boardTheme}
            interactive={isInteractive}
            onMove={game.handleMove}
            showCoordinates={settings.showCoordinates}
            highlightLastMove={settings.highlightMoves}
          />
          <PlayerRow
            label={mode === 'ai' ? 'Вы (белые)' : 'Белые'}
            color="white"
            captured={game.capturedByBlack}
            opponentCaptured={game.capturedByWhite}
          />
        </div>

        {/* Side panel */}
        <div className="w-full max-w-[200px] space-y-3">
          <ChessTimer
            timeWhite={game.timeWhite}
            timeBlack={game.timeBlack}
            activeColor={isOver ? null : game.isStarted ? game.gameState.turn : null}
            onTimeout={game.handleTimeout}
          />

          {/* Resign / Draw buttons */}
          {!isOver && game.isStarted && (
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
                    Сдаться
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Сдаться?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {mode === 'ai'
                        ? 'Вы уверены, что хотите сдаться? AI победит.'
                        : `${game.gameState.turn === 'white' ? 'Белые' : 'Чёрные'} сдаются?`}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => game.resign(mode === 'ai' ? 'white' : undefined)}
                    >
                      Сдаться
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs h-8">
                    <Handshake className="h-3.5 w-3.5" />
                    Ничья
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Предложить ничью?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {mode === 'ai'
                        ? drawAccepted(stockfish.evaluation)
                          ? 'AI рассмотрит предложение…'
                          : 'AI скорее всего откажет — позиция неравная.'
                        : 'Оба игрока соглашаются на ничью?'}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        if (mode === 'ai' && !drawAccepted(stockfish.evaluation)) return
                        game.declareDraw()
                      }}
                    >
                      {mode === 'ai' && !drawAccepted(stockfish.evaluation)
                        ? 'Предложить (AI откажет)'
                        : 'Согласиться'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {/* Status */}
          <div className="rounded-xl border border-border/60 bg-card/60 p-3 text-center text-sm">
            {result.status === 'checkmate' && (
              <p className="font-semibold flex items-center justify-center gap-1.5">
                {result.winner === 'white' ? (
                  mode === 'ai' ? (
                    <>
                      <Trophy className="h-4 w-4 text-amber-400" /> Вы победили
                    </>
                  ) : (
                    <>
                      <Trophy className="h-4 w-4 text-amber-400" /> Белые побеждают
                    </>
                  )
                ) : mode === 'ai' ? (
                  'AI победил'
                ) : (
                  <>
                    <Trophy className="h-4 w-4 text-amber-400" /> Чёрные побеждают
                  </>
                )}
              </p>
            )}
            {result.status === 'stalemate' && <p className="font-semibold">Пат — ничья</p>}
            {result.status === 'draw' && (
              <p className="font-semibold">Ничья — {result.drawReason?.replace('-', ' ')}</p>
            )}
            {(game.timeWhite <= 0 || game.timeBlack <= 0) && result.status === 'playing' && (
              <p className="font-semibold text-red-400">Время вышло</p>
            )}
            {result.status === 'check' && <p className="font-semibold text-red-400">Шах!</p>}
            {result.status === 'playing' && game.timeWhite > 0 && game.timeBlack > 0 && (
              <p className="text-muted-foreground">
                {isAiTurn
                  ? 'AI думает…'
                  : `Ход ${game.gameState.turn === 'white' ? 'белых' : 'чёрных'}`}
              </p>
            )}
          </div>

          {/* Move list */}
          <div className="rounded-xl border border-border/60 bg-card/60 p-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Ходы
            </p>
            <div
              className="max-h-52 space-y-0.5 overflow-y-auto text-xs font-mono"
              ref={(el) => {
                if (el) el.scrollTop = el.scrollHeight
              }}
            >
              {game.sanHistory.length === 0 ? (
                <p className="text-muted-foreground">Пока нет ходов</p>
              ) : (
                Array.from({ length: Math.ceil(game.sanHistory.length / 2) }, (_, i) => (
                  <div key={i} className="flex gap-1.5">
                    <span className="w-5 shrink-0 text-right text-muted-foreground">{i + 1}.</span>
                    <span className="flex-1 text-foreground">{game.sanHistory[i * 2]}</span>
                    <span className="flex-1 text-foreground/80">
                      {game.sanHistory[i * 2 + 1] ?? ''}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {isOver && (
            <div className="space-y-2">
              <Button className="w-full" size="sm" onClick={() => game.resetGame()}>
                Играть снова
              </Button>
              {game.sanHistory.length >= 4 && (
                <Button
                  variant="outline"
                  className="w-full gap-1.5"
                  size="sm"
                  onClick={() => {
                    try {
                      localStorage.setItem(
                        'lastGame',
                        JSON.stringify({
                          sanHistory: game.sanHistory,
                          fenHistory: game.fenHistory,
                        })
                      )
                    } catch {}
                    router.push('/analysis')
                  }}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  Анализ партии
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PlayerRow({
  label,
  color,
  captured,
  opponentCaptured,
}: {
  label: string
  color: 'white' | 'black'
  captured: import('@/lib/engine/types').PieceType[]
  opponentCaptured: import('@/lib/engine/types').PieceType[]
}) {
  return (
    <div className="flex items-center gap-3 px-1">
      <div
        className={cn(
          'h-6 w-6 shrink-0 rounded-full border-2',
          color === 'white' ? 'bg-zinc-100 border-zinc-300' : 'bg-zinc-800 border-zinc-600'
        )}
      />
      <span className="text-sm font-medium">{label}</span>
      <div className="ml-auto">
        <CapturedPieces
          captured={captured}
          color={color}
          showAdvantage
          opponentCaptured={opponentCaptured}
        />
      </div>
    </div>
  )
}

/* ── Mode selector ──────────────────────────────────────── */
function ModeSelector({ onStart }: { onStart: (m: Mode, tc: TCKey, level: number) => void }) {
  const [mode, setMode] = useState<Mode>('local')
  const [tc, setTc] = useState<TCKey>('rapid')
  const [level, setLevel] = useState(10)

  const diff = DIFFICULTY_LEVELS[level - 1]

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Новая партия</h1>
          <p className="mt-1 text-sm text-muted-foreground">Выбери режим и контроль времени</p>
        </div>

        {/* Mode */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Режим
          </p>
          <div className="grid grid-cols-3 gap-2">
            {MODES.map(({ key, icon: Icon, label, desc, badge }) => (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={cn(
                  'relative cursor-pointer rounded-xl border p-3 text-left transition-all',
                  mode === key
                    ? 'border-primary/60 bg-primary/10'
                    : 'border-border/60 bg-card/60 hover:border-border hover:bg-card'
                )}
              >
                {badge && (
                  <span className="absolute right-2 top-2 rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                    {badge}
                  </span>
                )}
                <Icon
                  className={cn(
                    'mb-2 h-5 w-5',
                    mode === key ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                <p className="text-xs font-semibold">{label}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground leading-snug">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* AI difficulty — only show for AI mode */}
        {mode === 'ai' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Brain className="h-3 w-3" />
                Уровень сложности
              </p>
              <div className="text-right">
                <span className="text-sm font-bold text-primary">{diff.label}</span>
                <span className="ml-2 text-xs text-muted-foreground">~{diff.elo} Эло</span>
              </div>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>1 — Новичок</span>
              <span className="text-center">{diff.description}</span>
              <span>20 — Макс</span>
            </div>
          </div>
        )}

        {/* Time control */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            Контроль времени
          </p>
          <div className="grid grid-cols-4 gap-2">
            {TC_OPTIONS.map(({ key, label, sub }) => (
              <button
                key={key}
                onClick={() => setTc(key)}
                className={cn(
                  'cursor-pointer rounded-xl border p-3 text-center transition-all',
                  tc === key
                    ? 'border-primary/60 bg-primary/10 text-primary'
                    : 'border-border/60 bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground'
                )}
              >
                <p className="text-xs font-bold">{label}</p>
                <p className="mt-0.5 text-[10px] font-mono">{sub}</p>
              </button>
            ))}
          </div>
        </div>

        <Button className="w-full gap-2" size="lg" onClick={() => onStart(mode, tc, level)}>
          <Swords className="h-4 w-4" />
          Начать партию
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
