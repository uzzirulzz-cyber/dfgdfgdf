import { Link } from 'react-router-dom'
import { Home, AlertTriangle } from 'lucide-react'

const NotFoundPage = () => (
  <div className="min-h-[80vh] flex items-center justify-center px-4">
    <div className="text-center">
      <AlertTriangle className="w-16 h-16 text-accent-orange mx-auto mb-6" />
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-slate-400 mb-8 max-w-md mx-auto">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="btn-primary inline-flex items-center gap-2">
        <Home className="w-5 h-5" /> Back to Home
      </Link>
    </div>
  </div>
)

export default NotFoundPage
