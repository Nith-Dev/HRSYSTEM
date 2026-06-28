import { useEffect, useState } from 'react'
import { rankApi, educationApi, userApi } from '../../services/api'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

const ROLE_LABEL = { ADMIN: 'Admin', HR: 'Staff', VIEWER: 'Viewer' }
const ROLE_BADGE = {
  ADMIN: 'bg-blue-100 text-blue-700',
  HR: 'bg-green-100 text-green-700',
  VIEWER: 'bg-gray-100 text-gray-600',
}

function UserManagement() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'VIEWER' })

  const load = () => userApi.getAll().then(r => setUsers(r.data))
  useEffect(() => { load() }, [])

  const startAdd = () => {
    setForm({ name: '', email: '', password: '', role: 'VIEWER' })
    setEditing('new')
  }

  const startEdit = (u) => {
    setForm({ name: u.name, email: u.email, password: '', role: u.role })
    setEditing(u.id)
  }

  const cancel = () => setEditing(null)

  const save = async () => {
    try {
      if (editing === 'new') {
        await userApi.create(form)
      } else {
        const data = { name: form.name, email: form.email, role: form.role }
        if (form.password) data.password = form.password
        await userApi.update(editing, data)
      }
      toast.success('រក្សាទុកដោយជោគជ័យ')
      setEditing(null)
      load()
    } catch (e) {
      toast.error(e.response?.data?.message || 'មានបញ្ហា')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('លុបគណនីនេះ?')) return
    try {
      await userApi.delete(id)
      toast.success('លុបបានជោគជ័យ')
      load()
    } catch (e) {
      toast.error(e.response?.data?.message || 'មិនអាចលុបបាន')
    }
  }

  const RoleSelect = ({ value, onChange }) => (
    <select className="input text-xs py-1.5" value={value} onChange={e => onChange(e.target.value)}>
      <option value="ADMIN">Admin</option>
      <option value="HR">Staff</option>
      <option value="VIEWER">Viewer</option>
    </select>
  )

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h3 className="font-semibold text-gray-900">គ្រប់គ្រងគណនីអ្នកប្រើ</h3>
          <p className="text-xs text-gray-500 mt-0.5">Admin · Staff · Viewer</p>
        </div>
        <button className="btn-primary text-xs py-1.5" onClick={startAdd}>+ បន្ថែមគណនី</button>
      </div>

      <div className="divide-y divide-gray-100">
        {editing === 'new' && (
          <div className="px-4 py-3 bg-blue-50 flex flex-wrap gap-2 items-end">
            <div>
              <label className="label text-xs">ឈ្មោះ</label>
              <input className="input text-xs py-1.5" placeholder="ឈ្មោះ" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label text-xs">អ៊ីមែល</label>
              <input type="email" className="input text-xs py-1.5" placeholder="email@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="label text-xs">ពាក្យសម្ងាត់</label>
              <input type="password" className="input text-xs py-1.5" placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
            <div>
              <label className="label text-xs">សិទ្ធិ</label>
              <RoleSelect value={form.role} onChange={v => setForm({ ...form, role: v })} />
            </div>
            <div className="flex gap-1">
              <button className="btn-primary text-xs py-1.5" onClick={save}>រក្សាទុក</button>
              <button className="btn-secondary text-xs py-1.5" onClick={cancel}>បោះបង់</button>
            </div>
          </div>
        )}

        {users.map(u => (
          <div key={u.id} className="px-4 py-3 flex items-center gap-3 flex-wrap">
            {editing === u.id ? (
              <>
                <input className="input text-xs py-1 w-32" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
                <input type="email" className="input text-xs py-1 w-44" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })} />
                <input type="password" className="input text-xs py-1 w-36" placeholder="ពាក្យសម្ងាត់ថ្មី"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
                <RoleSelect value={form.role} onChange={v => setForm({ ...form, role: v })} />
                <button className="btn-primary text-xs py-1" onClick={save}>រក្សាទុក</button>
                <button className="btn-secondary text-xs py-1" onClick={cancel}>បោះបង់</button>
              </>
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900">{u.name}</span>
                  <span className="text-xs text-gray-500 ml-2">{u.email}</span>
                  {u.id === currentUser?.id && (
                    <span className="text-xs text-gray-400 ml-1">(អ្នក)</span>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE[u.role]}`}>
                  {ROLE_LABEL[u.role] || u.role}
                </span>
                <button className="text-xs text-gray-600 hover:text-gray-900" onClick={() => startEdit(u)}>កែ</button>
                {u.id !== currentUser?.id && (
                  <button className="text-xs text-red-500 hover:text-red-700" onClick={() => handleDelete(u.id)}>លុប</button>
                )}
              </>
            )}
          </div>
        ))}

        {users.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">មិនទាន់មានទិន្នន័យ</p>
        )}
      </div>
    </div>
  )
}

function ManageList({ title, items, onSave, onDelete, fields, canEdit, canDelete: canDel }) {
  const [form, setForm] = useState({})
  const [editing, setEditing] = useState(null)

  const startAdd = () => { setForm(Object.fromEntries(fields.map(f => [f.key, f.default || '']))); setEditing('new') }
  const startEdit = (item) => { setForm(Object.fromEntries(fields.map(f => [f.key, item[f.key] || '']))); setEditing(item.id) }
  const cancel = () => setEditing(null)

  const save = async () => {
    await onSave(editing === 'new' ? null : editing, form)
    setEditing(null)
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {canEdit && <button className="btn-primary text-xs py-1.5" onClick={startAdd}>+ បន្ថែម</button>}
      </div>
      <div className="divide-y divide-gray-100">
        {editing === 'new' && (
          <div className="px-4 py-3 bg-blue-50 flex flex-wrap gap-2 items-end">
            {fields.map(f => (
              <div key={f.key}>
                <label className="label text-xs">{f.label}</label>
                {f.type === 'select' ? (
                  <select className="input text-xs py-1.5" value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}>
                    {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <input className="input text-xs py-1.5" value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                )}
              </div>
            ))}
            <div className="flex gap-1">
              <button className="btn-primary text-xs py-1.5" onClick={save}>រក្សាទុក</button>
              <button className="btn-secondary text-xs py-1.5" onClick={cancel}>បោះបង់</button>
            </div>
          </div>
        )}
        {items.map(item => (
          <div key={item.id} className="px-4 py-3 flex items-center gap-3">
            {editing === item.id ? (
              <>
                {fields.map(f => (
                  <div key={f.key}>
                    {f.type === 'select' ? (
                      <select className="input text-xs py-1" value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}>
                        {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    ) : (
                      <input className="input text-xs py-1" value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                    )}
                  </div>
                ))}
                <button className="btn-primary text-xs py-1" onClick={save}>រក្សាទុក</button>
                <button className="btn-secondary text-xs py-1" onClick={cancel}>បោះបង់</button>
              </>
            ) : (
              <>
                <div className="flex-1">
                  <span className="text-sm text-gray-900">{item.nameKh}</span>
                  {item.nameEn && <span className="text-xs text-gray-600 ml-2">({item.nameEn})</span>}
                  {item.rankType && <span className={`badge ml-2 ${item.rankType === 'MILITARY' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>{item.rankType === 'MILITARY' ? 'មន្រ្តីនគរបាល' : 'ស៊ីវិល'}</span>}
                </div>
                {canEdit && <button className="text-xs text-gray-700 hover:text-gray-900" onClick={() => startEdit(item)}>កែ</button>}
                {canDel && <button className="text-xs text-red-500 hover:text-red-700" onClick={() => onDelete(item.id)}>លុប</button>}
              </>
            )}
          </div>
        ))}
        {items.length === 0 && <p className="text-gray-600 text-sm text-center py-4">មិនទាន់មីទិន្នន័យ</p>}
      </div>
    </div>
  )
}

export default function Settings() {
  const { user } = useAuth()
  const [ranks, setRanks] = useState([])
  const [educationLevels, setEducationLevels] = useState([])
  const canEdit = user?.role === 'ADMIN'

  const loadAll = () => {
    rankApi.getAll().then(r => setRanks(r.data))
    educationApi.getAll().then(r => setEducationLevels(r.data))
  }

  useEffect(() => { loadAll() }, [])

  const handleRankSave = async (id, form) => {
    try {
      if (id) await rankApi.update(id, form)
      else await rankApi.create(form)
      toast.success('រក្សាទុកដោយជោគជ័យ')
      loadAll()
    } catch { toast.error('មានបញ្ហា') }
  }

  const handleRankDelete = async (id) => {
    if (!confirm('លុប?')) return
    try { await rankApi.delete(id); toast.success('លុបបានជោគជ័យ'); loadAll() }
    catch { toast.error('មិនអាចលុបបាន') }
  }

  const handleEduSave = async (id, form) => {
    try {
      if (id) await educationApi.update(id, form)
      else await educationApi.create(form)
      toast.success('រក្សាទុកដោយជោគជ័យ')
      loadAll()
    } catch { toast.error('មានបញ្ហា') }
  }

  const handleEduDelete = async (id) => {
    if (!confirm('លុប?')) return
    try { await educationApi.delete(id); toast.success('លុបបានជោគជ័យ'); loadAll() }
    catch { toast.error('មិនអាចលុបបាន') }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">ការកំណត់</h2>
        <p className="text-gray-700 text-sm">គ្រប់គ្រងទិន្នន័យជំនួយ</p>
      </div>

      {canEdit && <UserManagement />}

      <ManageList
        title="ឋានៈ / លក្ខន្តិកៈ"
        items={ranks}
        onSave={handleRankSave}
        onDelete={handleRankDelete}
        canEdit={canEdit}
        canDelete={canEdit}
        fields={[
          { key: 'nameKh', label: 'ឈ្មោះ (ខ្មែរ)', default: '' },
          { key: 'nameEn', label: 'English', default: '' },
          { key: 'rankType', label: 'ប្រភេទ', type: 'select', default: 'MILITARY', options: [{ value: 'MILITARY', label: 'មន្រ្តីនគរបាល' }, { value: 'CIVIL', label: 'ស៊ីវិល' }] },
        ]}
      />

      <ManageList
        title="កំរិតវប្បធម៌"
        items={educationLevels}
        onSave={handleEduSave}
        onDelete={handleEduDelete}
        canEdit={canEdit}
        canDelete={canEdit}
        fields={[
          { key: 'nameKh', label: 'ឈ្មោះ (ខ្មែរ)', default: '' },
          { key: 'nameEn', label: 'English', default: '' },
        ]}
      />
    </div>
  )
}
