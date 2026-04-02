import { useEffect, useState } from 'react'
import { Leaf } from 'lucide-react'
import { api } from '@/services/api'
import { useAuthStore } from '@/store/authStore'

interface SaldoData {
  saldo: number
  totalGanho: number
  totalUsado: number
}

export default function EcoCoinWidget() {
  const { usuario } = useAuthStore()
  const [saldo, setSaldo] = useState<SaldoData | null>(null)

  useEffect(() => {
    if (!usuario) return

    api
      .get<SaldoData>('/ecocoin/saldo')
      .then((r) => setSaldo(r.data))
      .catch(() => {
        // Silencioso — widget não quebra a UI
      })
  }, [usuario])

  if (!usuario || saldo === null) return null

  return (
    <a
      href="/app/ecocoin"
      className="flex items-center gap-1.5 bg-green-50 border border-green-200
                 rounded-xl px-2.5 py-1.5 hover:bg-green-100 transition cursor-pointer
                 no-underline"
      title={`Total ganho: ${saldo.totalGanho} EC`}
    >
      <Leaf size={14} className="text-[#2D7D46]" />
      <span className="text-sm font-semibold text-[#2D7D46]">{saldo.saldo} EC</span>
    </a>
  )
}
