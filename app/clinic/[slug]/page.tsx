import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  HeartPulse, 
  MapPin, 
  Phone, 
  Mail,
  Clock,
  Star,
  Building2,
  Calendar,
  Globe,
  CheckCircle2,
  Users,
  Stethoscope,
  ArrowLeft,
  Share2,
  Video,
  PenSquare
} from 'lucide-react'
import { connectDB } from '@/lib/mongodb'
import { Hospital, User } from '@/lib/models'
import type { Hospital as HospitalType, PublicDoctor, HospitalService } from '@/lib/types'
import { ClinicBookingButton } from '@/components/clinic/booking-button'

async function getClinic(slug: string): Promise<HospitalType | null> {
  await connectDB()
  
  const hospital = await Hospital.findOne({ 
    slug: slug.toLowerCase(),
    isActive: true
  }).lean()

  if (!hospital) {
    return null
  }

  // Get doctors for this hospital
  let doctors = hospital.publicDoctors || []
  
  if (doctors.length === 0) {
    const hospitalDoctors = await User.find({
      hospitalId: hospital._id,
      role: 'doctor',
      isActive: true
    })
    .select('firstName lastName specialization avatar')
    .lean()

    doctors = hospitalDoctors.map((doc: { _id: string; firstName: string; lastName: string; specialization?: string; avatar?: string }) => ({
      userId: doc._id.toString(),
      displayName: `Dr. ${doc.firstName} ${doc.lastName}`,
      specialization: doc.specialization || 'General Practitioner',
      photo: doc.avatar,
      isVisible: true,
      availableForBooking: true,
      qualifications: [],
      languages: []
    }))
  }

  return {
    ...hospital,
    _id: hospital._id.toString(),
    publicDoctors: doctors
  } as HospitalType
}

