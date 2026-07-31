import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Loader2, Users, Mail, Calendar, ShoppingBag, DollarSign } from 'lucide-react'
import api from '../../services/api.js'
import Drawer from '../../components/Drawer.jsx'
import Pagination from '../../components/Pagination.jsx'
import EmptyState from '../../components/EmptyState.jsx'

const AdminCustomers = () => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.append('search', search)
      const { data } = await api.get(`/admin/customers?${params}`)
      return data
    },
  })

  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ['admin-customer', selectedId],
    enabled: !!selectedId,
    queryFn: async () => {
      const { data } = await api.get(`/admin/customers/${selectedId}`)
      return data
    },
  })

  const customers = data?.data || []
  const pagination = data?.pagination
  const customer = detailData?.data

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Customers</h1>
        <p className="text-sm text-slate-500 mt-1">View customer accounts and order history</p>
      </div>

      <div className="glass rounded-xl p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name or email…"
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none:focus:border-accent-blue"
          />
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
          </div>
        ) : customers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers yet"
            message="When customers register on your storefront, they'll appear here with their order history and lifetime value."
          />
        ) : (
          <>
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
                  {customers.map(c => (
                    <tr
                      key={c._id}
                      onClick={() => setSelectedId(c._id)}
                      className="border-b border-white/5 last:border-0 hover:bg-white/5 cursor-pointer"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center shrink-0">
                            <span className="text-sm font-medium text-accent-blue">{c.name?.charAt(0)?.toUpperCase()}</span>
                          </div>
                          <div>
                            <div className="font-medium">{c.name}</div>
                            {c.role && c.role !== 'customer' && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 capitalize">{c.role.replace('_', ' ')}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">{c.email}</td>
                      <td className="p-4">{c.orderCount || 0}</td>
                      <td className="p-4 font-medium">${(c.totalSpent || 0).toFixed(2)}</td>
                      <td className="p-4 text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={pagination} onPage={setPage} isLoading={isLoading} />
          </>
        )}
      </div>

      {/* Detail drawer */}
      <Drawer
        isOpen={!!selectedId}
        onClose={() => setSelectedId(null)}
        title={customer ? customer.name : 'Loading…'}
        width="max-w-xl"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
          </div>
        ) : !customer ? null : (
          <div className="space-y-6">
            {/* Avatar + name */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-accent-blue/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-accent-blue">{customer.name?.charAt(0)?.toUpperCase()}</span>
              </div>
              <div>
                <h3 className="font-semibold">{customer.name}</h3>
                <p className="text-sm text-slate-400">{customer.email}</p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 bg-slate-800/30 rounded-lg">
                <ShoppingBag className="w-4 h-4 text-slate-500 mb-2" />
                <div className="text-xl font-bold">{customer.orderCount || 0}</div>
                <div className="text-xs text-slate-500">Orders</div>
              </div>
              <div className="p-4 bg-slate-800/30 rounded-lg">
                <DollarSign className="w-4 h-4 text-slate-500 mb-2" />
                <div className="text-xl font-bold">${(customer.totalSpent || 0).toFixed(0)}</div>
                <div className="text-xs text-slate-500">Spent</div>
              </div>
              <div className="p-4 bg-slate-800/30 rounded-lg">
                <Calendar className="w-4 h-4 text-slate-500 mb-2" />
                <div className="text-xs font-bold mt-3">{new Date(customer.createdAt).toLocaleDateString()}</div>
                <div className="text-xs text-slate-500">Joined</div>
              </div>
            </div>

            {/* Contact */}
            <section>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Contact</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <a href={`mailto:${customer.email}`} className="hover:text-accent-blue">{customer.email}</a>
                </div>
                {customer.phone && (
                  <div className="flex items-center gap-3 text-slate-300">
                    <span className="text-slate-500 w-4">☎</span>
                    <span>{customer.phone}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Account status */}
            <section>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Account</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-700/50 capitalize">{customer.role?.replace('_', ' ')}</span>
                {customer.isEmailVerified && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">Email Verified</span>
                )}
                {customer.isActive === false && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400">Deactivated</span>
                )}
              </div>
            </section>

            {/* Recent orders */}
            {customer.recentOrders?.length > 0 && (
              <section>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Recent Orders</h4>
                <div className="space-y-2">
                  {customer.recentOrders.map(o => (
                    <div key={o._id} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg text-sm">
                      <span className="font-mono text-slate-400">{o.orderNumber}</span>
                      <span className="font-medium">${o.totalAmount.toFixed(2)}</span>
                      <span className="text-xs text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default AdminCustomers
