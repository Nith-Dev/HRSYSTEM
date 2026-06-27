const prisma = require('../lib/prisma')

const getAll = async (req, res) => {
  const ranks = await prisma.rank.findMany({ orderBy: [{ rankType: 'asc' }, { order: 'asc' }] })
  res.json(ranks)
}

const create = async (req, res) => {
  const { nameKh, nameEn, rankType, order } = req.body
  const rank = await prisma.rank.create({ data: { nameKh, nameEn, rankType, order: order || 0 } })
  res.status(201).json(rank)
}

const update = async (req, res) => {
  const { nameKh, nameEn, rankType, order } = req.body
  const rank = await prisma.rank.update({
    where: { id: parseInt(req.params.id) },
    data: { nameKh, nameEn, rankType, order: order || 0 },
  })
  res.json(rank)
}

const remove = async (req, res) => {
  await prisma.rank.delete({ where: { id: parseInt(req.params.id) } })
  res.json({ message: 'Rank deleted' })
}

module.exports = { getAll, create, update, remove }
