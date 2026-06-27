const prisma = require('../lib/prisma')

const getRecent = async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50)
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  res.json(logs)
}

module.exports = { getRecent }
