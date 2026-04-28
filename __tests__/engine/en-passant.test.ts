import { GameState } from '@/lib/engine'
import { hasMove, move, sq, state } from './helpers'

describe('En Passant', () => {
  test('white can capture en passant after black double push', () => {
    // White pawn on e5, black pawn on d7 double-pushes to d5
    const s = state('8/3p4/8/4P3/8/8/8/8 b - - 0 1')
    const s2 = s.makeMove(move('d7', 'd5')) // black double push → ep square d6
    expect(s2.enPassantSquare).toBe(sq('d6'))
    const moves = s2.getLegalMoves(sq('e5'))
    expect(hasMove(moves, 'e5', 'd6', { isEnPassant: true })).toBe(true)
  })

  test('after en passant capture the captured pawn is removed', () => {
    const s = state('8/3p4/8/4P3/8/8/8/8 b - - 0 1')
    const s2 = s.makeMove(move('d7', 'd5'))
    const s3 = s2.makeMove(move('e5', 'd6', { isEnPassant: true, capturedPiece: 'pawn' }))
    expect(s3.board[sq('d6')]?.type).toBe('pawn') // white pawn on d6
    expect(s3.board[sq('d6')]?.color).toBe('white')
    expect(s3.board[sq('d5')]).toBeNull() // captured pawn removed
  })

  test('black can capture en passant after white double push', () => {
    // Black pawn on d4, white pawn on e2 double-pushes to e4
    const s = state('8/8/8/8/3p4/8/4P3/8 w - - 0 1')
    const s2 = s.makeMove(move('e2', 'e4'))
    expect(s2.enPassantSquare).toBe(sq('e3'))
    const moves = s2.getLegalMoves(sq('d4'))
    expect(hasMove(moves, 'd4', 'e3', { isEnPassant: true })).toBe(true)
  })

  test('en passant option disappears after next move', () => {
    const s = state('8/3p4/8/4P3/8/8/8/8 b - - 0 1')
    const s2 = s.makeMove(move('d7', 'd5')) // sets ep square
    // White plays a different move
    const s3 = s2.makeMove(move('e5', 'e6')) // pawn pushes forward instead
    // Now it's black's turn — no ep option
    expect(s3.enPassantSquare).toBeNull()
  })

  test('en passant discovered check is illegal', () => {
    // White king and black rook on rank 5; capturing en passant removes both pawns and exposes the king
    const s = state('k7/8/8/K2Pp2r/8/8/8/8 w - e6 0 1')
    const moves = s.getLegalMoves(sq('d5'))
    expect(hasMove(moves, 'd5', 'e6', { isEnPassant: true })).toBe(false)
  })

  test('en passant does not set ep square for single push', () => {
    const s = state('8/8/8/8/8/8/4P3/8 w - - 0 1')
    const s2 = s.makeMove(move('e2', 'e3'))
    expect(s2.enPassantSquare).toBeNull()
  })
})
