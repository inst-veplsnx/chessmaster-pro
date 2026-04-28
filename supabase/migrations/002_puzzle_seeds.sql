INSERT INTO puzzles (id, fen, solution, title, explanation, algorithm_connection, interview_category, difficulty, rating, tags, is_curated) VALUES

(
  gen_random_uuid(),
  'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
  ARRAY['Ng5', 'd5', 'exd5', 'Na5'],
  'The Fork: Binary Search in Action',
  'White''s knight on g5 simultaneously attacks f7, threatening both the rook on h8 and the queen on d8. This double attack forces Black into a losing position — just like binary search that eliminates half the search space with each comparison, the fork eliminates options for the opponent.',
  'A fork mirrors binary search: one move creates two threats, just as one comparison in binary search eliminates half the remaining candidates. When you see a fork opportunity, think "what single operation covers two requirements simultaneously?" — the same logic applies to designing efficient algorithms.',
  'algorithm',
  2,
  1350,
  ARRAY['fork', 'binary-search', 'double-attack'],
  true
),

(
  gen_random_uuid(),
  '2r3k1/pp3ppp/2n5/3Bp3/8/2P2N2/PP3PPP/R3K2R w KQ - 0 15',
  ARRAY['d6', 'Nb4', 'Nc5', 'Nd3'],
  'The Pin: Constraint Propagation',
  'The bishop on d5 pins the knight on c6 to the king — the knight cannot move without exposing the king to check. This is constraint propagation: one constraint (the pin) restricts all downstream moves of the pinned piece.',
  'A pin is constraint propagation: fixing one variable (the pinned piece) to satisfy a higher-priority constraint (king safety). In algorithm design, this appears in constraint satisfaction problems (CSP) — when you fix a variable, it reduces the domain of related variables. Recognize pins in code as hard constraints blocking seemingly valid moves.',
  'algorithm',
  3,
  1500,
  ARRAY['pin', 'constraint-propagation', 'CSP'],
  true
),

(
  gen_random_uuid(),
  '8/8/4k3/8/4N3/4K3/8/8 w - - 0 1',
  ARRAY['Nc5+', 'Kd6', 'Nb7+', 'Kc6', 'Nd8+'],
  'Knight Tour: Graph Traversal',
  'The knight must navigate to a specific square using L-shaped moves — each position is a node, each knight move is an edge. Finding the optimal path is a graph traversal problem solved with BFS (shortest path) or DFS (exhaustive search).',
  'The knight tour is literally graph traversal. Each board square is a node; each legal knight move is a directed edge. BFS finds the minimum number of moves between two squares; DFS with backtracking solves the full knight tour. In interviews, when you see "minimum steps" with constrained moves, think BFS on an implicit graph.',
  'algorithm',
  3,
  1450,
  ARRAY['knight-tour', 'graph-traversal', 'BFS', 'DFS'],
  true
),

(
  gen_random_uuid(),
  'r3k2r/ppp2ppp/2n5/3qp3/3P4/2N2N2/PPP2PPP/R2QKB1R w KQkq - 0 10',
  ARRAY['d5', 'Nb4', 'a3', 'Na6'],
  'Discovered Attack: Chain of Responsibility',
  'Moving the d-pawn reveals an attack from the queen on d1 along the d-file. The "discovering" piece (pawn) delegates the attack to the piece behind it (queen) — Chain of Responsibility pattern in chess.',
  'A discovered attack implements the Chain of Responsibility pattern: piece A moves, which activates piece B''s latent power. In software, this maps to middleware chains or event pipelines where one handler''s action triggers the next. When designing systems, ask: "What capabilities are currently blocked that one change could unlock?"',
  'algorithm',
  4,
  1600,
  ARRAY['discovered-attack', 'chain-of-responsibility', 'pipeline'],
  true
),

(
  gen_random_uuid(),
  '8/8/8/8/8/4k3/4p3/4K3 b - - 0 1',
  ARRAY['Kd3', 'Kf2', 'e1=Q+'],
  'Zugzwang: Backtracking Dead End',
  'Both sides are in zugzwang — any move worsens their position. This is the chess equivalent of a backtracking dead end where every available path leads to a worse state, forcing you to reconsider earlier decisions.',
  'Zugzwang is a backtracking dead end: every available move makes things worse. In recursive algorithms, this is the state where all branches fail and you must backtrack to a previous decision point. Recognizing "forced loss" positions early (pruning) is alpha-beta pruning in minimax — don''t explore branches you know are losing.',
  'algorithm',
  4,
  1650,
  ARRAY['zugzwang', 'backtracking', 'pruning', 'minimax'],
  true
),

