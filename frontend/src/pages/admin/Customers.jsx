import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Mail, ShoppingBag, DollarSign } from 'lucide-react'
import api from '../../services/api.js'

const AdminCustomers = () => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.append('search', search)
      const { data } = await api.get(`/admin/customers?${params}`)
      return data
    },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Customers</h1>

      <div className="glass rounded-xl p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search customers..." className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-blue" />
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-white/5">
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Orders</th>
                <th className="p-4 font-medium">Total Spent</th>
                <th className="p-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {data?.data?.map(customer => (
                <tr key={customer._id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center">
                        <span className="text-sm font-medium text-accent-blue">{customer.name?.charAt(0)?.toUpperCase()}</span>
                      </div>
                      <span className="font-medium">{customer.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-400">{customer.email}</td>
                  <td className="p-4">{customer.orderCount || 0}</td>
                  <td className="p-4 font-medium">${(customer.totalSpent || 0).toFixed(2)}</td>
                  <td className="p-4 text-slate-500">{new Date(customer.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminCustomers
