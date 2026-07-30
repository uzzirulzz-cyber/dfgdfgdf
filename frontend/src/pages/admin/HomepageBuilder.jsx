import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, GripVertical, Eye, EyeOff, Trash2 } from 'lucide-react'
import api from '../../services/api.js'

const sectionTypes = [
  { value: 'hero', label: 'Hero Section' },
  { value: 'featured_products', label: 'Featured Products' },
  { value: 'trending_products', label: 'Trending Products' },
  { value: 'categories', label: 'Categories' },
  { value: 'banner', label: 'Banner' },
  { value: 'custom', label: 'Custom HTML' },
]

const AdminHomepage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-homepage'],
    queryFn: async () => {
      const { data } = await api.get('/homepage/admin')
      return data
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Homepage Builder</h1>
        <button className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Section</button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-2 border-accent-blue border-t-transparent" /></div>
      ) : (
        <div className="space-y-4">
          {data?.data?.map((section, index) => (
            <div key={section._id} className="glass rounded-xl p-6">
              <div className="flex items-center gap-4">
                <GripVertical className="w-5 h-5 text-slate-600 cursor-move" />
                <div className="w-10 h-10 rounded-lg bg-accent-blue/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-accent-blue">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{section.name}</h3>
                    <span className="px-2 py-1 rounded-full text-xs bg-slate-500/10 text-slate-400 capitalize">{section.type.replace('_', ' ')}</span>
                    {!section.isActive && <span className="px-2 py-1 rounded-full text-xs bg-red-500/10 text-red-400">Inactive</span>}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{section.title || 'No title'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-accent-blue">
                    {section.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button className="p-2 text-slate-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminHomepage
