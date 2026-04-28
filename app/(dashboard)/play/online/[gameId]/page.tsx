'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Handshake, Link as LinkIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMultiplayerGame } from '@/hooks/useMultiplayerGame'
import { useAuth } from '@/hooks/useAuth'
import { useSettings } from '@/hooks/useSettings'
import { PlayerCard } from '@/components/multiplayer/PlayerCard'
import { ChatBox } from '@/components/multiplayer/ChatBox'
import { DrawOfferBanner } from '@/components/multiplayer/DrawOfferBanner'
import { DisconnectOverlay } from '@/components/multiplayer/DisconnectOverlay'
import { ResignConfirm } from '@/components/multiplayer/ResignConfirm'

const ChessBoard = dynamic(
  () => import('@/components/chess/ChessBoard').then((m) => m.ChessBoard),
  {
    ssr: false,
    loading: () => <div className="aspect-square w-full animate-pulse rounded-xl bg-muted" />,
  }
)

export default function OnlineGamePage({ params }: { params: { gameId: string } }) {
  const { gameId } = params
  const router = useRouter()
  const { profile } = useAuth()
  const { settings } = useSettings()

  const mp = useMultiplayerGame(gameId)

  const myUsername = profile?.username ?? ''
  const isMyTurn = mp.gameState?.turn === mp.myColor
  const isOver = !!mp.gameResult
  const opponentColor = mp.myColor === 'white' ? 'black' : 'white'
  const opponentInfo = mp.myColor === 'white' ? mp.black : mp.white
  const myInfo = mp.myColor === 'white' ? mp.white : mp.black

  if (isOver) {
    const res = mp.gameResult!
    const iWon = res.winner === mp.myColor
    const isDraw = res.winner === null

    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-5 text-center">
          <div className="text-5xl">{isDraw ? '🤝' : iWon ? '🏆' : '😔'}</div>
          <div>
            <h2 className="text-2xl font-bold">
              {isDraw ? 'Ничья!' : iWon ? 'Вы победили!' : 'Вы проиграли'}
            </h2>
            {res.drawReason && (
              <p className="mt-1 text-sm text-muted-foreground capitalize">
                {res.drawReason.replace('-', ' ')}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button className="flex-1" onClick={() => router.push('/play/online')}>
              Новая партия
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => router.push('/play')}>
              В меню
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-0">
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LinkIcon className="h-3.5 w-3.5" />
          <span className="font-mono text-xs">{gameId.slice(0, 8)}…</span>
        </div>
        <div className="flex items-center gap-2">
          {!isOver && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={mp.offerDraw}
              disabled={isOver}
            >
              <Handshake className="h-3.5 w-3.5" />
              Ничья
            </Button>
          )}
          <ResignConfirm onConfirm={mp.resign} disabled={isOver} />
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-start gap-4 overflow-auto p-4 lg:flex-row lg:items-start lg:justify-center lg:p-6">
        <div className="w-full max-w-[520px] space-y-2">
          {opponentInfo && (
            <PlayerCard
              username={opponentInfo.username}
              rating={opponentInfo.rating}
              color={opponentColor}
              timeMs={mp.clocks[opponentColor]}
              isActive={!isOver && mp.gameState?.turn === opponentColor}
            />
          )}

          <div className="relative">
            {mp.gameState ? (
              <ChessBoard
                gameState={mp.gameState}
                orientation={mp.myColor ?? 'white'}
                boardTheme={settings.boardTheme}
                interactive={isMyTurn && !isOver}
                onMove={mp.makeMove}
                showCoordinates={settings.showCoordinates}
                highlightLastMove={settings.highlightMoves}
              />
            ) : (
              <div className="aspect-square w-full animate-pulse rounded-xl bg-muted" />
            )}
            {mp.opponentDisconnected && (
              <DisconnectOverlay secondsLeft={mp.disconnectSecondsLeft} />
            )}
          </div>

          {myInfo && mp.myColor && (
            <PlayerCard
              username={myInfo.username}
              rating={myInfo.rating}
              color={mp.myColor}
              timeMs={mp.clocks[mp.myColor]}
              isActive={isMyTurn && !isOver}
              isMyCard
            />
          )}
        </div>

        <div className="w-full max-w-[220px] space-y-3">
          {mp.drawOffered && (
            <DrawOfferBanner onAccept={mp.acceptDraw} onDecline={mp.declineDraw} />
          )}

          <ChatBox messages={mp.messages} myUsername={myUsername} onSend={mp.sendChat} />

          <div className="rounded-xl border border-border/60 bg-card/60 p-3 text-center text-sm">
            {mp.gameState?.turn === 'white' ? 'Ход белых' : 'Ход чёрных'}
            {isMyTurn && <p className="mt-0.5 text-xs font-semibold text-primary">Ваш ход</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
