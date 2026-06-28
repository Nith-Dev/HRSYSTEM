import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/', label: 'ផ្ទាំងគ្រប់គ្រង', icon: '🏠', exact: true },
  { to: '/employees', label: 'មន្ត្រី', icon: '👤' },
  { to: '/departments', label: 'នាយកដ្ឋាន', icon: '🏢' },
  { to: '/settings', label: 'ការកំណត់', icon: '⚙️', roles: ['ADMIN', 'HR'] },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth()
  const visibleItems = navItems.filter(item => !item.roles || item.roles.includes(user?.role))

  return (
    <aside className={`
      fixed left-0 top-0 z-40 w-64 min-h-screen bg-blue-900 text-white flex flex-col
      transform transition-transform duration-300 ease-in-out
      md:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="p-6 border-b border-blue-800 flex items-start justify-between">
        <div>
          <h1 className="text-sm font-bold leading-tight">អគ្គាធិការដ្ឋាន</h1>
          <p className="text-blue-300 text-xs mt-1">ប្រព័ន្ធគ្រប់គ្រងមន្ត្រី</p>
        </div>
        <button
          className="md:hidden text-blue-300 hover:text-white p-1 mt-0.5 shrink-0"
          onClick={onClose}
          aria-label="Close menu"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            onClick={onClose}
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
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold shrink-0">
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
