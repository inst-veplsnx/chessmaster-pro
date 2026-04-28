import { GameState } from '@/lib/engine'
import { hasMove, move, sq, state } from './helpers'

// ─── Castling ─────────────────────────────────────────────────────────────

describe('Castling', () => {
  // White kingside
  test('white can castle kingside when path is clear', () => {
    const s = state('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1')
    expect(hasMove(s.getLegalMoves(sq('e1')), 'e1', 'g1', { isCastling: 'kingside' })).toBe(true)
  })

  test('after white kingside castle king is on g1 and rook on f1', () => {
    const s = state('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1')
    const after = s.makeMove(move('e1', 'g1', { isCastling: 'kingside' }))
    expect(after.board[sq('g1')]?.type).toBe('king')
    expect(after.board[sq('f1')]?.type).toBe('rook')
    expect(after.board[sq('h1')]).toBeNull()
    expect(after.board[sq('e1')]).toBeNull()
  })

  // White queenside
  test('white can castle queenside when path is clear', () => {
    const s = state('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1')
    expect(hasMove(s.getLegalMoves(sq('e1')), 'e1', 'c1', { isCastling: 'queenside' })).toBe(true)
  })

  test('after white queenside castle king is on c1 and rook on d1', () => {
    const s = state('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1')
    const after = s.makeMove(move('e1', 'c1', { isCastling: 'queenside' }))
    expect(after.board[sq('c1')]?.type).toBe('king')
    expect(after.board[sq('d1')]?.type).toBe('rook')
    expect(after.board[sq('a1')]).toBeNull()
  })

  // Black castling
  test('black can castle kingside', () => {
    const s = state('r3k2r/8/8/8/8/8/8/R3K2R b KQkq - 0 1')
    expect(hasMove(s.getLegalMoves(sq('e8')), 'e8', 'g8', { isCastling: 'kingside' })).toBe(true)
  })

  test('black can castle queenside', () => {
    const s = state('r3k2r/8/8/8/8/8/8/R3K2R b KQkq - 0 1')
    expect(hasMove(s.getLegalMoves(sq('e8')), 'e8', 'c8', { isCastling: 'queenside' })).toBe(true)
  })

  // Cannot castle when blocked
  test('cannot castle kingside when f1 is occupied', () => {
    const s = state('r3k2r/8/8/8/8/8/8/R3KB1R w KQkq - 0 1')
    expect(hasMove(s.getLegalMoves(sq('e1')), 'e1', 'g1', { isCastling: 'kingside' })).toBe(false)
  })

  test('cannot castle queenside when b1 is occupied', () => {
    const s = state('r3k2r/8/8/8/8/8/8/RN2K2R w KQkq - 0 1')
    expect(hasMove(s.getLegalMoves(sq('e1')), 'e1', 'c1', { isCastling: 'queenside' })).toBe(false)
  })

  // Cannot castle when in check
  test('cannot castle when king is in check', () => {
    // Black rook attacks e1
    const s = state('4k2r/8/8/8/8/8/8/4K2R w K - 0 1')
    // Put black rook on e8 attacking e1
    const s2 = state('4k3/8/8/8/8/8/8/R3K2r w Q - 0 1')
    // King on e1, black rook on h1 gives check
    const s3 = state('8/8/8/8/8/8/8/R3K2r w Q - 0 1')
    expect(hasMove(s3.getLegalMoves(sq('e1')), 'e1', 'c1', { isCastling: 'queenside' })).toBe(false)
  })

  // Cannot castle through check
  test('cannot castle kingside when f1 is attacked', () => {
    // Black rook on f8 attacks f1
    const s = state('5r2/8/8/8/8/8/8/4K2R w K - 0 1')
    expect(hasMove(s.getLegalMoves(sq('e1')), 'e1', 'g1', { isCastling: 'kingside' })).toBe(false)
  })

  test('cannot castle queenside when d1 is attacked', () => {
    // Black rook on d8 attacks d1
    const s = state('3r4/8/8/8/8/8/8/R3K3 w Q - 0 1')
    expect(hasMove(s.getLegalMoves(sq('e1')), 'e1', 'c1', { isCastling: 'queenside' })).toBe(false)
  })

  // Castling rights revoked after king/rook moves
  test('castling rights revoked after king moves', () => {
    const s = state('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1')
    const s2 = s.makeMove(move('e1', 'e2')) // king moves
    const s3 = s2.makeMove(move('e8', 'e7')) // black any move
    expect(hasMove(s3.getLegalMoves(sq('e2')), 'e2', 'g2', { isCastling: 'kingside' })).toBe(false)
  })

  test('kingside castling rights revoked after kingside rook moves', () => {
    const s = state('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1')
    const s2 = s.makeMove(move('h1', 'h2')) // rook moves
    const s3 = s2.makeMove(move('e8', 'e7'))
    expect(s3.castlingRights.whiteKingside).toBe(false)
    expect(s3.castlingRights.whiteQueenside).toBe(true)
  })
})
