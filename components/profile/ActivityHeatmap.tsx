'use client'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface HeatmapDay {
  day: string
  count: number
}

interface ActivityHeatmapProps {
  data: HeatmapDay[]
}

function getCellClass(count: number): string {
  if (count === 0) return 'bg-secondary'
  if (count <= 2) return 'bg-primary/25'
  if (count <= 5) return 'bg-primary/55'
  return 'bg-primary'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  // Build a 52-week grid ending today
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Start from 364 days ago, aligned to Sunday
  const start = new Date(today)
  start.setDate(today.getDate() - 363)
  const dayOfWeek = start.getDay()
  start.setDate(start.getDate() - dayOfWeek)

  const countMap = new Map<string, number>()
  for (const d of data) {
    countMap.set(d.day, d.count)
  }

  // Build columns (weeks), each column is an array of 7 days
  const weeks: { date: string; count: number }[][] = []
  const cursor = new Date(start)

  while (cursor <= today) {
    const week: { date: string; count: number }[] = []
    for (let d = 0; d < 7; d++) {
      const dateStr = cursor.toISOString().slice(0, 10)
      const isInRange = cursor <= today
      week.push({
        date: dateStr,
        count: isInRange ? (countMap.get(dateStr) ?? 0) : -1,
      })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }

  const monthLabels: { label: string; col: number }[] = []
  let lastMonth = -1
  weeks.forEach((week, i) => {
    const month = new Date(week[0].date).getMonth()
    if (month !== lastMonth) {
      monthLabels.push({
        label: new Date(week[0].date).toLocaleDateString('ru-RU', { month: 'short' }),
        col: i,
      })
      lastMonth = month
    }
  })

  return (
    <TooltipProvider>
      <div className="overflow-x-auto">
        {/* Month labels */}
        <div className="flex mb-1" style={{ paddingLeft: '0px' }}>
          {monthLabels.map(({ label, col }) => (
            <div
              key={col}
              className="text-xs text-muted-foreground"
              style={{ position: 'absolute', marginLeft: `${col * 14}px` }}
            >
              {label}
            </div>
          ))}
        </div>

        <div className="relative mt-5">
          <div className="flex gap-[2px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[2px]">
                {week.map((day, di) => (
                  <Tooltip key={di}>
                    <TooltipTrigger asChild>
                      <div
                        className={`w-3 h-3 rounded-[2px] transition-colors ${
                          day.count === -1 ? 'bg-transparent' : getCellClass(day.count)
                        }`}
                      />
                    </TooltipTrigger>
                    {day.count >= 0 && (
                      <TooltipContent>
                        <p className="text-xs">
                          {day.count === 0
                            ? `Нет игр — ${formatDate(day.date)}`
                            : `${day.count} ${day.count === 1 ? 'игра' : day.count < 5 ? 'игры' : 'игр'} — ${formatDate(day.date)}`}
                        </p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1 mt-2 justify-end">
          <span className="text-xs text-muted-foreground mr-1">Меньше</span>
          {[0, 1, 3, 6].map((n) => (
            <div key={n} className={`w-3 h-3 rounded-[2px] ${getCellClass(n)}`} />
          ))}
          <span className="text-xs text-muted-foreground ml-1">Больше</span>
        </div>
      </div>
    </TooltipProvider>
  )
}
