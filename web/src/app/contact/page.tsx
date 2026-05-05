'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export default function ContactPage() {
  const { data: settings } = useQuery({
    queryKey: ['school-settings'],
    queryFn: () => fetch(`${API}/public/settings`).then(r => r.json()).catch(() => ({})),
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
            <Link href="/about" className="text-gray-600 hover:text-sky-600">About</Link>
            <Link href="/admissions" className="text-gray-600 hover:text-sky-600">Admissions</Link>
            <Link href="/auth/login" className="text-gray-600 hover:text-sky-600">Sign In</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-8">Contact Us</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Get in Touch</h2>
              <div className="space-y-4">
                {school.phone && (
                  <div className="flex items-start gap-3">
                    <span className="text-sky-600 text-lg">Phone</span>
                    <div>
                      <p className="text-sm text-gray-500">Call Us</p>
                      <a href={`tel:${school.phone}`} className="font-medium text-sky-600">
                        {school.phone}
                      </a>
                    </div>
                  </div>
                )}
                {school.email && (
                  <div className="flex items-start gap-3">
                    <span className="text-sky-600 text-lg">Email</span>
                    <div>
                      <p className="text-sm text-gray-500">Write to Us</p>
                      <a href={`mailto:${school.email}`} className="font-medium text-sky-600">
                        {school.email}
                      </a>
                    </div>
                  </div>
                )}
                {school.address && (
                  <div className="flex items-start gap-3">
                    <span className="text-sky-600 text-lg">Address</span>
                    <div>
                      <p className="text-sm text-gray-500">Visit Us</p>
                      <p className="font-medium">{school.address}</p>
                      {school.city && (
                        <p className="text-sm text-gray-500">
                          {school.city}{school.state ? `, ${school.state}` : ''}{' '}
                          {school.pincode || ''}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {school.officeHours && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Office Hours</h2>
                <div className="space-y-2 text-sm">
                  {Object.entries(school.officeHours || {}).map(([day, hours]: [string, any]) => (
                    <div key={day} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{day}</span>
                      <span className="font-medium">{hours?.open ? `${hours.open} - ${hours.close}` : 'Closed'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {school.whatsapp && (
              <a
                href={`https://wa.me/${school.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="block bg-green-600 text-white text-center py-3 rounded-xl font-medium hover:bg-green-700"
              >
                Chat on WhatsApp
              </a>
            )}
          </div>

          <div className="space-y-6">
            {school.googleMapsUrl ? (
              <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                <iframe
                  src={school.googleMapsUrl}
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 shadow-sm h-[300px] flex items-center justify-center">
                <p className="text-gray-400">Map not configured</p>
              </div>
            )}

            <div className="bg-sky-50 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-sky-900 mb-2">Apply for Admission</h2>
              <p className="text-sky-800 text-sm mb-4">
                Admissions are open for the upcoming academic session. Apply online today.
              </p>
              <Link
                href="/admissions"
                className="inline-block bg-sky-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-sky-700"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
