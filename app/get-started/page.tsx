'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  HeartPulse, 
  ArrowLeft, 
  ArrowRight, 
  Building2, 
  User, 
  MapPin,
  CheckCircle2,
  Loader2
} from 'lucide-react'

const facilityTypes = [
  { value: 'clinic', label: 'Clinic' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'diagnostic_center', label: 'Diagnostic Center' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'dental', label: 'Dental Practice' },
  { value: 'eye_care', label: 'Eye Care Center' },
  { value: 'maternity', label: 'Maternity Center' },
  { value: 'specialty_center', label: 'Specialty Center' },
  { value: 'other', label: 'Other' }
]

const subscriptionPlans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    description: 'Get started with basic features',
    features: ['Up to 50 patients', 'Basic scheduling', 'Public profile']
  },
  {
    id: 'standard',
    name: 'Standard',
    price: '$49/mo',
    description: 'For growing practices',
    features: ['Unlimited patients', 'Full billing', 'Custom subdomain', 'Lab & Pharmacy']
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$99/mo',
    description: 'Complete solution',
    features: ['Everything in Standard', 'Telemedicine', 'Custom domain', 'API access']
  }
]

type Step = 1 | 2 | 3 | 4

export default function RegisterClinicPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Form data
  const [formData, setFormData] = useState({
    // Step 1 - Admin Account
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Step 2 - Clinic Information
    clinicName: '',
    slug: '',
    facilityType: 'clinic',
    address: '',
    city: '',
    country: 'DRC',
    clinicPhone: '',
    clinicEmail: '',
    
    // Step 3 - Profile & Services
    tagline: '',
    description: '',
    specialties: [] as string[],
    
    // Step 4 - Subscription
    subscription: 'free'
  })

  const updateFormData = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-generate slug from clinic name
    if (field === 'clinicName') {
      const slug = (value as string)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/auth/register-clinic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }
      
      // Save clinic data for success page
      sessionStorage.setItem('newClinic', JSON.stringify({
        name: formData.clinicName,
        slug: formData.slug,
        subscription: formData.subscription
      }))
      
      // Redirect to success page
      router.push('/get-started/success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const validateStep = (currentStep: Step): boolean => {
    switch (currentStep) {
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
          setError('Please fill in all required fields')
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          return false
        }
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters')
          return false
        }
        break
      case 2:
        if (!formData.clinicName || !formData.slug || !formData.address || !formData.city) {
          setError('Please fill in all required fields')
          return false
        }
        break
      case 3:
        // Optional step
        break
      case 4:
        break
    }
    setError('')
    return true
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4) as Step)
    }
  }

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1) as Step)
    setError('')
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <HeartPulse className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">MediCare Pro</span>
          </Link>
          
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
            Already have an account? Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { step: 1, label: 'Account', icon: User },
              { step: 2, label: 'Clinic', icon: Building2 },
              { step: 3, label: 'Profile', icon: MapPin },
              { step: 4, label: 'Plan', icon: CheckCircle2 }
            ].map((item, index) => (
              <div key={item.step} className="flex items-center">
                <div className={`flex items-center justify-center ${index > 0 ? 'flex-1' : ''}`}>
                  {index > 0 && (
                    <div className={`h-0.5 w-16 sm:w-24 ${step >= item.step ? 'bg-primary' : 'bg-border'}`} />
                  )}
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      step >= item.step
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-muted-foreground'
                    }`}
                  >
                    {step > item.step ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <item.icon className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>Account</span>
            <span>Clinic</span>
            <span>Profile</span>
            <span>Plan</span>
          </div>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && 'Create Your Account'}
              {step === 2 && 'Clinic Information'}
              {step === 3 && 'Public Profile'}
              {step === 4 && 'Choose Your Plan'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Enter your personal details to create an admin account'}
              {step === 2 && 'Tell us about your clinic or healthcare facility'}
              {step === 3 && 'Set up your public profile to attract patients'}
              {step === 4 && 'Select a subscription plan that fits your needs'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Step 1 - Admin Account */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => updateFormData('firstName', e.target.value)}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => updateFormData('lastName', e.target.value)}
                      placeholder="Doe"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    placeholder="john@clinic.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    placeholder="+243 XXX XXX XXX"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    placeholder="At least 8 characters"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
            )}

            {/* Step 2 - Clinic Information */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clinicName">Clinic Name *</Label>
                  <Input
                    id="clinicName"
                    value={formData.clinicName}
                    onChange={(e) => updateFormData('clinicName', e.target.value)}
                    placeholder="My Healthcare Clinic"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug *</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">medicarepro.com/clinic/</span>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => updateFormData('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="my-clinic"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This will be your public URL. Use only lowercase letters, numbers, and hyphens.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="facilityType">Facility Type *</Label>
                  <Select
                    value={formData.facilityType}
                    onValueChange={(value) => updateFormData('facilityType', value)}
                  >
                    <SelectTrigger id="facilityType">
                      <SelectValue placeholder="Select facility type" />
                    </SelectTrigger>
                    <SelectContent>
                      {facilityTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    placeholder="123 Healthcare Street"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateFormData('city', e.target.value)}
                      placeholder="Kinshasa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => updateFormData('country', e.target.value)}
                      placeholder="DRC"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clinicPhone">Phone</Label>
                    <Input
                      id="clinicPhone"
                      type="tel"
                      value={formData.clinicPhone}
                      onChange={(e) => updateFormData('clinicPhone', e.target.value)}
                      placeholder="+243 XXX XXX XXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clinicEmail">Email</Label>
                    <Input
                      id="clinicEmail"
                      type="email"
                      value={formData.clinicEmail}
                      onChange={(e) => updateFormData('clinicEmail', e.target.value)}
                      placeholder="contact@clinic.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 - Public Profile */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={formData.tagline}
                    onChange={(e) => updateFormData('tagline', e.target.value)}
                    placeholder="Your trusted healthcare partner"
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    A short catchy phrase that describes your clinic (max 100 characters)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    placeholder="Tell potential patients about your clinic, services, and what makes you special..."
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Specialties</Label>
                  <div className="flex flex-wrap gap-2">
                    {['General Medicine', 'Pediatrics', 'Cardiology', 'Dermatology', 'Gynecology', 'Orthopedics', 'Neurology', 'Ophthalmology', 'ENT', 'Dental'].map((specialty) => (
                      <Badge
                        key={specialty}
                        variant={formData.specialties.includes(specialty) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          const newSpecialties = formData.specialties.includes(specialty)
                            ? formData.specialties.filter(s => s !== specialty)
                            : [...formData.specialties, specialty]
                          updateFormData('specialties', newSpecialties)
                        }}
                      >
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click to select/deselect specialties offered at your clinic
                  </p>
                </div>
                
                <div className="rounded-lg border bg-muted/30 p-4">
                  <h4 className="font-medium text-foreground">Preview Your Public URL</h4>
                  <p className="mt-1 text-sm text-primary">
                    medicarepro.com/clinic/{formData.slug || 'your-clinic'}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Patients will be able to find you at this URL and book appointments online.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4 - Subscription */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="grid gap-4">
                  {subscriptionPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                        formData.subscription === plan.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => updateFormData('subscription', plan.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{plan.name}</h3>
                            {plan.id === 'standard' && (
                              <Badge variant="secondary" className="text-xs">Popular</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold text-foreground">{plan.price}</span>
                        </div>
                      </div>
                      <ul className="mt-3 space-y-1">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">
                    All plans include a 14-day free trial. You can upgrade or downgrade at any time.
                    No credit card required for the free plan.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              {step > 1 ? (
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              ) : (
                <Link href="/">
                  <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Home
                  </Button>
                </Link>
              )}
              
              {step < 4 ? (
                <Button onClick={nextStep}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Clinic
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Terms */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link>
          {' '}and{' '}
          <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
        </p>
      </main>
    </div>
  )
}
