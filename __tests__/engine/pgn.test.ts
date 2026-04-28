import { GameState, parseSquare } from '@/lib/engine'

const sq = parseSquare

describe('SAN notation', () => {
  test('pawn move: e4', () => {
    const s = GameState.initial()
    const m = { from: sq('e2'), to: sq('e4') }
    expect(s.moveToSAN(m)).toBe('e4')
  })

  test('knight move: Nf3', () => {
    const s = GameState.initial()
    const m = { from: sq('g1'), to: sq('f3') }
    expect(s.moveToSAN(m)).toBe('Nf3')
  })

  test('capture: exd5', () => {
    // e4 vs d5
    let s = GameState.initial()
    s = s.makeMove({ from: sq('e2'), to: sq('e4') })
    s = s.makeMove({ from: sq('d7'), to: sq('d5') })
    const m = { from: sq('e4'), to: sq('d5'), capturedPiece: 'pawn' as const }
    expect(s.moveToSAN(m)).toBe('exd5')
  })

  test('promotion: e8=Q', () => {
    const s = GameState.fromFEN('8/4P3/8/8/8/8/8/k6K w - - 0 1')
    const m = { from: sq('e7'), to: sq('e8'), promotion: 'queen' as const }
    expect(s.moveToSAN(m)).toBe('e8=Q')
  })

  test('promotion to knight: e8=N', () => {
    const s = GameState.fromFEN('8/4P3/8/8/8/8/8/k6K w - - 0 1')
    const m = { from: sq('e7'), to: sq('e8'), promotion: 'knight' as const }
    expect(s.moveToSAN(m)).toBe('e8=N')
  })

  test('kingside castling: O-O', () => {
    const s = GameState.fromFEN('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1')
    const m = { from: sq('e1'), to: sq('g1'), isCastling: 'kingside' as const }
    expect(s.moveToSAN(m)).toBe('O-O')
  })

  test('queenside castling: O-O-O', () => {
    const s = GameState.fromFEN('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1')
    const m = { from: sq('e1'), to: sq('c1'), isCastling: 'queenside' as const }
    expect(s.moveToSAN(m)).toBe('O-O-O')
  })

  test('check suffix: +', () => {
    // Move that puts opponent in check
    const s = GameState.fromFEN('4k3/8/8/8/8/8/8/4KR2 w - - 0 1')
    const m = { from: sq('f1'), to: sq('f8') }
    const san = s.moveToSAN(m)
    expect(san).toContain('+')
  })

  test('checkmate suffix: #', () => {
    // Fool's mate final position — move Qh4#
    let s = GameState.initial()
    s = s.makeMove({ from: sq('f2'), to: sq('f3') })
    s = s.makeMove({ from: sq('e7'), to: sq('e5') })
    s = s.makeMove({ from: sq('g2'), to: sq('g4') })
    // Next move: Qh4#
    const m = { from: sq('d8'), to: sq('h4') }
    const san = s.moveToSAN(m)
    expect(san).toBe('Qh4#')
  })

  test('disambiguate by file when two rooks on same rank', () => {
    // Two white rooks on a1 and h1, both can go to d1
    const s = GameState.fromFEN('k7/8/8/8/8/5K2/8/R6R w - - 0 1')
    const m = { from: sq('a1'), to: sq('d1') }
    const san = s.moveToSAN(m)
    expect(san).toBe('Rad1')
  })

  test('disambiguate by rank when two rooks on same file', () => {
    const s = GameState.fromFEN('k7/8/8/8/8/8/R7/R6K w - - 0 1')
    // Two rooks on a-file (a1 and a2), both can reach a5
    const m = { from: sq('a1'), to: sq('a5') }
    const san = s.moveToSAN(m)
    expect(san).toBe('R1a5+')
  })
})

describe('PGN serialization', () => {
  test("Fool's Mate PGN contains expected tokens", () => {
    let s = GameState.initial()
    s = s.makeMove({ from: sq('f2'), to: sq('f3') })
    s = s.makeMove({ from: sq('e7'), to: sq('e5') })
    s = s.makeMove({ from: sq('g2'), to: sq('g4') })
    s = s.makeMove({ from: sq('d8'), to: sq('h4') })
    const pgn = s.toPGN({ white: 'Alice', black: 'Bob', result: '0-1' })
    expect(pgn).toContain('1. f3')
    expect(pgn).toContain('e5')
    expect(pgn).toContain('2. g4')
    expect(pgn).toContain('Qh4#')
    expect(pgn).toContain('[White "Alice"]')
  })
})
