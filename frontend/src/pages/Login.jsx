import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch {
      toast.error('អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundImage: 'url(/emblem.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
            🏛️
          </div>
          <h1 className="text-xl font-bold text-gray-900">អគ្គាធិការដ្ឋាន</h1>
          <p className="text-gray-700 text-sm mt-1">ប្រព័ន្ធគ្រប់គ្រងមន្ត្រី</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">អ៊ីមែល</label>
            <input
              type="email"
              className="input"
              placeholder="admin@hrsystem.gov.kh"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">ពាក្យសម្ងាត់</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full justify-center py-2.5 mt-2" disabled={loading}>
            {loading ? 'កំពុងចូល...' : 'ចូលប្រើប្រាស់'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          អភិវឌ្ឍន៍និងគាំទ្រផ្នែកបច្ចេកទេសដោយ លោក ញ៉េប ម៉ានិត
        </p>
      </div>
    </div>
  )
}
