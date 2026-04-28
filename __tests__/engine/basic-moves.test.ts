import { GameState } from '@/lib/engine'
import { hasMove, sq, state } from './helpers'

describe('Pawn moves', () => {
  test('white pawn single push from starting rank', () => {
    const s = GameState.initial()
    const moves = s.getLegalMoves(sq('e2'))
    expect(hasMove(moves, 'e2', 'e3')).toBe(true)
  })

  test('white pawn double push from starting rank', () => {
    const s = GameState.initial()
    const moves = s.getLegalMoves(sq('e2'))
    expect(hasMove(moves, 'e2', 'e4')).toBe(true)
  })

  test('white pawn cannot double push when blocked on first square', () => {
    // Place black rook on e3 → e4 still blocked because path goes through e3
    const s = state('rnbqkbnr/pppppppp/8/8/8/4r3/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
    const moves = s.getLegalMoves(sq('e2'))
    expect(hasMove(moves, 'e2', 'e3')).toBe(false)
    expect(hasMove(moves, 'e2', 'e4')).toBe(false)
  })

  test('white pawn cannot double push when blocked on second square', () => {
    const s = state('8/8/8/8/4r3/8/4P3/8 w - - 0 1')
    const moves = s.getLegalMoves(sq('e2'))
    expect(hasMove(moves, 'e2', 'e3')).toBe(true)
    expect(hasMove(moves, 'e2', 'e4')).toBe(false)
  })

  test('white pawn diagonal capture', () => {
    const s = state('8/8/8/8/8/3p4/4P3/8 w - - 0 1')
    const moves = s.getLegalMoves(sq('e2'))
    expect(hasMove(moves, 'e2', 'd3')).toBe(true)
    expect(hasMove(moves, 'e2', 'f3')).toBe(false) // no piece to capture
  })

  test('white pawn cannot capture own piece', () => {
    const s = state('8/8/8/8/8/3P4/4P3/8 w - - 0 1')
    const moves = s.getLegalMoves(sq('e2'))
    expect(hasMove(moves, 'e2', 'd3')).toBe(false)
  })

  test('black pawn moves downward', () => {
    const s = state('8/4p3/8/8/8/8/8/8 b - - 0 1')
    const moves = s.getLegalMoves(sq('e7'))
    expect(hasMove(moves, 'e7', 'e6')).toBe(true)
    expect(hasMove(moves, 'e7', 'e5')).toBe(true)
  })

  test('pawn cannot move outside board', () => {
    // White pawn at a2 — no b-file capture
    const s = state('8/8/8/8/8/8/P7/8 w - - 0 1')
    const moves = s.getLegalMoves(sq('a2'))
    expect(moves.every((m) => m.from === sq('a2') && m.to >= 0 && m.to < 64)).toBe(true)
  })
})

// ─── Knight ───────────────────────────────────────────────────────────────

describe('Knight moves', () => {
  test('knight from center has up to 8 moves', () => {
    const s = state('8/8/8/3N4/8/8/8/8 w - - 0 1')
    expect(s.getLegalMoves(sq('d5')).length).toBe(8)
  })

  test('knight from corner has 2 moves', () => {
    const s = state('N7/8/8/8/8/8/8/8 w - - 0 1')
    expect(s.getLegalMoves(sq('a8')).length).toBe(2)
  })

  test('knight can jump over pieces', () => {
    // Knight surrounded but can still jump out
    const s = state('8/8/8/2PPP3/2PNP3/2PPP3/8/8 w - - 0 1')
    const moves = s.getLegalMoves(sq('d4'))
    expect(moves.length).toBeGreaterThan(0)
    // All destinations should be empty squares (or opponent pieces)
    for (const m of moves) {
      const target = s.board[m.to]
      expect(target?.color).not.toBe('white')
    }
  })

  test('knight captures enemy pieces', () => {
    const s = state('8/8/8/2n5/4N3/8/8/8 w - - 0 1')
    const moves = s.getLegalMoves(sq('e4'))
    expect(hasMove(moves, 'e4', 'c5')).toBe(true)
    const cap = moves.find((m) => m.to === sq('c5'))!
    expect(cap.capturedPiece).toBe('knight')
  })
})

// ─── Bishop ───────────────────────────────────────────────────────────────

describe('Bishop moves', () => {
  test('bishop moves diagonally', () => {
    const s = state('8/8/8/3B4/8/8/8/8 w - - 0 1')
    const moves = s.getLegalMoves(sq('d5'))
    // d5 bishop can reach 13 squares on empty board
    expect(moves.length).toBe(13)
  })

  test('bishop blocked by own piece', () => {
    const s = state('8/8/8/3B4/4P3/8/8/8 w - - 0 1')
    const moves = s.getLegalMoves(sq('d5'))
    expect(hasMove(moves, 'd5', 'e4')).toBe(false)
    expect(hasMove(moves, 'd5', 'f3')).toBe(false)
  })

  test('bishop can capture but not slide through enemy', () => {
    const s = state('8/8/8/3B4/4p3/8/8/8 w - - 0 1')
    const moves = s.getLegalMoves(sq('d5'))
    expect(hasMove(moves, 'd5', 'e4')).toBe(true) // capture e4
    expect(hasMove(moves, 'd5', 'f3')).toBe(false) // blocked after capture
  })
})

// ─── Rook ─────────────────────────────────────────────────────────────────

describe('Rook moves', () => {
  test('rook moves orthogonally', () => {
    const s = state('8/8/8/3R4/8/8/8/8 w - - 0 1')
    const moves = s.getLegalMoves(sq('d5'))
    expect(moves.length).toBe(14)
  })

  test('rook blocked by own piece', () => {
    const s = state('8/8/8/3RP3/8/8/8/8 w - - 0 1')
    const moves = s.getLegalMoves(sq('d5'))
    expect(hasMove(moves, 'd5', 'e5')).toBe(false)
  })

  test('rook captures enemy and stops', () => {
    const s = state('8/8/8/3Rp3/8/8/8/8 w - - 0 1')
    const moves = s.getLegalMoves(sq('d5'))
    expect(hasMove(moves, 'd5', 'e5')).toBe(true)
    expect(hasMove(moves, 'd5', 'f5')).toBe(false)
  })
})

// ─── Queen ────────────────────────────────────────────────────────────────

describe('Queen moves', () => {
  test('queen combines rook and bishop movement', () => {
    const s = state('8/8/8/3Q4/8/8/8/8 w - - 0 1')
    // d5 queen on empty board: 7+7+6+6+3+4+4+4 = not exact, just verify > 20
    expect(s.getLegalMoves(sq('d5')).length).toBe(27)
  })
})

// ─── King ─────────────────────────────────────────────────────────────────

describe('King moves', () => {
  test('king moves one square in any direction (center)', () => {
    const s = state('8/8/8/3K4/8/8/8/8 w - - 0 1')
    expect(s.getLegalMoves(sq('d5')).length).toBe(8)
  })

  test('king in corner has 3 moves', () => {
    const s = state('K7/8/8/8/8/8/8/8 w - - 0 1')
    expect(s.getLegalMoves(sq('a8')).length).toBe(3)
  })

  test('king cannot move into check', () => {
    // White king at e1, black rook at e8 — king cannot move to e-file
    const s = state('4r3/8/8/8/8/8/8/4K3 w - - 0 1')
    const moves = s.getLegalMoves(sq('e1'))
    expect(hasMove(moves, 'e1', 'e2')).toBe(false)
  })

  test('king cannot capture protected piece', () => {
    // White king at e1, two black rooks — king cannot take the rook on d1 if it's protected by d8
    const s = state('3r4/8/8/8/8/8/8/3rK3 w - - 0 1')
    const moves = s.getLegalMoves(sq('e1'))
    expect(hasMove(moves, 'e1', 'd1')).toBe(false)
  })
})
