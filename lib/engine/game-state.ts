import type { Board, CastlingRights, Color, GameResult, Move, PGNMetadata, Piece } from './types'
import { INITIAL_FEN } from './constants'
import { fileOf, idx, opponent, rankOf } from './board'
import { applyMoveToBoard, generateLegalMoves, isInCheck } from './move-generator'
import { parseFEN, positionKey, serializeFEN, updateCastlingRights } from './fen'
import { moveToSAN } from './pgn'

interface GameStateParams {
  board: Board
  turn: Color
  castlingRights: CastlingRights
  enPassantSquare: number | null
  halfmoveClock: number
  fullmoveNumber: number
  history: Move[]
  positionHistory: Map<string, number>
  initialFEN: string
}

export class GameState {
  readonly board: Board
  readonly turn: Color
  readonly castlingRights: CastlingRights
  readonly enPassantSquare: number | null
  readonly halfmoveClock: number
  readonly fullmoveNumber: number
  readonly history: Move[]
  readonly positionHistory: Map<string, number>
  readonly initialFEN: string

  constructor(p: GameStateParams) {
    this.board = p.board
    this.turn = p.turn
    this.castlingRights = p.castlingRights
    this.enPassantSquare = p.enPassantSquare
    this.halfmoveClock = p.halfmoveClock
    this.fullmoveNumber = p.fullmoveNumber
    this.history = p.history
    this.positionHistory = p.positionHistory
    this.initialFEN = p.initialFEN
  }

  static initial(): GameState {
    return GameState.fromFEN(INITIAL_FEN)
  }

  static fromFEN(fen: string): GameState {
    const { board, turn, castlingRights, enPassantSquare, halfmoveClock, fullmoveNumber } =
      parseFEN(fen)

    const posHistory = new Map<string, number>()
    const key = positionKey(board, turn, castlingRights, enPassantSquare)
    posHistory.set(key, 1)

    return new GameState({
      board,
      turn,
      castlingRights,
      enPassantSquare,
      halfmoveClock,
      fullmoveNumber,
      history: [],
      positionHistory: posHistory,
      initialFEN: fen,
    })
  }

  getLegalMoves(square?: number): Move[] {
    const moves = generateLegalMoves(
      this.board,
      this.turn,
      this.enPassantSquare,
      this.castlingRights
    )
    return square !== undefined ? moves.filter((m) => m.from === square) : moves
  }

  makeMove(move: Move): GameState {
    const piece = this.board[move.from]!
    const newBoard = applyMoveToBoard(this.board, move)

    const newCastlingRights = updateCastlingRights(
      this.castlingRights,
      move.from,
      move.to,
      this.board
    )

    let newEpSquare: number | null = null
    if (piece.type === 'pawn' && Math.abs(rankOf(move.to) - rankOf(move.from)) === 2) {
      const epRank = (rankOf(move.from) + rankOf(move.to)) / 2
      newEpSquare = idx(fileOf(move.from), epRank)
    }

    const newHalfmoveClock =
      piece.type === 'pawn' || move.capturedPiece !== undefined || move.isEnPassant
        ? 0
        : this.halfmoveClock + 1

    const newFullmoveNumber = this.turn === 'black' ? this.fullmoveNumber + 1 : this.fullmoveNumber

    const newTurn = opponent(this.turn)
    const newHistory = [...this.history, move]

    const newPosHistory = new Map(this.positionHistory)
    const key = positionKey(newBoard, newTurn, newCastlingRights, newEpSquare)
    newPosHistory.set(key, (newPosHistory.get(key) ?? 0) + 1)

    return new GameState({
      board: newBoard,
      turn: newTurn,
      castlingRights: newCastlingRights,
      enPassantSquare: newEpSquare,
      halfmoveClock: newHalfmoveClock,
      fullmoveNumber: newFullmoveNumber,
      history: newHistory,
      positionHistory: newPosHistory,
      initialFEN: this.initialFEN,
    })
  }

  isInCheck(color?: Color): boolean {
    return isInCheck(this.board, color ?? this.turn)
  }

  getResult(): GameResult {
    const legalMoves = this.getLegalMoves()

    if (legalMoves.length === 0) {
      if (this.isInCheck()) {
        return { status: 'checkmate', winner: opponent(this.turn), drawReason: null }
      }
      return { status: 'stalemate', winner: null, drawReason: null }
    }

    if (this.halfmoveClock >= 100) {
      return { status: 'draw', winner: null, drawReason: 'fifty-move' }
    }

    if (this.isThreefoldRepetition()) {
      return { status: 'draw', winner: null, drawReason: 'repetition' }
    }

    if (this.isInsufficientMaterial()) {
      return { status: 'draw', winner: null, drawReason: 'insufficient-material' }
    }

    if (this.isInCheck()) {
      return { status: 'check', winner: null, drawReason: null }
    }

    return { status: 'playing', winner: null, drawReason: null }
  }

  toFEN(): string {
    return serializeFEN(
      this.board,
      this.turn,
      this.castlingRights,
      this.enPassantSquare,
      this.halfmoveClock,
      this.fullmoveNumber
    )
  }

  toPGN(metadata?: PGNMetadata): string {
    const headers = [
      `[Event "${metadata?.event ?? '?'}"]`,
      `[Site "${metadata?.site ?? '?'}"]`,
      `[Date "${metadata?.date ?? '????.??.??'}"]`,
      `[Round "${metadata?.round ?? '?'}"]`,
      `[White "${metadata?.white ?? '?'}"]`,
      `[Black "${metadata?.black ?? '?'}"]`,
      `[Result "${metadata?.result ?? '*'}"]`,
    ]
    if (this.initialFEN !== INITIAL_FEN) {
      headers.push(`[SetUp "1"]`)
      headers.push(`[FEN "${this.initialFEN}"]`)
    }

    let state: GameState = GameState.fromFEN(this.initialFEN)
    const tokens: string[] = []
    for (const move of this.history) {
      if (state.turn === 'white') tokens.push(`${state.fullmoveNumber}.`)
      tokens.push(moveToSAN(state, move))
      state = state.makeMove(move)
    }
    tokens.push(metadata?.result ?? '*')
    return headers.join('\n') + '\n\n' + tokens.join(' ')
  }

  moveToSAN(move: Move): string {
    return moveToSAN(this, move)
  }

  private isThreefoldRepetition(): boolean {
    return Array.from(this.positionHistory.values()).some((count) => count >= 3)
  }

  private isInsufficientMaterial(): boolean {
    const pieces = this.board.filter(Boolean) as Piece[]
    const w = pieces.filter((p) => p.color === 'white')
    const b = pieces.filter((p) => p.color === 'black')

    if (w.length === 1 && b.length === 1) return true

    if (w.length === 1 && b.length === 2) {
      const extra = b.find((p) => p.type !== 'king')!
      if (extra.type === 'bishop' || extra.type === 'knight') return true
    }
    if (b.length === 1 && w.length === 2) {
      const extra = w.find((p) => p.type !== 'king')!
      if (extra.type === 'bishop' || extra.type === 'knight') return true
    }

    if (w.length === 2 && b.length === 2) {
      const wb = w.find((p) => p.type !== 'king')
      const bb = b.find((p) => p.type !== 'king')
      if (wb?.type === 'bishop' && bb?.type === 'bishop') {
        const wsq = this.board.findIndex((p) => p?.type === 'bishop' && p.color === 'white')
        const bsq = this.board.findIndex((p) => p?.type === 'bishop' && p.color === 'black')
        if (wsq !== -1 && bsq !== -1) {
          const wColor = (fileOf(wsq) + rankOf(wsq)) % 2
          const bColor = (fileOf(bsq) + rankOf(bsq)) % 2
          if (wColor === bColor) return true
        }
      }
    }

    return false
  }
}
