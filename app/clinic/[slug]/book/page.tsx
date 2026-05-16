'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  HeartPulse, 
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import type { Hospital as HospitalType } from '@/lib/types'

export default function ClinicBookPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const resolvedParams = use(params)
  const searchParams = useSearchParams()
  const [clinic, setClinic] = useState<HospitalType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    service: searchParams.get('service') || '',
    doctor: searchParams.get('doctor') || '',
    reason: ''
  })

  useEffect(() => {
    async function fetchClinic() {
      try {
        const response = await fetch(`/api/public/clinics/${resolvedParams.slug}`)
        const data = await response.json()
        if (data.success) {
          setClinic(data.data)
        }
      } catch (err) {
        console.error('Error fetching clinic:', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchClinic()
  }, [resolvedParams.slug])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/public/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicSlug: resolvedParams.slug,
          ...formData
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit appointment')
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit appointment')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!clinic) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <h1 className="text-2xl font-bold text-foreground">Clinic not found</h1>
        <Link href="/clinics" className="mt-4 text-primary hover:underline">
          Browse all clinics
        </Link>
      </div>
    )
  }

  // Get available services and doctors
  const services = clinic.services?.filter(s => s.isAvailable) || []
  const doctors = clinic.publicDoctors?.filter(d => d.isVisible && d.availableForBooking) || []

  // Generate time slots
  const timeSlots = []
  for (let hour = 8; hour < 18; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
      timeSlots.push(time)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Navigation */}
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href={`/clinic/${clinic.slug}`} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <HeartPulse className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">{clinic.name}</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href={`/clinic/${clinic.slug}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Clinic Profile
        </Link>

        <div className="mt-8">
          {success ? (
            <Card className="text-center">
              <CardContent className="py-12">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="mt-6 text-2xl font-bold text-foreground">Appointment Requested!</h2>
                <p className="mt-4 text-muted-foreground">
                  Thank you for booking with {clinic.name}. We&apos;ve received your appointment request and will contact you shortly to confirm.
                </p>
                <div className="mt-6 rounded-lg bg-muted p-4 text-left">
                  <h3 className="font-semibold text-foreground">Appointment Details</h3>
                  <dl className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Date:</dt>
                      <dd className="font-medium text-foreground">{formData.date}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Time:</dt>
                      <dd className="font-medium text-foreground">{formData.time}</dd>
                    </div>
                    {formData.service && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Service:</dt>
                        <dd className="font-medium text-foreground">{formData.service}</dd>
                      </div>
                    )}
                  </dl>
                </div>
                <div className="mt-8 flex justify-center gap-4">
                  <Link href={`/clinic/${clinic.slug}`}>
                    <Button variant="outline">Back to Clinic</Button>
                  </Link>
                  <Button onClick={() => {
                    setSuccess(false)
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      date: '',
                      time: '',
                      service: '',
                      doctor: '',
                      reason: ''
                    })
                  }}>
                    Book Another
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Book an Appointment
                </CardTitle>
                <CardDescription>
                  Fill out the form below to request an appointment at {clinic.name}. We&apos;ll confirm your booking shortly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="flex items-center gap-2 font-medium text-foreground">
                      <User className="h-4 w-4 text-primary" />
                      Personal Information
                    </h3>
                    
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="email">
                          <Mail className="mr-1 inline h-3 w-3" />
                          Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          <Phone className="mr-1 inline h-3 w-3" />
                          Phone *
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+243 XXX XXX XXX"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="space-y-4 border-t pt-6">
                    <h3 className="flex items-center gap-2 font-medium text-foreground">
                      <Clock className="h-4 w-4 text-primary" />
                      Appointment Details
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="date">Preferred Date *</Label>
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">Preferred Time *</Label>
                        <Select
                          value={formData.time}
                          onValueChange={(value) => setFormData({ ...formData, time: value })}
                        >
                          <SelectTrigger id="time">
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {services.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="service">Service</Label>
                        <Select
                          value={formData.service}
                          onValueChange={(value) => setFormData({ ...formData, service: value })}
                        >
                          <SelectTrigger id="service">
                            <SelectValue placeholder="Select a service (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General Consultation</SelectItem>
                            {services.map((service) => (
                              <SelectItem key={service._id} value={service.name}>
                                {service.name}
                                {service.price && ` - $${service.price}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {doctors.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="doctor">Preferred Doctor</Label>
                        <Select
                          value={formData.doctor}
                          onValueChange={(value) => setFormData({ ...formData, doctor: value })}
                        >
                          <SelectTrigger id="doctor">
                            <SelectValue placeholder="Any available doctor" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any available doctor</SelectItem>
                            {doctors.map((doctor) => (
                              <SelectItem key={doctor.userId} value={doctor.displayName}>
                                {doctor.displayName} - {doctor.specialization}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason for Visit</Label>
                      <Textarea
                        id="reason"
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        placeholder="Please describe your symptoms or reason for the visit..."
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="border-t pt-6">
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Calendar className="mr-2 h-4 w-4" />
                          Request Appointment
                        </>
                      )}
                    </Button>
                    <p className="mt-4 text-center text-xs text-muted-foreground">
                      By submitting, you agree to be contacted regarding your appointment request.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {clinic.name}. Powered by{' '}
            <Link href="/" className="text-primary hover:underline">MediCare Pro</Link>
          </p>
        </div>
      </footer>
    </div>
  )
}
