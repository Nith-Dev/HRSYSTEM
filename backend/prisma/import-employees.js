const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : value
}

function normalizeEmployee(emp) {
  return Object.fromEntries(
    Object.entries(emp).map(([key, value]) => [key, normalizeText(value)])
  )
}

function retirementDate(dob) {
  const d = new Date(dob)
  d.setFullYear(d.getFullYear() + 60)
  return d
}

function parseDate(value, fieldName, emp) {
  const date = new Date(value)
  if (!value || Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ${fieldName} for #${emp.sequentialNo ?? 'unknown'} ${emp.latinName ?? ''}`)
  }
  return date
}

function requireValue(emp, key) {
  if (emp[key] === undefined || emp[key] === null || emp[key] === '') {
    throw new Error(`Missing required field "${key}"`)
  }
}

function officeKey(nameKh, departmentId) {
  return `${departmentId}:${nameKh}`
}

function rankTypeForEmployee(emp) {
  return emp.employeeType === 'CIVIL' || emp.employeeType === 'CONTRACT' ? 'CIVIL' : 'MILITARY'
}

async function ensureLoginUsers() {
  await prisma.user.upsert({
    where: { email: 'admin@hrsystem.gov.kh' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@hrsystem.gov.kh',
      password: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
    },
  })

  await prisma.user.upsert({
    where: { email: 'hr@hrsystem.gov.kh' },
    update: {},
    create: {
      name: 'HR Officer',
      email: 'hr@hrsystem.gov.kh',
      password: await bcrypt.hash('hr123456', 10),
      role: 'HR',
    },
  })
}

async function resetEmployeeData() {
  await prisma.$transaction([
    prisma.employee.deleteMany(),
    prisma.office.deleteMany(),
    prisma.department.deleteMany(),
    prisma.rank.deleteMany(),
    prisma.educationLevel.deleteMany(),
  ])
}

async function main() {
  const filePath = path.join(__dirname, 'employees.json')

  if (!fs.existsSync(filePath)) {
    console.error('ERROR: employees.json not found at', filePath)
    console.error('Please save the JSON file from Claude web to backend/prisma/employees.json')
    process.exit(1)
  }

  const employees = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  if (!Array.isArray(employees)) {
    throw new Error('employees.json must contain an array of employees')
  }

  console.log(`Found ${employees.length} employees to import...`)
  console.log('Clearing existing employee/reference data...')

  await ensureLoginUsers()
  await resetEmployeeData()

  const rankMap = new Map()
  const deptMap = new Map()
  const officeMap = new Map()
  const eduMap  = new Map()

  let created = 0
  let errors  = 0
  let rankOrder = 1
  let deptOrder = 1
  let officeOrder = 1
  let eduOrder = 1

  for (const rawEmp of employees) {
    const emp = normalizeEmployee(rawEmp)

    try {
      requireValue(emp, 'khmerLastName')
      requireValue(emp, 'khmerFirstName')
      requireValue(emp, 'latinName')
      requireValue(emp, 'dateOfBirth')
      requireValue(emp, 'position')

      const dob = parseDate(emp.dateOfBirth, 'dateOfBirth', emp)

      // --- Rank ---
      let rankId = null
      if (emp.rankName) {
        if (!rankMap.has(emp.rankName)) {
          const r = await prisma.rank.create({
            data: { nameKh: emp.rankName, rankType: rankTypeForEmployee(emp), order: rankOrder++ }
          })
          rankMap.set(emp.rankName, r.id)
          console.log(`  [NEW RANK] ${emp.rankName}`)
        }
        rankId = rankMap.get(emp.rankName)
      }

      // --- Department ---
      let departmentId = null
      if (emp.departmentName) {
        if (!deptMap.has(emp.departmentName)) {
          const d = await prisma.department.create({
            data: { nameKh: emp.departmentName, order: deptOrder++ }
          })
          deptMap.set(emp.departmentName, d.id)
          console.log(`  [NEW DEPT] ${emp.departmentName}`)
        }
        departmentId = deptMap.get(emp.departmentName)
      }

      // --- Office ---
      let officeId = null
      if (emp.officeName && departmentId) {
        const key = officeKey(emp.officeName, departmentId)
        if (!officeMap.has(key)) {
          const o = await prisma.office.create({
            data: { nameKh: emp.officeName, order: officeOrder++, departmentId }
          })
          officeMap.set(key, o.id)
          console.log(`  [NEW OFFICE] ${emp.officeName}`)
        }
        officeId = officeMap.get(key)
      }

      // --- Education Level ---
      let educationLevelId = null
      if (emp.educationLevelName) {
        if (!eduMap.has(emp.educationLevelName)) {
          const e = await prisma.educationLevel.create({
            data: { nameKh: emp.educationLevelName, order: eduOrder++ }
          })
          eduMap.set(emp.educationLevelName, e.id)
          console.log(`  [NEW EDU] ${emp.educationLevelName}`)
        }
        educationLevelId = eduMap.get(emp.educationLevelName)
      }

      await prisma.employee.create({
        data: {
          sequentialNo:     emp.sequentialNo ?? null,
          khmerLastName:    emp.khmerLastName,
          khmerFirstName:   emp.khmerFirstName,
          latinName:        emp.latinName,
          gender:           emp.gender,
          badgeNumber:      emp.badgeNumber ? String(emp.badgeNumber) : null,
          dateOfBirth:      dob,
          retirementDate:   emp.retirementDate ? parseDate(emp.retirementDate, 'retirementDate', emp) : retirementDate(dob),
          position:         emp.position,
          employeeType:     emp.employeeType || 'POLICE',
          phone:            emp.phone ? String(emp.phone) : null,
          remarks:          emp.remarks || null,
          rankId,
          departmentId,
          officeId,
          educationLevelId,
        }
      })

      created++
      if (created % 50 === 0) {
        console.log(`  Progress: ${created}/${employees.length}`)
      }
    } catch (err) {
      if (err.code === 'P2002') {
        skipped++
      } else {
        console.error(`  ERROR on #${emp.sequentialNo} ${emp.latinName}: ${err.message}`)
        errors++
      }
    }
  }

  console.log('\n=============================')
  console.log(`  Imported : ${created}`)
  console.log(`  Errors   : ${errors}`)
  console.log('=============================')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
