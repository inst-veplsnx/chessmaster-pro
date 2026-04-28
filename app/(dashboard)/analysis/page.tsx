'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GameAnalysis } from '@/components/analysis/GameAnalysis'
import { GameState } from '@/lib/engine'
import { moveToSAN } from '@/lib/engine/pgn'

interface SavedGame {
  sanHistory: string[]
  fenHistory: string[]
}

export default function AnalysisPage() {
  const [savedGame, setSavedGame] = useState<SavedGame | null>(null)
  const [pgnInput, setPgnInput] = useState('')
  const [showPgnInput, setShowPgnInput] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('lastGame')
      if (raw) setSavedGame(JSON.parse(raw))
    } catch {
      // ignore
    }
  }, [])

  const hasGame = savedGame && savedGame.fenHistory.length > 1

  function loadPGN() {
    const sans = pgnInput
      .replace(/\d+\./g, '')
      .replace(/\{[^}]*\}/g, '')
      .replace(/\([^)]*\)/g, '')
      .trim()
      .split(/\s+/)
      .filter((t) => t && !/^\*|1-0|0-1|1\/2/.test(t))

    try {
      let state = GameState.initial()
      const fenHistory = [state.toFEN()]
      const sanHistory: string[] = []

      for (const san of sans) {
        const legal = state.getLegalMoves()
        let matched = false
        for (const move of legal) {
          if (moveToSAN(state, move) === san) {
            sanHistory.push(san)
            state = state.makeMove(move)
            fenHistory.push(state.toFEN())
            matched = true
            break
          }
        }
        if (!matched) break
      }

      const game: SavedGame = { sanHistory, fenHistory }
      setSavedGame(game)
      localStorage.setItem('lastGame', JSON.stringify(game))
      setShowPgnInput(false)
      setPgnInput('')
    } catch {
      alert('Ошибка при разборе PGN')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">Анализ партий</h1>
          <p className="mt-1 text-sm text-muted-foreground">Разбор ходов с помощью Stockfish 18</p>
        </div>
        <Button
          className="gap-2"
          size="sm"
          variant="outline"
          onClick={() => setShowPgnInput(!showPgnInput)}
        >
          <Upload className="h-4 w-4" />
          Загрузить PGN
        </Button>
      </div>

      {showPgnInput && (
        <div className="rounded-2xl border border-border/60 bg-card/60 p-4 space-y-3">
          <p className="text-sm font-semibold">Вставь PGN партии</p>
          <textarea
            className="w-full rounded-xl border border-border/60 bg-secondary/50 p-3 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            rows={6}
            placeholder="1. e4 e5 2. Nf3 Nc6 ..."
            value={pgnInput}
            onChange={(e) => setPgnInput(e.target.value)}
          />
          <Button size="sm" className="w-full" onClick={loadPGN}>
            Загрузить
          </Button>
        </div>
      )}

      {hasGame ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="font-mono text-xs">
              {savedGame.sanHistory.length} ходов
            </Badge>
            <Badge variant="outline" className="text-xs">
              Последняя партия
            </Badge>
          </div>
          <GameAnalysis sanHistory={savedGame.sanHistory} fenHistory={savedGame.fenHistory} />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center">
          <BarChart3 className="mx-auto mb-4 h-10 w-10 text-muted-foreground/30" />
          <p className="font-semibold">Нет партии для анализа</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Сыграй партию на странице{' '}
            <a href="/play" className="text-primary underline-offset-2 hover:underline">
              Играть
            </a>{' '}
            или загрузи PGN выше
          </p>
        </div>
      )}
    </div>
  )
}
