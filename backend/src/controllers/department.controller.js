const prisma = require('../lib/prisma')

const getAll = async (req, res) => {
  const departments = await prisma.department.findMany({
    include: { offices: { orderBy: { order: 'asc' } }, _count: { select: { employees: true } } },
    orderBy: { order: 'asc' },
  })
  res.json(departments)
}

const getById = async (req, res) => {
  const dept = await prisma.department.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { offices: true },
  })
  if (!dept) return res.status(404).json({ message: 'Department not found' })
  res.json(dept)
}

const create = async (req, res) => {
  const { nameKh, nameEn, order } = req.body
  const dept = await prisma.department.create({ data: { nameKh, nameEn, order: order || 0 } })
  res.status(201).json(dept)
}

const update = async (req, res) => {
  const { nameKh, nameEn, order } = req.body
  const dept = await prisma.department.update({
    where: { id: parseInt(req.params.id) },
    data: { nameKh, nameEn, order: order || 0 },
  })
  res.json(dept)
}

const remove = async (req, res) => {
  await prisma.department.delete({ where: { id: parseInt(req.params.id) } })
  res.json({ message: 'Department deleted' })
}

module.exports = { getAll, getById, create, update, remove }
