'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export default function AboutPage() {
  const { data: settings } = useQuery({
    queryKey: ['school-settings'],
    queryFn: () => fetch(`${API}/public/settings`).then(r => r.json()).catch(() => ({})),
  })

  const { data: teachers = [] } = useQuery({
    queryKey: ['public-teachers'],
    queryFn: () => fetch(`${API}/public/teachers`).then(r => r.json()).catch(() => []),
  })

  const school = settings as any || {}

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-sky-600">
            {school.schoolName || 'Our School'}
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/admissions" className="text-gray-600 hover:text-sky-600">Admissions</Link>
            <Link href="/contact" className="text-gray-600 hover:text-sky-600">Contact</Link>
            <Link href="/auth/login" className="text-gray-600 hover:text-sky-600">Sign In</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <section className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{school.schoolName || 'About Our School'}</h1>
          {school.description && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{school.description}</p>
          )}
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white rounded-xl p-6 text-center shadow-sm">
            <p className="text-3xl font-bold text-sky-600">{(teachers as any[]).length}+</p>
            <p className="text-sm text-gray-500 mt-1">Expert Teachers</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm">
            <p className="text-3xl font-bold text-sky-600">2000+</p>
            <p className="text-sm text-gray-500 mt-1">Students Enrolled</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm">
            <p className="text-3xl font-bold text-sky-600">20+</p>
            <p className="text-sm text-gray-500 mt-1">Years of Excellence</p>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-sm">
            <p className="text-3xl font-bold text-sky-600">98%</p>
            <p className="text-sm text-gray-500 mt-1">Pass Rate</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Our Faculty</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {(teachers as any[]).slice(0, 6).map((teacher: any) => (
              <div
                key={teacher.id}
                className="bg-white rounded-xl p-6 shadow-sm text-center hover:shadow-md transition"
              >
                <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-sky-600">
                    {teacher.user?.name?.[0] || teacher.name?.[0] || 'T'}
                  </span>
                </div>
                <h3 className="font-semibold">{teacher.user?.name || teacher.name}</h3>
                <p className="text-sm text-sky-600">{teacher.specialization || teacher.qualification}</p>
                {teacher.experience && (
                  <p className="text-xs text-gray-400 mt-1">{teacher.experience} years experience</p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Our Facilities</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: 'Smart Classrooms', desc: 'Technology-enabled classrooms with digital boards and projectors' },
              { title: 'Science Laboratories', desc: 'Fully equipped physics, chemistry, and biology labs' },
              { title: 'Library', desc: 'Extensive collection of books, journals, and digital resources' },
              { title: 'Sports Complex', desc: 'Indoor and outdoor sports facilities for holistic development' },
              { title: 'Computer Lab', desc: 'Modern computer lab with high-speed internet connectivity' },
              { title: 'Transport', desc: 'Safe and reliable school bus service covering all major routes' },
            ].map((facility, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold mb-2">{facility.title}</h3>
                <p className="text-sm text-gray-500">{facility.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-sky-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-2">Admissions Open</h2>
          <p className="text-sky-100 mb-6">Apply now for the upcoming academic session. Limited seats available.</p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/admissions"
              className="bg-white text-sky-600 px-6 py-2.5 rounded-lg font-medium hover:bg-sky-50"
            >
              Apply Now
            </Link>
            <Link
              href="/contact"
              className="border border-white text-white px-6 py-2.5 rounded-lg font-medium hover:bg-sky-700"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