export default async function ClinicProfilePage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const clinic = await getClinic(slug)

  if (!clinic) {
    notFound()
  }

  const profile = clinic.publicProfile
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dayNames: Record<string, string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <HeartPulse className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">MediCare Pro</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/clinics">
                <ArrowLeft className="mr-2 h-4 w-4" />
                All Clinics
              </Link>
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 sm:h-64">
          {clinic.coverImage && (
            <img
              src={clinic.coverImage}
              alt=""
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 sm:-mt-20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              {/* Logo & Title */}
              <div className="flex items-end gap-4">
                <div className="flex h-24 w-24 items-center justify-center rounded-xl border-4 border-background bg-card shadow-lg sm:h-32 sm:w-32">
                  {clinic.logo ? (
                    <img src={clinic.logo} alt="" className="h-full w-full rounded-lg object-cover" />
                  ) : (
                    <Building2 className="h-12 w-12 text-primary sm:h-16 sm:w-16" />
                  )}
                </div>
                <div className="pb-2">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{clinic.name}</h1>
                    {clinic.isVerified && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  {profile?.tagline && (
                    <p className="mt-1 text-muted-foreground">{profile.tagline}</p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    {profile?.facilityType && (
                      <Badge variant="secondary" className="capitalize">
                        {profile.facilityType.replace('_', ' ')}
                      </Badge>
                    )}
                    {clinic.stats?.avgRating && clinic.stats.avgRating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="text-sm font-medium">
                          {clinic.stats.avgRating.toFixed(1)} ({clinic.stats.totalReviews} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <div className="flex flex-wrap gap-2 pb-2">
                <Button variant="outline" asChild>
                  <Link href={`/clinic/${clinic.slug}/video-consultation`}>
                    <Video className="mr-2 h-4 w-4" />
                    Video Consultation
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/clinic/${clinic.slug}/blog`}>
                    <PenSquare className="mr-2 h-4 w-4" />
                    Blog
                  </Link>
                </Button>
                <ClinicBookingButton clinicSlug={clinic.slug} clinicName={clinic.name} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="mb-6 w-full justify-start">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="doctors">Doctors</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              {/* About Tab */}
              <TabsContent value="about" className="space-y-6">
                {profile?.description && (
                  <Card>
                    <CardHeader>
                      <CardTitle>About Us</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-line text-muted-foreground">
                        {profile.description}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {profile?.mission && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Our Mission</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{profile.mission}</p>
                    </CardContent>
                  </Card>
                )}

                {profile?.specialties && profile.specialties.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Specialties</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {profile.specialties.map((spec) => (
                          <Badge key={spec} variant="secondary">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {profile?.amenities && profile.amenities.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Amenities & Facilities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {profile.amenities.map((amenity) => (
                          <div key={amenity} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            <span className="text-sm text-muted-foreground">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {profile?.gallery && profile.gallery.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Gallery</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        {profile.gallery.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt={`${clinic.name} gallery ${i + 1}`}
                            className="aspect-video rounded-lg object-cover"
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services" className="space-y-4">
                {clinic.services && clinic.services.length > 0 ? (
                  clinic.services.filter((s: HospitalService) => s.isAvailable).map((service: HospitalService) => (
                    <Card key={service._id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{service.name}</CardTitle>
                            {service.category && (
                              <Badge variant="outline" className="mt-1 capitalize">
                                {service.category}
                              </Badge>
                            )}
                          </div>
                          {(service.price || service.priceFrom) && (
                            <div className="text-right">
                              {service.priceFrom && service.priceTo ? (
                                <span className="text-lg font-semibold text-primary">
                                  ${service.priceFrom} - ${service.priceTo}
                                </span>
                              ) : (
                                <span className="text-lg font-semibold text-primary">
                                  ${service.price}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      {service.description && (
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                          {service.duration && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Duration: {service.duration} minutes
                            </p>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Stethoscope className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-4 text-muted-foreground">
                        Services information coming soon.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Doctors Tab */}
              <TabsContent value="doctors" className="space-y-4">
                {clinic.publicDoctors && clinic.publicDoctors.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {clinic.publicDoctors.filter((d: PublicDoctor) => d.isVisible).map((doctor: PublicDoctor) => (
                      <Card key={doctor.userId}>
                        <CardContent className="flex items-start gap-4 pt-6">
                          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            {doctor.photo ? (
                              <img
                                src={doctor.photo}
                                alt=""
                                className="h-full w-full rounded-full object-cover"
                              />
                            ) : (
                              <Users className="h-8 w-8 text-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{doctor.displayName}</h3>
                            <p className="text-sm text-primary">{doctor.specialization}</p>
                            {doctor.experience && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                {doctor.experience}+ years experience
                              </p>
                            )}
                            {doctor.qualifications && doctor.qualifications.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {doctor.qualifications.map((q) => (
                                  <Badge key={q} variant="outline" className="text-xs">
                                    {q}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-4 text-muted-foreground">
                        Doctor information coming soon.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-4">
                {clinic.testimonials && clinic.testimonials.filter(t => t.isApproved && t.isVisible).length > 0 ? (
                  clinic.testimonials.filter(t => t.isApproved && t.isVisible).map((review) => (
                    <Card key={review._id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-sm font-medium text-primary">
                              {review.patientName.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-foreground">{review.patientName}</h3>
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? 'fill-primary text-primary'
                                        : 'text-muted-foreground'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.service && (
                              <Badge variant="outline" className="mt-1 text-xs">
                                {review.service}
                              </Badge>
                            )}
                            <p className="mt-2 text-sm text-muted-foreground">{review.review}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <Star className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-4 text-muted-foreground">
                        No reviews yet. Be the first to leave a review!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Address</p>
                    <p className="text-sm text-muted-foreground">
                      {clinic.address}, {clinic.city}
                      {clinic.country && `, ${clinic.country}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Phone</p>
                    <a href={`tel:${clinic.phone}`} className="text-sm text-muted-foreground hover:text-primary">
                      {clinic.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Email</p>
                    <a href={`mailto:${clinic.email}`} className="text-sm text-muted-foreground hover:text-primary">
                      {clinic.email}
                    </a>
                  </div>
                </div>

                {profile?.socialMedia?.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">Website</p>
                      <a 
                        href={profile.socialMedia.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Working Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Working Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profile?.workingHours ? (
                    days.map((day) => {
                      const hours = profile.workingHours?.find((h) => h.day === day)
                      return (
                        <div key={day} className="flex items-center justify-between text-sm">
                          <span className="text-foreground">{dayNames[day]}</span>
                          {hours?.isOpen ? (
                            <span className="text-muted-foreground">
                              {hours.openTime} - {hours.closeTime}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Closed</span>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Working hours not available
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Insurance & Payment */}
            {((profile?.insuranceAccepted && profile.insuranceAccepted.length > 0) ||
              (profile?.paymentMethods && profile.paymentMethods.length > 0)) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment & Insurance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile?.paymentMethods && profile.paymentMethods.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-foreground">Payment Methods</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.paymentMethods.map((method) => (
                          <Badge key={method} variant="outline" className="text-xs capitalize">
                            {method.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {profile?.insuranceAccepted && profile.insuranceAccepted.length > 0 && (
                    <div>
                      <p className="mb-2 text-sm font-medium text-foreground">Insurance Accepted</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.insuranceAccepted.map((ins) => (
                          <Badge key={ins} variant="secondary" className="text-xs">
                            {ins}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Book Appointment CTA */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-6 text-center">
                <Calendar className="mx-auto h-10 w-10 text-primary" />
                <h3 className="mt-3 font-semibold text-foreground">Ready to Book?</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Schedule your appointment online today
                </p>
                <ClinicBookingButton 
                  clinicSlug={clinic.slug} 
                  clinicName={clinic.name}
                  className="mt-4 w-full"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <HeartPulse className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">MediCare Pro</span>
          </Link>
          <p className="mt-4 text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} MediCare Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
