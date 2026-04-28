'use client'

import { useState, useCallback } from 'react'
import {
  BarChart3,
  Star,
  Zap,
  TrendingUp,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { EvalChart } from './EvalChart'
import { ClassifiedMove, QUALITY_STYLE, classifyMove } from '@/lib/analysis/classifier'
import { GameMetrics, calculateMetrics, getTopMistakes } from '@/lib/analysis/metrics'
import { useStockfish } from '@/hooks/useStockfish'
import { useSubscription } from '@/hooks/useSubscription'
import { parseFEN } from '@/lib/engine/fen'

interface EvalPoint {
  move: number
  eval: number
  label: string
}

interface GameAnalysisProps {
  sanHistory: string[]
  fenHistory: string[]
}

export function GameAnalysis({ sanHistory, fenHistory }: GameAnalysisProps) {
  const { analyzePosition, isLoading } = useStockfish()
  const { analysisDepth, isPro } = useSubscription()
  const [progress, setProgress] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [evalData, setEvalData] = useState<EvalPoint[]>([])
  const [classifiedMoves, setClassifiedMoves] = useState<ClassifiedMove[]>([])
  const [metrics, setMetrics] = useState<GameMetrics | null>(null)
  const [currentMoveIdx, setCurrentMoveIdx] = useState<number | null>(null)
  const [done, setDone] = useState(false)

  const runAnalysis = useCallback(async () => {
    if (sanHistory.length === 0 || fenHistory.length < 2) return
    setIsAnalyzing(true)
    setDone(false)
    setProgress(0)
    setEvalData([])
    setClassifiedMoves([])
    setMetrics(null)

    const whitePovEvals: number[] = []
    const points: EvalPoint[] = []
    const classified: ClassifiedMove[] = []

    for (let i = 0; i < fenHistory.length; i++) {
      const fen = fenHistory[i]
      const result = await analyzePosition(fen, analysisDepth)
      if (!result) break

      const state = parseFEN(fen)
      const raw = result.evaluation ?? 0
      const whitePov = state.turn === 'white' ? raw : -raw
      whitePovEvals.push(whitePov)

      const moveNum = Math.ceil(i / 2)
      points.push({
        move: i,
        eval: whitePov,
        label:
          i === 0 ? 'Начало' : `${moveNum}${i % 2 === 1 ? '.' : '...'} ${sanHistory[i - 1] ?? ''}`,
      })

      if (i > 0) {
        const prevWhitePov = whitePovEvals[i - 1]
        const san = sanHistory[i - 1]

        const whiteJustMoved = i % 2 === 1
        const cpLoss = whiteJustMoved
          ? Math.max(0, prevWhitePov - whitePov)
          : Math.max(0, whitePov - prevWhitePov)

        const quality = classifyMove(cpLoss)
        classified.push({
          san,
          uci: '',
          quality,
          cpLoss,
          evalBefore: prevWhitePov,
          evalAfter: whitePov,
          isBestMove: cpLoss <= 10,
        })
      }

      setProgress(Math.round(((i + 1) / fenHistory.length) * 100))
      setEvalData([...points])
    }

    const m = calculateMetrics(classified)
    setClassifiedMoves(classified)
    setMetrics(m)
    setIsAnalyzing(false)
    setDone(true)
  }, [sanHistory, fenHistory, analyzePosition, analysisDepth])

  const movePairs = Array.from({ length: Math.ceil(classifiedMoves.length / 2) }, (_, i) => ({
    num: i + 1,
    white: classifiedMoves[i * 2],
    black: classifiedMoves[i * 2 + 1],
  }))

  const topMistakes = metrics ? getTopMistakes(classifiedMoves) : []

  return (
    <div className="space-y-4">
      {!done && !isAnalyzing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Глубина анализа:{' '}
              <span className="font-semibold text-foreground">{analysisDepth}</span>
            </span>
            {!isPro && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="flex items-center gap-1 cursor-help text-primary">
                    <Lock className="h-3 w-3" />
                    Pro: глубина 18
                  </span>
                </TooltipTrigger>
                <TooltipContent>Перейдите на Pro для анализа с глубиной 18</TooltipContent>
              </Tooltip>
            )}
          </div>
          <Button onClick={runAnalysis} className="w-full gap-2" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BarChart3 className="h-4 w-4" />
            )}
            Запустить анализ
          </Button>
        </div>
      )}

      {isAnalyzing && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Анализ Stockfish…
            </span>
            <span className="font-mono font-semibold">{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {evalData.length > 1 && (
        <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
          <div className="mb-2 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">График оценки</span>
          </div>
          <EvalChart
            data={evalData}
            currentMove={currentMoveIdx ?? undefined}
            onMoveClick={setCurrentMoveIdx}
          />
        </div>
      )}

      {metrics && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            {
              icon: Star,
              label: 'Точность',
              value: `${metrics.accuracy}%`,
              color: 'text-green-400',
            },
            {
              icon: Zap,
              label: 'Отличных',
              value: String(metrics.great),
              color: 'text-green-400',
            },
            {
              icon: TrendingUp,
              label: 'Ошибок',
              value: String(metrics.mistakes),
              color: 'text-orange-400',
            },
            {
              icon: AlertTriangle,
              label: 'Грубых',
              value: String(metrics.blunders),
              color: 'text-red-400',
            },
          ].map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="rounded-xl border border-border/60 bg-card/60 p-3 text-center"
            >
              <Icon className={`mx-auto mb-1 h-4 w-4 ${color}`} />
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      )}

      {movePairs.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-card/60 overflow-hidden">
          <div className="border-b border-border/60 px-4 py-2.5">
            <p className="text-sm font-semibold">Разбор ходов</p>
          </div>
          <div className="divide-y divide-border/40 max-h-72 overflow-y-auto">
            {movePairs.map(({ num, white, black }) => (
              <div
                key={num}
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-secondary/20"
              >
                <span className="w-6 shrink-0 text-xs text-muted-foreground font-mono">{num}.</span>
                <MoveCell move={white} />
                {black && <MoveCell move={black} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {topMistakes.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-card/60 p-4 space-y-2">
          <p className="text-sm font-semibold">Главные ошибки</p>
          {topMistakes.map((m, i) => {
            const style = QUALITY_STYLE[m.quality]
            return (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl border border-border/40 bg-secondary/30 px-3 py-2"
              >
                <span
                  className={`rounded px-1.5 py-0.5 text-xs font-bold ${style.bg} ${style.text}`}
                >
                  {style.label}
                </span>
                <span className="font-mono text-sm font-semibold">{m.san}</span>
                <span className="text-xs text-muted-foreground ml-auto">−{m.cpLoss} п.</span>
              </div>
            )
          })}
        </div>
      )}

      {done && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentMoveIdx((i) => Math.max(0, (i ?? 0) - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground font-mono w-16 text-center">
            {currentMoveIdx !== null ? `Ход ${currentMoveIdx}` : 'Навигация'}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentMoveIdx((i) => Math.min(evalData.length - 1, (i ?? -1) + 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

function MoveCell({ move }: { move: ClassifiedMove }) {
  const style = QUALITY_STYLE[move.quality]
  return (
    <div className="flex flex-1 items-center gap-1.5">
      <span className="font-mono font-medium">{move.san}</span>
      <span className={`rounded px-1 py-0.5 text-[10px] font-bold ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    </div>
  )
}
