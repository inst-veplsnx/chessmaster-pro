'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

interface EvalPoint {
  move: number
  eval: number
  label: string
}

interface EvalChartProps {
  data: EvalPoint[]
  currentMove?: number
  onMoveClick?: (move: number) => void
}

function clampEval(cp: number): number {
  return Math.max(-1000, Math.min(1000, cp))
}

function formatEval(cp: number): string {
  if (Math.abs(cp) > 900) return cp > 0 ? '+M' : '-M'
  const pawns = cp / 100
  return (pawns > 0 ? '+' : '') + pawns.toFixed(1)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as EvalPoint
  return (
    <div className="rounded-lg border border-border/60 bg-card px-3 py-2 text-xs shadow-lg">
      <p className="text-muted-foreground">{d.label}</p>
      <p className="font-bold">{formatEval(d.eval)}</p>
    </div>
  )
}

export function EvalChart({ data, currentMove, onMoveClick }: EvalChartProps) {
  const chartData = data.map((d) => ({ ...d, eval: clampEval(d.eval) }))

  return (
    <ResponsiveContainer width="100%" height={96}>
      <AreaChart
        data={chartData}
        margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
        onClick={(e: unknown) => {
          const ev = e as { activePayload?: { payload: EvalPoint }[] }
          if (ev?.activePayload?.[0] && onMoveClick) {
            onMoveClick(ev.activePayload[0].payload.move)
          }
        }}
        style={{ cursor: onMoveClick ? 'pointer' : 'default' }}
      >
        <defs>
          <linearGradient id="whiteGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ffffff" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="blackGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
          </linearGradient>
        </defs>

        <XAxis dataKey="move" hide />
        <YAxis domain={[-1000, 1000]} hide />
        <ReferenceLine y={0} stroke="hsl(var(--border))" strokeWidth={1} />

        {currentMove !== undefined && (
          <ReferenceLine
            x={currentMove}
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            strokeDasharray="4 2"
          />
        )}

        <Tooltip content={<CustomTooltip />} />

        {/* White advantage area (above 0) */}
        <Area
          type="monotone"
          dataKey="eval"
          stroke="#ffffff"
          strokeWidth={1.5}
          fill="url(#whiteGrad)"
          dot={false}
          activeDot={{ r: 3, fill: 'hsl(var(--primary))' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
