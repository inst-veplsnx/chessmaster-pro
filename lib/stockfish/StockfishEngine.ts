export interface EngineOptions {
  depth?: number
  movetime?: number
  skillLevel?: number
}

export interface BestMoveResult {
  move: string // e.g. "e2e4"
  ponder?: string
  evaluation?: number
}

export interface AnalysisLine {
  depth: number
  score: number // centipawns, from current player's perspective
  mate?: number // moves to mate (positive = current player wins)
  pv: string[] // principal variation UCI moves
}

export class StockfishEngine {
  private worker: Worker | null = null
  private listeners: Array<(line: string) => void> = []
  private pendingResolver: ((line: string) => void) | null = null
  private pendingAnalysis: ((line: AnalysisLine) => void) | null = null
  private lastInfo: AnalysisLine | null = null
  private _ready = false

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.worker = new Worker('/stockfish/stockfish.js')

      this.worker.onmessage = (e: MessageEvent<string>) => {
        const line: string = typeof e.data === 'string' ? e.data : String(e.data)
        this._handleLine(line)
      }

      this.worker.onerror = (err) => reject(err)

      const timeout = setTimeout(() => reject(new Error('Stockfish init timeout')), 15_000)

      // Wait for readyok
      const onReady = (line: string) => {
        if (line === 'readyok') {
          clearTimeout(timeout)
          this._ready = true
          this.listeners = this.listeners.filter((l) => l !== onReady)
          resolve()
        }
      }
      this.listeners.push(onReady)

      this.worker.postMessage('uci')
      this.worker.postMessage('isready')
    })
  }

  private _handleLine(line: string) {
    for (const fn of this.listeners) fn(line)

    if (line.startsWith('info depth')) {
      const parsed = this._parseInfo(line)
      if (parsed) {
        this.lastInfo = parsed
        if (this.pendingAnalysis) this.pendingAnalysis(parsed)
      }
    }

    if (line.startsWith('bestmove') && this.pendingResolver) {
      const resolver = this.pendingResolver
      this.pendingResolver = null
      resolver(line)
    }
  }

  private _parseInfo(line: string): AnalysisLine | null {
    const depthMatch = line.match(/depth (\d+)/)
    const cpMatch = line.match(/score cp (-?\d+)/)
    const mateMatch = line.match(/score mate (-?\d+)/)
    const pvMatch = line.match(/ pv (.+)/)
    if (!depthMatch) return null

    const depth = parseInt(depthMatch[1])
    let score = 0
    let mate: number | undefined

    if (mateMatch) {
      mate = parseInt(mateMatch[1])
      score = mate > 0 ? 30_000 : -30_000
    } else if (cpMatch) {
      score = parseInt(cpMatch[1])
    } else {
      return null
    }

    const pv = pvMatch ? pvMatch[1].trim().split(' ') : []
    return { depth, score, mate, pv }
  }

  async getBestMove(
    fen: string,
    options: EngineOptions = {},
    onInfo?: (line: AnalysisLine) => void
  ): Promise<BestMoveResult> {
    if (!this.worker || !this._ready) throw new Error('Engine not initialized')

    const { depth = 15, movetime, skillLevel } = options

    if (skillLevel !== undefined) {
      this.worker.postMessage(`setoption name Skill Level value ${skillLevel}`)
    }

    this.worker.postMessage('ucinewgame')
    this.worker.postMessage(`position fen ${fen}`)

    this.pendingAnalysis = onInfo ?? null
    this.lastInfo = null

    const goCmd = movetime ? `go movetime ${movetime}` : `go depth ${depth}`

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingResolver = null
        this.pendingAnalysis = null
        reject(new Error('bestmove timeout'))
      }, 30_000)

      this.pendingResolver = (line: string) => {
        clearTimeout(timeout)
        this.pendingAnalysis = null
        const parts = line.split(' ')
        const move = parts[1]
        const ponder = parts[3]
        resolve({
          move,
          ponder,
          evaluation: this.lastInfo?.score,
        })
      }

      this.worker!.postMessage(goCmd)
    })
  }

  stop() {
    this.worker?.postMessage('stop')
  }

  onMessage(fn: (line: string) => void): () => void {
    this.listeners.push(fn)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn)
    }
  }

  get ready() {
    return this._ready
  }

  destroy() {
    this.worker?.postMessage('quit')
    this.worker?.terminate()
    this.worker = null
    this._ready = false
  }
}
