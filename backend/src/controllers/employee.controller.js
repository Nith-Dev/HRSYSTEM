const prisma = require('../lib/prisma')

const include = {
  rank: true,
  department: true,
  office: true,
  educationLevel: true,
}

const getAll = async (req, res) => {
  const { search, departmentId, officeId, gender, employeeType, page = 1, limit = 20 } = req.query
  const pageNumber = Math.max(parseInt(page, 10) || 1, 1)
  const pageSize = Math.max(parseInt(limit, 10) || 20, 1)
  const skip = (pageNumber - 1) * pageSize

  const where = {}
  const searchTerm = typeof search === 'string' ? search.trim() : ''

  if (searchTerm) {
    where.OR = [
      { latinName: { contains: searchTerm } },
      { latinName: { contains: searchTerm.toUpperCase() } },
      { khmerFirstName: { contains: searchTerm } },
      { khmerLastName: { contains: searchTerm } },
      { badgeNumber: { contains: searchTerm } },
      { phone: { contains: searchTerm } },
    ]

    const sequentialNo = parseInt(searchTerm, 10)
    if (!Number.isNaN(sequentialNo)) {
      where.OR.push({ sequentialNo })
    }
  }
  if (departmentId) where.departmentId = parseInt(departmentId, 10)
  if (officeId) where.officeId = parseInt(officeId, 10)
  if (gender) where.gender = gender.trim()
  if (employeeType) where.employeeType = employeeType.trim()

  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      include,
      orderBy: [{ departmentId: 'asc' }, { sequentialNo: 'asc' }],
      skip,
      take: pageSize,
    }),
    prisma.employee.count({ where }),
  ])

  res.json({ data: employees, total, page: pageNumber, limit: pageSize })
}

const getById = async (req, res) => {
  const employee = await prisma.employee.findUnique({
    where: { id: parseInt(req.params.id) },
    include,
  })
  if (!employee) return res.status(404).json({ message: 'Employee not found' })
  res.json(employee)
}

const create = async (req, res) => {
  const data = buildEmployeeData(req.body)
  const employee = await prisma.employee.create({ data, include })
  res.status(201).json(employee)
}

const update = async (req, res) => {
  const id = parseInt(req.params.id)
  const data = buildEmployeeData(req.body)
  const employee = await prisma.employee.update({ where: { id }, data, include })
  res.json(employee)
}

const remove = async (req, res) => {
  await prisma.employee.delete({ where: { id: parseInt(req.params.id) } })
  res.json({ message: 'Employee deleted' })
}

const getStats = async (req, res) => {
  const [total, byGender, byType, byDept] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.groupBy({ by: ['gender'], _count: { gender: true } }),
    prisma.employee.groupBy({ by: ['employeeType'], _count: { employeeType: true } }),
    prisma.employee.groupBy({
      by: ['departmentId'],
      _count: { departmentId: true },
    }),
  ])

  const deptIds = byDept.map((d) => d.departmentId).filter(Boolean)
  const depts = await prisma.department.findMany({ where: { id: { in: deptIds } } })
  const deptMap = Object.fromEntries(depts.map((d) => [d.id, d.nameKh]))

  res.json({
    total,
    byGender: Object.fromEntries(byGender.map((g) => [g.gender, g._count.gender])),
    byType: Object.fromEntries(byType.map((t) => [t.employeeType, t._count.employeeType])),
    byDepartment: byDept.map((d) => ({
      departmentId: d.departmentId,
      name: deptMap[d.departmentId] || 'Unknown',
      count: d._count.departmentId,
    })),
  })
}

function buildEmployeeData(body) {
  return {
    sequentialNo: body.sequentialNo ? parseInt(body.sequentialNo) : null,
    khmerLastName: body.khmerLastName,
    khmerFirstName: body.khmerFirstName,
    latinName: body.latinName,
    gender: body.gender,
    badgeNumber: body.badgeNumber || null,
    dateOfBirth: new Date(body.dateOfBirth),
    retirementDate: body.retirementDate ? new Date(body.retirementDate) : null,
    position: body.position,
    rankId: body.rankId ? parseInt(body.rankId) : null,
    departmentId: body.departmentId ? parseInt(body.departmentId) : null,
    officeId: body.officeId ? parseInt(body.officeId) : null,
    educationLevelId: body.educationLevelId ? parseInt(body.educationLevelId) : null,
    phone: body.phone || null,
    remarks: body.remarks || null,
    employeeType: body.employeeType || 'POLICE',
  }
}

module.exports = { getAll, getById, create, update, remove, getStats }
