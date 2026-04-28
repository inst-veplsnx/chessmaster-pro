'use client'

import { useState, useEffect, useCallback } from 'react'

export type BoardTheme = 'classic' | 'marble' | 'cyberpunk' | 'tournament'
export type PieceTheme = 'classic' | 'modern' | 'pixel'

export interface AppSettings {
  boardTheme: BoardTheme
  pieceTheme: PieceTheme
  soundEnabled: boolean
  animationsEnabled: boolean
  showCoordinates: boolean
  highlightMoves: boolean
}

const DEFAULTS: AppSettings = {
  boardTheme: 'classic',
  pieceTheme: 'classic',
  soundEnabled: true,
  animationsEnabled: true,
  showCoordinates: true,
  highlightMoves: true,
}

const KEY = 'chessmaster-settings'

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) })
    } catch {}
    setLoaded(true)
  }, [])

  const update = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value }
      try {
        localStorage.setItem(KEY, JSON.stringify(next))
      } catch {}
      return next
    })
  }, [])

  return { settings, update, loaded }
}
