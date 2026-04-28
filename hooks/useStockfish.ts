'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { StockfishEngine, BestMoveResult, AnalysisLine } from '@/lib/stockfish/StockfishEngine'
import { getDifficultyLevel } from '@/lib/stockfish/difficulty'

type Status = 'idle' | 'loading' | 'ready' | 'thinking' | 'error'

export function useStockfish() {
  const engineRef = useRef<StockfishEngine | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [evaluation, setEvaluation] = useState<number | null>(null)
  const [difficultyLevel, setDifficultyLevel] = useState(10)

  const ensureInit = useCallback(async (): Promise<StockfishEngine> => {
    if (engineRef.current?.ready) return engineRef.current

    setStatus('loading')
    const engine = new StockfishEngine()
    await engine.init()
    engineRef.current = engine
    setStatus('ready')
    return engine
  }, [])

  const getBestMove = useCallback(
    async (fen: string, level?: number): Promise<BestMoveResult | null> => {
      try {
        const engine = await ensureInit()
        const diff = getDifficultyLevel(level ?? difficultyLevel)
        setStatus('thinking')

        const result = await engine.getBestMove(
          fen,
          {
            skillLevel: diff.skillLevel,
            movetime: diff.movetime,
          },
          (info: AnalysisLine) => {
            setEvaluation(info.score)
          }
        )

        setStatus('ready')
        return result
      } catch {
        setStatus('error')
        return null
      }
    },
    [ensureInit, difficultyLevel]
  )

  const analyzePosition = useCallback(
    async (
      fen: string,
      depth = 18,
      onInfo?: (line: AnalysisLine) => void
    ): Promise<BestMoveResult | null> => {
      try {
        const engine = await ensureInit()
        setStatus('thinking')
        const result = await engine.getBestMove(fen, { depth }, onInfo)
        setStatus('ready')
        return result
      } catch {
        setStatus('error')
        return null
      }
    },
    [ensureInit]
  )

  const stop = useCallback(() => {
    engineRef.current?.stop()
    setStatus('ready')
  }, [])

  useEffect(() => {
    return () => {
      engineRef.current?.destroy()
    }
  }, [])

  return {
    status,
    isThinking: status === 'thinking',
    isLoading: status === 'loading',
    evaluation,
    difficultyLevel,
    setDifficultyLevel,
    getBestMove,
    analyzePosition,
    stop,
  }
}
