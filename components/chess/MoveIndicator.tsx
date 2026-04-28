'use client'

interface MoveIndicatorProps {
  isCapture: boolean
}

export function MoveIndicator({ isCapture }: MoveIndicatorProps) {
  if (isCapture) {
    return (
      <div
        className="absolute inset-0 rounded-full border-4 border-black/20 pointer-events-none z-10"
        style={{ margin: '3px' }}
      />
    )
  }
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div className="w-[34%] h-[34%] rounded-full bg-black/20" />
    </div>
  )
}
