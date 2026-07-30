import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react'
import useCartStore from '../services/cartStore.js'

const CartPage = () => {
  const { items, removeItem, updateQuantity, getSubtotal, getTotal, clearCart } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingCart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your Cart is Empty</h2>
        <p className="text-slate-400 mb-6">Browse our products and add items to your cart</p>
        <Link to="/products" className="btn-primary">Start Shopping</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Shopping Cart ({items.length} items)</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div key={`${item.productId}-${item.variantId}`} className="glass rounded-xl p-4 flex gap-4">
              <div className="w-20 h-20 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" /> : <ShoppingCart className="w-8 h-8 text-slate-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                {item.variantName && <p className="text-xs text-slate-500">{item.variantName}</p>}
                <p className="text-accent-blue font-bold mt-1">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 glass rounded-lg">
                  <button onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)} className="p-2 hover:text-accent-blue"><Minus className="w-4 h-4" /></button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)} className="p-2 hover:text-accent-blue"><Plus className="w-4 h-4" /></button>
                </div>
                <button onClick={() => removeItem(item.productId, item.variantId)} className="p-2 text-red-400 hover:text-red-300"><Trash2 className="w-5 h-5" /></button>
              </div>
            </div>
          ))}
          <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"><Trash2 className="w-4 h-4" /> Clear Cart</button>
        </div>
        <div className="lg:w-80 shrink-0">
          <div className="glass rounded-xl p-6 sticky top-24">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>${getSubtotal().toFixed(2)}</span></div>
              <div className="flex justify-between text-slate-400"><span>Discount</span><span className="text-green-400">-$0.00</span></div>
              <hr className="border-white/10" />
              <div className="flex justify-between font-bold text-lg"><span>Total</span><span>${getTotal().toFixed(2)}</span></div>
            </div>
            <Link to="/checkout" className="w-full btn-primary mt-6 flex items-center justify-center gap-2">Checkout <ArrowRight className="w-4 h-4" /></Link>
            <Link to="/products" className="w-full btn-secondary mt-3 text-center block">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
