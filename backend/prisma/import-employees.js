const { PrismaClient } = require('@prisma/client')
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

async function findExistingEmployee(emp, dob) {
  const badgeNumber = emp.badgeNumber ? String(emp.badgeNumber) : null

  if (badgeNumber) {
    const existing = await prisma.employee.findFirst({ where: { badgeNumber } })
    if (existing) return existing
  }

  return prisma.employee.findFirst({
    where: {
      sequentialNo: emp.sequentialNo ?? null,
      latinName: emp.latinName,
      dateOfBirth: dob,
    },
  })
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

  // Load all reference data into maps for fast lookup
  const ranks      = await prisma.rank.findMany()
  const depts      = await prisma.department.findMany()
  const offices    = await prisma.office.findMany()
  const eduLevels  = await prisma.educationLevel.findMany()

  const rankMap = new Map(ranks.map(r => [r.nameKh, r.id]))
  const deptMap = new Map(depts.map(d => [d.nameKh, d.id]))
  const officeMap = new Map(offices.map(o => [officeKey(o.nameKh, o.departmentId), o.id]))
  const eduMap  = new Map(eduLevels.map(e => [e.nameKh, e.id]))

  let created = 0
  let skipped = 0
  let errors  = 0

  for (const rawEmp of employees) {
    const emp = normalizeEmployee(rawEmp)

    try {
      requireValue(emp, 'khmerLastName')
      requireValue(emp, 'khmerFirstName')
      requireValue(emp, 'latinName')
      requireValue(emp, 'dateOfBirth')
      requireValue(emp, 'position')

      const dob = parseDate(emp.dateOfBirth, 'dateOfBirth', emp)
      const existing = await findExistingEmployee(emp, dob)

      if (existing) {
        skipped++
        continue
      }

      // --- Rank ---
      let rankId = null
      if (emp.rankName) {
        if (!rankMap.has(emp.rankName)) {
          const r = await prisma.rank.create({
            data: { nameKh: emp.rankName, rankType: 'MILITARY', order: 99 }
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
            data: { nameKh: emp.departmentName, order: 99 }
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
            data: { nameKh: emp.officeName, order: 99, departmentId }
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
            data: { nameKh: emp.educationLevelName, order: 99 }
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
  console.log(`  Skipped  : ${skipped} (already exists)`)
  console.log(`  Errors   : ${errors}`)
  console.log('=============================')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
