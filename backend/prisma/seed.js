const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@hrsystem.gov.kh' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@hrsystem.gov.kh',
      password: hashedPassword,
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

  // Ranks - Military
  const militaryRanks = [
    { nameKh: 'ឯកឧត្តម', nameEn: 'His Excellency', order: 1 },
    { nameKh: 'ឧត្តមសេនីយ៍ឯក', nameEn: 'Lieutenant General', order: 2 },
    { nameKh: 'ឧត្តមសេនីយ៍ទោ', nameEn: 'Major General', order: 3 },
    { nameKh: 'ឧត្តមសេនីយ៍ត្រី', nameEn: 'Brigadier General', order: 4 },
    { nameKh: 'វរសេនីយ៍ឯក', nameEn: 'Colonel', order: 5 },
    { nameKh: 'វរសេនីយ៍ទោ', nameEn: 'Lieutenant Colonel', order: 6 },
    { nameKh: 'វរសេនីយ៍ត្រី', nameEn: 'Major', order: 7 },
    { nameKh: 'អនុសេនីយ៍ឯក', nameEn: 'Captain', order: 8 },
    { nameKh: 'អនុសេនីយ៍ទោ', nameEn: 'First Lieutenant', order: 9 },
    { nameKh: 'អនុសេនីយ៍ត្រី', nameEn: 'Second Lieutenant', order: 10 },
    { nameKh: 'ព្រឹទ្ធបុរសឯក', nameEn: 'Senior Elder I', order: 11 },
    { nameKh: 'ព្រឹទ្ធបុរសទោ', nameEn: 'Senior Elder II', order: 12 },
  ]

  for (const rank of militaryRanks) {
    await prisma.rank.upsert({
      where: { id: militaryRanks.indexOf(rank) + 1 },
      update: {},
      create: { ...rank, rankType: 'MILITARY' },
    })
  }

  // Ranks - Civil
  const civilRanks = [
    { nameKh: 'លោក', nameEn: 'Mr.', order: 1 },
    { nameKh: 'លោកស្រី', nameEn: 'Mrs./Ms.', order: 2 },
    { nameKh: 'ព្រឹទ្ធបុរស', nameEn: 'Elder', order: 3 },
  ]

  for (const rank of civilRanks) {
    await prisma.rank.create({
      data: { ...rank, rankType: 'CIVIL' },
    }).catch(() => {})
  }

  // Education Levels
  const educationLevels = [
    { nameKh: 'អនុបណ្ឌិត', nameEn: "Master's Degree", order: 1 },
    { nameKh: 'បរិញ្ញាបត្រ', nameEn: "Bachelor's Degree", order: 2 },
    { nameKh: 'បរិញ្ញាបត្ររង', nameEn: 'Associate Degree', order: 3 },
    { nameKh: 'បរិញ្ញាបត្រគ្រប់គ្រង', nameEn: 'Management Degree', order: 4 },
    { nameKh: 'ទុតិយភូមិ', nameEn: 'Upper Secondary', order: 5 },
    { nameKh: 'មធ្យម.កំរិត២', nameEn: 'Secondary Level 2', order: 6 },
    { nameKh: 'ថ្នាក់ទី១២', nameEn: 'Grade 12', order: 7 },
    { nameKh: 'ថ្នាក់ទី១២ងីម', nameEn: 'Grade 12 (Incomplete)', order: 8 },
    { nameKh: 'ថ្នាក់ទី១០ងីម', nameEn: 'Grade 10 (Incomplete)', order: 9 },
    { nameKh: 'ថ្នាក់ទី៩', nameEn: 'Grade 9', order: 10 },
    { nameKh: 'ថ្នាក់ទី៨ងីម', nameEn: 'Grade 8 (Incomplete)', order: 11 },
    { nameKh: 'ថ្នាក់ទី៥', nameEn: 'Grade 5', order: 12 },
  ]

  for (const level of educationLevels) {
    await prisma.educationLevel.create({ data: level }).catch(() => {})
  }

  // Departments
  const departments = [
    { nameKh: 'ថ្នាក់ដឹកនាំ អគ្គាធិការដ្ឋាន', nameEn: 'General Commissariat Leadership', order: 1 },
    { nameKh: 'នាយកដ្ឋានរដ្ឋបាល', nameEn: 'Administration Department', order: 2 },
    { nameKh: 'នាយកដ្ឋានអធិការកិច្ចកិច្ចការរដ្ឋបាល', nameEn: 'Administrative Inspection Department', order: 3 },
    { nameKh: 'នាយកដ្ឋានទទួលពាក្យបណ្តឹង និងអង្កេតស្រាវជ្រាវកិច្ចការរដ្ឋបាល', nameEn: 'Administrative Complaints & Investigation Department', order: 4 },
    { nameKh: 'នាយកដ្ឋានអធិការកិច្ចកិច្ចការនគរបាលថ្នាក់កណ្តាល', nameEn: 'Central Police Inspection Department', order: 5 },
    { nameKh: 'នាយកដ្ឋានអធិការកិច្ចកិច្ចការនគរបាលរាជធានីភ្នំពេញ', nameEn: 'Phnom Penh Police Inspection Department', order: 6 },
    { nameKh: 'នាយកដ្ឋានទទួលពាក្យបណ្ឹង និងអង្កេតស្រាវជ្រាវកិច្ចការនគរបាល', nameEn: 'Police Complaints & Investigation Department', order: 7 },
  ]

  const createdDepts = []
  for (const dept of departments) {
    const d = await prisma.department.create({ data: dept })
    createdDepts.push(d)
  }

  // Offices for Admin Department (dept index 1)
  const adminDeptId = createdDepts[1].id
  const offices = [
    { nameKh: 'ការិយាល័យរបៀប និងរដ្ឋបាល', nameEn: 'Procedures & Administration Office', order: 1 },
    { nameKh: 'ការិយាល័យសរុបវិភាគ និងផែនការ', nameEn: 'Analysis & Planning Office', order: 2 },
    { nameKh: 'ការិយាល័យស្ថេអ្ជ័រ និងគណនេយ្យ', nameEn: 'Finance & Accounting Office', order: 3 },
    { nameKh: 'ការិយាល័យបុគ្គលិក និងបណ្តុះបណ្តាល', nameEn: 'Personnel & Training Office', order: 4 },
    { nameKh: 'ការិយាល័យឯកសារ និងព័ត៌មានវិទ្យា', nameEn: 'Documents & IT Office', order: 5 },
    { nameKh: 'ការិយាល័យជំនួយការ', nameEn: 'Assistant Office', order: 6 },
    { nameKh: 'ជំនួយការថ្នាក់ដឹកនាំ', nameEn: 'Executive Assistants', order: 7 },
  ]

  for (const office of offices) {
    await prisma.office.create({ data: { ...office, departmentId: adminDeptId } })
  }

  console.log('Seeding complete!')
  console.log('Admin login: admin@hrsystem.gov.kh / admin123')
  console.log('HR login:    hr@hrsystem.gov.kh / hr123456')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
