import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { employeeApi, departmentApi, officeApi } from '../../services/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

const EMPTY_FILTERS = {
  search: '',
  departmentId: '',
  officeId: '',
  gender: '',
  employeeType: '',
}

const GENDER_LABEL = { MALE: 'ប្រុស', FEMALE: 'ស្រី' }
const TYPE_COLOR = {
  POLICE: 'bg-blue-100 text-blue-700',
  CIVIL: 'bg-green-100 text-green-700',
  CONTRACT: 'bg-orange-100 text-orange-700',
}
const TYPE_LABEL = { POLICE: 'នគរបាល', CIVIL: 'ស៊ីវិល', CONTRACT: 'កិច្ចសន្យា' }

export default function EmployeeList() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [offices, setOffices] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const limit = 20

  const initialFilters = { ...EMPTY_FILTERS, departmentId: searchParams.get('departmentId') || '' }
  const [filters, setFilters] = useState(initialFilters)
  const [applied, setApplied] = useState(initialFilters)

  useEffect(() => {
    departmentApi.getAll()
      .then((r) => setDepartments(r.data))
      .catch(() => toast.error('Could not load departments'))
  }, [])

  useEffect(() => {
    if (!filters.departmentId) {
      setOffices([])
      return
    }

    officeApi.getAll({ departmentId: filters.departmentId })
      .then((r) => setOffices(r.data))
      .catch(() => {
        setOffices([])
        toast.error('Could not load offices')
      })
  }, [filters.departmentId])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1)
      setApplied(filters)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [filters])

  useEffect(() => {
    setLoading(true)
    const params = { page, limit, ...applied }
    Object.keys(params).forEach((k) => !params[k] && delete params[k])
    employeeApi.getAll(params)
      .then((r) => { setEmployees(r.data.data); setTotal(r.data.total) })
      .catch(() => {
        setEmployees([])
        setTotal(0)
        toast.error('Could not load employees')
      })
      .finally(() => setLoading(false))
  }, [page, applied])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    setApplied(filters)
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`លុប ${name}?`)) return
    try {
      await employeeApi.delete(id)
      toast.success('លុបដោយជោគជ័យ')
      setApplied({ ...applied })
    } catch {
      toast.error('មិនអាចលុបបាន')
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">បញ្ជីមន្ត្រី</h2>
          <p className="text-gray-500 text-sm">សរុប {total} នាក់</p>
        </div>
        {['ADMIN', 'HR'].includes(user?.role) && (
          <Link to="/employees/new" className="btn-primary">
            + បន្ថែមមន្ត្រី
          </Link>
        )}
      </div>

      <div className="card p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
          <input
            className="input max-w-xs"
            placeholder="ស្វែងរកតាមឈ្មោះ, លេខសម្គាល់..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <select
            className="input max-w-[200px]"
            value={filters.departmentId}
            onChange={(e) => setFilters({ ...filters, departmentId: e.target.value, officeId: '' })}
          >
            <option value="">នាយកដ្ឋានទាំងអស់</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.nameKh}</option>
            ))}
          </select>
          <select
            className="input max-w-[200px]"
            value={filters.officeId}
            onChange={(e) => setFilters({ ...filters, officeId: e.target.value })}
            disabled={!filters.departmentId}
          >
            <option value="">ការិយាល័យទាំងអស់</option>
            {offices.map((o) => (
              <option key={o.id} value={o.id}>{o.nameKh}</option>
            ))}
          </select>
          <select
            className="input max-w-[150px]"
            value={filters.gender}
            onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
          >
            <option value="">ភេទទាំងអស់</option>
            <option value="MALE">ប្រុស</option>
            <option value="FEMALE">ស្រី</option>
          </select>
          <select
            className="input max-w-[150px]"
            value={filters.employeeType}
            onChange={(e) => setFilters({ ...filters, employeeType: e.target.value })}
          >
            <option value="">ប្រភេទទាំងអស់</option>
            <option value="POLICE">នគរបាល</option>
            <option value="CIVIL">ស៊ីវិល</option>
            <option value="CONTRACT">កិច្ចសន្យា</option>
          </select>
          <button type="submit" className="btn-primary">ស្វែងរក</button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => { setFilters(EMPTY_FILTERS); setPage(1); setApplied(EMPTY_FILTERS) }}
          >
            សម្អាត
          </button>
        </form>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">លរ.</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">ឈ្មោះ (ខ្មែរ)</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Latin Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">ភេទ</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">អត្តលេខ</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">មុខតំណែង</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">នាយកដ្ឋាន</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">ប្រភេទ</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">ថ្ងៃខែឆ្នាំកំណើត</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={10} className="text-center py-12 text-gray-400">កំពុងផ្ទុក...</td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-gray-400">មិនមានទិន្នន័យ</td></tr>
              ) : (
                employees.map((emp, i) => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500">{(page - 1) * limit + i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{emp.khmerLastName} {emp.khmerFirstName}</div>
                      {emp.rank && <div className="text-xs text-gray-400">{emp.rank.nameKh}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{emp.latinName}</td>
                    <td className="px-4 py-3">{GENDER_LABEL[emp.gender]}</td>
                    <td className="px-4 py-3 text-gray-600">{emp.badgeNumber || '—'}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-[160px] truncate">{emp.position}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">{emp.department?.nameKh || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${TYPE_COLOR[emp.employeeType]}`}>{TYPE_LABEL[emp.employeeType]}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {emp.dateOfBirth ? format(new Date(emp.dateOfBirth), 'dd/MM/yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/employees/${emp.id}`} className="text-blue-600 hover:text-blue-700 text-xs font-medium">មើល</Link>
                        {['ADMIN', 'HR'].includes(user?.role) && (
                          <Link to={`/employees/${emp.id}/edit`} className="text-gray-600 hover:text-gray-700 text-xs font-medium">កែ</Link>
                        )}
                        {user?.role === 'ADMIN' && (
                          <button
                            onClick={() => handleDelete(emp.id, emp.latinName)}
                            className="text-red-600 hover:text-red-700 text-xs font-medium"
                          >
                            លុប
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              បង្ហាញ {(page - 1) * limit + 1}–{Math.min(page * limit, total)} នៃ {total}
            </p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary py-1 px-3 disabled:opacity-40">‹</button>
              <span className="btn-secondary py-1 px-3 cursor-default">{page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary py-1 px-3 disabled:opacity-40">›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
