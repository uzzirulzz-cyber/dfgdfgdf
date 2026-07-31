import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  DollarSign, ShoppingBag, Users, Package,
  TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Loader2, Ticket
} from 'lucide-react'
import api from '../../services/api.js'

const StatCard = ({ title, value, icon: Icon, trend, trendUp, color, link }) => {
  const card = (
    <div className="glass rounded-xl p-6 hover:bg-white/[0.02] transition-colors h-full">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend !== undefined && trend !== null && (
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
  return link ? <Link to={link}>{card}</Link> : card
}

const AdminDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/admin/dashboard')
      return data.data
    },
  })

  if (isLoading) return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-12 h-12 animate-spin text-accent-blue" />
    </div>
  )

  const stats = data?.stats || {}
  const trendUp = (v) => typeof v === 'number' && v >= 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of your store's performance</p>
      </div>

      {/* Primary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Revenue" value={`$${(stats.totalRevenue || 0).toLocaleString()}`} icon={DollarSign} color="bg-green-500/20" trend={stats.revenueGrowth} trendUp={trendUp(stats.revenueGrowth)} link="/admin/orders" />
        <StatCard title="Total Orders" value={stats.totalOrders || 0} icon={ShoppingBag} color="bg-blue-500/20" trend={stats.ordersGrowth} trendUp={trendUp(stats.ordersGrowth)} link="/admin/orders" />
        <StatCard title="Total Customers" value={stats.totalCustomers || 0} icon={Users} color="bg-purple-500/20" trend={stats.customersGrowth} trendUp={trendUp(stats.customersGrowth)} link="/admin/customers" />
        <StatCard title="Active Products" value={stats.activeProducts || 0} icon={Package} color="bg-orange-500/20" link="/admin/products" />
      </div>

      {/* Operational stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Today's Sales" value={`$${(stats.todaySales || 0).toFixed(2)}`} icon={TrendingUp} color="bg-cyan-500/20" />
        <StatCard title="Pending Orders" value={stats.pendingOrders || 0} icon={ShoppingBag} color="bg-yellow-500/20" link="/admin/orders" />
        <StatCard title="Low Stock" value={stats.lowStockProducts || 0} icon={AlertTriangle} color="bg-red-500/20" link="/admin/inventory" />
        <StatCard title="Open Tickets" value={stats.openTickets || 0} icon={Ticket} color="bg-pink-500/20" link="/admin/tickets" />
      </div>

      {/* Recent Orders */}
      <div className="glass rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Orders</h3>
          <Link to="/admin/orders" className="text-xs text-accent-blue hover:underline">View all →</Link>
        </div>
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
              {(data?.recentOrders || []).slice(0, 5).map(order => (
                <tr key={order._id} className="border-b border-white/5 last:border-0">
                  <td className="py-3 font-mono text-slate-400">{order.orderNumber}</td>
                  <td className="py-3">{order.customerName}</td>
                  <td className="py-3 font-medium">${(order.totalAmount || 0).toFixed(2)}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      order.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                      order.status === 'pending' || order.status === 'payment_pending' ? 'bg-yellow-500/10 text-yellow-400' :
                      order.status === 'cancelled' || order.status === 'refunded' ? 'bg-red-500/10 text-red-400' :
                      'bg-slate-500/10 text-slate-400'
                    }`}>{order.status.replace('_', ' ')}</span>
                  </td>
                  <td className="py-3 text-slate-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {(data?.recentOrders || []).length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-slate-500 text-sm">No orders yet — your dashboard will populate as customers place orders.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/admin/products" className="glass rounded-xl p-6 hover:bg-white/[0.02] transition-colors">
          <Package className="w-6 h-6 text-accent-blue mb-3" />
          <h4 className="font-semibold mb-1">Add a product</h4>
          <p className="text-xs text-slate-500">Create new items in your catalog</p>
        </Link>
        <Link to="/admin/homepage" className="glass rounded-xl p-6 hover:bg-white/[0.02] transition-colors">
          <TrendingUp className="w-6 h-6 text-accent-cyan mb-3" />
          <h4 className="font-semibold mb-1">Design homepage</h4>
          <p className="text-xs text-slate-500">Arrange sections customers see first</p>
        </Link>
        <Link to="/admin/settings" className="glass rounded-xl p-6 hover:bg-white/[0.02] transition-colors">
          <AlertTriangle className="w-6 h-6 text-orange-400 mb-3" />
          <h4 className="font-semibold mb-1">Configure store</h4>
          <p className="text-xs text-slate-500">Set branding, payments, and emails</p>
        </Link>
      </div>
    </div>
  )
}

export default AdminDashboard