(
  gen_random_uuid(),
  'r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 6',
  ARRAY['O-O', 'O-O', 'd4', 'exd4'],
  'Pawn Chain: Layered Architecture',
  'The pawn chain (d3-e4-f5 or similar) creates a tiered defense — each pawn protected by the one behind it. Removing the base of the chain collapses the whole structure. This is layered architecture: each layer depends on the one below.',
  'A pawn chain is layered architecture: the presentation layer (tip pawn) depends on business logic (middle pawn) which depends on the data layer (base pawn). Attack the base to collapse the chain. In system design, this means your most critical dependency is your lowest layer — if the database fails, everything above it fails. Design for resilience at the base.',
  'system_design',
  2,
  1300,
  ARRAY['pawn-chain', 'layered-architecture', 'dependencies'],
  true
),

(
  gen_random_uuid(),
  'r2q1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2NBPN2/PP3PPP/R1BQ1RK1 b - - 0 8',
  ARRAY['Ne4', 'Qc2', 'Nxd2', 'Qxd2'],
  'The Outpost: Strategic Caching',
  'An outpost is a square deep in the opponent''s territory that cannot be attacked by their pawns — a permanently safe forward position. Placing a knight on an outpost is like placing a cache node close to users: high value, unreachable by the opponent (low latency).',
  'An outpost is a CDN node or cache: placed where it can''t be "attacked" (evicted or bypassed), providing maximum forward coverage with minimum movement cost. In system design, identify your "outpost squares" — high-traffic, low-latency positions where a cache has maximum impact. A cache that can be invalidated trivially is not an outpost.',
  'system_design',
  3,
  1500,
  ARRAY['outpost', 'caching', 'CDN', 'forward-deployment'],
  true
),

(
  gen_random_uuid(),
  'r4rk1/ppp2ppp/2n5/3p4/3P4/2N2N2/PPP2PPP/R3K2R w KQ - 0 12',
  ARRAY['Rd1', 'Rfd8', 'Rfd1', 'Rac8'],
  'Open File Control: Load Balancing',
  'The rook dominates an open file (no pawns blocking), controlling access from top to bottom. Two rooks on the same file ("doubled rooks") cover all entry points. This is a load balancer: the open file is your public API endpoint, the rooks are server instances distributing traffic.',
  'Controlling an open file = load balancing an endpoint. One rook handles traffic, two rooks (doubled) give redundancy and throughput. In system design: an open file with no rook is an unprotected endpoint; an open file with two rooks is a load-balanced, fault-tolerant service. Always ask in design reviews: "Who controls this open file?"',
  'system_design',
  3,
  1550,
  ARRAY['open-file', 'load-balancing', 'redundancy'],
  true
),

(
  gen_random_uuid(),
  '8/8/3r4/8/8/8/3R4/3R4 w - - 0 1',
  ARRAY['R1d4', 'Rd7', 'Rd1d3', 'Rc6'],
  'Rook Battery: Horizontal Scaling',
  'Two rooks on the same file form a "battery" — their combined power is greater than the sum of their parts, as one supports the advance of the other. This is horizontal scaling: adding more instances of the same service multiplies throughput.',
  'A rook battery is horizontal scaling: two rooks on the same file act as a cluster. The lead rook can advance knowing the trailing rook provides backup — like a primary and replica in a database cluster. In system design interviews, when asked to scale a read-heavy service, the answer is often "add more rooks to the file" — read replicas behind a load balancer.',
  'system_design',
  4,
  1600,
  ARRAY['rook-battery', 'horizontal-scaling', 'replication'],
  true
),

(
  gen_random_uuid(),
  'r1bqk2r/pppp1ppp/2n2n2/2b5/4P3/2NP1N2/PPP2PPP/R1BQKB1R w KQkq - 0 6',
  ARRAY['Be3', 'Bxe3', 'fxe3', 'O-O'],
  'King Safety: Defense in Depth',
  'The king needs multiple layers of protection: the pawn shield in front, pieces defending from behind, and the corner position limiting attack angles. Remove one layer and the king becomes vulnerable — Defense in Depth security principle.',
  'King safety is Defense in Depth: the pawn shield is your firewall, the castled position is network segmentation, the defending pieces are your IDS/IPS. A single breach of the pawn shield is catastrophic only if there are no inner defenses. In system design, never rely on a single security layer — a compromised perimeter should still face authentication, authorization, and encryption barriers.',
  'system_design',
  2,
  1400,
  ARRAY['king-safety', 'defense-in-depth', 'security-layers'],
  true
),

(
  gen_random_uuid(),
  '7k/5ppp/8/8/8/8/5PPP/7K w - - 0 1',
  ARRAY['h4', 'h5', 'h6', 'g6'],
  'Stalemate Trap: Avoiding Deadlock',
  'White is winning but must avoid stalemating Black — if Black has no legal moves, the game is a draw. This is a deadlock: a situation where the "winning" move ends the game as a draw because the opponent has no valid next action.',
  'Stalemate is deadlock: Thread A (White) takes all resources, leaving Thread B (Black) with no valid moves — both freeze, nothing progresses. In code, deadlocks occur when locks are acquired in the wrong order. The debugging lesson: always verify the opponent/thread still has valid moves after your operation. Check for resource exhaustion before the final "kill" move.',
  'debugging',
  2,
  1300,
  ARRAY['stalemate', 'deadlock', 'resource-exhaustion'],
  true
),

(
  gen_random_uuid(),
  '6k1/5ppp/8/8/8/8/q7/6K1 b - - 0 1',
  ARRAY['Qa8+', 'Kh2', 'Qa2+', 'Kg1', 'Qa1+'],
  'Perpetual Check: Infinite Loop',
  'Black cannot checkmate White but can give infinite checks — perpetual check is a draw by repetition. This is an infinite loop: an operation that runs forever because the termination condition is never met.',
  'Perpetual check is an infinite loop: the queen keeps attacking (looping), the king keeps evading (the loop body runs), but the termination condition (checkmate) is never reached. In debugging, infinite loops often look like "progress" — things are happening, but state never advances to the exit condition. Add explicit loop counters and verify your termination invariant at each step.',
  'debugging',
  2,
  1350,
  ARRAY['perpetual-check', 'infinite-loop', 'termination-condition'],
  true
),

(
  gen_random_uuid(),
  'r1b1k2r/pppp1ppp/2n5/2b1p3/4P1q1/2NP1N2/PPP2PPP/R1BQKB1R w KQkq - 0 6',
  ARRAY['Nxe5', 'Qxd1+', 'Kxd1', 'Nxe5'],
  'Zwischenzug: Unexpected Intermediate State',
  'Instead of recapturing immediately (expected sequence), Black inserts an intermediate queen check — a "zwischenzug" or in-between move that changes everything. The opponent computed the wrong outcome because they missed an intermediate state.',
  'Zwischenzug is a race condition: you assume a sequence A→B→C, but an unexpected intermediate action A→X→B→C changes the final state. In concurrent systems, the "in-between move" is another thread mutating shared state between your read and write. Debug with: "What if something happens between steps 1 and 2?" Always check for intermediate state mutations.',
  'debugging',
  4,
  1700,
  ARRAY['zwischenzug', 'race-condition', 'intermediate-state', 'concurrency'],
  true
),

(
  gen_random_uuid(),
  'rnbqkbnr/ppp1pppp/8/3pP3/8/8/PPPP1PPP/RNBQKBNR b KQkq e6 0 2',
  ARRAY['dxe6', 'Nf3', 'exf1=Q+', 'Rxf1'],
  'En Passant: The Edge Case',
  'En passant is the most misunderstood rule in chess — a capture that can only happen under a very specific, one-turn-only condition. Players who don''t know this rule miss both the opportunity and the threat. This is the classic edge case: valid only in a narrow, easily-missed scenario.',
  'En passant is the textbook edge case: it only applies for exactly one move, only when a pawn advanced two squares on the immediately preceding turn, only on a specific file. Miss the condition, miss the bug. In code reviews and testing, ask: "What happens right after X happens?" Timing-dependent bugs (TTL expiry, session timeout, one-time tokens) follow exactly this pattern.',
  'debugging',
  3,
  1500,
  ARRAY['en-passant', 'edge-case', 'timing', 'one-time-condition'],
  true
),

(
  gen_random_uuid(),
  'rnbqkb1r/pppp1ppp/5n2/4p3/2B1P3/8/PPPP1PPP/RNBQK1NR w KQkq - 2 3',
  ARRAY['Bxf7+', 'Kxf7', 'Nxe5+', 'Ke6'],
  'Pawn Promotion: Type Coercion',
  'A pawn reaching the 8th rank promotes to any piece — most commonly a queen. The pawn''s "type" changes completely at the boundary condition (rank 8). Failing to account for this transformation is a classic chess programming bug.',
  'Pawn promotion is type coercion: the pawn (int) reaches a boundary and becomes a queen (object). In code, this appears as implicit type conversions at boundary conditions — a string "8" becoming the number 8, an integer overflow wrapping to negative, or a null becoming an empty string. Always validate type transformations at system boundaries: the 8th rank is your API input validation layer.',
  'debugging',
  3,
  1450,
  ARRAY['promotion', 'type-coercion', 'boundary-condition', 'type-safety'],
  true
),

