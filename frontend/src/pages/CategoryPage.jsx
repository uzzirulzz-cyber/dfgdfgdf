import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Star, Zap } from 'lucide-react'
import api from '../services/api.js'

const CategoryPage = () => {
  const { slug } = useParams()

  const { data, isLoading } = useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      const { data } = await api.get(`/products/categories/${slug}`)
      return data.data
    },
  })

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-2 border-accent-blue border-t-transparent" /></div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link to="/products" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> All Products
      </Link>

      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">{data?.category?.name}</h1>
        <p className="text-slate-400">{data?.category?.description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {data?.products?.map(product => (
          <Link key={product._id} to={`/products/${product.slug}`} className="group card hover:border-slate-600 transition-all hover:-translate-y-1">
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-800">
              {product.images?.[0]?.url ? (
                <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : <div className="w-full h-full flex items-center justify-center"><Zap className="w-12 h-12 text-slate-600" /></div>}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-accent-blue transition-colors">{product.name}</h3>
              <div className="flex items-center gap-1 mb-2"><Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /><span className="text-xs text-slate-400">{product.averageRating || '4.5'}</span></div>
              <span className="text-lg font-bold">${(product.salePrice || product.price)?.toFixed(2)}</span>
            </div>
          </Link>
        ))}
      </div>

      {(!data?.products || data.products.length === 0) && (
        <div className="text-center py-20 text-slate-500">No products found in this category</div>
      )}
    </div>
  )
}

export default CategoryPage
