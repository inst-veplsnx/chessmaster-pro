'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { GameState } from '@/lib/engine/game-state'
import { EVENTS } from '@/lib/multiplayer/events'
import type { Move } from '@/lib/engine/types'

export type Color = 'white' | 'black'

export interface PlayerMeta {
  username: string
  rating: number
}

export interface Clocks {
  white: number
  black: number
}

export interface ChatMessage {
  from: string
  text: string
  timestamp: number
}

export interface GameResult {
  status: string
  winner: Color | null
  drawReason: string | null
}

type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error'

interface MultiplayerState {
  connectionStatus: ConnectionStatus
  isSearching: boolean
  gameId: string | null
  gameState: GameState | null
  myColor: Color | null
  white: PlayerMeta | null
  black: PlayerMeta | null
  clocks: Clocks
  gameResult: GameResult | null
  drawOffered: boolean
  opponentDisconnected: boolean
  disconnectSecondsLeft: number
  messages: ChatMessage[]
}

const WS_URL = process.env.NEXT_PUBLIC_WS_SERVER_URL ?? 'ws://localhost:3001'

function indexToSquare(idx: number): string {
  const file = String.fromCharCode(97 + (idx % 8))
  const rank = Math.floor(idx / 8) + 1
  return `${file}${rank}`
}

export function useMultiplayerGame(reconnectGameId?: string) {
  const socketRef = useRef<Socket | null>(null)
  const disconnectTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const [state, setState] = useState<MultiplayerState>({
    connectionStatus: 'idle',
    isSearching: false,
    gameId: reconnectGameId ?? null,
    gameState: null,
    myColor: null,
    white: null,
    black: null,
    clocks: { white: 0, black: 0 },
    gameResult: null,
    drawOffered: false,
    opponentDisconnected: false,
    disconnectSecondsLeft: 30,
    messages: [],
  })

  const connect = useCallback(async () => {
    if (socketRef.current?.connected) return

    setState((s) => ({ ...s, connectionStatus: 'connecting' }))

    const res = await fetch('/api/auth/ws-token')
    if (!res.ok) {
      console.error('[WS] Failed to get token from server:', res.status)
      setState((s) => ({ ...s, connectionStatus: 'error' }))
      return
    }
    const { token } = (await res.json()) as { token: string }

    const socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
    })
    socketRef.current = socket

    socket.on('connect', () => {
      setState((s) => ({ ...s, connectionStatus: 'connected' }))
      if (reconnectGameId) {
        socket.emit(EVENTS.RECONNECT_GAME, { gameId: reconnectGameId })
      }
    })

    socket.on('connect_error', (err) => {
      console.error('[WS] connect_error:', err.message)
      setState((s) => ({ ...s, connectionStatus: 'error' }))
    })

    socket.on(
      EVENTS.GAME_STARTED,
      (data: {
        gameId: string
        color: Color
        white: PlayerMeta
        black: PlayerMeta
        fen: string
        clocks: Clocks
      }) => {
        setState((s) => ({
          ...s,
          isSearching: false,
          gameId: data.gameId,
          gameState: GameState.fromFEN(data.fen),
          myColor: data.color,
          white: data.white,
          black: data.black,
          clocks: data.clocks,
        }))
      }
    )

    socket.on(
      EVENTS.MOVE_MADE,
      (data: { move: { from: string; to: string }; fen: string; clocks: Clocks }) => {
        setState((s) => ({
          ...s,
          gameState: GameState.fromFEN(data.fen),
          clocks: data.clocks,
          drawOffered: false,
        }))
      }
    )

    socket.on(EVENTS.GAME_OVER, (data: { result: GameResult }) => {
      setState((s) => ({
        ...s,
        gameResult: data.result,
        drawOffered: false,
        opponentDisconnected: false,
      }))
      if (disconnectTimerRef.current) clearInterval(disconnectTimerRef.current)
    })

    socket.on(EVENTS.DRAW_OFFERED, () => {
      setState((s) => ({ ...s, drawOffered: true }))
    })

    socket.on(EVENTS.DRAW_DECLINED, () => {
      setState((s) => ({ ...s, drawOffered: false }))
    })

    socket.on(EVENTS.CHAT_RECEIVED, (msg: ChatMessage) => {
      setState((s) => ({ ...s, messages: [...s.messages, msg] }))
    })

    socket.on(EVENTS.OPPONENT_DISCONNECTED, ({ timeoutIn }: { timeoutIn: number }) => {
      const seconds = Math.floor(timeoutIn / 1000)
      setState((s) => ({
        ...s,
        opponentDisconnected: true,
        disconnectSecondsLeft: seconds,
      }))
      disconnectTimerRef.current = setInterval(() => {
        setState((s) => {
          const next = s.disconnectSecondsLeft - 1
          return { ...s, disconnectSecondsLeft: Math.max(0, next) }
        })
      }, 1000)
    })

    socket.on(EVENTS.OPPONENT_RECONNECTED, () => {
      if (disconnectTimerRef.current) clearInterval(disconnectTimerRef.current)
      setState((s) => ({ ...s, opponentDisconnected: false, disconnectSecondsLeft: 30 }))
    })

    socket.on(
      EVENTS.SYNC_STATE,
      (data: {
        fen: string
        clocks: Clocks
        gameId: string
        color?: Color
        white?: PlayerMeta
        black?: PlayerMeta
      }) => {
        setState((s) => ({
          ...s,
          gameState: GameState.fromFEN(data.fen),
          clocks: data.clocks,
          gameId: data.gameId,
          ...(data.color !== undefined ? { myColor: data.color } : {}),
          ...(data.white !== undefined ? { white: data.white } : {}),
          ...(data.black !== undefined ? { black: data.black } : {}),
        }))
      }
    )

    socket.on(EVENTS.ERROR, (err: { code: string; message: string }) => {
      console.error('[WS Error]', err.code, err.message)
    })
  }, [reconnectGameId])

  useEffect(() => {
    connect()
    return () => {
      if (disconnectTimerRef.current) clearInterval(disconnectTimerRef.current)
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [connect])

  const findGame = useCallback(
    (options: { timeControl: { initial: number; increment: number }; rated: boolean }) => {
      if (!socketRef.current?.connected) return
      setState((s) => ({ ...s, isSearching: true }))
      socketRef.current.emit(EVENTS.CREATE_GAME, options)
    },
    []
  )

  const makeMove = useCallback(
    (move: Move) => {
      if (!socketRef.current?.connected || !state.gameId) return
      const uci = {
        from: indexToSquare(move.from),
        to: indexToSquare(move.to),
        promotion: move.promotion ? move.promotion[0] : undefined,
      }
      socketRef.current.emit(EVENTS.MAKE_MOVE, { gameId: state.gameId, move: uci })
      if (state.gameState) {
        setState((s) => ({
          ...s,
          gameState: s.gameState!.makeMove(move),
        }))
      }
    },
    [state.gameId, state.gameState]
  )

  const resign = useCallback(() => {
    if (!socketRef.current?.connected || !state.gameId) return
    socketRef.current.emit(EVENTS.RESIGN, { gameId: state.gameId })
  }, [state.gameId])

  const offerDraw = useCallback(() => {
    if (!socketRef.current?.connected || !state.gameId) return
    socketRef.current.emit(EVENTS.OFFER_DRAW, { gameId: state.gameId })
  }, [state.gameId])

  const acceptDraw = useCallback(() => {
    if (!socketRef.current?.connected || !state.gameId) return
    socketRef.current.emit(EVENTS.ACCEPT_DRAW, { gameId: state.gameId })
  }, [state.gameId])

  const declineDraw = useCallback(() => {
    if (!socketRef.current?.connected || !state.gameId) return
    socketRef.current.emit(EVENTS.DECLINE_DRAW, { gameId: state.gameId })
    setState((s) => ({ ...s, drawOffered: false }))
  }, [state.gameId])

  const sendChat = useCallback(
    (text: string) => {
      if (!socketRef.current?.connected || !state.gameId || !text.trim()) return
      socketRef.current.emit(EVENTS.CHAT_MESSAGE, { gameId: state.gameId, text: text.trim() })
    },
    [state.gameId]
  )

  return {
    ...state,
    findGame,
    makeMove,
    resign,
    offerDraw,
    acceptDraw,
    declineDraw,
    sendChat,
  }
}
