import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { employeeApi } from '../services/api'

const StatCard = ({ label, value, total, color, borderColor, icon }) => {
  const pct = total && value != null ? Math.round((value / total) * 100) : null
  return (
    <div className={`card p-5 border-l-4 ${borderColor}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value ?? '—'}</p>
          {pct !== null && (
            <p className="text-xs text-gray-400 mt-1">{pct}% នៃសរុប</p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

const DeptRow = ({ name, count, max }) => (
  <div className="py-2">
    <div className="flex justify-between items-center mb-1">
      <span className="text-sm text-gray-700 truncate max-w-[70%]">{name}</span>
      <span className="text-sm font-semibold text-gray-900">{count}</span>
    </div>
    <div className="w-full bg-gray-100 rounded-full h-1.5">
      <div
        className="bg-blue-500 h-1.5 rounded-full transition-all"
        style={{ width: `${max ? (count / max) * 100 : 0}%` }}
      />
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

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )

  const total = stats?.total ?? 0
  const male = stats?.byGender?.MALE ?? 0
  const female = stats?.byGender?.FEMALE ?? 0
  const malePct = total ? Math.round((male / total) * 100) : 0
  const femalePct = total ? Math.round((female / total) * 100) : 0

  const sortedDepts = [...(stats?.byDepartment ?? [])].sort((a, b) => b.count - a.count)
  const maxDept = sortedDepts[0]?.count ?? 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">ផ្ទាំងគ្រប់គ្រង</h2>
          <p className="text-gray-500 text-sm mt-0.5">ព័ត៌មានសង្ខេបស្ថានភាពមន្ត្រី</p>
        </div>
        <Link to="/employees" className="btn-primary text-sm">
          មើលបញ្ជីមន្ត្រី →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="មន្ត្រីសរុប"
          value={total}
          color="bg-blue-50"
          borderColor="border-blue-500"
          icon="👥"
        />
        <StatCard
          label="នគរបាល"
          value={stats?.byType?.POLICE}
          total={total}
          color="bg-indigo-50"
          borderColor="border-indigo-500"
          icon="🛡️"
        />
        <StatCard
          label="រដ្ឋបាលស៊ីវិល"
          value={stats?.byType?.CIVIL}
          total={total}
          color="bg-green-50"
          borderColor="border-green-500"
          icon="📋"
        />
        <StatCard
          label="ជាប់កិច្ចសន្យា"
          value={stats?.byType?.CONTRACT}
          total={total}
          color="bg-orange-50"
          borderColor="border-orange-500"
          icon="📝"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">ចំនួនតាមភេទ</h3>

          <div className="flex rounded-full overflow-hidden h-3 mb-5">
            <div className="bg-blue-500 transition-all" style={{ width: `${malePct}%` }} />
            <div className="bg-pink-400 transition-all" style={{ width: `${femalePct}%` }} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-gray-600">ប្រុស</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-gray-900">{male}</span>
                <span className="text-xs text-gray-400 ml-1">({malePct}%)</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-pink-400" />
                <span className="text-sm text-gray-600">ស្រី</span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-gray-900">{female}</span>
                <span className="text-xs text-gray-400 ml-1">({femalePct}%)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">ចំនួនតាមនាយកដ្ឋាន</h3>
            <span className="text-xs text-gray-400">{sortedDepts.length} នាយកដ្ឋាន</span>
          </div>
          <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
            {sortedDepts.length === 0 ? (
              <p className="text-gray-400 text-sm">មិនទាន់មានទិន្នន័យ</p>
            ) : (
              sortedDepts.map((d) => (
                <DeptRow key={d.departmentId} name={d.name} count={d.count} max={maxDept} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
