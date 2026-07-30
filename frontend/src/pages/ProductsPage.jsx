import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Search, Filter, Star, Zap } from 'lucide-react'
import api from '../services/api.js'

const ProductsPage = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, search, category],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '12' })
      if (search) params.append('search', search)
      if (category) params.append('category', category)
      const { data } = await api.get(`/products?${params}`)
      return data
    },
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/products/categories')
      return data.data
    },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0">
          <div className="glass rounded-xl p-6 sticky top-24">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5 text-accent-blue" />
              <h3 className="font-semibold">Filters</h3>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search..." className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-blue" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
              <div className="space-y-2">
                <button onClick={() => { setCategory(''); setPage(1) }} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!category ? 'bg-accent-blue/10 text-accent-blue' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>All</button>
                {categoriesData?.map(cat => (
                  <button key={cat._id} onClick={() => { setCategory(cat._id); setPage(1) }} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${category === cat._id ? 'bg-accent-blue/10 text-accent-blue' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>{cat.name}</button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">All Products</h1>
            <span className="text-sm text-slate-400">{data?.pagination?.total || 0} products</span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <div key={i} className="card animate-pulse"><div className="aspect-[4/3] bg-slate-800" /><div className="p-4 space-y-3"><div className="h-4 bg-slate-800 rounded w-3/4" /><div className="h-4 bg-slate-800 rounded w-1/2" /></div></div>)}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.data?.map(product => (
                  <Link key={product._id} to={`/products/${product.slug}`} className="group card hover:border-slate-600 transition-all hover:-translate-y-1">
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-800">
                      {product.images?.[0]?.url ? (
                        <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : <div className="w-full h-full flex items-center justify-center"><Zap className="w-12 h-12 text-slate-600" /></div>}
                      {product.salePrice && <span className="absolute top-3 left-3 px-2 py-1 bg-accent-orange text-xs font-bold text-white rounded-lg">-{Math.round(((product.price - product.salePrice) / product.price) * 100)}%</span>}
                    </div>
                    <div className="p-4">
                      <div className="text-xs text-slate-500 mb-1">{product.category?.name}</div>
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-accent-blue transition-colors">{product.name}</h3>
                      <div className="flex items-center gap-1 mb-3"><Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /><span className="text-xs text-slate-400">{product.averageRating || '4.5'}</span></div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">${(product.salePrice || product.price)?.toFixed(2)}</span>
                        {product.salePrice && <span className="text-sm text-slate-500 line-through">${product.price.toFixed(2)}</span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {data?.pagination?.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 glass rounded-lg text-sm disabled:opacity-50">Previous</button>
                  <span className="text-sm text-slate-400">Page {page} of {data.pagination.pages}</span>
                  <button onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))} disabled={page === data.pagination.pages} className="px-4 py-2 glass rounded-lg text-sm disabled:opacity-50">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductsPage
