const prisma = require('../lib/prisma')

const getAll = async (req, res) => {
  const levels = await prisma.educationLevel.findMany({ orderBy: { order: 'asc' } })
  res.json(levels)
}

const create = async (req, res) => {
  const { nameKh, nameEn, order } = req.body
  const level = await prisma.educationLevel.create({ data: { nameKh, nameEn, order: order || 0 } })
  res.status(201).json(level)
}

const update = async (req, res) => {
  const { nameKh, nameEn, order } = req.body
  const level = await prisma.educationLevel.update({
    where: { id: parseInt(req.params.id) },
    data: { nameKh, nameEn, order: order || 0 },
  })
  res.json(level)
}

const remove = async (req, res) => {
  await prisma.educationLevel.delete({ where: { id: parseInt(req.params.id) } })
  res.json({ message: 'Education level deleted' })
}

module.exports = { getAll, create, update, remove }
