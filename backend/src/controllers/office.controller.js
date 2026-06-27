const prisma = require('../lib/prisma')

const getAll = async (req, res) => {
  const { departmentId } = req.query
  const where = departmentId ? { departmentId: parseInt(departmentId) } : {}
  const offices = await prisma.office.findMany({
    where,
    include: { department: true, _count: { select: { employees: true } } },
    orderBy: [{ departmentId: 'asc' }, { order: 'asc' }],
  })
  res.json(offices)
}

const create = async (req, res) => {
  const { nameKh, nameEn, departmentId, order } = req.body
  const office = await prisma.office.create({
    data: { nameKh, nameEn, departmentId: parseInt(departmentId), order: order || 0 },
    include: { department: true },
  })
  res.status(201).json(office)
}

const update = async (req, res) => {
  const { nameKh, nameEn, departmentId, order } = req.body
  const office = await prisma.office.update({
    where: { id: parseInt(req.params.id) },
    data: { nameKh, nameEn, departmentId: parseInt(departmentId), order: order || 0 },
    include: { department: true },
  })
  res.json(office)
}

const remove = async (req, res) => {
  await prisma.office.delete({ where: { id: parseInt(req.params.id) } })
  res.json({ message: 'Office deleted' })
}

module.exports = { getAll, create, update, remove }
