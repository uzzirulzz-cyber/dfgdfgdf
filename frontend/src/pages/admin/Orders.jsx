import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Filter, Eye, CheckCircle, XCircle } from 'lucide-react'
import api from '../../services/api.js'

const statusOptions = ['pending', 'payment_pending', 'paid', 'processing', 'delivered', 'completed', 'cancelled', 'refunded']

const AdminOrders = () => {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, search, status],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.append('search', search)
      if (status) params.append('status', status)
      const { data } = await api.get(`/orders/admin/all?${params}`)
      return data
    },
  })

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      const { data } = await api.put(`/orders/admin/${id}/status`, { status })
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Orders</h1>

      <div className="glass rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search orders..." className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-blue" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }} className="input-field py-2">
          <option value="">All Statuses</option>
          {statusOptions.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-white/5">
                <th className="p-4 font-medium">Order #</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Payment</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map(order => (
                <tr key={order._id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  <td className="p-4 font-mono text-slate-400">{order.orderNumber}</td>
                  <td className="p-4">
                    <div>{order.customerName}</div>
                    <div className="text-xs text-slate-500">{order.customerEmail}</div>
                  </td>
                  <td className="p-4 font-medium">${order.totalAmount.toFixed(2)}</td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={e => updateStatus.mutate({ id: order._id, status: e.target.value })}
                      className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs capitalize"
                    >
                      {statusOptions.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      order.paymentStatus === 'paid' ? 'bg-green-500/10 text-green-400' :
                      order.paymentStatus === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-red-500/10 text-red-400'
                    }`}>{order.paymentStatus}</span>
                  </td>
                  <td className="p-4 text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <button className="p-2 text-slate-400 hover:text-accent-blue"><Eye className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminOrders
