import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Eye, Loader2, ShoppingBag, Mail, MapPin, CreditCard, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api.js'
import Drawer from '../../components/Drawer.jsx'
import Pagination from '../../components/Pagination.jsx'
import EmptyState from '../../components/EmptyState.jsx'

const statusOptions = ['pending', 'payment_pending', 'paid', 'processing', 'delivered', 'completed', 'cancelled', 'refunded']

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  payment_pending: 'bg-yellow-500/10 text-yellow-400',
  paid: 'bg-blue-500/10 text-blue-400',
  processing: 'bg-purple-500/10 text-purple-400',
  delivered: 'bg-cyan-500/10 text-cyan-400',
  completed: 'bg-green-500/10 text-green-400',
  cancelled: 'bg-red-500/10 text-red-400',
  refunded: 'bg-red-500/10 text-red-400',
}

const paymentColors = {
  paid: 'bg-green-500/10 text-green-400',
  pending: 'bg-yellow-500/10 text-yellow-400',
  failed: 'bg-red-500/10 text-red-400',
  refunded: 'bg-red-500/10 text-red-400',
}

const AdminOrders = () => {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(null)
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

  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ['admin-order', selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const { data } = await api.get(`/orders/${selectedId}`)
      return data
    },
  })

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      const { data } = await api.put(`/orders/admin/${id}/status`, { status })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin-order'] })
      toast.success('Order status updated')
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update status'),
  })

  const orders = data?.data || []
  const pagination = data?.pagination
  const order = detailData?.data

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-slate-500 mt-1">View and manage customer orders</p>
      </div>

      <div className="glass rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by order number, customer name, or email…"
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-blue"
          />
        </div>
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1) }}
          className="input-field py-2 text-sm sm:w-48"
        >
          <option value="">All Statuses</option>
          {statusOptions.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No orders found"
            message="When customers place orders, they'll appear here. Try adjusting your search or status filter."
          />
        ) : (
          <>
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
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr
                      key={order._id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/5 cursor-pointer"
                      onClick={() => setSelectedId(order._id)}
                    >
                      <td className="p-4 font-mono text-slate-400">{order.orderNumber}</td>
                      <td className="p-4">
                        <div>{order.customerName}</div>
                        <div className="text-xs text-slate-500">{order.customerEmail}</div>
                      </td>
                      <td className="p-4 font-medium">${order.totalAmount.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status] || statusColors.pending}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${paymentColors[order.paymentStatus] || paymentColors.pending}`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedId(order._id) }}
                          className="p-2 text-slate-400 hover:text-accent-blue rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={pagination} onPage={setPage} isLoading={isLoading} />
          </>
        )}
      </div>

      {/* Detail drawer */}
      <Drawer
        isOpen={!!selectedId}
        onClose={() => setSelectedId(null)}
        title={order ? `Order ${order.orderNumber}` : 'Loading…'}
        width="max-w-2xl"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
          </div>
        ) : !order ? null : (
          <div className="space-y-6">
            {/* Status row */}
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status]}`}>
                {order.status.replace('_', ' ')}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${paymentColors[order.paymentStatus]}`}>
                {order.paymentStatus}
              </span>
              <span className="text-xs text-slate-500 ml-auto">
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </div>

            {/* Update status */}
            <div className="p-4 bg-slate-800/30 rounded-lg">
              <label className="block text-xs font-medium text-slate-400 mb-2">Update Order Status</label>
              <div className="flex gap-2">
                <select
                  value={order.status}
                  onChange={e => updateStatus.mutate({ id: order._id, status: e.target.value })}
                  disabled={updateStatus.isPending}
                  className="input-field py-2 text-sm flex-1"
                >
                  {statusOptions.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>

            {/* Customer */}
            <section>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Customer</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span>{order.customerEmail}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span>{order.shippingAddress
                    ? `${order.shippingAddress.city}, ${order.shippingAddress.country}`
                    : 'Digital delivery'}
                  </span>
                </div>
              </div>
            </section>

            {/* Items */}
            <section>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Items</h3>
              <div className="space-y-2">
                {(order.items || []).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.name}</div>
                      <div className="text-xs text-slate-500">Qty {item.quantity} × ${item.price.toFixed(2)}</div>
                    </div>
                    <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
                {(!order.items || order.items.length === 0) && (
                  <p className="text-sm text-slate-500">No items in this order.</p>
                )}
              </div>
            </section>

            {/* Totals */}
            <section className="p-4 bg-slate-800/30 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-400">Subtotal</span><span>${(order.subtotal || order.totalAmount || 0).toFixed(2)}</span></div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-400"><span>Discount</span><span>−${order.discount.toFixed(2)}</span></div>
              )}
              <div className="flex justify-between"><span className="text-slate-400">Tax</span><span>${(order.tax || 0).toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold text-base pt-2 border-t border-white/5">
                <span>Total</span><span>${(order.totalAmount || 0).toFixed(2)}</span>
              </div>
            </section>

            {/* Payment */}
            {order.payment && (
              <section>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <CreditCard className="w-3 h-3" /> Payment
                </h3>
                <div className="p-4 bg-slate-800/30 rounded-lg space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-slate-400">Method</span><span>{order.payment.method || 'Stripe'}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Transaction ID</span><span className="font-mono text-xs">{order.payment.transactionId || '—'}</span></div>
                </div>
              </section>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default AdminOrders
