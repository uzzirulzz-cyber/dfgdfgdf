import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, Lock, ArrowLeft } from 'lucide-react'
import useCartStore from '../services/cartStore.js'
import useAuthStore from '../services/authStore.js'
import api from '../services/api.js'

const CheckoutPage = () => {
  const { items, getTotal, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const handlePlaceOrder = async () => {
    setLoading(true)
    try {
      const orderItems = items.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      }))
      const { data } = await api.post('/orders', {
        items: orderItems,
        paymentMethod: 'stripe',
        customerEmail: user?.email,
        customerName: user?.name,
      })
      clearCart()
      navigate(`/orders/${data.data._id}`)
    } catch (err) {
      alert(err.response?.data?.message || 'Order failed')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <button onClick={() => navigate('/products')} className="btn-primary">Browse Products</button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Cart
      </button>
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <div className="space-y-6">
        {/* Order Review */}
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold mb-4">Order Items</h3>
          <div className="space-y-3">
            {items.map(item => (
              <div key={`${item.productId}-${item.variantId}`} className="flex justify-between text-sm">
                <span>{item.name} {item.variantName && `(${item.variantName})`} x{item.quantity}</span>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <hr className="my-4 border-white/10" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${getTotal().toFixed(2)}</span>
          </div>
        </div>

        {/* Payment */}
        <div className="glass rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-accent-blue" /> Payment Method</h3>
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded" />
              <span className="text-sm">Stripe (Credit/Debit Card)</span>
            </div>
          </div>
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Lock className="w-5 h-5" />
          {loading ? 'Processing...' : `Pay $${getTotal().toFixed(2)}`}
        </button>
      </div>
    </div>
  )
}

export default CheckoutPage
