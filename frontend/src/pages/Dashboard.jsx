import { useEffect, useState } from 'react'
import { employeeApi } from '../services/api'

const StatCard = ({ label, value, color, icon }) => (
  <div className="card p-6 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-500 text-sm">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
    </div>
  </div>
)

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    employeeApi.getStats()
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">ផ្ទាំងគ្រប់គ្រង</h2>
        <p className="text-gray-500 text-sm">ព័ត៌មានសង្ខេបស្ថានភាពមន្ត្រី</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="មន្ត្រីសរុប" value={stats?.total} color="bg-blue-100" icon="👥" />
        <StatCard label="នគរបាល" value={stats?.byType?.POLICE} color="bg-indigo-100" icon="🛡️" />
        <StatCard label="រដ្ឋបាលស៊ីវិល" value={stats?.byType?.CIVIL} color="bg-green-100" icon="📋" />
        <StatCard label="ជាប់កិច្ចសន្យា" value={stats?.byType?.CONTRACT} color="bg-orange-100" icon="📝" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">ចំនួនតាមភេទ</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-gray-600">ប្រុស</span>
              </div>
              <span className="font-semibold">{stats?.byGender?.MALE ?? 0}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${stats?.total ? ((stats?.byGender?.MALE ?? 0) / stats.total) * 100 : 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-500" />
                <span className="text-sm text-gray-600">ស្រី</span>
              </div>
              <span className="font-semibold">{stats?.byGender?.FEMALE ?? 0}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-pink-500 h-2 rounded-full"
                style={{ width: `${stats?.total ? ((stats?.byGender?.FEMALE ?? 0) / stats.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">ចំនួនតាមនាយកដ្ឋាន</h3>
          <div className="space-y-2 max-h-52 overflow-y-auto">
            {stats?.byDepartment?.length === 0 && (
              <p className="text-gray-400 text-sm">មិនទាន់មានទិន្នន័យ</p>
            )}
            {stats?.byDepartment?.map((d) => (
              <div key={d.departmentId} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-700 truncate max-w-[75%]">{d.name}</span>
                <span className="badge bg-blue-100 text-blue-700">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
