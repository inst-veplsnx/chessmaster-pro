import { state } from './helpers'

describe('Stalemate', () => {
  test('classic stalemate: black king in corner with no moves', () => {
    // Black king at a8, white queen at b6, white king at c6
    const s = state('k7/8/1QK5/8/8/8/8/8 b - - 0 1')
    const result = s.getResult()
    expect(result.status).toBe('stalemate')
    expect(result.winner).toBeNull()
  })

  test('stalemate: king only safe move would put it in check', () => {
    // White king at a1, black queen at c2 attacks a2 (rank), b2 (rank), b1 (diagonal) — all escape squares covered
    const s = state('8/8/6k1/8/8/8/2q5/K7 w - - 0 1')
    const result = s.getResult()
    expect(result.status).toBe('stalemate')
  })

  test('not stalemate when king has escape', () => {
    // King at a1, queen at c2 — king can go to b1 (not attacked), a2 (attacked by c2? yes), b2(attacked)
    // c2 queen attacks: b1(diagonal), b3, a2(diagonal), d1, d3, e4, f5, g6, h7, also orthogonal c-file and 2-rank
    // b1 is attacked by c2? c2 to b1 diagonal yes. a2 attacked? c2 to a2 is file no, rank diagonal: c2-b1 yes but a2: c2 to a2 is 2 files — not diagonal. c2 attacks c-file (c1,c3...) and 2-rank (a2,b2,d2,e2...) and diagonals (b1,a2? no: c2-b3-a4, c2-d1, c2-b1, c2-d3-e4-f5-g6-h7)
    // Actually c2-a2 is same rank (rank 2): yes queen can move along rank 2 horizontally. So a2 IS attacked.
    // b1 is attacked (diagonal c2-b1). So: a1, a2(attacked), b1(attacked), b2(attacked) — stalemate
    // Let me use a cleaner non-stalemate position
    const s = state('8/8/8/8/8/8/8/K1k5 w - - 0 1')
    // White king at a1, black king at c1 — white has moves (b2, a2 maybe not if attacked by black king)
    // Black king at c1 attacks b1, b2, c2, d1, d2 — white king at a1 can go to a2 (not attacked by c1 king)
    const result = s.getResult()
    expect(result.status).not.toBe('stalemate')
    expect(result.status).not.toBe('checkmate')
  })
})
