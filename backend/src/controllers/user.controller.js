const bcrypt = require('bcryptjs')
const prisma = require('../lib/prisma')

const VALID_ROLES = ['ADMIN', 'HR', 'VIEWER']

const getAll = async (req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { id: 'asc' },
  })
  res.json(users)
}

const create = async (req, res) => {
  const { name, email, password, role } = req.body
  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' })
  }
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ message: 'Invalid role' })
  }
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return res.status(409).json({ message: 'Email already in use' })

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })
  res.status(201).json(user)
}

const update = async (req, res) => {
  const id = Number(req.params.id)
  const { name, email, role, password } = req.body
  const data = {}
  if (name) data.name = name
  if (email) data.email = email
  if (role) {
    if (!VALID_ROLES.includes(role)) return res.status(400).json({ message: 'Invalid role' })
    data.role = role
  }
  if (password) data.password = await bcrypt.hash(password, 10)

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })
  res.json(user)
}

const remove = async (req, res) => {
  const id = Number(req.params.id)
  if (id === req.user.id) {
    return res.status(400).json({ message: 'Cannot delete your own account' })
  }
  await prisma.user.delete({ where: { id } })
  res.json({ message: 'Deleted' })
}

module.exports = { getAll, create, update, remove }
