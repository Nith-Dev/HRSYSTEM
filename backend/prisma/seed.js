const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function main() {
  // Skip if already seeded — runs on every Render startup so must be idempotent and fast
  const existing = await prisma.department.count()
  if (existing > 0) {
    console.log(`Seed skipped — database already contains ${existing} departments.`)
    return
  }

  const backup = JSON.parse(fs.readFileSync(path.join(__dirname, 'backup.json'), 'utf-8'))

  console.log('Seeding departments...')
  for (const d of backup.departments) {
    await prisma.department.upsert({
      where: { id: d.id },
      update: { nameKh: d.nameKh, nameEn: d.nameEn, order: d.order },
      create: { id: d.id, nameKh: d.nameKh, nameEn: d.nameEn, order: d.order },
    })
  }

  console.log('Seeding offices...')
  for (const o of backup.offices) {
    await prisma.office.upsert({
      where: { id: o.id },
      update: { nameKh: o.nameKh, nameEn: o.nameEn, order: o.order, departmentId: o.departmentId },
      create: { id: o.id, nameKh: o.nameKh, nameEn: o.nameEn, order: o.order, departmentId: o.departmentId },
    })
  }

  console.log('Seeding ranks...')
  for (const r of backup.ranks) {
    await prisma.rank.upsert({
      where: { id: r.id },
      update: { nameKh: r.nameKh, nameEn: r.nameEn, rankType: r.rankType, order: r.order },
      create: { id: r.id, nameKh: r.nameKh, nameEn: r.nameEn, rankType: r.rankType, order: r.order },
    })
  }

  console.log('Seeding education levels...')
  for (const e of backup.educationLevels) {
    await prisma.educationLevel.upsert({
      where: { id: e.id },
      update: { nameKh: e.nameKh, nameEn: e.nameEn, order: e.order },
      create: { id: e.id, nameKh: e.nameKh, nameEn: e.nameEn, order: e.order },
    })
  }

  console.log('Seeding users...')
  for (const u of backup.users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role },
      create: { id: u.id, name: u.name, email: u.email, password: u.password, role: u.role },
    })
  }

  console.log('Seeding employees...')
  for (const e of backup.employees) {
    await prisma.employee.upsert({
      where: { id: e.id },
      update: {
        sequentialNo: e.sequentialNo,
        khmerLastName: e.khmerLastName,
        khmerFirstName: e.khmerFirstName,
        latinName: e.latinName,
        gender: e.gender,
        badgeNumber: e.badgeNumber,
        dateOfBirth: new Date(e.dateOfBirth),
        retirementDate: e.retirementDate ? new Date(e.retirementDate) : null,
        position: e.position,
        rankId: e.rankId,
        departmentId: e.departmentId,
        officeId: e.officeId,
        educationLevelId: e.educationLevelId,
        phone: e.phone,
        remarks: e.remarks,
        employeeType: e.employeeType,
      },
      create: {
        id: e.id,
        sequentialNo: e.sequentialNo,
        khmerLastName: e.khmerLastName,
        khmerFirstName: e.khmerFirstName,
        latinName: e.latinName,
        gender: e.gender,
        badgeNumber: e.badgeNumber,
        dateOfBirth: new Date(e.dateOfBirth),
        retirementDate: e.retirementDate ? new Date(e.retirementDate) : null,
        position: e.position,
        rankId: e.rankId,
        departmentId: e.departmentId,
        officeId: e.officeId,
        educationLevelId: e.educationLevelId,
        phone: e.phone,
        remarks: e.remarks,
        employeeType: e.employeeType,
      },
    })
  }

  // Reset sequences so new records don't conflict with existing IDs
  await prisma.$executeRawUnsafe(`SELECT setval('"Department_id_seq"', (SELECT MAX(id) FROM "Department"))`)
  await prisma.$executeRawUnsafe(`SELECT setval('"Office_id_seq"', (SELECT MAX(id) FROM "Office"))`)
  await prisma.$executeRawUnsafe(`SELECT setval('"Rank_id_seq"', (SELECT MAX(id) FROM "Rank"))`)
  await prisma.$executeRawUnsafe(`SELECT setval('"EducationLevel_id_seq"', (SELECT MAX(id) FROM "EducationLevel"))`)
  await prisma.$executeRawUnsafe(`SELECT setval('"User_id_seq"', (SELECT MAX(id) FROM "User"))`)
  await prisma.$executeRawUnsafe(`SELECT setval('"Employee_id_seq"', (SELECT MAX(id) FROM "Employee"))`)

  console.log(`Done! Seeded:`)
  console.log(`  ${backup.departments.length} departments`)
  console.log(`  ${backup.offices.length} offices`)
  console.log(`  ${backup.ranks.length} ranks`)
  console.log(`  ${backup.educationLevels.length} education levels`)
  console.log(`  ${backup.users.length} users`)
  console.log(`  ${backup.employees.length} employees`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
