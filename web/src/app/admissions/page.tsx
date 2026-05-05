'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle } from 'lucide-react'

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Education Management'

export default function AdmissionsPage() {
  const { toast } = useToast()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    studentName: '',
    dateOfBirth: '',
    gender: '',
    classApplying: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    address: '',
    previousSchool: '',
    remarks: '',
  })

  const { data: classes = [] } = useQuery({
    queryKey: ['public-classes'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/public/classes')
        return data.data || data || []
      } catch { return [] }
    },
  })

  const submitMutation = useMutation({
    mutationFn: (payload: typeof form) => api.post('/admissions/apply', payload),
    onSuccess: () => {
      setSubmitted(true)
      toast({ title: 'Application Submitted', description: 'We will contact you shortly.' })
    },
    onError: (err: any) => {
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: err.response?.data?.message || 'Please try again later.',
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitMutation.mutate(form)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Application Submitted!</h2>
            <p className="text-muted-foreground mb-6">
              Thank you for applying. Our admissions team will review your application
              and contact you within 3-5 business days.
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild variant="outline">
                <Link href="/">Go Home</Link>
              </Button>
              <Button onClick={() => { setSubmitted(false); setForm({ studentName: '', dateOfBirth: '', gender: '', classApplying: '', parentName: '', parentEmail: '', parentPhone: '', address: '', previousSchool: '', remarks: '' }) }}>
                Submit Another
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-sky-600">{APP_NAME}</Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/about" className="text-gray-600 hover:text-sky-600">About</Link>
            <Link href="/contact" className="text-gray-600 hover:text-sky-600">Contact</Link>
            <Link href="/auth/login" className="text-gray-600 hover:text-sky-600">Sign In</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Admission Application</h1>
          <p className="text-muted-foreground mt-2">Fill out the form below to apply for admission</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
            <CardDescription>Please provide accurate details for the admission process</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentName">Student Full Name *</Label>
                  <Input
                    id="studentName"
                    value={form.studentName}
                    onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                    placeholder="Enter student name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender *</Label>
                  <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Class Applying For *</Label>
                  <Select value={form.classApplying} onValueChange={(v) => setForm({ ...form, classApplying: v })}>
                    <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      {(classes as any[]).length > 0 ? (
                        (classes as any[]).map((c: any) => (
                          <SelectItem key={c.id || c.name} value={c.name}>{c.name}</SelectItem>
                        ))
                      ) : (
                        <>
                          {['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Parent / Guardian Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="parentName">Parent Name *</Label>
                    <Input
                      id="parentName"
                      value={form.parentName}
                      onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                      placeholder="Enter parent name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="parentPhone">Phone Number *</Label>
                    <Input
                      id="parentPhone"
                      type="tel"
                      value={form.parentPhone}
                      onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="parentEmail">Email Address</Label>
                    <Input
                      id="parentEmail"
                      type="email"
                      value={form.parentEmail}
                      onChange={(e) => setForm({ ...form, parentEmail: e.target.value })}
                      placeholder="parent@email.com"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Enter complete address"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="previousSchool">Previous School (if any)</Label>
                <Input
                  id="previousSchool"
                  value={form.previousSchool}
                  onChange={(e) => setForm({ ...form, previousSchool: e.target.value })}
                  placeholder="Name of previous school"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Additional Remarks</Label>
                <Textarea
                  id="remarks"
                  value={form.remarks}
                  onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  placeholder="Any additional information..."
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitMutation.isPending}>
                {submitMutation.isPending ? 'Submitting...' : 'Submit Application'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
