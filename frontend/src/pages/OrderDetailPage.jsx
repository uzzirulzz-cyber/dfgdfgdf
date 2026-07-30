import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Package, Download } from 'lucide-react'
import api from '../services/api.js'

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  payment_pending: 'bg-yellow-500/10 text-yellow-400',
  paid: 'bg-green-500/10 text-green-400',
  processing: 'bg-blue-500/10 text-blue-400',
  delivered: 'bg-green-500/10 text-green-400',
  completed: 'bg-green-500/10 text-green-400',
  cancelled: 'bg-red-500/10 text-red-400',
  refunded: 'bg-red-500/10 text-red-400',
  failed: 'bg-red-500/10 text-red-400',
}

const OrderDetailPage = () => {
  const { id } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${id}`)
      return data.data
    },
  })

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-2 border-accent-blue border-t-transparent" /></div>
  if (!data) return <div className="text-center py-20">Order not found</div>

  const order = data

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/orders" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> My Orders
      </Link>

      <div className="glass rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">Order #{order.orderNumber}</h1>
            <p className="text-sm text-slate-500 mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${statusColors[order.status] || 'bg-slate-500/10 text-slate-400'}`}>
            {order.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="glass rounded-xl p-6 mb-6">
        <h3 className="font-semibold mb-4">Order Items</h3>
        <div className="space-y-4">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-3 bg-slate-800/30 rounded-lg">
              <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center">
                <Package className="w-6 h-6 text-slate-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{item.productName}</h4>
                <p className="text-xs text-slate-500">Qty: {item.quantity} x ${item.unitPrice.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <div className="font-bold">${item.totalPrice.toFixed(2)}</div>
                {item.deliveryStatus === 'delivered' && (
                  <span className="text-xs text-green-400 flex items-center gap-1"><Download className="w-3 h-3" /> Delivered</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="glass rounded-xl p-6">
        <h3 className="font-semibold mb-4">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>${order.subtotal.toFixed(2)}</span></div>
          {order.discountAmount > 0 && <div className="flex justify-between text-green-400"><span>Discount</span><span>-${order.discountAmount.toFixed(2)}</span></div>}
          <hr className="border-white/10" />
          <div className="flex justify-between font-bold text-lg"><span>Total</span><span>${order.totalAmount.toFixed(2)}</span></div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailPage
