import { useEffect, useState } from 'react'
import { departmentApi, officeApi } from '../../services/api'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default function DepartmentList() {
  const { user } = useAuth()
  const [departments, setDepartments] = useState([])
  const [offices, setOffices] = useState([])
  const [expanded, setExpanded] = useState(null)

  const [deptModal, setDeptModal] = useState(null)
  const [officeModal, setOfficeModal] = useState(null)
  const [deptForm, setDeptForm] = useState({ nameKh: '', nameEn: '' })
  const [officeForm, setOfficeForm] = useState({ nameKh: '', nameEn: '', departmentId: '' })

  const canEdit = ['ADMIN', 'HR'].includes(user?.role)
  const canDelete = user?.role === 'ADMIN'

  const loadDepts = () => departmentApi.getAll().then((r) => setDepartments(r.data))
  const loadOffices = () => officeApi.getAll().then((r) => setOffices(r.data))

  useEffect(() => { loadDepts(); loadOffices() }, [])

  const saveDept = async () => {
    try {
      if (deptModal?.id) await departmentApi.update(deptModal.id, deptForm)
      else await departmentApi.create(deptForm)
      toast.success('រក្សាទុកដោយជោគជ័យ')
      setDeptModal(null)
      loadDepts()
    } catch { toast.error('មានបញ្ហា') }
  }

  const deleteDept = async (id) => {
    if (!confirm('លុបនាយកដ្ឋាននេះ?')) return
    try { await departmentApi.delete(id); toast.success('លុបបានជោគជ័យ'); loadDepts() }
    catch { toast.error('មិនអាចលុបបាន — ពិនិត្យថាមិនមានមន្ត្រីក្នុង') }
  }

  const saveOffice = async () => {
    try {
      if (officeModal?.id) await officeApi.update(officeModal.id, officeForm)
      else await officeApi.create(officeForm)
      toast.success('រក្សាទុកដោយជោគជ័យ')
      setOfficeModal(null)
      loadOffices()
    } catch { toast.error('មានបញ្ហា') }
  }

  const deleteOffice = async (id) => {
    if (!confirm('លុបការិយាល័យនេះ?')) return
    try { await officeApi.delete(id); toast.success('លុបបានជោគជ័យ'); loadOffices() }
    catch { toast.error('មិនអាចលុបបាន') }
  }

  const openDeptEdit = (dept) => {
    setDeptForm({ nameKh: dept.nameKh, nameEn: dept.nameEn || '' })
    setDeptModal(dept)
  }

  const openOfficeEdit = (office) => {
    setOfficeForm({ nameKh: office.nameKh, nameEn: office.nameEn || '', departmentId: office.departmentId })
    setOfficeModal(office)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">នាយកដ្ឋាន & ការិយាល័យ</h2>
          <p className="text-gray-500 text-sm">គ្រប់គ្រងរចនាសម្ព័ន្ធ</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={() => { setOfficeForm({ nameKh: '', nameEn: '', departmentId: '' }); setOfficeModal({}) }}>
              + ការិយាល័យ
            </button>
            <button className="btn-primary" onClick={() => { setDeptForm({ nameKh: '', nameEn: '' }); setDeptModal({}) }}>
              + នាយកដ្ឋាន
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {departments.map((dept) => {
          const deptOffices = offices.filter((o) => o.departmentId === dept.id)
          const isOpen = expanded === dept.id
          return (
            <div key={dept.id} className="card overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpanded(isOpen ? null : dept.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{isOpen ? '▼' : '▶'}</span>
                  <div>
                    <p className="font-medium text-gray-900">{dept.nameKh}</p>
                    {dept.nameEn && <p className="text-xs text-gray-400">{dept.nameEn}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="badge bg-blue-100 text-blue-700">{dept._count?.employees ?? 0} នាក់</span>
                  <span className="text-xs text-gray-400">{deptOffices.length} ការិយាល័យ</span>
                  {canEdit && (
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => openDeptEdit(dept)} className="text-xs text-gray-500 hover:text-gray-700">កែ</button>
                      {canDelete && <button onClick={() => deleteDept(dept.id)} className="text-xs text-red-500 hover:text-red-700">លុប</button>}
                    </div>
                  )}
                </div>
              </div>
              {isOpen && (
                <div className="border-t border-gray-100">
                  {deptOffices.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">មិនមានការិយាល័យ</p>
                  ) : (
                    <table className="w-full text-sm">
                      <tbody>
                        {deptOffices.map((o) => (
                          <tr key={o.id} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="px-6 py-3 pl-12 text-gray-700">📁 {o.nameKh}</td>
                            <td className="px-4 py-3 text-gray-400 text-xs">{o.nameEn}</td>
                            <td className="px-4 py-3">
                              <span className="badge bg-gray-100 text-gray-600">{o._count?.employees ?? 0} នាក់</span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {canEdit && (
                                <div className="flex gap-2 justify-end">
                                  <button onClick={() => openOfficeEdit(o)} className="text-xs text-gray-500 hover:text-gray-700">កែ</button>
                                  {canDelete && <button onClick={() => deleteOffice(o.id)} className="text-xs text-red-500 hover:text-red-700">លុប</button>}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {deptModal !== null && (
        <Modal title={deptModal?.id ? 'កែប្រែនាយកដ្ឋាន' : 'បន្ថែមនាយកដ្ឋាន'} onClose={() => setDeptModal(null)}>
          <div className="space-y-3">
            <div>
              <label className="label">ឈ្មោះ (ខ្មែរ) *</label>
              <input className="input" value={deptForm.nameKh} onChange={(e) => setDeptForm({ ...deptForm, nameKh: e.target.value })} required />
            </div>
            <div>
              <label className="label">ឈ្មោះ (English)</label>
              <input className="input" value={deptForm.nameEn} onChange={(e) => setDeptForm({ ...deptForm, nameEn: e.target.value })} />
            </div>
            <div className="flex gap-2 pt-2">
              <button className="btn-primary flex-1" onClick={saveDept}>រក្សាទុក</button>
              <button className="btn-secondary" onClick={() => setDeptModal(null)}>បោះបង់</button>
            </div>
          </div>
        </Modal>
      )}

      {officeModal !== null && (
        <Modal title={officeModal?.id ? 'កែប្រែការិយាល័យ' : 'បន្ថែមការិយាល័យ'} onClose={() => setOfficeModal(null)}>
          <div className="space-y-3">
            <div>
              <label className="label">នាយកដ្ឋាន *</label>
              <select className="input" value={officeForm.departmentId} onChange={(e) => setOfficeForm({ ...officeForm, departmentId: e.target.value })} required>
                <option value="">-- ជ្រើស --</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.nameKh}</option>)}
              </select>
            </div>
            <div>
              <label className="label">ឈ្មោះ (ខ្មែរ) *</label>
              <input className="input" value={officeForm.nameKh} onChange={(e) => setOfficeForm({ ...officeForm, nameKh: e.target.value })} required />
            </div>
            <div>
              <label className="label">ឈ្មោះ (English)</label>
              <input className="input" value={officeForm.nameEn} onChange={(e) => setOfficeForm({ ...officeForm, nameEn: e.target.value })} />
            </div>
            <div className="flex gap-2 pt-2">
              <button className="btn-primary flex-1" onClick={saveOffice}>រក្សាទុក</button>
              <button className="btn-secondary" onClick={() => setOfficeModal(null)}>បោះបង់</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
