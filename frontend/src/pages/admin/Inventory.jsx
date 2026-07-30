import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Upload, Download, AlertTriangle } from 'lucide-react'
import api from '../../services/api.js'

const AdminInventory = () => {
  const [selectedProduct, setSelectedProduct] = useState('')

  const { data: lowStock } = useQuery({
    queryKey: ['low-stock'],
    queryFn: async () => {
      const { data } = await api.get('/inventory/admin/low-stock')
      return data.data
    },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Inventory</h1>

      {/* Low Stock Alert */}
      {lowStock && lowStock.length > 0 && (
        <div className="glass rounded-xl p-6 mb-8 border border-red-500/20">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="font-semibold text-red-400">Low Stock Alert</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStock.map(product => (
              <div key={product._id} className="flex items-center gap-3 p-3 bg-red-500/5 rounded-lg">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                  {product.images?.[0]?.url ? <img src={product.images[0].url} alt="" className="w-full h-full object-cover rounded-lg" /> : <span className="text-xs text-slate-500">IMG</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{product.name}</div>
                  <div className="text-xs text-red-400">{product.stockQuantity} remaining</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4 mb-6">
        <button className="btn-primary flex items-center gap-2"><Upload className="w-4 h-4" /> Import CSV</button>
        <button className="btn-secondary flex items-center gap-2"><Download className="w-4 h-4" /> Export</button>
      </div>

      <div className="glass rounded-xl p-8 text-center text-slate-500">
        <p>Select a product to view and manage its inventory</p>
      </div>
    </div>
  )
}

export default AdminInventory
