import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Package, ChevronRight } from 'lucide-react'
import api from '../services/api.js'

const statusColors = {
  pending: 'text-yellow-400',
  payment_pending: 'text-yellow-400',
  paid: 'text-green-400',
  processing: 'text-blue-400',
  delivered: 'text-green-400',
  completed: 'text-green-400',
  cancelled: 'text-red-400',
  refunded: 'text-red-400',
  failed: 'text-red-400',
}

const OrdersPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const { data } = await api.get('/orders')
      return data
    },
  })

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-2 border-accent-blue border-t-transparent" /></div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">My Orders</h1>

      {(!data?.data || data.data.length === 0) ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Orders Yet</h2>
          <p className="text-slate-400 mb-6">You haven't placed any orders yet</p>
          <Link to="/products" className="btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data.data.map(order => (
            <Link key={order._id} to={`/orders/${order._id}`} className="block glass rounded-xl p-6 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm text-slate-500">Order #{order.orderNumber}</span>
                  <div className="text-xs text-slate-600 mt-1">{new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium capitalize ${statusColors[order.status] || 'text-slate-400'}`}>{order.status.replace('_', ' ')}</span>
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-400">{order.items.length} item(s)</div>
                <div className="font-bold">${order.totalAmount.toFixed(2)}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default OrdersPage
