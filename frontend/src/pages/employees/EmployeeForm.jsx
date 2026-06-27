import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { employeeApi, departmentApi, officeApi, rankApi, educationApi } from '../../services/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const POSITIONS = [
  'អគ្គាធិការ', 'អគ្គាធិការរង', 'ប្រធាននាយកដ្ឋាន', 'អនុប្រធាននាយកដ្ឋាន',
  'នាយការិយាល័យ', 'នាយរងការិយាល័យ', 'អនុប្រធានការិយាល័យ',
  'នាយផ្នែក', 'នាយរងផ្នែក', 'នាយខ្សែក', 'នាយរងខ្សែក',
  'ជំនួយការអគ្គាធិការ', 'ជំនួយការអគ្គាធិការរង',
  'មន្ត្រីត', 'មន្ត្រីជាប់កិច្ចសន្យា',
]

export default function EmployeeForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id && id !== 'new')

  const [departments, setDepartments] = useState([])
  const [offices, setOffices] = useState([])
  const [ranks, setRanks] = useState([])
  const [educationLevels, setEducationLevels] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    sequentialNo: '',
    khmerLastName: '',
    khmerFirstName: '',
    latinName: '',
    gender: 'MALE',
    badgeNumber: '',
    dateOfBirth: '',
    retirementDate: '',
    position: '',
    rankId: '',
    departmentId: '',
    officeId: '',
    educationLevelId: '',
    phone: '',
    remarks: '',
    employeeType: 'POLICE',
  })

  useEffect(() => {
    Promise.all([departmentApi.getAll(), rankApi.getAll(), educationApi.getAll()])
      .then(([d, r, e]) => {
        setDepartments(d.data)
        setRanks(r.data)
        setEducationLevels(e.data)
      })
  }, [])

  useEffect(() => {
    if (form.departmentId) {
      officeApi.getAll({ departmentId: form.departmentId }).then((r) => setOffices(r.data))
    } else {
      setOffices([])
    }
  }, [form.departmentId])

  useEffect(() => {
    if (isEdit) {
      setLoading(true)
      employeeApi.getById(id).then((r) => {
        const e = r.data
        setForm({
          sequentialNo: e.sequentialNo ?? '',
          khmerLastName: e.khmerLastName,
          khmerFirstName: e.khmerFirstName,
          latinName: e.latinName,
          gender: e.gender,
          badgeNumber: e.badgeNumber ?? '',
          dateOfBirth: e.dateOfBirth ? format(new Date(e.dateOfBirth), 'yyyy-MM-dd') : '',
          retirementDate: e.retirementDate ? format(new Date(e.retirementDate), 'yyyy-MM-dd') : '',
          position: e.position,
          rankId: e.rankId ?? '',
          departmentId: e.departmentId ?? '',
          officeId: e.officeId ?? '',
          educationLevelId: e.educationLevelId ?? '',
          phone: e.phone ?? '',
          remarks: e.remarks ?? '',
          employeeType: e.employeeType,
        })
      }).finally(() => setLoading(false))
    }
  }, [id, isEdit])

  const handleDOBChange = (e) => {
    const dob = e.target.value
    const retirement = dob ? format(new Date(new Date(dob).setFullYear(new Date(dob).getFullYear() + 60)), 'yyyy-MM-dd') : ''
    setForm({ ...form, dateOfBirth: dob, retirementDate: retirement })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isEdit) {
        await employeeApi.update(id, form)
        toast.success('កែប្រែដោយជោគជ័យ')
      } else {
        await employeeApi.create(form)
        toast.success('បន្ថែមដោយជោគជ័យ')
      }
      navigate('/employees')
    } catch (err) {
      toast.error(err.response?.data?.message || 'មានបញ្ហា')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'កែប្រែ' : 'បន្ថែម'}មន្ត្រី</h2>
        <p className="text-gray-500 text-sm">បំពេញព័ត៌មានខាងក្រោម</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">ព័ត៌មានផ្ទាល់ខ្លួន</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">នាមត្រកូល (ខ្មែរ) *</label>
              <input className="input" value={form.khmerLastName} onChange={set('khmerLastName')} required />
            </div>
            <div>
              <label className="label">នាមខ្លួន (ខ្មែរ) *</label>
              <input className="input" value={form.khmerFirstName} onChange={set('khmerFirstName')} required />
            </div>
            <div>
              <label className="label">ឈ្មោះ Latin *</label>
              <input className="input uppercase" value={form.latinName} onChange={(e) => setForm({ ...form, latinName: e.target.value.toUpperCase() })} required />
            </div>
            <div>
              <label className="label">ភេទ *</label>
              <select className="input" value={form.gender} onChange={set('gender')}>
                <option value="MALE">ប្រុស</option>
                <option value="FEMALE">ស្រី</option>
              </select>
            </div>
            <div>
              <label className="label">អត្តលេខ</label>
              <input className="input" value={form.badgeNumber} onChange={set('badgeNumber')} />
            </div>
            <div>
              <label className="label">លេខទូរស័ព្ទ</label>
              <input className="input" type="tel" value={form.phone} onChange={set('phone')} />
            </div>
            <div>
              <label className="label">ថ្ងៃខែឆ្នាំកំណើត *</label>
              <input className="input" type="date" value={form.dateOfBirth} onChange={handleDOBChange} required />
            </div>
            <div>
              <label className="label">ថ្ងៃចូលនិវត្តន៍</label>
              <input className="input" type="date" value={form.retirementDate} onChange={set('retirementDate')} />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b">ព័ត៌មានមុខងារ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">ប្រភេទ *</label>
              <select className="input" value={form.employeeType} onChange={set('employeeType')}>
                <option value="POLICE">នគរបាល</option>
                <option value="CIVIL">រដ្ឋបាលស៊ីវិល</option>
                <option value="CONTRACT">ជាប់កិច្ចសន្យា</option>
              </select>
            </div>
            <div>
              <label className="label">ឋានៈ/លក្ខន្តិកៈ</label>
              <select className="input" value={form.rankId} onChange={set('rankId')}>
                <option value="">-- ជ្រើសឋានៈ --</option>
                <optgroup label="យោធា">
                  {ranks.filter(r => r.rankType === 'MILITARY').map(r => (
                    <option key={r.id} value={r.id}>{r.nameKh}</option>
                  ))}
                </optgroup>
                <optgroup label="ស៊ីវិល">
                  {ranks.filter(r => r.rankType === 'CIVIL').map(r => (
                    <option key={r.id} value={r.id}>{r.nameKh}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">មុខតំណែងបច្ចុប្បន្ន *</label>
              <input
                className="input"
                list="positions-list"
                value={form.position}
                onChange={set('position')}
                placeholder="ជ្រើស ឬវាយបញ្ចូល..."
                required
              />
              <datalist id="positions-list">
                {POSITIONS.map(p => <option key={p} value={p} />)}
              </datalist>
            </div>
            <div>
              <label className="label">នាយកដ្ឋាន</label>
              <select className="input" value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value, officeId: '' })}>
                <option value="">-- ជ្រើសនាយកដ្ឋាន --</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.nameKh}</option>)}
              </select>
            </div>
            <div>
              <label className="label">ការិយាល័យ</label>
              <select className="input" value={form.officeId} onChange={set('officeId')} disabled={!form.departmentId}>
                <option value="">-- ជ្រើសការិយាល័យ --</option>
                {offices.map(o => <option key={o.id} value={o.id}>{o.nameKh}</option>)}
              </select>
            </div>
            <div>
              <label className="label">កំរិតវប្បធម៌</label>
              <select className="input" value={form.educationLevelId} onChange={set('educationLevelId')}>
                <option value="">-- ជ្រើសកំរិត --</option>
                {educationLevels.map(e => <option key={e.id} value={e.id}>{e.nameKh}</option>)}
              </select>
            </div>
            <div>
              <label className="label">លរ.</label>
              <input className="input" type="number" value={form.sequentialNo} onChange={set('sequentialNo')} />
            </div>
            <div className="md:col-span-2">
              <label className="label">ផ្សេងៗ (ជំនួយការ/ឈ្មោះប្រធាន)</label>
              <input className="input" value={form.remarks} onChange={set('remarks')} />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'កំពុងរក្សាទុក...' : isEdit ? 'រក្សាទុកការផ្លាស់ប្តូរ' : 'បន្ថែមមន្ត្រី'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/employees')}>
            បោះបង់
          </button>
        </div>
      </form>
    </div>
  )
}
