import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { employeeApi, activityApi } from '../services/api'

const DonutChart = ({ male, female, total }) => {
  const r = 44
  const cx = 60
  const cy = 60
  const strokeWidth = 18
  const circumference = 2 * Math.PI * r

  const maleFrac = total ? male / total : 0
  const maleLen = maleFrac * circumference
  const femaleLen = (total ? female / total : 0) * circumference
  const gap = total ? Math.min(3, circumference * 0.015) : 0

  return (
    <div className="flex justify-center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={strokeWidth} />
        {female > 0 && (
          <circle
            cx={cx} cy={cy} r={r}
            fill="none" stroke="#f472b4" strokeWidth={strokeWidth}
            strokeDasharray={`${Math.max(femaleLen - gap, 0)} ${circumference - Math.max(femaleLen - gap, 0)}`}
            strokeDashoffset={-(maleLen + gap / 2)}
            transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="round"
          />
        )}
        {male > 0 && (
          <circle
            cx={cx} cy={cy} r={r}
            fill="none" stroke="#3b82f6" strokeWidth={strokeWidth}
            strokeDasharray={`${Math.max(maleLen - gap, 0)} ${circumference - Math.max(maleLen - gap, 0)}`}
            strokeDashoffset={0}
            transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="round"
          />
        )}
        <text x={cx} y={cy - 5} textAnchor="middle" fontSize="18" fontWeight="700" fill="#111827">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#4b5563">នាក់</text>
      </svg>
    </div>
  )
}

