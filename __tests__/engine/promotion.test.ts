import { GameState } from '@/lib/engine'
import { hasMove, move, sq, state } from './helpers'

describe('Pawn Promotion', () => {
  test('white pawn on 7th rank promotes to all 4 pieces', () => {
    const s = state('8/4P3/8/8/8/8/8/8 w - - 0 1')
    const moves = s.getLegalMoves(sq('e7'))
    expect(hasMove(moves, 'e7', 'e8', { promotion: 'queen' })).toBe(true)
    expect(hasMove(moves, 'e7', 'e8', { promotion: 'rook' })).toBe(true)
    expect(hasMove(moves, 'e7', 'e8', { promotion: 'bishop' })).toBe(true)
    expect(hasMove(moves, 'e7', 'e8', { promotion: 'knight' })).toBe(true)
    // Non-promotion move should not be present
    expect(hasMove(moves, 'e7', 'e8')).toBe(false)
  })

  test('black pawn on 2nd rank promotes to all 4 pieces', () => {
    const s = state('8/8/8/8/8/8/4p3/8 b - - 0 1')
    const moves = s.getLegalMoves(sq('e2'))
    expect(hasMove(moves, 'e2', 'e1', { promotion: 'queen' })).toBe(true)
    expect(hasMove(moves, 'e2', 'e1', { promotion: 'rook' })).toBe(true)
    expect(hasMove(moves, 'e2', 'e1', { promotion: 'bishop' })).toBe(true)
    expect(hasMove(moves, 'e2', 'e1', { promotion: 'knight' })).toBe(true)
  })

  test('promotion with capture generates 4 moves per capture direction', () => {
    // White pawn on e7, black rooks on d8 and f8
    const s = state('3r1r2/4P3/8/8/8/8/8/8 w - - 0 1')
    const moves = s.getLegalMoves(sq('e7'))
    // Forward: 4 promotions
    expect(hasMove(moves, 'e7', 'e8', { promotion: 'queen' })).toBe(true)
    // Capture d8: 4 promotions
    expect(hasMove(moves, 'e7', 'd8', { promotion: 'queen' })).toBe(true)
    expect(hasMove(moves, 'e7', 'd8', { promotion: 'rook' })).toBe(true)
    expect(hasMove(moves, 'e7', 'd8', { promotion: 'bishop' })).toBe(true)
    expect(hasMove(moves, 'e7', 'd8', { promotion: 'knight' })).toBe(true)
    // Capture f8: 4 promotions
    expect(hasMove(moves, 'e7', 'f8', { promotion: 'queen' })).toBe(true)
  })

  test('after promotion the correct piece is on the board', () => {
    const s = state('8/4P3/8/8/8/8/8/8 w - - 0 1')
    const s2 = s.makeMove(move('e7', 'e8', { promotion: 'queen' }))
    expect(s2.board[sq('e8')]?.type).toBe('queen')
    expect(s2.board[sq('e8')]?.color).toBe('white')
    expect(s2.board[sq('e7')]).toBeNull()
  })

  test('promoting to knight gives check', () => {
    // White pawn on g7, black king on f5 — promoting to knight on h8 gives check
    // (h8 knight attacks g6 not f5, let's use a better test)
    // White pawn on b7, black king on c5 — knight on a8 attacks b6 and c7, not c5
    // Simplest: pawn on d7 promotes to knight on d8, black king on e6 — knight on d8 attacks e6 and c6 and b7 and f7
    // d8 knight attacks: b7, c6, e6, f7 — yes, e6 is attacked
    const s = state('8/3P4/3pk3/8/8/8/8/K7 w - - 0 1')
    const s2 = s.makeMove(move('d7', 'd8', { promotion: 'knight' }))
    const result = s2.getResult()
    expect(result.status).toBe('check')
  })

  test('pawn cannot promote without reaching last rank', () => {
    const s = state('8/8/4P3/8/8/8/8/8 w - - 0 1')
    const moves = s.getLegalMoves(sq('e6'))
    expect(moves.every((m) => !m.promotion)).toBe(true)
  })
})
