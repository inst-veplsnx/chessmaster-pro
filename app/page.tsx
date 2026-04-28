import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { ArrowRight, ChevronRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Navbar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 h-16 border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
            <div className="relative h-7 w-7 shrink-0">
              <Image src="/pieces/classic/wN.svg" alt="Chess knight" fill unoptimized />
            </div>
            <span className="font-serif text-[17px] font-bold tracking-tight">ChessMaster Pro</span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {[
              { href: '/play', label: 'Играть' },
              { href: '/puzzles', label: 'Задачи' },
              { href: '/leaderboard', label: 'Рейтинг' },
              { href: '/pricing', label: 'Цены' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Войти</Link>
            </Button>
            <Button size="sm" className="cursor-pointer" asChild>
              <Link href="/play">Играть бесплатно</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section className="relative min-h-[91vh] overflow-hidden flex items-center">
        {/* Subtle chess grid texture */}
        <div className="pointer-events-none absolute inset-0 chess-texture opacity-60" />
        {/* Gradient fade-out at bottom */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent" />

        <div className="relative mx-auto w-full max-w-7xl px-5 lg:px-8 py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[3fr_2fr] lg:gap-16">
            {/* ── Left: text ───────────────────────────────── */}
            <div>
              {/* Move notation caption */}
              <div className="mb-8 flex items-center gap-3">
                <div className="h-px w-10 bg-primary" />
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary/80">
                  1. e4 — Interview Prep Engine
                </span>
              </div>

              {/* Headline */}
              <h1 className="mb-8 font-serif leading-[0.93]">
                <span className="block text-[clamp(3rem,8vw,6.5rem)] font-normal text-foreground">
                  Думай ходами.
                </span>
                <span className="block text-[clamp(2.2rem,6vw,4.8rem)] font-bold italic text-primary">
                  Побеждай
                </span>
                <span className="block text-[clamp(2.2rem,6vw,4.8rem)] font-bold italic text-primary">
                  на интервью.
                </span>
              </h1>

              <p className="mb-10 max-w-md text-[1.0625rem] leading-relaxed text-muted-foreground">
                Геймифицированная платформа для подготовки к собеседованиям FAANG. Каждый шахматный
                паттерн — это алгоритм. Каждая задача — LeetCode в игровой форме.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Button size="lg" className="cursor-pointer gap-2 px-8 text-base" asChild>
                  <Link href="/play">
                    Начать играть
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Link
                  href="/puzzles"
                  className="flex cursor-pointer items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Задачи для интервью
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Social mini-proof */}
              <div className="mt-12 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {['wK', 'wQ', 'wR', 'wB'].map((p) => (
                    <div
                      key={p}
                      className="relative h-8 w-8 rounded-full border-2 border-background bg-card p-1"
                    >
                      <Image
                        src={`/pieces/classic/${p}.svg`}
                        alt=""
                        fill
                        unoptimized
                        className="p-0.5"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-mono font-semibold text-foreground">12 400+</span> игроков
                  готовятся к FAANG
                </p>
              </div>
            </div>

            {/* ── Right: game card ─────────────────────────── */}
            <div className="relative hidden lg:block">
              {/* Large decorative queen piece, top-right overflow */}
              <div className="pointer-events-none absolute -right-8 -top-12 h-52 w-52 opacity-[0.07]">
                <Image src="/pieces/classic/wQ.svg" alt="" fill unoptimized />
              </div>

              <GameCard />

              {/* Floating evaluation badge */}
              <div className="absolute -bottom-4 -left-4 rounded-xl border border-border bg-card px-4 py-2.5 shadow-lg">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Оценка Stockfish
                </p>
                <p className="font-mono text-lg font-bold text-primary">+0.3 ↗</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ────────────────────────────────────── */}
      <section className="border-y border-border/50">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid grid-cols-2 divide-x divide-border/50 md:grid-cols-4">
            {STATS.map(({ value, label, notation }) => (
              <div key={label} className="py-9 px-6 text-center">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary/70 mb-1">
                  {notation}
                </p>
                <p className="font-mono text-3xl font-bold text-foreground">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features — editorial magazine grid ─────────────── */}
      <section className="py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          {/* Section header */}
          <div className="mb-14 flex items-end justify-between">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <div className="h-px w-8 bg-primary" />
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary/70">
                  02 — Возможности
                </span>
              </div>
              <h2 className="font-serif text-4xl font-bold leading-tight">
                Инструменты для <em className="text-primary">роста</em>
              </h2>
            </div>
          </div>

          {/* Magazine grid */}
          <div className="rounded-2xl border border-border/50 overflow-hidden">
            <div className="grid lg:grid-cols-3">
              {/* Big feature: AI Analysis (2 cols) */}
              <div className="lg:col-span-2 border-b border-r-0 border-border/50 lg:border-b-0 lg:border-r p-8 lg:p-10 flex flex-col justify-between gap-8">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="relative h-8 w-8 opacity-70">
                      <Image src="/pieces/classic/bQ.svg" alt="" fill unoptimized />
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono border-primary/30 text-primary"
                    >
                      Stockfish 16
                    </Badge>
                  </div>
                  <h3 className="font-serif mt-4 text-2xl font-bold">AI-разбор партий</h3>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    После каждой партии Stockfish анализирует каждый ход (depth 18): определяет
                    блестящие ходы, ошибки и зевки. График оценки, навигация по позициям, метрики
                    точности — как у гроссмейстера.
                  </p>
                </div>
                {/* Inline eval graph mockup */}
                <div className="rounded-xl border border-border/50 bg-muted/30 px-5 py-4">
                  <p className="mb-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    Оценка по ходам
                  </p>
                  <div className="flex items-end gap-0.5 h-14">
                    {EVAL_BARS.map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm transition-all"
                        style={{
                          height: `${h}%`,
                          backgroundColor:
                            h > 60
                              ? 'hsl(var(--primary) / 0.7)'
                              : h > 40
                                ? 'hsl(var(--primary) / 0.4)'
                                : 'hsl(var(--destructive) / 0.5)',
                        }}
                      />
                    ))}
                  </div>
                  <div className="mt-2 flex justify-between font-mono text-[9px] text-muted-foreground">
                    <span>ход 1</span>
                    <span className="text-primary">Ваша точность: 87%</span>
                    <span>ход 40</span>
                  </div>
                </div>
              </div>

              {/* Right small cell: Interview Prep */}
              <div className="border-b border-border/50 lg:border-b-0 p-8 flex flex-col gap-4">
                <div className="relative h-12 w-12">
                  <Image
                    src="/pieces/classic/wK.svg"
                    alt=""
                    fill
                    unoptimized
                    className="opacity-80"
                  />
                </div>
                <div>
                  <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 text-[10px]">
                    Эксклюзивно
                  </Badge>
                  <h3 className="font-serif text-xl font-bold">Interview Prep Mode</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Форк = divide & conquer. Связка = dependency lock. Вилка = two-pointer. Паттерны
                    алгоритмов через шахматные задачи.
                  </p>
                </div>
                <div className="mt-auto">
                  <Link
                    href="/puzzles"
                    className="flex cursor-pointer items-center gap-1 text-sm font-medium text-primary hover:underline underline-offset-4"
                  >
                    Перейти к задачам <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Second row */}
            <div className="grid border-t border-border/50 md:grid-cols-3">
              {BOTTOM_FEATURES.map((f, i) => (
                <div
                  key={f.title}
                  className={`p-8 flex flex-col gap-3 ${
                    i < 2 ? 'border-b border-r-0 md:border-b-0 md:border-r border-border/50' : ''
                  }`}
                >
                  <div className="relative h-9 w-9">
                    <Image src={f.piece} alt="" fill unoptimized className="opacity-75" />
                  </div>
                  <h3 className="font-serif text-lg font-bold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  {f.badge && (
                    <span className="mt-auto font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {f.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Game modes — horizontal editorial rows ──────────── */}
      <section className="border-t border-border/50 py-28">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          {/* Section header */}
          <div className="mb-14">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px w-8 bg-primary" />
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary/70">
                03 — Режимы игры
              </span>
            </div>
            <h2 className="font-serif text-4xl font-bold leading-tight">
              Выбери <em className="text-primary">формат</em>
            </h2>
          </div>

          <div className="divide-y divide-border/50">
            {MODES.map((mode) => (
              <ModeRow key={mode.title} {...mode} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-border/50 py-36">
        <div className="pointer-events-none absolute inset-0 chess-texture opacity-40" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 top-0 bg-gradient-to-b from-background/50 to-background/95" />

        {/* Large decorative knight, background */}
        <div className="pointer-events-none absolute -right-8 bottom-0 h-[480px] w-[480px] opacity-[0.04]">
          <Image src="/pieces/classic/wN.svg" alt="" fill unoptimized />
        </div>

        <div className="relative mx-auto max-w-2xl px-5 text-center">
          {/* Mini piece row */}
          <div className="mb-8 flex items-center justify-center gap-1">
            {['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR'].map((p, i) => (
              <div key={i} className="relative h-6 w-6 opacity-30">
                <Image src={`/pieces/classic/${p}.svg`} alt="" fill unoptimized />
              </div>
            ))}
          </div>

          <h2 className="mb-5 font-serif text-5xl font-bold leading-tight lg:text-6xl">
            Готов мыслить
            <br />
            <em className="text-primary">как гроссмейстер?</em>
          </h2>
          <p className="mb-10 text-muted-foreground">
            Начни бесплатно. Никаких кредитных карт, никаких ограничений на старте.
          </p>
          <Button size="lg" className="cursor-pointer px-12 text-base" asChild>
            <Link href="/play">
              Начать сейчас
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="mt-5 font-mono text-[11px] text-muted-foreground/60">
            1. e4 e5 2. Nf3 Nc6 3. Bb5 — Испанская партия
          </p>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-border/50 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 text-xs text-muted-foreground lg:px-8">
          <span className="font-mono">1. e4 — ChessMaster Pro © 2026</span>
          <span>Построено для будущих инженеров</span>
        </div>
      </footer>
    </div>
  )
}

/* ── Game card (hero right side) ─────────────────────────── */
function GameCard() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden glow-gold">
      {/* Card header */}
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="font-mono text-[11px] text-muted-foreground">Live · Blitz 3+2</span>
        </div>
        <Badge variant="outline" className="font-mono text-[10px] border-primary/30 text-primary">
          ELO 2847
        </Badge>
      </div>

      {/* Black player */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="relative h-5 w-5">
            <Image src="/pieces/classic/bK.svg" alt="" fill unoptimized />
          </div>
          <span className="font-mono text-xs text-muted-foreground">Magnus_Dev</span>
          <span className="font-mono text-[10px] text-muted-foreground/60">2847</span>
        </div>
        <span className="font-mono text-sm font-bold text-red-400">0:34</span>
      </div>

      {/* Board */}
      <MiniBoard />

      {/* White player */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="relative h-5 w-5">
            <Image src="/pieces/classic/wK.svg" alt="" fill unoptimized />
          </div>
          <span className="font-mono text-xs">AlgoKing</span>
          <span className="font-mono text-[10px] text-muted-foreground/60">2831</span>
        </div>
        <span className="font-mono text-sm font-bold text-foreground">2:18</span>
      </div>

      {/* Move history */}
      <div className="border-t border-border/50 px-4 py-3">
        <p className="font-mono text-[10px] leading-relaxed text-muted-foreground">
          1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6
          <span className="text-primary"> 5. O-O</span> Be7 6. Re1 b5
        </p>
      </div>
    </div>
  )
}

/* ── Mini board (static preview) ─────────────────────────── */
function MiniBoard() {
  const PIECES: Record<number, string> = {
    0: 'bR',
    2: 'bB',
    3: 'bQ',
    4: 'bK',
    5: 'bB',
    6: 'bN',
    7: 'bR',
    8: 'bP',
    9: 'bP',
    10: 'bP',
    11: 'bP',
    13: 'bP',
    14: 'bP',
    15: 'bP',
    28: 'bP',
    36: 'wP',
    48: 'wP',
    49: 'wP',
    50: 'wP',
    51: 'wP',
    52: 'wP',
    54: 'wP',
    55: 'wP',
    56: 'wR',
    57: 'wN',
    58: 'wB',
    59: 'wQ',
    60: 'wK',
    61: 'wB',
    62: 'wN',
    63: 'wR',
  }
  return (
    <div className="grid grid-cols-8">
      {Array.from({ length: 64 }, (_, i) => {
        const file = i % 8
        const rank = 7 - Math.floor(i / 8)
        const sqIdx = rank * 8 + file
        const isLight = (file + rank) % 2 !== 0
        const piece = PIECES[sqIdx]
        return (
          <div
            key={i}
            className="flex aspect-square select-none items-center justify-center p-[7%]"
            style={{ backgroundColor: isLight ? '#f0d9b5' : '#b58863' }}
          >
            {piece && (
              <div className="relative h-full w-full">
                <Image
                  src={`/pieces/classic/${piece}.svg`}
                  alt={piece}
                  fill
                  unoptimized
                  draggable={false}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Mode row ─────────────────────────────────────────────── */
function ModeRow({
  piece,
  title,
  desc,
  badge,
  href,
  highlight,
}: {
  piece: string
  title: string
  desc: string
  badge: string
  href: string
  highlight?: boolean
}) {
  return (
    <Link
      href={href}
      className="group -mx-5 flex cursor-pointer items-center gap-6 rounded-xl px-5 py-7 transition-colors hover:bg-card/60 lg:-mx-8 lg:px-8"
    >
      {/* Piece image */}
      <div className="relative h-14 w-14 shrink-0 opacity-70 transition-opacity group-hover:opacity-100">
        <Image src={`/pieces/classic/${piece}`} alt="" fill unoptimized />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2.5 mb-1">
          <h3 className="font-serif text-xl font-bold">{title}</h3>
          <Badge
            variant={highlight ? 'default' : 'secondary'}
            className={`text-[10px] ${highlight ? 'bg-primary/15 text-primary border-primary/20' : ''}`}
          >
            {badge}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>

      {/* Arrow */}
      <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground/30 transition-all group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  )
}

/* ── Static data ─────────────────────────────────────────── */
const STATS = [
  { value: '12 400+', label: 'Игроков', notation: 'e4' },
  { value: '340+', label: 'Задач', notation: 'Nf3' },
  { value: '98%', label: 'Успех на интервью', notation: 'O-O' },
  { value: '20', label: 'Уровней AI', notation: 'Bb5' },
]

const EVAL_BARS = [
  52, 55, 58, 54, 61, 65, 60, 63, 67, 70, 68, 72, 75, 69, 66, 71, 74, 78, 72, 76, 80, 75, 69, 62,
  58, 54, 51, 48, 44, 40,
]

const BOTTOM_FEATURES = [
  {
    piece: '/pieces/classic/wR.svg',
    title: 'Рейтинговые партии',
    desc: 'Система ELO, таблица лидеров, прогресс по контролям времени: пуля, блиц, рапид, классика.',
    badge: 'ELO · Рейтинг',
  },
  {
    piece: '/pieces/classic/wN.svg',
    title: 'Чистый движок',
    desc: 'TypeScript движок: рокировка, взятие на проходе, промоция, правило 50 ходов. 107 юнит-тестов.',
    badge: '107 тестов',
  },
  {
    piece: '/pieces/classic/wB.svg',
    title: 'Мультиплеер',
    desc: 'Живые партии через WebSocket в реальном времени. Чат, предложение ничьей, переподключение.',
    badge: 'WebSocket',
  },
]

const MODES = [
  {
    piece: 'wN.svg',
    title: 'Против себя',
    desc: 'Изучай дебюты и эндшпили без давления времени. Идеально для начинающих.',
    badge: 'Бесплатно',
    href: '/play',
  },
  {
    piece: 'wQ.svg',
    title: 'Против AI',
    desc: '20 уровней сложности (600–2500 Эло) + режим тренера с подсказками Stockfish после каждого хода.',
    badge: 'Популярно',
    href: '/play',
    highlight: true,
  },
  {
    piece: 'wR.svg',
    title: 'Онлайн-партии',
    desc: 'Рейтинговые и тренировочные партии с игроками со всего мира. Живой чат и реванш.',
    badge: 'Новое',
    href: '/play/online',
  },
]
