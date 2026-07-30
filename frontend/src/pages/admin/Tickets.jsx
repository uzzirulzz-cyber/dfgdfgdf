import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, MessageCircle, CheckCircle } from 'lucide-react'
import api from '../../services/api.js'

const statusColors = {
  open: 'bg-yellow-500/10 text-yellow-400',
  in_progress: 'bg-blue-500/10 text-blue-400',
  waiting: 'bg-orange-500/10 text-orange-400',
  resolved: 'bg-green-500/10 text-green-400',
  closed: 'bg-slate-500/10 text-slate-400',
}

const AdminTickets = () => {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tickets', search, status],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (status) params.append('status', status)
      const { data } = await api.get(`/tickets/admin/all?${params}`)
      return data
    },
  })

  const updateTicket = useMutation({
    mutationFn: async ({ id, updates }) => {
      const { data } = await api.put(`/tickets/admin/${id}`, updates)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-tickets'] }),
  })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Support Tickets</h1>

      <div className="glass rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets..." className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent-blue" />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} className="input-field py-2">
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="waiting">Waiting</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="space-y-4">
        {data?.data?.map(ticket => (
          <div key={ticket._id} className="glass rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-sm text-slate-500">{ticket.ticketNumber}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[ticket.status] || 'bg-slate-500/10 text-slate-400'}`}>{ticket.status.replace('_', ' ')}</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium capitalize bg-slate-500/10 text-slate-400">{ticket.priority}</span>
                </div>
                <h3 className="font-semibold">{ticket.subject}</h3>
                <p className="text-sm text-slate-400 mt-1">{ticket.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">
                By {ticket.customer?.name} • {new Date(ticket.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-accent-blue"><MessageCircle className="w-4 h-4" /></button>
                <button onClick={() => updateTicket.mutate({ id: ticket._id, updates: { status: 'resolved' } })} className="p-2 text-slate-400 hover:text-green-400"><CheckCircle className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AdminTickets
