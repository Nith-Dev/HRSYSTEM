import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', label: 'ផ្ទាំងគ្រប់គ្រង', icon: '🏠', exact: true },
  { to: '/employees', label: 'មន្ត្រី', icon: '👤' },
  { to: '/departments', label: 'នាយកដ្ឋាន', icon: '🏢' },
  { to: '/settings', label: 'ការកំណត់', icon: '⚙️', roles: ['ADMIN', 'HR'] },
]

export default function Sidebar() {
  const { user } = useAuth()
  const visibleItems = navItems.filter(item => !item.roles || item.roles.includes(user?.role))

  return (
    <aside className="w-64 min-h-screen bg-blue-900 text-white flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-blue-800">
        <h1 className="text-sm font-bold leading-tight">អគ្គាធិការដ្ឋាន</h1>
        <p className="text-blue-300 text-xs mt-1">ប្រព័ន្ធគ្រប់គ្រងមន្ត្រី</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-700 text-white font-medium'
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-blue-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-blue-300 text-xs truncate">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
