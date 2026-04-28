'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

const SKILL_LEVELS = [
  { label: 'Новичок', description: 'Только изучаю правила', elo: 800, puzzleRating: 800 },
  {
    label: 'Любитель',
    description: 'Знаю основы, играю для удовольствия',
    elo: 1200,
    puzzleRating: 1100,
  },
  { label: 'Средний', description: 'Понимаю тактику и дебюты', elo: 1600, puzzleRating: 1400 },
  {
    label: 'Продвинутый',
    description: 'Клубный игрок, изучаю стратегию',
    elo: 2000,
    puzzleRating: 1700,
  },
]

const TIME_CONTROLS = [
  { id: 'bullet', label: 'Пуля', description: '1 мин' },
  { id: 'blitz', label: 'Блиц', description: '3+2' },
  { id: 'rapid', label: 'Рапид', description: '10 мин' },
  { id: 'classical', label: 'Классика', description: '30 мин' },
]

const BOARD_THEMES = [
  { id: 'classic', label: 'Классика', light: '#f0d9b5', dark: '#b58863' },
  { id: 'marble', label: 'Мрамор', light: '#e8e8e8', dark: '#6b6b6b' },
  { id: 'cyberpunk', label: 'Киберпанк', light: '#0d1117', dark: '#00ffcc' },
  { id: 'tournament', label: 'Турнир', light: '#fffff0', dark: '#769656' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { profile, updateProfile } = useAuth()
  const [step, setStep] = useState(1)
  const [skill, setSkill] = useState(1)
  const [timeControl, setTimeControl] = useState('rapid')
  const [boardTheme, setBoardTheme] = useState('classic')
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [loading, setLoading] = useState(false)

  async function finish() {
    setLoading(true)
    await updateProfile({
      display_name: displayName || undefined,
      preferred_time_control: timeControl,
      board_theme: boardTheme,
      puzzle_rating: SKILL_LEVELS[skill].puzzleRating,
    })
    setLoading(false)
    router.push('/play')
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                step > s
                  ? 'bg-green-500 text-white'
                  : step === s
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground'
              }`}
            >
              {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
            </div>
            {s < 3 && <div className={`h-px flex-1 ${step > s ? 'bg-green-500' : 'bg-border'}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold">Как тебя зовут?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Можно изменить позже в настройках</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Отображаемое имя</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={profile?.username ?? 'Имя игрока'}
              className="w-full rounded-xl border border-border/60 bg-secondary/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Твой уровень игры</p>
            <div className="grid grid-cols-2 gap-2">
              {SKILL_LEVELS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setSkill(i)}
                  className={`rounded-xl border p-3 text-left transition-colors ${
                    skill === i
                      ? 'border-primary bg-primary/10'
                      : 'border-border/60 bg-secondary/30 hover:border-primary/50'
                  }`}
                >
                  <p className="text-sm font-semibold">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </button>
              ))}
            </div>
          </div>
          <Button className="w-full gap-2" onClick={() => setStep(2)}>
            Далее <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold">Контроль времени</h2>
            <p className="mt-1 text-sm text-muted-foreground">Какой формат игры предпочитаешь?</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {TIME_CONTROLS.map((tc) => (
              <button
                key={tc.id}
                onClick={() => setTimeControl(tc.id)}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  timeControl === tc.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border/60 bg-secondary/30 hover:border-primary/50'
                }`}
              >
                <p className="text-sm font-semibold">{tc.label}</p>
                <p className="text-xs text-muted-foreground">{tc.description}</p>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
              Назад
            </Button>
            <Button className="flex-1 gap-2" onClick={() => setStep(3)}>
              Далее <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-bold">Тема доски</h2>
            <p className="mt-1 text-sm text-muted-foreground">Выбери внешний вид доски</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {BOARD_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setBoardTheme(theme.id)}
                className={`rounded-xl border p-3 transition-colors ${
                  boardTheme === theme.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border/60 bg-secondary/30 hover:border-primary/50'
                }`}
              >
                <div className="mb-2 grid grid-cols-4 gap-0.5 overflow-hidden rounded-lg">
                  {Array.from({ length: 16 }, (_, i) => (
                    <div
                      key={i}
                      className="aspect-square"
                      style={{
                        backgroundColor:
                          (Math.floor(i / 4) + (i % 4)) % 2 === 0 ? theme.light : theme.dark,
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs font-semibold">{theme.label}</p>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
              Назад
            </Button>
            <Button className="flex-1 gap-2" onClick={finish} disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Начать играть
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
