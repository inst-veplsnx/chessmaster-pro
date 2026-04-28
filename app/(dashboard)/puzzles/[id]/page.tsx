'use client'

import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChessBoard } from '@/components/chess/ChessBoard'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { getPuzzleById, markPuzzleSolved } from '@/lib/supabase/queries'
import { GameState, moveToSAN } from '@/lib/engine'
import type { Puzzle, UserPuzzleStat } from '@/lib/supabase/types'
import type { Move } from '@/lib/engine'

interface Props {
  params: { id: string }
}

const CATEGORY_LABELS: Record<string, string> = {
  algorithm: 'Алгоритмы',
  system_design: 'System Design',
  debugging: 'Дебаггинг',
  behavioral: 'Поведенческие',
}

function DifficultyStars({ level }: { level: number }) {
  return (
    <span className="font-mono text-[#ce9178]">
      {'★'.repeat(level)}
      {'☆'.repeat(5 - level)}
    </span>
  )
}

function findMoveBySAN(state: GameState, san: string): Move | null {
  return state.getLegalMoves().find((m) => moveToSAN(state, m) === san) ?? null
}

function useTimer(totalSeconds: number, active: boolean) {
  const [remaining, setRemaining] = useState(totalSeconds)

  useEffect(() => {
    setRemaining(totalSeconds)
  }, [totalSeconds])

  useEffect(() => {
    if (!active || remaining <= 0) return
    const id = setInterval(() => setRemaining((r) => r - 1), 1000)
    return () => clearInterval(id)
  }, [active, remaining])

  const pct = totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 0
  const expired = remaining <= 0

  return { remaining, pct, expired }
}

