import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import api from '../../services/api.js'

const AdminProducts = () => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.append('search', search)
      const { data } = await api.get(`/products?${params}`)
      return data
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Products</h1>
        <button className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Product</button>
      </div>

      <div className="glass rounded-xl p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search products..." className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-blue" />
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-white/5">
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map(product => (
                <tr key={product._id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                        {product.images?.[0]?.url ? <img src={product.images[0].url} alt="" className="w-full h-full object-cover rounded-lg" /> : <Eye className="w-4 h-4 text-slate-600" />}
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-slate-500">{product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-400">{product.category?.name}</td>
                  <td className="p-4">
                    <span className="font-medium">${(product.salePrice || product.price)?.toFixed(2)}</span>
                    {product.salePrice && <span className="text-xs text-slate-500 line-through ml-2">${product.price.toFixed(2)}</span>}
                  </td>
                  <td className="p-4">{product.unlimitedStock ? '∞' : product.stockQuantity}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      product.status === 'active' ? 'bg-green-500/10 text-green-400' :
                      product.status === 'draft' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-slate-500/10 text-slate-400'
                    }`}>{product.status}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-slate-400 hover:text-accent-blue"><Edit className="w-4 h-4" /></button>
                      <button className="p-2 text-slate-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
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

export default AdminProducts
