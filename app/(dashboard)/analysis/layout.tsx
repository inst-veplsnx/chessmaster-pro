import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Анализ',
  description:
    'Анализ шахматных партий с Stockfish 16. Оценка каждого хода, точность и разбор ошибок.',
}

export default function AnalysisLayout({ children }: { children: React.ReactNode }) {
  return children
}
