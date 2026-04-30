'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FiTrash2 } from 'react-icons/fi'

export default function DeleteBtn({ url, label = 'Delete', method = 'DELETE', confirm: confirmMsg }: {
  url: string; label?: string; method?: string; confirm?: string
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handle = async () => {
    if (!window.confirm(confirmMsg ?? `Are you sure you want to ${label.toLowerCase()} this item?`)) return
    setLoading(true)
    await fetch(url, { method })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
    >
      <FiTrash2 size={11} />
      {loading ? '…' : label}
    </button>
  )
}
