CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL CHECK (length(username) BETWEEN 3 AND 20),
  display_name text,
  avatar_url text,
  rating int NOT NULL DEFAULT 1200 CHECK (rating > 0),
  rating_rapid int NOT NULL DEFAULT 1200,
  rating_blitz int NOT NULL DEFAULT 1200,
  rating_bullet int NOT NULL DEFAULT 1200,
  games_played int NOT NULL DEFAULT 0,
  games_won int NOT NULL DEFAULT 0,
  games_drawn int NOT NULL DEFAULT 0,
  games_lost int NOT NULL DEFAULT 0,
  puzzle_rating int NOT NULL DEFAULT 1200,
  puzzles_solved int NOT NULL DEFAULT 0,
  is_pro boolean NOT NULL DEFAULT false,
  board_theme text NOT NULL DEFAULT 'classic',
  piece_theme text NOT NULL DEFAULT 'classic',
  preferred_time_control text NOT NULL DEFAULT 'rapid',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  white_id uuid REFERENCES profiles(id),
  black_id uuid REFERENCES profiles(id),
  result text CHECK (result IN ('white', 'black', 'draw', 'abandoned')),
  termination text CHECK (termination IN (
    'checkmate', 'resignation', 'timeout', 'draw-agreement',
    'stalemate', 'insufficient-material', '50-move', 'repetition'
  )),
  time_control text NOT NULL,
  initial_time int NOT NULL,
  increment int NOT NULL DEFAULT 0,
  pgn text,
  opening_name text,
  opening_eco text,
  white_rating_before int,
  black_rating_before int,
  white_rating_after int,
  black_rating_after int,
  is_rated boolean NOT NULL DEFAULT true,
  is_public boolean NOT NULL DEFAULT true,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS moves (
  id bigserial PRIMARY KEY,
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  move_number int NOT NULL,
  color text NOT NULL CHECK (color IN ('white', 'black')),
  san text NOT NULL,
  uci text NOT NULL,
  fen_after text NOT NULL,
  clock_remaining int,
  eval int,
  move_quality text CHECK (move_quality IN (
    'brilliant', 'great', 'good', 'inaccuracy', 'mistake', 'blunder'
  )),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS puzzles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fen text NOT NULL,
  solution text[] NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  difficulty int NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  title text NOT NULL,
  explanation text NOT NULL,
  algorithm_connection text,
  interview_category text CHECK (interview_category IN (
    'algorithm', 'system_design', 'debugging', 'behavioral'
  )),
  rating int NOT NULL DEFAULT 1500,
  times_solved int NOT NULL DEFAULT 0,
  is_curated boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_puzzle_stats (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  puzzle_id uuid NOT NULL REFERENCES puzzles(id) ON DELETE CASCADE,
  solved boolean NOT NULL DEFAULT false,
  attempts int NOT NULL DEFAULT 0,
  time_taken int,
  solved_at timestamptz,
  UNIQUE (user_id, puzzle_id)
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  plan text NOT NULL CHECK (plan IN ('free', 'pro', 'team')) DEFAULT 'free',
  status text NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')) DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION calculate_elo(
  player_rating int,
  opponent_rating int,
  result numeric  
) RETURNS int AS $$
DECLARE
  k int;
  expected numeric;
BEGIN
  k := CASE
    WHEN player_rating < 2100 THEN 32
    WHEN player_rating < 2400 THEN 24
    ELSE 16
  END;
  expected := 1.0 / (1.0 + POWER(10, (opponent_rating - player_rating)::numeric / 400));
  RETURN ROUND(player_rating + k * (result - expected));
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_leaderboard(
  time_control_filter text DEFAULT 'rapid',
  limit_n int DEFAULT 50
) RETURNS TABLE (
  rank bigint,
  username text,
  display_name text,
  avatar_url text,
  rating int,
  games_played int
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY
      CASE time_control_filter
        WHEN 'rapid'  THEN p.rating_rapid
        WHEN 'blitz'  THEN p.rating_blitz
        WHEN 'bullet' THEN p.rating_bullet
        ELSE p.rating
      END DESC
    ) AS rank,
    p.username,
    p.display_name,
    p.avatar_url,
    CASE time_control_filter
      WHEN 'rapid'  THEN p.rating_rapid
      WHEN 'blitz'  THEN p.rating_blitz
      WHEN 'bullet' THEN p.rating_bullet
      ELSE p.rating
    END AS rating,
    p.games_played
  FROM profiles p
  WHERE p.games_played >= 0
  LIMIT limit_n;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION update_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE games             ENABLE ROW LEVEL SECURITY;
ALTER TABLE moves             ENABLE ROW LEVEL SECURITY;
ALTER TABLE puzzles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_puzzle_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions     ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_read_all"  ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_write_own" ON profiles FOR ALL    USING (auth.uid() = id);

CREATE POLICY "games_read_public"   ON games FOR SELECT
  USING (is_public = true OR auth.uid() IN (white_id, black_id));
CREATE POLICY "games_insert_player" ON games FOR INSERT
  WITH CHECK (auth.uid() IN (white_id, black_id));
CREATE POLICY "games_update_player" ON games FOR UPDATE
  USING (auth.uid() IN (white_id, black_id));

CREATE POLICY "moves_read_via_game" ON moves FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM games g
      WHERE g.id = game_id
        AND (g.is_public OR auth.uid() IN (g.white_id, g.black_id))
    )
  );
CREATE POLICY "moves_insert_player" ON moves FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games g
      WHERE g.id = game_id
        AND auth.uid() IN (g.white_id, g.black_id)
    )
  );

CREATE POLICY "puzzles_read_all" ON puzzles FOR SELECT USING (true);

CREATE POLICY "puzzle_stats_own" ON user_puzzle_stats FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "subscriptions_own" ON subscriptions FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_games_white_id     ON games(white_id);
CREATE INDEX IF NOT EXISTS idx_games_black_id     ON games(black_id);
CREATE INDEX IF NOT EXISTS idx_games_created_at   ON games(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moves_game_id      ON moves(game_id);
CREATE INDEX IF NOT EXISTS idx_profiles_rating    ON profiles(rating DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_username  ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_puzzle_stats_user  ON user_puzzle_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_puzzles_difficulty ON puzzles(difficulty);
CREATE INDEX IF NOT EXISTS idx_puzzles_category   ON puzzles(interview_category);