(
  gen_random_uuid(),
  'r1bqk2r/pppp1ppp/2n2n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 5',
  ARRAY['Bxf7+', 'Kxf7', 'Nxe5+', 'Nxe5', 'Qh5+'],
  'The Greek Gift: Long-term Thinking',
  'White sacrifices the bishop (material loss) to expose the king (strategic gain). The material is gone, but the positional advantage persists for the rest of the game. Short-term thinkers refuse to sacrifice; long-term thinkers see the compound return.',
  'The Greek Gift sacrifice is long-term thinking: give up something valuable now for a lasting structural advantage. In interviews, this maps to "tell me about a time you made a hard short-term decision for long-term gain" — refactoring messy code before adding features, writing documentation that slows the sprint, or raising a difficult issue early. Quantify the long-term return.',
  'behavioral',
  3,
  1500,
  ARRAY['sacrifice', 'long-term-thinking', 'tradeoffs', 'strategic-investment'],
  true
),

(
  gen_random_uuid(),
  'rnbqkb1r/pppp1ppp/4pn2/8/3PP3/8/PPP2PPP/RNBQKBNR w KQkq - 0 3',
  ARRAY['Nc3', 'd5', 'e5', 'Nfd7'],
  'Tempo: Deadline Management',
  'A "tempo" is a turn. Playing a move that gains tempo forces the opponent to react rather than pursue their own plan — you control the pace. Losing tempo (moving the same piece twice for no gain) is equivalent to missing a sprint deadline.',
  'Tempo is deadline management: every move where your opponent must react is a deadline you control. Wasting tempo — moving a piece back to where it came from — is scope creep: effort expended with no net progress. In interviews: describe a time you had to manage competing priorities. Demonstrate you understand "cost of delay" — some work is worth doing late, other work compounds value when done early.',
  'behavioral',
  2,
  1300,
  ARRAY['tempo', 'deadline', 'time-management', 'prioritization'],
  true
),

(
  gen_random_uuid(),
  'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
  ARRAY['d4', 'exd4', 'Nxd4', 'Bb4+'],
  'Seizing the Initiative: Proactive Ownership',
  'White opens with d4, immediately seizing central control and forcing Black to react. The player with initiative dictates the game''s direction. Passive players wait and respond; players with initiative shape the outcome.',
  'Initiative is proactive ownership: you define the agenda rather than respond to it. In behavioral interviews, "initiative" means identifying a problem before being asked, proposing a solution, and driving it to completion. The opposite — losing initiative — is a red flag: waiting for explicit instructions, asking permission for every step, letting problems compound. Show the interviewer you''re a center-controller, not a reactor.',
  'behavioral',
  2,
  1350,
  ARRAY['initiative', 'proactive', 'ownership', 'leadership'],
  true
),

(
  gen_random_uuid(),
  'r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQ1RK1 w - - 0 8',
  ARRAY['Bxf7+', 'Rxf7', 'Nxe5', 'Nxe5', 'Qh5'],
  'The Exchange Sacrifice: Managing Technical Debt',
  'White sacrifices a rook for a minor piece (losing material) to gain a permanent structural advantage — a dominant knight on e5 and a weakened enemy king. The rook is technical debt being traded for architectural clarity.',
  'The exchange sacrifice is technical debt management: you give up a rook (immediate capability, e.g., test coverage or a working feature) to fix structural problems (refactor the architecture) that would compound over time. In interviews: "Describe a time you took on technical debt." The key is showing you consciously chose the tradeoff, planned the payoff, and executed the repayment — not that you just accumulated it accidentally.',
  'behavioral',
  4,
  1600,
  ARRAY['exchange-sacrifice', 'technical-debt', 'tradeoffs', 'architectural-decision'],
  true
),

(
  gen_random_uuid(),
  '8/5k2/4p3/4P3/4K3/8/8/8 w - - 0 1',
  ARRAY['Kd4', 'Kf8', 'Kd5', 'Ke7', 'Kc6'],
  'Endgame Technique: Code Refactoring',
  'The king and pawn endgame requires precise, methodical technique — no brilliant sacrifices, just systematic execution of known principles (opposition, key squares). This is refactoring: disciplined, step-by-step improvement with no room for shortcuts.',
  'Endgame technique is refactoring: you''ve won the strategic battle (the feature works), now comes precise execution to convert the advantage (make the code maintainable). Good endgame technique means: small, verified steps; no speculative moves; known patterns applied consistently. In interviews: describe a large refactor you led. Emphasize planning (which squares to target), incremental steps (not one giant rewrite), and measurable progress (regression tests staying green).',
  'behavioral',
  3,
  1450,
  ARRAY['endgame', 'refactoring', 'systematic-execution', 'technical-excellence'],
  true
);