export default function PuzzlePage({ params }: Props) {
  const { id } = params
  const { user } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [stat, setStat] = useState<UserPuzzleStat | null>(null)
  const [loading, setLoading] = useState(true)

  // Puzzle solving state
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [solutionStep, setSolutionStep] = useState(0)
  const [status, setStatus] = useState<
    'idle' | 'solving' | 'solved' | 'wrong' | 'expired' | 'opponent'
  >('idle')
  const [showExplanation, setShowExplanation] = useState(false)
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    if (!user) return
    getPuzzleById(supabase, id, user.id)
      .then(({ puzzle: p, stat: s }) => {
        setPuzzle(p)
        setStat(s)
        if (p) {
          setGameState(GameState.fromFEN(p.fen))
          // Already solved — show explanation immediately
          if (s?.solved) {
            setStatus('solved')
            setShowExplanation(true)
          } else {
            setStatus('solving')
            startTimeRef.current = Date.now()
          }
        }
      })
      .finally(() => setLoading(false))
  }, [supabase, id, user])

  const totalSeconds = puzzle ? puzzle.difficulty * 60 : 60
  const { remaining, pct, expired } = useTimer(totalSeconds, status === 'solving')

  useEffect(() => {
    if (expired && status === 'solving') {
      setStatus('expired')
      setShowExplanation(true)
    }
  }, [expired, status])

  const handleMove = useCallback(
    (move: Move) => {
      if (!puzzle || !gameState || status !== 'solving') return

      const expectedSan = puzzle.solution[solutionStep]
      if (!expectedSan) return

      // Compute SAN before applying the move
      const moveSan = moveToSAN(gameState, move)
      const newState = gameState.makeMove(move)

      if (moveSan === expectedSan) {
        // Correct move
        const nextStep = solutionStep + 1
        if (nextStep >= puzzle.solution.length) {
          // Puzzle complete
          setGameState(newState)
          setStatus('solved')
          setShowExplanation(true)
          const timeTaken = Date.now() - startTimeRef.current
          if (user && !stat?.solved) {
            markPuzzleSolved(supabase, user.id, puzzle.id, timeTaken).catch(() => {})
          }
        } else {
          // User's move accepted — auto-play opponent's response from solution[]
          setGameState(newState)
          setStatus('opponent')

          const opponentSan = puzzle.solution[nextStep]
          const opponentMove = findMoveBySAN(newState, opponentSan)

          setTimeout(() => {
            if (opponentMove) {
              const stateAfterOpponent = newState.makeMove(opponentMove)
              const afterStep = nextStep + 1

              if (afterStep >= puzzle.solution.length) {
                setGameState(stateAfterOpponent)
                setStatus('solved')
                setShowExplanation(true)
                const timeTaken = Date.now() - startTimeRef.current
                if (user && !stat?.solved) {
                  markPuzzleSolved(supabase, user.id, puzzle.id, timeTaken).catch(() => {})
                }
              } else {
                setGameState(stateAfterOpponent)
                setSolutionStep(afterStep)
                setStatus('solving')
              }
            } else {
              setSolutionStep(nextStep)
              setStatus('solving')
            }
          }, 500)
        }
      } else {
        // Wrong move — flash error, reset to last correct position
        setStatus('wrong')
        setTimeout(() => setStatus('solving'), 1200)
      }
    },
    [puzzle, gameState, status, solutionStep, supabase, user, stat]
  )

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 rounded-full bg-[#3c3c3c] animate-pulse" />
      </div>
    )
  }

  if (!puzzle || !gameState) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-[#1e1e1e]">
        <p className="text-[#d4d4d4]">Задача не найдена</p>
        <Button variant="outline" asChild>
          <Link href="/puzzles">← К задачам</Link>
        </Button>
      </div>
    )
  }

  // Determine board orientation from FEN (side to move)
  const fenParts = puzzle.fen.split(' ')
  const orientation = fenParts[1] === 'b' ? 'black' : 'white'

  return (
    <div className="min-h-full bg-[#1e1e1e] text-[#d4d4d4] font-mono">
      <div className="flex h-full flex-col lg:flex-row">
        {/* Left: Chess board */}
        <div className="flex flex-col items-center gap-4 p-6 lg:w-1/2">
          <div className="w-full flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="text-[#858585] hover:text-[#d4d4d4]"
              asChild
            >
              <Link href="/puzzles">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Задачи
              </Link>
            </Button>
            {status === 'solved' && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Решено
              </Badge>
            )}
            {status === 'wrong' && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                <XCircle className="h-3 w-3 mr-1" />
                Неверный ход
              </Badge>
            )}
          </div>

          <div
            className={`w-full max-w-sm transition-all ${status === 'wrong' ? 'ring-2 ring-red-500/50 rounded-lg' : status === 'solved' ? 'ring-2 ring-green-500/50 rounded-lg' : ''}`}
          >
            <ChessBoard
              gameState={gameState}
              orientation={orientation}
              interactive={status === 'solving' || status === 'wrong'}
              onMove={handleMove}
              boardTheme="classic"
            />
          </div>

          {/* Timer */}
          {status === 'solving' && (
            <div className="w-full max-w-sm space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-[#858585]">
                  <Clock className="h-3 w-3" />
                  Осталось
                </span>
                <span className={remaining <= 30 ? 'text-red-400' : 'text-[#d4d4d4]'}>
                  {formatTime(remaining)}
                </span>
              </div>
              <div className="h-1 w-full rounded-full bg-[#3c3c3c]">
                <div
                  className={`h-full rounded-full transition-all ${remaining <= 30 ? 'bg-red-500' : 'bg-[#0e639c]'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right: IDE panel */}
        <div className="flex flex-col gap-4 p-6 lg:w-1/2 lg:border-l lg:border-[#3c3c3c]">
          {/* File header */}
          <div className="flex items-center gap-2 border-b border-[#3c3c3c] pb-3">
            <span className="text-[#858585] text-xs">puzzle.ts</span>
          </div>

          {/* Code-style metadata */}
          <div className="space-y-1 text-sm">
            <p>
              <span className="text-[#6a9955]">{'// '}</span>
              <span className="text-[#6a9955]">
                Interview Puzzle —{' '}
                {CATEGORY_LABELS[puzzle.interview_category ?? ''] ?? puzzle.interview_category}
              </span>
            </p>
            <p>
              <span className="text-[#6a9955]">{'// '}</span>
              <span className="text-[#6a9955]">Difficulty: </span>
              <DifficultyStars level={puzzle.difficulty} />
            </p>
            <p>
              <span className="text-[#6a9955]">{'// '}</span>
              <span className="text-[#6a9955]">Rating: {puzzle.rating}</span>
            </p>
          </div>

          <div className="h-px bg-[#3c3c3c]" />

          {/* Title */}
          <div className="text-sm">
            <p className="text-[#9cdcfe]">const</p>
            <p className="text-xl font-bold text-[#dcdcaa] mt-1">{puzzle.title}</p>
          </div>

          {/* Explanation */}
          <div className="flex-1 rounded bg-[#252526] p-4 text-sm leading-relaxed border border-[#3c3c3c] overflow-y-auto">
            <p className="text-[#6a9955] mb-2">{'/** '}</p>
            <p className="text-[#d4d4d4] whitespace-pre-wrap">{puzzle.explanation}</p>
            <p className="text-[#6a9955] mt-2">{' */'}</p>
          </div>

          {/* Algorithm connection — shown after solve */}
          {showExplanation && puzzle.algorithm_connection && (
            <div className="rounded bg-[#0e2d0e] border border-green-800/50 p-4 text-sm space-y-2">
              <p className="text-[#6a9955] font-bold">{'// Algorithm Connection'}</p>
              <p className="text-[#d4d4d4] leading-relaxed">{puzzle.algorithm_connection}</p>
            </div>
          )}

          {/* CTA */}
          {status === 'idle' && <p className="text-[#858585] text-sm text-center">Загрузка...</p>}
          {status === 'solving' && (
            <p className="text-[#858585] text-xs text-center animate-pulse">
              {'> '} Найдите лучший ход за {orientation === 'white' ? 'белых' : 'чёрных'}
            </p>
          )}
          {status === 'opponent' && (
            <p className="text-[#858585] text-xs text-center animate-pulse">
              {'> '} Соперник отвечает...
            </p>
          )}
          {status === 'solved' && (
            <div className="space-y-2">
              <p className="text-green-400 text-sm text-center font-bold">✓ Задача решена!</p>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/puzzles">← К списку задач</Link>
              </Button>
            </div>
          )}
          {status === 'expired' && (
            <div className="space-y-2">
              <p className="text-red-400 text-sm text-center">Время вышло. Вот решение:</p>
              <p className="text-[#d4d4d4] text-sm text-center font-mono">
                {puzzle.solution.join(' ')}
              </p>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/puzzles">← К списку задач</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
