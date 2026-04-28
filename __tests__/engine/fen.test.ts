import { GameState, idx, parseSquare } from '@/lib/engine'

describe('FEN parsing', () => {
  test('initial FEN produces correct piece count', () => {
    const s = GameState.initial()
    const pieces = s.board.filter(Boolean)
    expect(pieces).toHaveLength(32)
  })

  test('initial FEN: white rook at a1', () => {
    const s = GameState.initial()
    const p = s.board[parseSquare('a1')]
    expect(p?.type).toBe('rook')
    expect(p?.color).toBe('white')
  })

  test('initial FEN: black queen at d8', () => {
    const s = GameState.initial()
    const p = s.board[parseSquare('d8')]
    expect(p?.type).toBe('queen')
    expect(p?.color).toBe('black')
  })

  test('initial FEN: turn is white', () => {
    expect(GameState.initial().turn).toBe('white')
  })

  test('initial FEN: all castling rights set', () => {
    const cr = GameState.initial().castlingRights
    expect(cr.whiteKingside).toBe(true)
    expect(cr.whiteQueenside).toBe(true)
    expect(cr.blackKingside).toBe(true)
    expect(cr.blackQueenside).toBe(true)
  })

  test('FEN with no castling rights', () => {
    const s = GameState.fromFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w - - 0 1')
    const cr = s.castlingRights
    expect(cr.whiteKingside).toBe(false)
    expect(cr.whiteQueenside).toBe(false)
    expect(cr.blackKingside).toBe(false)
    expect(cr.blackQueenside).toBe(false)
  })

  test('FEN with en passant square', () => {
    const s = GameState.fromFEN('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1')
    expect(s.enPassantSquare).toBe(parseSquare('e3'))
  })

  test('FEN with black to move', () => {
    const s = GameState.fromFEN('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1')
    expect(s.turn).toBe('black')
  })

  test('FEN halfmove and fullmove clocks', () => {
    const s = GameState.fromFEN('8/8/8/8/8/8/8/K7 w - - 25 40')
    expect(s.halfmoveClock).toBe(25)
    expect(s.fullmoveNumber).toBe(40)
  })

  test('FEN with only kings', () => {
    const s = GameState.fromFEN('k7/8/8/8/8/8/8/K7 w - - 0 1')
    expect(s.board.filter(Boolean)).toHaveLength(2)
  })
})

describe('FEN serialization (toFEN roundtrip)', () => {
  const fens = [
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    'r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
    'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
    '8/8/4k3/8/8/4K3/8/7R w - - 25 40',
  ]

  for (const fen of fens) {
    test(`roundtrip: ${fen.slice(0, 40)}...`, () => {
      const s = GameState.fromFEN(fen)
      expect(s.toFEN()).toBe(fen)
    })
  }

  test('FEN updates correctly after a move', () => {
    const s = GameState.initial()
    const s2 = s.makeMove({ from: parseSquare('e2'), to: parseSquare('e4') })
    const fen = s2.toFEN()
    // Should reflect: e4 pawn moved, black to move, ep on e3, halfmove=0, fullmove=1
    expect(fen).toBe('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1')
  })

  test('fullmove increments after black moves', () => {
    let s = GameState.initial()
    s = s.makeMove({ from: parseSquare('e2'), to: parseSquare('e4') })
    s = s.makeMove({ from: parseSquare('e7'), to: parseSquare('e5') })
    expect(s.fullmoveNumber).toBe(2)
  })
})
