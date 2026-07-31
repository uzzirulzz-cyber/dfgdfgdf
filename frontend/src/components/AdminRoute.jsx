import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuthStore from '../services/authStore.js'

/**
 * Route guard for admin-only pages.
 *
 * - Not logged in → redirect to /login?redirect=<current path> so the user
 *   comes back after authenticating.
 * - Logged in but not an admin role → show a "not authorized" screen instead
 *   of silently redirecting away (which made it look like the page was broken).
 * - Logged in as admin → render the child routes.
 */
const AdminRoute = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent-blue border-t-transparent" />
      </div>
    )
  }

  // Not logged in → send to login with a redirect back here
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  }

  // Logged in but not an admin → show a clear "not authorized" screen
  const adminRoles = ['admin', 'super_admin', 'manager', 'support_agent']
  if (!adminRoles.includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-dark px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-slate-400 mb-6">
            You need an admin account to access this page. You're signed in as
            <span className="text-white font-medium"> {user?.email}</span> with a
            customer account.
          </p>
          <a href="/" className="btn-primary inline-block py-2 px-6 text-sm">Back to Storefront</a>
        </div>
      </div>
    )
  }

  return <Outlet />
}

export default AdminRoute
