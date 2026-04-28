// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = any
import type {
  Game,
  LeaderboardEntry,
  Profile,
  Puzzle,
  UserPuzzleStat,
  InterviewCategory,
} from './types'

export async function getLeaderboard(
  supabase: Client,
  timeControl: string = 'rapid',
  limit: number = 50
): Promise<LeaderboardEntry[]> {
  const { data } = await supabase.rpc('get_leaderboard', {
    time_control_filter: timeControl,
    limit_n: limit,
  })
  return (data as LeaderboardEntry[]) ?? []
}

export async function getProfileByUsername(
  supabase: Client,
  username: string
): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('username', username).single()
  return data ?? null
}

export async function getGamesByUser(
  supabase: Client,
  userId: string,
  page: number = 0,
  pageSize: number = 10
): Promise<{ games: Game[]; count: number }> {
  const from = page * pageSize
  const to = from + pageSize - 1

  const { data, count } = await supabase
    .from('games')
    .select('*', { count: 'exact' })
    .or(`white_id.eq.${userId},black_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .range(from, to)

  return { games: (data as Game[]) ?? [], count: count ?? 0 }
}

export async function getActivityHeatmap(
  supabase: Client,
  userId: string
): Promise<{ day: string; count: number }[]> {
  const since = new Date()
  since.setDate(since.getDate() - 364)

  const { data } = await supabase
    .from('games')
    .select('created_at')
    .or(`white_id.eq.${userId},black_id.eq.${userId}`)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true })

  if (!data) return []

  const map = new Map<string, number>()
  for (const row of data) {
    const day = row.created_at.slice(0, 10)
    map.set(day, (map.get(day) ?? 0) + 1)
  }

  return Array.from(map.entries()).map(([day, count]) => ({ day, count }))
}

export interface PuzzleWithStatus {
  puzzle: Puzzle
  solved: boolean
}

export async function getPuzzles(
  supabase: Client,
  userId: string,
  category?: InterviewCategory | 'all',
  page: number = 0,
  pageSize: number = 20
): Promise<PuzzleWithStatus[]> {
  let query = supabase
    .from('puzzles')
    .select('*')
    .eq('is_curated', true)
    .order('difficulty', { ascending: true })
    .range(page * pageSize, page * pageSize + pageSize - 1)

  if (category && category !== 'all') {
    query = query.eq('interview_category', category)
  }

  const { data: puzzles } = await query

  if (!puzzles || puzzles.length === 0) return []

  const puzzleIds = (puzzles as Puzzle[]).map((p) => p.id)
  const { data: stats } = await supabase
    .from('user_puzzle_stats')
    .select('puzzle_id, solved')
    .eq('user_id', userId)
    .in('puzzle_id', puzzleIds)

  const solvedSet = new Set(
    ((stats ?? []) as { puzzle_id: string; solved: boolean }[])
      .filter((s) => s.solved)
      .map((s) => s.puzzle_id)
  )

  return (puzzles as Puzzle[]).map((puzzle) => ({
    puzzle,
    solved: solvedSet.has(puzzle.id),
  }))
}

export type PuzzleProgress = Record<InterviewCategory, { solved: number; total: number }>

export async function getPuzzleProgress(supabase: Client, userId: string): Promise<PuzzleProgress> {
  const categories: InterviewCategory[] = ['algorithm', 'system_design', 'debugging', 'behavioral']

  const { data: puzzles } = await supabase
    .from('puzzles')
    .select('id, interview_category')
    .eq('is_curated', true)

  if (!puzzles) {
    return Object.fromEntries(categories.map((c) => [c, { solved: 0, total: 0 }])) as PuzzleProgress
  }

  const { data: stats } = await supabase
    .from('user_puzzle_stats')
    .select('puzzle_id, solved')
    .eq('user_id', userId)
    .eq('solved', true)

  const solvedIds = new Set(((stats ?? []) as { puzzle_id: string }[]).map((s) => s.puzzle_id))

  const progress = Object.fromEntries(
    categories.map((c) => [c, { solved: 0, total: 0 }])
  ) as PuzzleProgress

  for (const p of puzzles) {
    const cat = p.interview_category as InterviewCategory
    if (!cat) continue
    progress[cat].total++
    if (solvedIds.has(p.id)) progress[cat].solved++
  }

  return progress
}

export async function getPuzzleById(
  supabase: Client,
  puzzleId: string,
  userId: string
): Promise<{ puzzle: Puzzle; stat: UserPuzzleStat | null }> {
  const [{ data: puzzle }, { data: stat }] = await Promise.all([
    supabase.from('puzzles').select('*').eq('id', puzzleId).single(),
    supabase
      .from('user_puzzle_stats')
      .select('*')
      .eq('puzzle_id', puzzleId)
      .eq('user_id', userId)
      .maybeSingle(),
  ])

  return { puzzle: puzzle as Puzzle, stat: stat as UserPuzzleStat | null }
}

export async function markPuzzleSolved(
  supabase: Client,
  userId: string,
  puzzleId: string,
  timeTaken: number
): Promise<void> {
  await supabase.from('user_puzzle_stats').upsert(
    {
      user_id: userId,
      puzzle_id: puzzleId,
      solved: true,
      time_taken: timeTaken,
      solved_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,puzzle_id' }
  )
}

export interface RatingPoint {
  date: string
  rating: number
}

export async function getRatingHistory(
  supabase: Client,
  userId: string,
  limit: number = 50
): Promise<RatingPoint[]> {
  const { data } = await supabase
    .from('games')
    .select('started_at, white_id, white_rating_after, black_rating_after')
    .or(`white_id.eq.${userId},black_id.eq.${userId}`)
    .not('white_rating_after', 'is', null)
    .order('started_at', { ascending: true })
    .limit(limit)

  if (!data) return []

  type Row = {
    started_at: string
    white_id: string
    white_rating_after: number | null
    black_rating_after: number | null
  }
  return (data as Row[]).map((g) => ({
    date: g.started_at.slice(0, 10),
    rating: g.white_id === userId ? (g.white_rating_after ?? 1200) : (g.black_rating_after ?? 1200),
  }))
}

export interface TimeControlCount {
  time_control: string
  count: number
}

export async function getGamesByTimeControl(
  supabase: Client,
  userId: string
): Promise<TimeControlCount[]> {
  const { data } = await supabase
    .from('games')
    .select('time_control')
    .or(`white_id.eq.${userId},black_id.eq.${userId}`)

  if (!data) return []

  const map = new Map<string, number>()
  for (const g of data as { time_control: string }[]) {
    map.set(g.time_control, (map.get(g.time_control) ?? 0) + 1)
  }

  return Array.from(map.entries())
    .map(([time_control, count]) => ({ time_control, count }))
    .sort((a, b) => b.count - a.count)
}
