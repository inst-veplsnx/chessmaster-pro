'use client'

interface CoordinateLabelProps {
  label: string
  position: 'file' | 'rank'
  isLight: boolean
}

export function CoordinateLabel({ label, position, isLight }: CoordinateLabelProps) {
  const color = isLight ? 'var(--board-dark)' : 'var(--board-light)'

  if (position === 'file') {
    return (
      <span
        className="absolute bottom-0.5 right-1 text-[10px] font-bold leading-none select-none pointer-events-none"
        style={{ color }}
      >
        {label}
      </span>
    )
  }

  return (
    <span
      className="absolute top-0.5 left-1 text-[10px] font-bold leading-none select-none pointer-events-none"
      style={{ color }}
    >
      {label}
    </span>
  )
}
