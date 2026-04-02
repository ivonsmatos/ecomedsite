import { useState, useRef, useEffect } from 'react'
import { Send, Trash2, Leaf, Bot, User, Loader2 } from 'lucide-react'
import { useEcoMedChat } from '@/hooks/useEcoMedChat'
import { cn } from '@/lib/utils'

export default function Chat() {
  const { mensagens, enviar, carregando, limpar } = useEcoMedChat()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll ao final das mensagens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  const handleEnviar = () => {
    if (!input.trim() || carregando) return
    enviar(input.trim())
    setInput('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleEnviar()
    }
  }

  const sugestoes = [
    'Como descartar antibióticos vencidos?',
    'Posso jogar medicamentos no lixo comum?',
    'O que são resíduos do Grupo B?',
    'Como descartar agulhas e seringas?',
  ]

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] max-w-3xl mx-auto px-4 py-4 gap-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <Leaf size={20} className="text-[#2D7D46]" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900 leading-tight">Assistente EcoMed</h1>
            <p className="text-xs text-gray-500">Especialista em descarte de medicamentos</p>
          </div>
        </div>
        <button
          onClick={limpar}
          title="Limpar conversa"
          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Lista de mensagens */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {mensagens.map((msg, i) => (
          <div
            key={i}
            className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
          >
            {/* Avatar */}
            <div
              className={cn(
                'w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white',
                msg.role === 'user' ? 'bg-[#2D7D46]' : 'bg-gray-200',
              )}
            >
              {msg.role === 'user' ? (
                <User size={15} className="text-white" />
              ) : (
                <Bot size={15} className="text-gray-600" />
              )}
            </div>

            {/* Balão */}
            <div
              className={cn(
                'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words',
                msg.role === 'user'
                  ? 'bg-[#2D7D46] text-white rounded-tr-sm'
                  : 'bg-gray-100 text-gray-800 rounded-tl-sm',
              )}
            >
              {msg.content || (
                <span className="flex items-center gap-1 text-gray-400">
                  <Loader2 size={14} className="animate-spin" />
                  digitando…
                </span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Sugestões (só aparece na mensagem inicial) */}
      {mensagens.length === 1 && (
        <div className="grid grid-cols-2 gap-2">
          {sugestoes.map((s) => (
            <button
              key={s}
              onClick={() => { enviar(s); setInput('') }}
              className="text-left text-xs bg-green-50 border border-green-200 text-green-800
                         rounded-xl px-3 py-2 hover:bg-green-100 transition line-clamp-2"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Aviso LGPD */}
      <p className="text-center text-[10px] text-gray-400">
        As respostas são baseadas em dados técnicos. Consulte sempre um profissional de saúde para decisões médicas.
      </p>

      {/* Input */}
      <div className="flex gap-2 items-end border border-gray-200 rounded-2xl bg-white p-2 shadow-sm">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Como descartar este medicamento?"
          rows={1}
          className="flex-1 resize-none bg-transparent outline-none text-sm px-2 py-1
                     max-h-32 overflow-y-auto placeholder-gray-400"
          style={{ height: 'auto' }}
          onInput={(e) => {
            const el = e.currentTarget
            el.style.height = 'auto'
            el.style.height = Math.min(el.scrollHeight, 128) + 'px'
          }}
        />
        <button
          onClick={handleEnviar}
          disabled={!input.trim() || carregando}
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center transition flex-shrink-0',
            input.trim() && !carregando
              ? 'bg-[#2D7D46] text-white hover:bg-[#1B5C32]'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed',
          )}
        >
          {carregando ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </div>
    </div>
  )
}
