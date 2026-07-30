import { useQuery } from '@tanstack/react-query'
import { 
  DollarSign, ShoppingBag, Users, Package, 
  TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight 
} from 'lucide-react'
import api from '../services/api.js'

const StatCard = ({ title, value, icon: Icon, trend, trendUp, color }) => (
  <div className="glass rounded-xl p-6">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
          {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}%
        </div>
      )}
    </div>
    <div className="text-2xl font-bold mb-1">{value}</div>
    <div className="text-sm text-slate-500">{title}</div>
  </div>
)

const AdminDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard')
      return data.data
    },
  })

  if (isLoading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-2 border-accent-blue border-t-transparent" /></div>

  const stats = data?.stats || {}

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Revenue" value={`$${(stats.totalRevenue || 0).toLocaleString()}`} icon={DollarSign} color="bg-green-500/20" trend="12" trendUp />
        <StatCard title="Total Orders" value={stats.totalOrders || 0} icon={ShoppingBag} color="bg-blue-500/20" trend="8" trendUp />
        <StatCard title="Total Customers" value={stats.totalCustomers || 0} icon={Users} color="bg-purple-500/20" trend="15" trendUp />
        <StatCard title="Active Products" value={stats.activeProducts || 0} icon={Package} color="bg-orange-500/20" trend="5" trendUp />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Today's Sales" value={`$${(stats.todaySales || 0).toFixed(2)}`} icon={TrendingUp} color="bg-cyan-500/20" />
        <StatCard title="Pending Orders" value={stats.pendingOrders || 0} icon={ShoppingBag} color="bg-yellow-500/20" />
        <StatCard title="Low Stock" value={stats.lowStockProducts || 0} icon={AlertTriangle} color="bg-red-500/20" />
        <StatCard title="Open Tickets" value={stats.openTickets || 0} icon={Users} color="bg-pink-500/20" />
      </div>

      {/* Recent Orders */}
      <div className="glass rounded-xl p-6 mb-8">
        <h3 className="font-semibold mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-white/5">
                <th className="pb-3 font-medium">Order #</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentOrders?.slice(0, 5).map(order => (
                <tr key={order._id} className="border-b border-white/5 last:border-0">
                  <td className="py-3 font-mono text-slate-400">{order.orderNumber}</td>
                  <td className="py-3">{order.customerName}</td>
                  <td className="py-3 font-medium">${order.totalAmount.toFixed(2)}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      order.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                      order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                      'bg-slate-500/10 text-slate-400'
                    }`}>{order.status.replace('_', ' ')}</span>
                  </td>
                  <td className="py-3 text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
