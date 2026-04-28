export type MoveQuality = 'brilliant' | 'great' | 'good' | 'inaccuracy' | 'mistake' | 'blunder'
export type GameResult = 'white' | 'black' | 'draw' | 'abandoned'
export type Termination =
  | 'checkmate'
  | 'resignation'
  | 'timeout'
  | 'draw-agreement'
  | 'stalemate'
  | 'insufficient-material'
  | '50-move'
  | 'repetition'
export type SubscriptionPlan = 'free' | 'pro' | 'team'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'
export type InterviewCategory = 'algorithm' | 'system_design' | 'debugging' | 'behavioral'

export type Profile = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  rating: number
  rating_rapid: number
  rating_blitz: number
  rating_bullet: number
  games_played: number
  games_won: number
  games_drawn: number
  games_lost: number
  puzzle_rating: number
  puzzles_solved: number
  is_pro: boolean
  board_theme: string
  piece_theme: string
  preferred_time_control: string
  created_at: string
  updated_at: string
}

export type Game = {
  id: string
  white_id: string | null
  black_id: string | null
  result: GameResult | null
  termination: Termination | null
  time_control: string
  initial_time: number
  increment: number
  pgn: string | null
  opening_name: string | null
  opening_eco: string | null
  white_rating_before: number | null
  black_rating_before: number | null
  white_rating_after: number | null
  black_rating_after: number | null
  is_rated: boolean
  is_public: boolean
  started_at: string
  ended_at: string | null
  created_at: string
}

export type GameMove = {
  id: number
  game_id: string
  move_number: number
  color: 'white' | 'black'
  san: string
  uci: string
  fen_after: string
  clock_remaining: number | null
  eval: number | null
  move_quality: MoveQuality | null
  created_at: string
}

export type Puzzle = {
  id: string
  fen: string
  solution: string[]
  tags: string[]
  difficulty: number
  title: string
  explanation: string
  algorithm_connection: string | null
  interview_category: InterviewCategory | null
  rating: number
  times_solved: number
  is_curated: boolean
  created_at: string
}

export type UserPuzzleStat = {
  id: number
  user_id: string
  puzzle_id: string
  solved: boolean
  attempts: number
  time_taken: number | null
  solved_at: string | null
}

export type Subscription = {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan: SubscriptionPlan
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export type LeaderboardEntry = {
  rank: number
  username: string
  display_name: string | null
  avatar_url: string | null
  rating: number
  games_played: number
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Profile>
        Relationships: []
      }
      games: {
        Row: Game
        Insert: Omit<Game, 'id' | 'created_at'>
        Update: Partial<Game>
        Relationships: []
      }
      moves: {
        Row: GameMove
        Insert: Omit<GameMove, 'id' | 'created_at'>
        Update: Partial<GameMove>
        Relationships: []
      }
      puzzles: {
        Row: Puzzle
        Insert: Omit<Puzzle, 'id' | 'created_at'>
        Update: Partial<Puzzle>
        Relationships: []
      }
      user_puzzle_stats: {
        Row: UserPuzzleStat
        Insert: Omit<UserPuzzleStat, 'id'>
        Update: Partial<UserPuzzleStat>
        Relationships: []
      }
      subscriptions: {
        Row: Subscription
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Subscription>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      calculate_elo: {
        Args: { player_rating: number; opponent_rating: number; result: number }
        Returns: number
      }
      get_leaderboard: {
        Args: { time_control_filter?: string; limit_n?: number }
        Returns: LeaderboardEntry[]
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
