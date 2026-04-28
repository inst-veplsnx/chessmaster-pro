'use client'

import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import type { ChatMessage } from '@/hooks/useMultiplayerGame'

interface ChatBoxProps {
  messages: ChatMessage[]
  myUsername: string
  onSend: (text: string) => void
}

export function ChatBox({ messages, myUsername, onSend }: ChatBoxProps) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    onSend(input.trim())
    setInput('')
  }

  return (
    <div className="flex flex-col rounded-xl border border-border/60 bg-card/60 overflow-hidden">
      <div className="border-b border-border/50 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Чат</p>
      </div>

      <div className="flex-1 min-h-0 max-h-44 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">Нет сообщений</p>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.from === myUsername
            return (
              <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {!isMe && (
                  <span className="text-[10px] text-muted-foreground mb-0.5">{msg.from}</span>
                )}
                <div
                  className={`max-w-[85%] rounded-xl px-2.5 py-1.5 text-xs break-words ${
                    isMe ? 'bg-primary text-primary-foreground' : 'bg-secondary/80 text-foreground'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-border/50 p-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, 200))}
          placeholder="Сообщение…"
          className="flex-1 rounded-lg bg-secondary/50 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="rounded-lg bg-primary px-2.5 py-1.5 text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  )
}
