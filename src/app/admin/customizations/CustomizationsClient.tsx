'use client'

import AdminTable, { Column } from '@/components/admin/AdminTable'

const STATUS_STYLE: Record<string, string> = {
  PENDING:   'bg-amber-50 text-amber-700 border border-amber-100',
  REVIEWED:  'bg-blue-50 text-blue-700 border border-blue-100',
  QUOTED:    'bg-purple-50 text-purple-700 border border-purple-100',
  CONFIRMED: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
}

export default function CustomizationsClient({ items }: { items: any[] }) {
  const columns: Column[] = [
    {
      key: 'customerName', label: 'Customer', sortable: true,
      render: item => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-400 to-violet-500 flex items-center justify-center text-white text-xs font-black shrink-0">
            {item.customerName?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm leading-tight">{item.customerName}</p>
            <p className="text-[11px] text-gray-400">{item.customerEmail}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'tour', label: 'Tour', sortable: false,
      render: item => item.tour?.title
        ? <p className="text-sm text-gray-600 max-w-40 line-clamp-1">{item.tour.title}</p>
        : <span className="text-gray-300 text-xs">—</span>,
    },
    {
      key: 'travelDate', label: 'Travel Date', sortable: true,
      render: item => item.travelDate
        ? <span className="text-sm text-gray-600">{new Date(item.travelDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        : <span className="text-gray-300 text-xs">—</span>,
    },
    {
      key: 'paxCount', label: 'Pax', sortable: true, align: 'center',
      render: item => (
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg font-medium">{item.paxCount} pax</span>
      ),
    },
    {
      key: 'budget', label: 'Budget (LKR)', sortable: true, align: 'right',
      render: item => item.budget
        ? <span className="font-semibold text-sm text-gray-800">LKR {item.budget.toLocaleString()}</span>
        : <span className="text-gray-300 text-xs">—</span>,
    },
    {
      key: 'status', label: 'Status', sortable: true,
      render: item => (
        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[item.status] ?? 'bg-gray-100 text-gray-500'}`}>
          {item.status}
        </span>
      ),
    },
    {
      key: 'createdAt', label: 'Received', sortable: true,
      render: item => (
        <span className="text-xs text-gray-400">
          {new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
        </span>
      ),
    },
  ]

  return (
    <AdminTable
      data={items}
      columns={columns}
      filterKey="status"
      filterOptions={['ALL', 'PENDING', 'REVIEWED', 'QUOTED', 'CONFIRMED']}
      searchKeys={['customerName', 'customerEmail', 'tour.title']}
      defaultSort={{ key: 'createdAt', dir: 'desc' }}
      emptyMessage="No customization requests yet"
    />
  )
}