const chevron = (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

const StatCard = ({ label, value, total, bg, icon }) => {
  const pct = total && value != null ? Math.round((value / total) * 100) : null
  return (
    <div className="card p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center text-xl`}>{icon}</div>
        {pct !== null && (
          <span className="text-xs text-gray-600 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full font-medium">
            {pct}%
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900 leading-none">{value ?? '—'}</p>
      <p className="text-sm text-gray-700 mt-2">{label}</p>
    </div>
  )
}

const CHANGE_CONFIG = {
  PROMOTION: { icon: '📈', label: 'ផ្លាស់ប្ដូរតំណែង / ឋានៈ', bg: 'bg-blue-50', text: 'text-blue-600' },
  TRANSFER:  { icon: '🏢', label: 'ផ្លាស់ប្ដូរទីតាំង',        bg: 'bg-amber-50',  text: 'text-amber-600' },
  UPDATE:    { icon: '✏️', label: 'ធ្វើបច្ចុប្បន្នភាព',         bg: 'bg-gray-50',   text: 'text-gray-600'  },
  CREATE:    { icon: '➕', label: 'បន្ថែមមន្ត្រីថ្មី',          bg: 'bg-green-50',  text: 'text-green-600' },
  DELETE:    { icon: '🗑️', label: 'លុបចេញ',                    bg: 'bg-red-50',    text: 'text-red-600'   },
}

const FIELD_LABEL = {
  position:     'មុខតំណែង',
  rank:         'ឋានៈ',
  department:   'នាយកដ្ឋាន',
  office:       'ការិយាល័យ',
  employeeType: 'ប្រភេទ',
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ទើបតែ'
  if (mins < 60) return `${mins} នាទីមុន`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} ម៉ោងមុន`
  const days = Math.floor(hours / 24)
  return `${days} ថ្ងៃមុន`
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      employeeApi.getStats(),
      activityApi.getRecent(15),
    ]).then(([statsRes, actRes]) => {
      setStats(statsRes.data)
      setActivities(actRes.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-600" />
    </div>
  )

  const total = stats?.total ?? 0
  const male = stats?.byGender?.MALE ?? 0
  const female = stats?.byGender?.FEMALE ?? 0
  const malePct = total ? Math.round((male / total) * 100) : 0
  const femalePct = total ? Math.round((female / total) * 100) : 0
  const sortedDepts = [...(stats?.byDepartment ?? [])].sort((a, b) => b.count - a.count)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ផ្ទាំងគ្រប់គ្រង</h1>
          <p className="text-sm text-gray-600 mt-0.5">ព័ត៌មានសង្ខេបស្ថានភាពមន្ត្រី</p>
        </div>
        <Link to="/employees" className="btn-primary">មើលបញ្ជីមន្ត្រី</Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="មន្ត្រីសរុប"     value={total}                    bg="bg-blue-50"   icon="👥" />
        <StatCard label="នគរបាល"          value={stats?.byType?.POLICE}   total={total} bg="bg-indigo-50"  icon="🛡️" />
        <StatCard label="រដ្ឋបាលស៊ីវិល"  value={stats?.byType?.CIVIL}    total={total} bg="bg-emerald-50" icon="📋" />
        <StatCard label="ជាប់កិច្ចសន្យា" value={stats?.byType?.CONTRACT}  total={total} bg="bg-amber-50"   icon="📝" />
      </div>

      {/* Gender + Department */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Gender */}
        <div className="card p-6">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-5">ចំនួនតាមភេទ</p>
          <DonutChart male={male} female={female} total={total} />
          <div className="mt-5 space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                <span className="text-gray-600">ប្រុស</span>
              </div>
              <span className="font-semibold text-gray-900">{male} <span className="text-xs text-gray-600 font-normal">({malePct}%)</span></span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-pink-400 shrink-0" />
                <span className="text-gray-600">ស្រី</span>
              </div>
              <span className="font-semibold text-gray-900">{female} <span className="text-xs text-gray-600 font-normal">({femalePct}%)</span></span>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-600">សរុបប្រុស + ស្រី</span>
            <span className="text-sm font-semibold text-gray-700">{total} នាក់</span>
          </div>
        </div>

        {/* Department list */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest">ចំនួនតាមនាយកដ្ឋាន</p>
            <span className="text-xs text-gray-600">{sortedDepts.length} នាយកដ្ឋាន</span>
          </div>
          {sortedDepts.length === 0 ? (
            <p className="text-sm text-gray-600">មិនទាន់មានទិន្នន័យ</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              {sortedDepts.map((d) => (
                <Link
                  key={d.departmentId}
                  to={`/employees?departmentId=${d.departmentId}`}
                  className="group flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 hover:border-transparent"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-blue-500 shrink-0 transition-colors" />
                    <span className="text-sm text-gray-600 group-hover:text-blue-600 truncate transition-colors">{d.name}</span>
                  </div>
                  <div className="flex items-center gap-1 ml-3 shrink-0 text-gray-600 group-hover:text-blue-500 transition-colors">
                    <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600">{d.count}</span>
                    {chevron}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest">សកម្មភាពចុងក្រោយ</p>
          <span className="text-xs text-gray-600">{activities.length} ធាតុ</span>
        </div>

        {activities.length === 0 ? (
          <p className="text-sm text-gray-600 py-4 text-center">មិនទាន់មានសកម្មភាព — ការកែប្រែណាមួយនឹងបង្ហាញនៅទីនេះ</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {activities.map((log) => {
              const cfg = CHANGE_CONFIG[log.changeType] || CHANGE_CONFIG.UPDATE
              return (
                <div key={log.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <div className={`w-8 h-8 rounded-full ${cfg.bg} flex items-center justify-center text-base shrink-0 mt-0.5`}>
                    {cfg.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">{log.employeeName}</span>
                      <span className={`text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
                      {log.field && (
                        <span className="text-xs text-gray-600">· {FIELD_LABEL[log.field] || log.field}</span>
                      )}
                    </div>
                    {log.oldValue && log.newValue && (
                      <p className="text-xs text-gray-700 mt-0.5">
                        <span className="line-through text-gray-500">{log.oldValue}</span>
                        {' → '}
                        <span className="font-medium">{log.newValue}</span>
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-0.5">
                      {log.userName || 'System'} · {timeAgo(log.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
