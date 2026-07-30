import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Save } from 'lucide-react'
import api from '../../services/api.js'

const AdminSettings = () => {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data } = await api.get('/settings/admin')
      return data.data
    },
  })

  const [formData, setFormData] = useState(data || {})

  const updateSettings = useMutation({
    mutationFn: async (settings) => {
      const { data } = await api.put('/settings/admin', settings)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-settings'] }),
  })

  if (isLoading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-2 border-accent-blue border-t-transparent" /></div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      <div className="glass rounded-xl p-6 mb-6">
        <h3 className="font-semibold mb-4">General</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Site Name</label>
            <input type="text" defaultValue={data?.siteName} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tagline</label>
            <input type="text" defaultValue={data?.tagline} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Contact Email</label>
            <input type="email" defaultValue={data?.contactEmail} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Support Phone</label>
            <input type="tel" defaultValue={data?.supportPhone} className="input-field" />
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-6 mb-6">
        <h3 className="font-semibold mb-4">SEO</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Default SEO Title</label>
            <input type="text" defaultValue={data?.defaultSeoTitle} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Default SEO Description</label>
            <textarea defaultValue={data?.defaultSeoDescription} className="input-field min-h-[80px]" />
          </div>
        </div>
      </div>

      <button className="btn-primary flex items-center gap-2">
        <Save className="w-4 h-4" /> Save Changes
      </button>
    </div>
  )
}

export default AdminSettings
