import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { employeeApi } from '../../services/api'
import { format } from 'date-fns'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const Field = ({ label, value }) => (
  <div className="py-3 border-b border-gray-50 last:border-0 grid grid-cols-3 gap-2">
    <dt className="text-sm text-gray-500">{label}</dt>
    <dd className="text-sm font-medium text-gray-900 col-span-2">{value || '—'}</dd>
  </div>
)

const TYPE_LABEL = { POLICE: 'នគរបាល', CIVIL: 'ស៊ីវិល', CONTRACT: 'កិច្ចសន្យា' }
const GENDER_LABEL = { MALE: 'ប្រុស', FEMALE: 'ស្រី' }

export default function EmployeeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    employeeApi.getById(id)
      .then((r) => setEmployee(r.data))
      .catch(() => navigate('/employees'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!confirm(`លុប ${employee.latinName}?`)) return
    try {
      await employeeApi.delete(id)
      toast.success('លុបដោយជោគជ័យ')
      navigate('/employees')
    } catch {
      toast.error('មិនអាចលុបបាន')
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
  if (!employee) return null

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/employees')} className="text-sm text-blue-600 hover:underline mb-1">← ត្រឡប់</button>
          <h2 className="text-xl font-bold text-gray-900">
            {employee.rank?.nameKh && <span className="text-gray-500 font-normal mr-2">{employee.rank.nameKh}</span>}
            {employee.khmerLastName} {employee.khmerFirstName}
          </h2>
          <p className="text-gray-500 text-sm">{employee.latinName}</p>
        </div>
        <div className="flex gap-2">
          {['ADMIN', 'HR'].includes(user?.role) && (
            <Link to={`/employees/${id}/edit`} className="btn-secondary">កែប្រែ</Link>
          )}
          {user?.role === 'ADMIN' && (
            <button onClick={handleDelete} className="btn-danger">លុប</button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-3">ព័ត៌មានផ្ទាល់ខ្លួន</h3>
          <dl>
            <Field label="ឋានៈ" value={employee.rank?.nameKh} />
            <Field label="ភេទ" value={GENDER_LABEL[employee.gender]} />
            <Field label="អត្តលេខ" value={employee.badgeNumber} />
            <Field label="ថ្ងៃខែឆ្នាំ" value={employee.dateOfBirth ? format(new Date(employee.dateOfBirth), 'dd/MM/yyyy') : null} />
            <Field label="ចូលនិវត្តន៍" value={employee.retirementDate ? format(new Date(employee.retirementDate), 'dd/MM/yyyy') : null} />
            <Field label="ទូរស័ព្ទ" value={employee.phone} />
          </dl>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-3">ព័ត៌មានមុខងារ</h3>
          <dl>
            <Field label="ប្រភេទ" value={TYPE_LABEL[employee.employeeType]} />
            <Field label="មុខតំណែង" value={employee.position} />
            <Field label="នាយកដ្ឋាន" value={employee.department?.nameKh} />
            <Field label="ការិយាល័យ" value={employee.office?.nameKh} />
            <Field label="វប្បធម៌" value={employee.educationLevel?.nameKh} />
            <Field label="ផ្សេងៗ" value={employee.remarks} />
          </dl>
        </div>
      </div>
    </div>
  )
}
