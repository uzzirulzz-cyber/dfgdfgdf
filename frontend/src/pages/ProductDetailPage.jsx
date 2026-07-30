import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Star, ShoppingCart, Zap, Shield, Check, ArrowLeft } from 'lucide-react'
import api from '../services/api.js'
import useCartStore from '../services/cartStore.js'

const ProductDetailPage = () => {
  const { slug } = useParams()
  const { addItem } = useCartStore()
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [quantity, setQuantity] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data } = await api.get(`/products/${slug}`)
      return data.data
    },
  })

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-2 border-accent-blue border-t-transparent" /></div>
  if (!data) return <div className="text-center py-20">Product not found</div>

  const product = data
  const currentPrice = selectedVariant ? (selectedVariant.salePrice || selectedVariant.price) : (product.salePrice || product.price)
  const discount = product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0

  const handleAddToCart = () => {
    addItem(product, selectedVariant, quantity)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/products" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image */}
        <div className="aspect-square rounded-2xl overflow-hidden bg-slate-800">
          {product.images?.[0]?.url ? (
            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
          ) : <div className="w-full h-full flex items-center justify-center"><Zap className="w-24 h-24 text-slate-600" /></div>}
        </div>

        {/* Details */}
        <div>
          <div className="text-sm text-accent-blue mb-2">{product.category?.name}</div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1"><Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /><span className="font-medium">{product.averageRating || '4.5'}</span></div>
            <span className="text-slate-500">({product.reviewCount || 0} reviews)</span>
            <span className="text-green-400 flex items-center gap-1"><Check className="w-4 h-4" /> In Stock</span>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-bold">${currentPrice?.toFixed(2)}</span>
            {product.salePrice && <span className="text-xl text-slate-500 line-through">${product.price.toFixed(2)}</span>}
            {discount > 0 && <span className="px-2 py-1 bg-accent-orange/20 text-accent-orange text-sm font-bold rounded-lg">-{discount}%</span>}
          </div>

          <p className="text-slate-400 mb-8 leading-relaxed">{product.description}</p>

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">Select Variant</label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map(variant => (
                  <button
                    key={variant._id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      selectedVariant?._id === variant._id
                        ? 'border-accent-blue bg-accent-blue/10 text-accent-blue'
                        : 'border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {variant.name} - ${(variant.salePrice || variant.price)?.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-300 mb-2">Quantity</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 glass rounded-lg flex items-center justify-center hover:bg-white/10">-</button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 glass rounded-lg flex items-center justify-center hover:bg-white/10">+</button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button onClick={handleAddToCart} className="flex-1 btn-primary flex items-center justify-center gap-2 py-4">
              <ShoppingCart className="w-5 h-5" /> Add to Cart
            </button>
            <Link to="/cart" className="btn-secondary py-4 px-8">View Cart</Link>
          </div>

          {/* Trust badges */}
          <div className="mt-8 pt-8 border-t border-white/5 space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-400"><Shield className="w-5 h-5 text-accent-blue" /> Secure payment processing</div>
            <div className="flex items-center gap-3 text-sm text-slate-400"><Zap className="w-5 h-5 text-accent-orange" /> Instant digital delivery</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
