'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Building2, 
  Upload, 
  Globe, 
  Clock, 
  Image as ImageIcon,
  Link as LinkIcon,
  Save,
  Loader2,
  ExternalLink,
  Copy,
  CheckCircle2,
  Plus,
  Trash2,
  Eye
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

const specialtiesList = [
  'General Medicine', 'Pediatrics', 'Cardiology', 'Dermatology', 'Gynecology', 
  'Orthopedics', 'Neurology', 'Ophthalmology', 'ENT', 'Dental', 'Surgery',
  'Internal Medicine', 'Family Medicine', 'Psychiatry', 'Emergency Medicine'
]

const amenitiesList = [
  'WiFi', 'Parking', 'Wheelchair Access', 'Pharmacy', 'Laboratory', 
  'X-Ray', 'Ultrasound', 'Emergency Services', 'Ambulance', 'Cafeteria'
]

export default function CustomizePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [hospital, setHospital] = useState<any>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    tagline: '',
    description: '',
    aboutUs: '',
    mission: '',
    
    // Contact
    phone: '',
    email: '',
    whatsapp: '',
    emergencyPhone: '',
    
    // Social Media
    website: '',
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    
    // Images
    logo: '',
    coverImage: '',
    
    // Specialties & Amenities
    specialties: [] as string[],
    amenities: [] as string[],
    languages: [] as string[],
    insuranceAccepted: [] as string[],
    paymentMethods: [] as string[],
    
    // Working Hours
    workingHours: days.map(day => ({
      day,
      isOpen: day !== 'sunday',
      openTime: '08:00',
      closeTime: '18:00'
    })),
    
    // Settings
    isPubliclyListed: true
  })

  useEffect(() => {
    fetchHospital()
  }, [user])

  const fetchHospital = async () => {
    if (!user?.hospitalId) return
    
    try {
      const response = await fetch(`/api/hospitals/${user.hospitalId}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        const h = data.data
        setHospital(h)
        setFormData({
          name: h.name || '',
          tagline: h.publicProfile?.tagline || '',
          description: h.publicProfile?.description || '',
          aboutUs: h.publicProfile?.aboutUs || '',
          mission: h.publicProfile?.mission || '',
          phone: h.phone || '',
          email: h.email || '',
          whatsapp: h.publicProfile?.contactInfo?.whatsapp || '',
          emergencyPhone: h.publicProfile?.contactInfo?.emergencyPhone || '',
          website: h.publicProfile?.socialMedia?.website || '',
          facebook: h.publicProfile?.socialMedia?.facebook || '',
          twitter: h.publicProfile?.socialMedia?.twitter || '',
          instagram: h.publicProfile?.socialMedia?.instagram || '',
          linkedin: h.publicProfile?.socialMedia?.linkedin || '',
          logo: h.logo || '',
          coverImage: h.coverImage || '',
          specialties: h.publicProfile?.specialties || [],
          amenities: h.publicProfile?.amenities || [],
          languages: h.publicProfile?.languages || ['French', 'English'],
          insuranceAccepted: h.publicProfile?.insuranceAccepted || [],
          paymentMethods: h.publicProfile?.paymentMethods || ['cash', 'mobile_money'],
          workingHours: h.publicProfile?.workingHours?.length ? h.publicProfile.workingHours : formData.workingHours,
          isPubliclyListed: h.publicProfile?.isPubliclyListed ?? true
        })
      }
    } catch (error) {
      console.error('Failed to fetch hospital:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (file: File, type: 'logo' | 'cover') => {
    if (type === 'logo') setUploadingLogo(true)
    else setUploadingCover(true)

    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.hospitalId}/${type}-${Date.now()}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('clinic-images')
        .upload(fileName, file, { upsert: true })

      if (error) throw error

      const { data: urlData } = supabase.storage
        .from('clinic-images')
        .getPublicUrl(fileName)

      if (type === 'logo') {
        setFormData(prev => ({ ...prev, logo: urlData.publicUrl }))
      } else {
        setFormData(prev => ({ ...prev, coverImage: urlData.publicUrl }))
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      if (type === 'logo') setUploadingLogo(false)
      else setUploadingCover(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      const response = await fetch(`/api/hospitals/${user?.hospitalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          logo: formData.logo,
          coverImage: formData.coverImage,
          publicProfile: {
            tagline: formData.tagline,
            description: formData.description,
            aboutUs: formData.aboutUs,
            mission: formData.mission,
            specialties: formData.specialties,
            amenities: formData.amenities,
            languages: formData.languages,
            insuranceAccepted: formData.insuranceAccepted,
            paymentMethods: formData.paymentMethods,
            isPubliclyListed: formData.isPubliclyListed,
            workingHours: formData.workingHours,
            contactInfo: {
              primaryPhone: formData.phone,
              whatsapp: formData.whatsapp,
              emergencyPhone: formData.emergencyPhone,
              email: formData.email
            },
            socialMedia: {
              website: formData.website,
              facebook: formData.facebook,
              twitter: formData.twitter,
              instagram: formData.instagram,
              linkedin: formData.linkedin
            }
          }
        })
      })

      if (!response.ok) throw new Error('Failed to save')
      
      alert('Changes saved successfully!')
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save changes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleArrayItem = (array: string[], item: string, field: string) => {
    const newArray = array.includes(item) 
      ? array.filter(i => i !== item) 
      : [...array, item]
    setFormData(prev => ({ ...prev, [field]: newArray }))
  }

  const updateWorkingHours = (day: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      workingHours: prev.workingHours.map(wh => 
        wh.day === day ? { ...wh, [field]: value } : wh
      )
    }))
  }

  const copyToClipboard = async () => {
    const url = `${window.location.origin}/clinic/${hospital?.slug}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customize Your Clinic</h1>
          <p className="text-muted-foreground">
            Personalize your public profile to attract more patients
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={`/clinic/${hospital?.slug}`} target="_blank" rel="noopener noreferrer">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </a>
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Public URL Card */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Your Public URL</p>
              <code className="text-sm text-primary">
                {typeof window !== 'undefined' ? window.location.origin : ''}/clinic/{hospital?.slug}
              </code>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyToClipboard}>
              {copied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`/clinic/${hospital?.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="hours">Working Hours</TabsTrigger>
          <TabsTrigger value="services">Specialties</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                This information will be displayed on your public clinic page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Clinic Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your Clinic Name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
                  placeholder="Your trusted healthcare partner"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">A short catchy phrase (max 100 characters)</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="A brief description of your clinic..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="aboutUs">About Us</Label>
                <Textarea
                  id="aboutUs"
                  value={formData.aboutUs}
                  onChange={(e) => setFormData(prev => ({ ...prev, aboutUs: e.target.value }))}
                  placeholder="Tell your story, your history, your values..."
                  rows={5}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mission">Mission Statement</Label>
                <Textarea
                  id="mission"
                  value={formData.mission}
                  onChange={(e) => setFormData(prev => ({ ...prev, mission: e.target.value }))}
                  placeholder="Our mission is to..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium text-foreground">Public Listing</p>
                  <p className="text-sm text-muted-foreground">
                    Show your clinic in the public directory
                  </p>
                </div>
                <Switch
                  checked={formData.isPubliclyListed}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPubliclyListed: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logo & Cover Image</CardTitle>
              <CardDescription>
                Upload images to make your clinic page more appealing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Clinic Logo</Label>
                <div className="flex items-start gap-4">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                    {formData.logo ? (
                      <Image 
                        src={formData.logo} 
                        alt="Logo" 
                        width={96} 
                        height={96} 
                        className="h-full w-full object-cover" 
                      />
                    ) : (
                      <Building2 className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file, 'logo')
                      }}
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingLogo}
                    >
                      {uploadingLogo ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      Upload Logo
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Recommended: 200x200px, PNG or JPG
                    </p>
                  </div>
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-2">
                <Label>Cover Image</Label>
                <div className="space-y-2">
                  <div className="aspect-[3/1] w-full overflow-hidden rounded-lg border bg-muted">
                    {formData.coverImage ? (
                      <Image 
                        src={formData.coverImage} 
                        alt="Cover" 
                        width={800} 
                        height={267} 
                        className="h-full w-full object-cover" 
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, 'cover')
                    }}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => coverInputRef.current?.click()}
                    disabled={uploadingCover}
                  >
                    {uploadingCover ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    Upload Cover Image
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Recommended: 1200x400px, PNG or JPG
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                How patients can reach you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+243 XXX XXX XXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contact@clinic.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="+243 XXX XXX XXX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                    placeholder="+243 XXX XXX XXX"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Media & Website</CardTitle>
              <CardDescription>
                Connect your online presence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://www.yourclinic.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={formData.facebook}
                    onChange={(e) => setFormData(prev => ({ ...prev, facebook: e.target.value }))}
                    placeholder="https://facebook.com/yourclinic"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={formData.instagram}
                    onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                    placeholder="https://instagram.com/yourclinic"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.linkedin}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                    placeholder="https://linkedin.com/company/yourclinic"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Working Hours Tab */}
        <TabsContent value="hours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Working Hours</CardTitle>
              <CardDescription>
                Set your clinic&apos;s operating hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formData.workingHours.map((wh) => (
                  <div key={wh.day} className="flex items-center gap-4 rounded-lg border p-3">
                    <div className="w-24">
                      <span className="font-medium capitalize">{wh.day}</span>
                    </div>
                    <Switch
                      checked={wh.isOpen}
                      onCheckedChange={(checked) => updateWorkingHours(wh.day, 'isOpen', checked)}
                    />
                    {wh.isOpen ? (
                      <>
                        <Input
                          type="time"
                          value={wh.openTime}
                          onChange={(e) => updateWorkingHours(wh.day, 'openTime', e.target.value)}
                          className="w-32"
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          type="time"
                          value={wh.closeTime}
                          onChange={(e) => updateWorkingHours(wh.day, 'closeTime', e.target.value)}
                          className="w-32"
                        />
                      </>
                    ) : (
                      <span className="text-muted-foreground">Closed</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Specialties Tab */}
        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Specialties</CardTitle>
              <CardDescription>
                Select the medical specialties your clinic offers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {specialtiesList.map((specialty) => (
                  <Badge
                    key={specialty}
                    variant={formData.specialties.includes(specialty) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem(formData.specialties, specialty, 'specialties')}
                  >
                    {specialty}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
              <CardDescription>
                Facilities and services available at your clinic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {amenitiesList.map((amenity) => (
                  <Badge
                    key={amenity}
                    variant={formData.amenities.includes(amenity) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem(formData.amenities, amenity, 'amenities')}
                  >
                    {amenity}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Languages</CardTitle>
              <CardDescription>
                Languages spoken at your clinic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['French', 'English', 'Swahili', 'Lingala', 'Kikongo', 'Tshiluba', 'Portuguese', 'Spanish'].map((lang) => (
                  <Badge
                    key={lang}
                    variant={formData.languages.includes(lang) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem(formData.languages, lang, 'languages')}
                  >
                    {lang}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>
                Accepted payment methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['Cash', 'Mobile Money', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Insurance'].map((method) => (
                  <Badge
                    key={method}
                    variant={formData.paymentMethods.includes(method.toLowerCase().replace(' ', '_')) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem(formData.paymentMethods, method.toLowerCase().replace(' ', '_'), 'paymentMethods')}
                  >
                    {method}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
