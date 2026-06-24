'use client'

import { useState } from 'react'
import { FiEdit2, FiPlus, FiSave, FiX, FiPhone, FiMail, FiImage, FiEye, FiEyeOff } from 'react-icons/fi'

type Supplier = {
  id: string
  name: string
  companyName?: string | null
  phone: string
  whatsappNumber?: string | null
  email?: string | null
  imageUrl?: string | null
  notes?: string | null
  isActive: boolean
}

type FormState = {
  name: string
  companyName: string
  phone: string
  whatsappNumber: string
  email: string
  imageUrl: string
  notes: string
  isActive: boolean
}

const blank: FormState = {
  name: '',
  companyName: '',
  phone: '',
  whatsappNumber: '',
  email: '',
  imageUrl: '',
  notes: '',
  isActive: true,
}

function fromSupplier(supplier: Supplier): FormState {
  return {
    name: supplier.name,
    companyName: supplier.companyName ?? '',
    phone: supplier.phone,
    whatsappNumber: supplier.whatsappNumber ?? '',
    email: supplier.email ?? '',
    imageUrl: supplier.imageUrl ?? '',
    notes: supplier.notes ?? '',
    isActive: supplier.isActive,
  }
}

export default function SuppliersClient({ suppliers: initial }: { suppliers: Supplier[] }) {
  const [suppliers, setSuppliers] = useState(initial)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(blank)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function startCreate() {
    setEditingId(null)
    setForm(blank)
    setError('')
  }

  function startEdit(supplier: Supplier) {
    setEditingId(supplier.id)
    setForm(fromSupplier(supplier))
    setError('')
  }

  async function save() {
    setSaving(true)
    setError('')
    const payload = {
      ...form,
      companyName: form.companyName || null,
      whatsappNumber: form.whatsappNumber || null,
      email: form.email || null,
      imageUrl: form.imageUrl || null,
      notes: form.notes || null,
    }
    const url = editingId ? `/api/suppliers/${editingId}` : '/api/suppliers'
    const res = await fetch(url, {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      const saved = await res.json()
      setSuppliers((items) => editingId ? items.map((item) => item.id === saved.id ? saved : item) : [saved, ...items])
      setEditingId(saved.id)
      setForm(fromSupplier(saved))
    } else {
      setError('Supplier could not be saved. Check required fields and URL/email formatting.')
    }
    setSaving(false)
  }

  async function deactivate(id: string) {
    if (!confirm('Deactivate this supplier?')) return
    const res = await fetch(`/api/suppliers/${id}`, { method: 'DELETE' })
    if (res.ok) {
      const saved = await res.json()
      setSuppliers((items) => items.map((item) => item.id === saved.id ? saved : item))
      if (editingId === id) setForm(fromSupplier(saved))
    }
  }

  const input = (key: keyof FormState, label: string, placeholder = '', type = 'text') => (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-gray-500">{label}</label>
      <input
        type={type}
        value={form[key] as string}
        placeholder={placeholder}
        onChange={(event) => setForm({ ...form, [key]: event.target.value })}
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-400"
      />
    </div>
  )

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-bold text-gray-900">Supplier Directory</h2>
          <button onClick={startCreate} className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700">
            <FiPlus size={13} /> New Supplier
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {suppliers.map((supplier) => (
            <div key={supplier.id} className="flex items-center gap-4 px-5 py-4">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                {supplier.imageUrl ? <img src={supplier.imageUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-gray-300"><FiImage size={18} /></div>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-gray-900">{supplier.name}</p>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${supplier.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {supplier.isActive ? <FiEye size={10} /> : <FiEyeOff size={10} />}
                    {supplier.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {supplier.companyName && <p className="text-xs text-gray-400">{supplier.companyName}</p>}
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1"><FiPhone size={11} /> {supplier.whatsappNumber || supplier.phone}</span>
                  {supplier.email && <span className="inline-flex items-center gap-1"><FiMail size={11} /> {supplier.email}</span>}
                </div>
              </div>
              <button onClick={() => startEdit(supplier)} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:border-indigo-200 hover:text-indigo-600">
                <FiEdit2 size={12} />
              </button>
            </div>
          ))}
          {suppliers.length === 0 && <p className="px-5 py-10 text-center text-sm text-gray-400">No suppliers yet.</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900">{editingId ? 'Edit Supplier' : 'New Supplier'}</h2>
        <div className="mt-4 space-y-4">
          {input('name', 'Supplier Name *', 'e.g. Maldives Ground Partner')}
          {input('companyName', 'Company Name', 'Optional')}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {input('phone', 'Phone *', '+94 77 123 4567')}
            {input('whatsappNumber', 'WhatsApp Number', 'Defaults to phone if blank')}
          </div>
          {input('email', 'Email', 'supplier@example.com', 'email')}
          {input('imageUrl', 'Image URL', 'https://...', 'url')}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">Notes</label>
            <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={4}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-indigo-400" />
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} className="h-4 w-4 accent-indigo-600" />
            Active supplier
          </label>
          {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <button onClick={save} disabled={saving || !form.name || !form.phone}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50">
              <FiSave size={14} /> {saving ? 'Saving...' : 'Save Supplier'}
            </button>
            {editingId && (
              <button onClick={() => deactivate(editingId)} className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
                <FiX size={14} /> Deactivate
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
