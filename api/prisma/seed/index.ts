import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding education database...')

  // ---- Admin User ----
  const adminPassword = await hash('Admin@123456', 12)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@school.com' },
    update: {},
    create: {
      name: 'School Admin',
      email: 'admin@school.com',
      password: adminPassword,
      role: 'ADMIN',
      phone: '+91 98765 43210',
    },
  })
  console.log('Admin user created:', adminUser.email)

  // ---- Teachers ----
  const teacherPassword = await hash('Teacher@123456', 12)

  const teacherUser1 = await prisma.user.upsert({
    where: { email: 'sharma.teacher@school.com' },
    update: {},
    create: {
      name: 'Rajesh Sharma',
      email: 'sharma.teacher@school.com',
      password: teacherPassword,
      role: 'TEACHER',
      phone: '+91 98765 11111',
    },
  })

  const teacher1 = await prisma.teacher.upsert({
    where: { userId: teacherUser1.id },
    update: {},
    create: {
      userId: teacherUser1.id,
      employeeId: 'TCH-001',
      department: 'Science',
      subjects: ['Mathematics', 'Science'],
      qualification: 'M.Sc. Mathematics, B.Ed.',
      experience: 12,
      salary: 5500000, // 55,000 INR
    },
  })

  const teacherUser2 = await prisma.user.upsert({
    where: { email: 'gupta.teacher@school.com' },
    update: {},
    create: {
      name: 'Priya Gupta',
      email: 'gupta.teacher@school.com',
      password: teacherPassword,
      role: 'TEACHER',
      phone: '+91 98765 22222',
    },
  })

  const teacher2 = await prisma.teacher.upsert({
    where: { userId: teacherUser2.id },
    update: {},
    create: {
      userId: teacherUser2.id,
      employeeId: 'TCH-002',
      department: 'Languages',
      subjects: ['English', 'Hindi'],
      qualification: 'M.A. English, B.Ed.',
      experience: 8,
      salary: 4500000, // 45,000 INR
    },
  })

  const teacherUser3 = await prisma.user.upsert({
    where: { email: 'kumar.teacher@school.com' },
    update: {},
    create: {
      name: 'Anil Kumar',
      email: 'kumar.teacher@school.com',
      password: teacherPassword,
      role: 'TEACHER',
      phone: '+91 98765 33333',
    },
  })

  const teacher3 = await prisma.teacher.upsert({
    where: { userId: teacherUser3.id },
    update: {},
    create: {
      userId: teacherUser3.id,
      employeeId: 'TCH-003',
      department: 'Social Science',
      subjects: ['Social Studies'],
      qualification: 'M.A. History, B.Ed.',
      experience: 15,
      salary: 6000000, // 60,000 INR
    },
  })

  console.log('Teachers created')

  // ---- Classes ----
  const class10A = await prisma.class.upsert({
    where: { name_section_academicYear: { name: 'Class 10', section: 'A', academicYear: '2024-2025' } },
    update: {},
    create: {
      name: 'Class 10',
      section: 'A',
      teacherId: teacher1.id,
      academicYear: '2024-2025',
      room: 'Room 101',
    },
  })

  const class10B = await prisma.class.upsert({
    where: { name_section_academicYear: { name: 'Class 10', section: 'B', academicYear: '2024-2025' } },
    update: {},
    create: {
      name: 'Class 10',
      section: 'B',
      teacherId: teacher2.id,
      academicYear: '2024-2025',
      room: 'Room 102',
    },
  })

  console.log('Classes created')

  // ---- Subjects ----
  const subjectData = [
    { name: 'Mathematics', code: 'MATH-10', classId: class10A.id, teacherId: teacher1.id, credits: 5 },
    { name: 'Science', code: 'SCI-10', classId: class10A.id, teacherId: teacher1.id, credits: 5 },
    { name: 'English', code: 'ENG-10', classId: class10A.id, teacherId: teacher2.id, credits: 4 },
    { name: 'Hindi', code: 'HIN-10', classId: class10A.id, teacherId: teacher2.id, credits: 4 },
    { name: 'Social Studies', code: 'SST-10', classId: class10A.id, teacherId: teacher3.id, credits: 4 },
    { name: 'Mathematics', code: 'MATH-10B', classId: class10B.id, teacherId: teacher1.id, credits: 5 },
    { name: 'Science', code: 'SCI-10B', classId: class10B.id, teacherId: teacher1.id, credits: 5 },
    { name: 'English', code: 'ENG-10B', classId: class10B.id, teacherId: teacher2.id, credits: 4 },
    { name: 'Hindi', code: 'HIN-10B', classId: class10B.id, teacherId: teacher2.id, credits: 4 },
    { name: 'Social Studies', code: 'SST-10B', classId: class10B.id, teacherId: teacher3.id, credits: 4 },
  ]

  const subjects: any[] = []
  for (const sub of subjectData) {
    const subject = await prisma.subject.create({ data: sub })
    subjects.push(subject)
  }
  console.log(`Created ${subjects.length} subjects`)

  // ---- Parent ----
  const parentPassword = await hash('Parent@123456', 12)
  const parentUser1 = await prisma.user.upsert({
    where: { email: 'parent@demo.com' },
    update: {},
    create: {
      name: 'Suresh Verma',
      email: 'parent@demo.com',
      password: parentPassword,
      role: 'PARENT',
      phone: '+91 98765 88888',
    },
  })

  const parent1 = await prisma.parent.upsert({
    where: { userId: parentUser1.id },
    update: {},
    create: {
      userId: parentUser1.id,
      occupation: 'Engineer',
      address: '45 Gandhi Nagar, New Delhi',
      emergencyContact: '+91 98765 99999',
    },
  })

  // ---- Students (Class 10-A) ----
  const studentPassword = await hash('Student@123456', 12)
  const studentNames10A = [
    { name: 'Amit Verma', email: 'amit.student@school.com', roll: '10A-001', phone: '+91 91111 00001' },
    { name: 'Sneha Patel', email: 'sneha.student@school.com', roll: '10A-002', phone: '+91 91111 00002' },
    { name: 'Rahul Singh', email: 'rahul.student@school.com', roll: '10A-003', phone: '+91 91111 00003' },
    { name: 'Priya Sharma', email: 'priya.student@school.com', roll: '10A-004', phone: '+91 91111 00004' },
    { name: 'Vikram Joshi', email: 'vikram.student@school.com', roll: '10A-005', phone: '+91 91111 00005' },
  ]

  const students10A: any[] = []
  for (let i = 0; i < studentNames10A.length; i++) {
    const s = studentNames10A[i]
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        name: s.name,
        email: s.email,
        password: studentPassword,
        role: 'STUDENT',
        phone: s.phone,
      },
    })

    const student = await prisma.student.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        rollNumber: s.roll,
        class: 'Class 10',
        section: 'A',
        dateOfBirth: new Date(`200${8 + i}-0${i + 1}-${10 + i}`),
        parentId: i === 0 ? parent1.id : undefined, // first student linked to parent
        admissionDate: new Date('2020-04-01'),
        bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'A-'][i],
        address: `${100 + i} MG Road, New Delhi`,
      },
    })
    students10A.push(student)
  }

  // ---- Students (Class 10-B) ----
  const studentNames10B = [
    { name: 'Neha Gupta', email: 'neha.student@school.com', roll: '10B-001', phone: '+91 91111 00006' },
    { name: 'Arjun Reddy', email: 'arjun.student@school.com', roll: '10B-002', phone: '+91 91111 00007' },
    { name: 'Kavita Nair', email: 'kavita.student@school.com', roll: '10B-003', phone: '+91 91111 00008' },
    { name: 'Rohan Mehta', email: 'rohan.student@school.com', roll: '10B-004', phone: '+91 91111 00009' },
    { name: 'Ananya Das', email: 'ananya.student@school.com', roll: '10B-005', phone: '+91 91111 00010' },
  ]

  const students10B: any[] = []
  for (let i = 0; i < studentNames10B.length; i++) {
    const s = studentNames10B[i]
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        name: s.name,
        email: s.email,
        password: studentPassword,
        role: 'STUDENT',
        phone: s.phone,
      },
    })

    const student = await prisma.student.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        rollNumber: s.roll,
        class: 'Class 10',
        section: 'B',
        dateOfBirth: new Date(`200${8 + i}-0${i + 6}-${15 + i}`),
        admissionDate: new Date('2020-04-01'),
        bloodGroup: ['B+', 'O+', 'A+', 'B-', 'AB+'][i],
        address: `${200 + i} Nehru Place, New Delhi`,
      },
    })
    students10B.push(student)
  }

  console.log('Students created: 10 total (5 per class)')

  // ---- Sample Timetable (Class 10-A, Monday) ----
  const timetableEntries = [
    { classId: class10A.id, subjectId: subjects[0].id, dayOfWeek: 1, startTime: '08:00', endTime: '08:45', room: 'Room 101' },
    { classId: class10A.id, subjectId: subjects[1].id, dayOfWeek: 1, startTime: '08:45', endTime: '09:30', room: 'Room 101' },
    { classId: class10A.id, subjectId: subjects[2].id, dayOfWeek: 1, startTime: '09:45', endTime: '10:30', room: 'Room 101' },
    { classId: class10A.id, subjectId: subjects[3].id, dayOfWeek: 1, startTime: '10:30', endTime: '11:15', room: 'Room 101' },
    { classId: class10A.id, subjectId: subjects[4].id, dayOfWeek: 1, startTime: '11:30', endTime: '12:15', room: 'Room 101' },
    // Tuesday
    { classId: class10A.id, subjectId: subjects[2].id, dayOfWeek: 2, startTime: '08:00', endTime: '08:45', room: 'Room 101' },
    { classId: class10A.id, subjectId: subjects[0].id, dayOfWeek: 2, startTime: '08:45', endTime: '09:30', room: 'Room 101' },
    { classId: class10A.id, subjectId: subjects[4].id, dayOfWeek: 2, startTime: '09:45', endTime: '10:30', room: 'Room 101' },
    { classId: class10A.id, subjectId: subjects[1].id, dayOfWeek: 2, startTime: '10:30', endTime: '11:15', room: 'Room 101' },
    { classId: class10A.id, subjectId: subjects[3].id, dayOfWeek: 2, startTime: '11:30', endTime: '12:15', room: 'Room 101' },
  ]

  for (const entry of timetableEntries) {
    await prisma.timetable.create({ data: entry })
  }
  console.log('Sample timetable created')

  // ---- Sample Fee Records ----
  const feeEntries = []
  for (const student of [...students10A, ...students10B]) {
    feeEntries.push(
      { studentId: student.id, amount: 2500000, dueDate: new Date('2024-07-15'), status: 'PAID' as const, type: 'TUITION' as const, paidDate: new Date('2024-07-10') },
      { studentId: student.id, amount: 2500000, dueDate: new Date('2024-10-15'), status: 'PAID' as const, type: 'TUITION' as const, paidDate: new Date('2024-10-12') },
      { studentId: student.id, amount: 2500000, dueDate: new Date('2025-01-15'), status: 'PENDING' as const, type: 'TUITION' as const },
      { studentId: student.id, amount: 500000, dueDate: new Date('2024-08-01'), status: 'PAID' as const, type: 'EXAM' as const, paidDate: new Date('2024-07-28') },
    )
  }

  for (const fee of feeEntries) {
    await prisma.fee.create({ data: fee })
  }
  console.log('Sample fee records created')

  // ---- Default Settings ----
  const defaultSettings = [
    { key: 'schoolName', value: 'Bright Future School' },
    { key: 'address', value: '123 Education Lane, New Delhi - 110001' },
    { key: 'phone', value: '+91 11 2345 6789' },
    { key: 'principalName', value: 'Dr. Meena Kumari' },
    { key: 'academic_year', value: '2024-2025' },
    { key: 'school_hours', value: { start: '08:00', end: '15:00' } },
    { key: 'grading_system', value: 'PERCENTAGE' },
    { key: 'passing_percentage', value: 33 },
    { key: 'max_students_per_class', value: 40 },
    { key: 'fee_reminder_days', value: 7 },
    { key: 'currency', value: 'INR' },
    { key: 'timezone', value: 'Asia/Kolkata' },
  ]

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: { key: setting.key, value: setting.value },
    })
  }
  console.log('Default settings created')

  console.log('\n--- Seed completed! ---')
  console.log('\nLogin credentials:')
  console.log('  Admin:   admin@school.com / Admin@123456')
  console.log('  Teacher: sharma.teacher@school.com / Teacher@123456')
  console.log('  Teacher: gupta.teacher@school.com / Teacher@123456')
  console.log('  Teacher: kumar.teacher@school.com / Teacher@123456')
  console.log('  Parent:  parent@demo.com / Parent@123456')
  console.log('  Student: amit.student@school.com / Student@123456')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
