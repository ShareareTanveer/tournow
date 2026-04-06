'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

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
    <button onClick={handle} disabled={loading}
      className="text-red-500 hover:underline text-xs font-medium disabled:opacity-50">
      {loading ? '…' : label}
    </button>
  )
}
