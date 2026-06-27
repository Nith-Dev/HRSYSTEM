require('dotenv').config()
require('express-async-errors')
const express = require('express')
const cors = require('cors')

const app = express()

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((o) => o.trim())
  : ['http://localhost:5173']
app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(express.json())

app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/employees', require('./routes/employee.routes'))
app.use('/api/departments', require('./routes/department.routes'))
app.use('/api/offices', require('./routes/office.routes'))
app.use('/api/ranks', require('./routes/rank.routes'))
app.use('/api/education-levels', require('./routes/education.routes'))

app.use((err, req, res, next) => {
  console.error(err)
  const status = err.status || 500
  res.status(status).json({ message: err.message || 'Internal server error' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
