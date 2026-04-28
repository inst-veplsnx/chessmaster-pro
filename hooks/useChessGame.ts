'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { GameState, Move } from '@/lib/engine'
import { moveToSAN } from '@/lib/engine/pgn'
import { GameResult, PieceType } from '@/lib/engine/types'
import { TIME_CONTROLS, TimeControl } from '@/components/chess/ChessTimer'
import { useSound } from './useSound'

interface ChessGameState {
  gameState: GameState
  sanHistory: string[]
  fenHistory: string[]
  timeWhite: number
  timeBlack: number
  timeControl: TimeControl
  capturedByWhite: PieceType[]
  capturedByBlack: PieceType[]
  isStarted: boolean
}

export function useChessGame(initialTimeControl: TimeControl = TIME_CONTROLS.rapid) {
  const [forcedResult, setForcedResult] = useState<GameResult | null>(null)
  const [state, setState] = useState<ChessGameState>(() => {
    const init = GameState.initial()
    return {
      gameState: init,
      sanHistory: [],
      fenHistory: [init.toFEN()],
      timeWhite: initialTimeControl.initial,
      timeBlack: initialTimeControl.initial,
      timeControl: initialTimeControl,
      capturedByWhite: [],
      capturedByBlack: [],
      isStarted: false,
    }
  })

  const { playMove, playCapture, playCheck, playGameEnd } = useSound()

  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    const id = setInterval(() => {
      const s = stateRef.current
      if (!s.isStarted) return

      const result = s.gameState.getResult()
      const isOver =
        result.status === 'checkmate' ||
        result.status === 'stalemate' ||
        result.status === 'draw' ||
        s.timeWhite <= 0 ||
        s.timeBlack <= 0
      if (isOver) return

      setState((prev) => {
        if (prev.gameState.turn === 'white') {
          return { ...prev, timeWhite: Math.max(0, prev.timeWhite - 100) }
        } else {
          return { ...prev, timeBlack: Math.max(0, prev.timeBlack - 100) }
        }
      })
    }, 100)

    return () => clearInterval(id)
  }, [])

  const handleMove = useCallback(
    (move: Move) => {
      setState((prev) => {
        const san = moveToSAN(prev.gameState, move)
        const newGameState = prev.gameState.makeMove(move)
        const result = newGameState.getResult()

        const capturedByWhite = [...prev.capturedByWhite]
        const capturedByBlack = [...prev.capturedByBlack]
        if (move.capturedPiece) {
          if (prev.gameState.turn === 'white') {
            capturedByWhite.push(move.capturedPiece)
          } else {
            capturedByBlack.push(move.capturedPiece)
          }
        }

        let timeWhite = prev.timeWhite
        let timeBlack = prev.timeBlack
        if (prev.isStarted) {
          if (prev.gameState.turn === 'white') {
            timeWhite += prev.timeControl.increment
          } else {
            timeBlack += prev.timeControl.increment
          }
        }

        if (
          result.status === 'checkmate' ||
          result.status === 'stalemate' ||
          result.status === 'draw'
        ) {
          playGameEnd()
        } else if (result.status === 'check') {
          playCheck()
        } else if (move.capturedPiece) {
          playCapture()
        } else {
          playMove()
        }

        const newFenHistory = [...prev.fenHistory, newGameState.toFEN()]

        const newResult = newGameState.getResult()
        if (
          newResult.status === 'checkmate' ||
          newResult.status === 'stalemate' ||
          newResult.status === 'draw'
        ) {
          try {
            localStorage.setItem(
              'lastGame',
              JSON.stringify({ sanHistory: [...prev.sanHistory, san], fenHistory: newFenHistory })
            )
          } catch {
            /* quota exceeded */
          }
        }

        return {
          ...prev,
          gameState: newGameState,
          sanHistory: [...prev.sanHistory, san],
          fenHistory: newFenHistory,
          capturedByWhite,
          capturedByBlack,
          timeWhite,
          timeBlack,
          isStarted: true,
        }
      })
    },
    [playMove, playCapture, playCheck, playGameEnd]
  )

  const saveGameForAnalysis = useCallback(() => {
    const { sanHistory, fenHistory } = stateRef.current
    if (sanHistory.length === 0) return
    try {
      localStorage.setItem('lastGame', JSON.stringify({ sanHistory, fenHistory }))
    } catch {}
  }, [])

  const handleTimeout = useCallback(
    (color: 'white' | 'black') => {
      playGameEnd()
      saveGameForAnalysis()
      setState((prev) => ({
        ...prev,
        [color === 'white' ? 'timeWhite' : 'timeBlack']: 0,
      }))
    },
    [playGameEnd, saveGameForAnalysis]
  )

  const resign = useCallback(
    (color?: 'white' | 'black') => {
      const resignColor = color ?? stateRef.current.gameState.turn
      setForcedResult({
        status: 'checkmate',
        winner: resignColor === 'white' ? 'black' : 'white',
        drawReason: null,
      })
      playGameEnd()
      saveGameForAnalysis()
    },
    [playGameEnd, saveGameForAnalysis]
  )

  const declareDraw = useCallback(() => {
    setForcedResult({ status: 'draw', winner: null, drawReason: null })
    playGameEnd()
    saveGameForAnalysis()
  }, [playGameEnd, saveGameForAnalysis])

  const resetGame = useCallback((timeControl?: TimeControl) => {
    const tc = timeControl ?? stateRef.current.timeControl
    const init = GameState.initial()
    setForcedResult(null)
    setState({
      gameState: init,
      sanHistory: [],
      fenHistory: [init.toFEN()],
      timeWhite: tc.initial,
      timeBlack: tc.initial,
      timeControl: tc,
      capturedByWhite: [],
      capturedByBlack: [],
      isStarted: false,
    })
  }, [])

  const engineResult = state.gameState.getResult()
  const result = forcedResult ?? engineResult
  const isGameOver =
    result.status === 'checkmate' ||
    result.status === 'stalemate' ||
    result.status === 'draw' ||
    state.timeWhite <= 0 ||
    state.timeBlack <= 0

  return {
    gameState: state.gameState,
    sanHistory: state.sanHistory,
    fenHistory: state.fenHistory,
    timeWhite: state.timeWhite,
    timeBlack: state.timeBlack,
    timeControl: state.timeControl,
    capturedByWhite: state.capturedByWhite,
    capturedByBlack: state.capturedByBlack,
    isStarted: state.isStarted,
    isGameOver,
    result,
    handleMove,
    handleTimeout,
    resetGame,
    resign,
    declareDraw,
  }
}
