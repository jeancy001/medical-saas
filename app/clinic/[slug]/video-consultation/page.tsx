'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  Video, 
  Calendar, 
  Clock, 
  CreditCard, 
  Building2,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  User,
  Phone,
  Mail,
  FileText,
  Shield,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Clinic {
  _id: string
  name: string
  slug: string
  logo?: string
  phone: string
  email: string
  address: string
  city: string
  services?: { name: string; price: number; category: string }[]
  publicProfile?: {
    tagline?: string
    description?: string
  }
}

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '14:00', '14:30', '15:00',
  '15:30', '16:00', '16:30', '17:00', '17:30'
]

export default function VideoConsultationPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const [slug, setSlug] = useState<string>('')
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const [bookingComplete, setBookingComplete] = useState(false)
  const [bookingData, setBookingData] = useState<{ meetingId: string; meetingLink: string } | null>(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    scheduledDate: '',
    scheduledTime: '',
    reason: '',
    symptoms: '',
    urgency: 'routine',
    paymentOption: 'pay_later',
    consultationFee: 25,
    insuranceProvider: '',
    insurancePolicyNumber: ''
  })

  useEffect(() => {
    params.then(p => setSlug(p.slug))
  }, [params])

  useEffect(() => {
    if (slug) {
      fetchClinic()
    }
  }, [slug])

  const fetchClinic = async () => {
    try {
      const response = await fetch(`/api/public/clinics/${slug}`)
      const data = await response.json()
      if (data.success) {
        setClinic(data.data)
        // Set default consultation fee based on clinic services
        const telemedService = data.data.services?.find(
          (s: { category: string }) => s.category === 'telemedicine' || s.category === 'consultation'
        )
        if (telemedService?.price) {
          setFormData(prev => ({ ...prev, consultationFee: telemedService.price }))
        }
      }
    } catch (error) {
      console.error('Error fetching clinic:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const response = await fetch('/api/video-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicSlug: slug,
          patientInfo: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            dateOfBirth: formData.dateOfBirth || undefined,
            gender: formData.gender || undefined
          },
          scheduledDate: formData.scheduledDate,
          scheduledTime: formData.scheduledTime,
          duration: 30,
          reason: formData.reason,
          symptoms: formData.symptoms.split(',').map(s => s.trim()).filter(Boolean),
          urgency: formData.urgency,
          paymentOption: formData.paymentOption,
          consultationFee: formData.consultationFee,
          insuranceInfo: formData.paymentOption === 'insurance' ? {
            provider: formData.insuranceProvider,
            policyNumber: formData.insurancePolicyNumber,
            memberName: `${formData.firstName} ${formData.lastName}`
          } : undefined
        })
      })

      const data = await response.json()
      if (data.success) {
        setBookingData({ meetingId: data.meetingId, meetingLink: data.meetingLink })
        setBookingComplete(true)
      } else {
        alert(data.error || 'Failed to book appointment')
      }
    } catch (error) {
      console.error('Error booking:', error)
      alert('Failed to book appointment')
    } finally {
      setSubmitting(false)
    }
  }

  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!clinic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Clinic not found</p>
            <Button className="mt-4" asChild>
              <Link href="/clinics">Browse Clinics</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (bookingComplete && bookingData) {
    return (
      <div className="min-h-screen bg-muted/30 py-12">
        <div className="container mx-auto max-w-2xl px-4">
          <Card>
            <CardContent className="pt-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="mt-4 text-2xl font-bold">Booking Confirmed!</h1>
              <p className="mt-2 text-muted-foreground">
                Your video consultation has been scheduled with {clinic.name}
              </p>

              <div className="mt-6 rounded-lg bg-muted p-4 text-left">
                <h3 className="font-semibold">Appointment Details</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <p><strong>Date:</strong> {new Date(formData.scheduledDate).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {formData.scheduledTime}</p>
                  <p><strong>Duration:</strong> 30 minutes</p>
                  <p><strong>Payment:</strong> {formData.paymentOption === 'pay_now' ? 'Paid Online' : formData.paymentOption === 'insurance' ? 'Insurance' : 'Pay at Office'}</p>
                </div>
              </div>

              <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
                <h3 className="font-semibold text-primary">Your Video Call Link</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Join the call at your scheduled time using this link:
                </p>
                <code className="mt-2 block rounded bg-muted px-3 py-2 text-xs break-all">
                  {bookingData.meetingLink}
                </code>
                <Button 
                  className="mt-3" 
                  onClick={() => navigator.clipboard.writeText(bookingData.meetingLink)}
                >
                  Copy Link
                </Button>
              </div>

              <div className="mt-6 text-sm text-muted-foreground">
                <p>A confirmation email has been sent to {formData.email}</p>
              </div>

              <div className="mt-8 flex gap-3 justify-center">
                <Button variant="outline" asChild>
                  <Link href={`/clinic/${slug}`}>Back to Clinic</Link>
                </Button>
                <Button asChild>
                  <Link href={bookingData.meetingLink}>
                    <Video className="h-4 w-4 mr-2" />
                    Join Call (when ready)
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href={`/clinic/${slug}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to {clinic.name}
          </Link>
          <div className="flex items-center gap-2">
            {clinic.logo ? (
              <Image src={clinic.logo} alt={clinic.name} width={32} height={32} className="rounded" />
            ) : (
              <Building2 className="h-8 w-8 text-primary" />
            )}
            <span className="font-semibold">{clinic.name}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            <Video className="h-3 w-3 mr-1" />
            Video Consultation
          </Badge>
          <h1 className="text-3xl font-bold text-balance">Book Your Online Consultation</h1>
          <p className="mt-2 text-muted-foreground">
            Consult with our doctors from the comfort of your home via secure video call
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {s}
              </div>
              {s < 3 && (
                <div className={`w-16 h-1 mx-2 ${step > s ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="mb-8 flex justify-center gap-8 text-sm">
          <span className={step >= 1 ? 'text-foreground' : 'text-muted-foreground'}>Your Details</span>
          <span className={step >= 2 ? 'text-foreground' : 'text-muted-foreground'}>Schedule</span>
          <span className={step >= 3 ? 'text-foreground' : 'text-muted-foreground'}>Payment</span>
        </div>

        <Card>
          <CardContent className="p-6">
            {/* Step 1: Patient Details */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Personal Information
                  </h2>
                  <p className="text-sm text-muted-foreground">Please provide your details for the consultation</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        className="pl-9"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        className="pl-9"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => setStep(2)}
                    disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.phone}
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Schedule */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Schedule Your Consultation
                  </h2>
                  <p className="text-sm text-muted-foreground">Choose a convenient date and time</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="scheduledDate">Preferred Date *</Label>
                    <Input
                      id="scheduledDate"
                      type="date"
                      min={getMinDate()}
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduledTime">Preferred Time *</Label>
                    <Select value={formData.scheduledTime} onValueChange={(v) => setFormData({ ...formData, scheduledTime: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Consultation *</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="reason"
                      className="pl-9 min-h-[100px]"
                      placeholder="Describe your symptoms or reason for the consultation..."
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="symptoms">Symptoms (comma separated)</Label>
                  <Input
                    id="symptoms"
                    placeholder="e.g., headache, fever, cough"
                    value={formData.symptoms}
                    onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Urgency Level</Label>
                  <RadioGroup
                    value={formData.urgency}
                    onValueChange={(v) => setFormData({ ...formData, urgency: v })}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="routine" id="routine" />
                      <Label htmlFor="routine" className="font-normal">Routine</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="urgent" id="urgent" />
                      <Label htmlFor="urgent" className="font-normal">Urgent</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="emergency" id="emergency" />
                      <Label htmlFor="emergency" className="font-normal">Emergency</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={() => setStep(3)}
                    disabled={!formData.scheduledDate || !formData.scheduledTime || !formData.reason}
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Payment Options
                  </h2>
                  <p className="text-sm text-muted-foreground">Choose how you would like to pay for your consultation</p>
                </div>

                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Consultation Fee</span>
                      <span className="text-2xl font-bold">${formData.consultationFee}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">30-minute video consultation</p>
                  </CardContent>
                </Card>

                <RadioGroup
                  value={formData.paymentOption}
                  onValueChange={(v) => setFormData({ ...formData, paymentOption: v })}
                  className="space-y-3"
                >
                  <Card className={`cursor-pointer transition-colors ${formData.paymentOption === 'pay_now' ? 'border-primary bg-primary/5' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value="pay_now" id="pay_now" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="pay_now" className="font-semibold cursor-pointer">Pay Now Online</Label>
                          <p className="text-sm text-muted-foreground">Pay securely with card or mobile money</p>
                        </div>
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={`cursor-pointer transition-colors ${formData.paymentOption === 'pay_later' ? 'border-primary bg-primary/5' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value="pay_later" id="pay_later" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="pay_later" className="font-semibold cursor-pointer">Pay Later at Office</Label>
                          <p className="text-sm text-muted-foreground">Pay when you visit the clinic or after consultation</p>
                        </div>
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={`cursor-pointer transition-colors ${formData.paymentOption === 'insurance' ? 'border-primary bg-primary/5' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <RadioGroupItem value="insurance" id="insurance" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="insurance" className="font-semibold cursor-pointer">Use Insurance</Label>
                          <p className="text-sm text-muted-foreground">We will bill your insurance provider</p>
                        </div>
                        <Shield className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </RadioGroup>

                {formData.paymentOption === 'insurance' && (
                  <div className="grid gap-4 sm:grid-cols-2 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                      <Input
                        id="insuranceProvider"
                        value={formData.insuranceProvider}
                        onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                        placeholder="e.g., BlueCross"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
                      <Input
                        id="insurancePolicyNumber"
                        value={formData.insurancePolicyNumber}
                        onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
                        placeholder="e.g., POL-123456"
                      />
                    </div>
                  </div>
                )}

                {/* Summary */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Booking Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Patient</span>
                      <span>{formData.firstName} {formData.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span>{formData.scheduledDate ? new Date(formData.scheduledDate).toLocaleDateString() : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time</span>
                      <span>{formData.scheduledTime || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment</span>
                      <span>
                        {formData.paymentOption === 'pay_now' ? 'Pay Online' : 
                         formData.paymentOption === 'insurance' ? 'Insurance' : 'Pay Later'}
                      </span>
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${formData.consultationFee}</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Booking...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Booking
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trust badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Secure & Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            <span>HD Video Quality</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Join from Any Device</span>
          </div>
        </div>
      </main>
    </div>
  )
}
