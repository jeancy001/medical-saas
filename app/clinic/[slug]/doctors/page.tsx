import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  HeartPulse, 
  ArrowLeft,
  Users,
  Star,
  Award,
  MessageSquare
} from 'lucide-react'
import { connectDB } from '@/lib/mongodb'
import { Hospital, User } from '@/lib/models'
import type { Hospital as HospitalType, PublicDoctor } from '@/lib/types'

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
    .select('firstName lastName specialization avatar bio')
    .lean()

    doctors = hospitalDoctors.map((doc: { _id: string; firstName: string; lastName: string; specialization?: string; avatar?: string; bio?: string }) => ({
      userId: doc._id.toString(),
      displayName: `Dr. ${doc.firstName} ${doc.lastName}`,
      specialization: doc.specialization || 'General Practitioner',
      photo: doc.avatar,
      bio: doc.bio,
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

export default async function ClinicDoctorsPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const clinic = await getClinic(slug)

  if (!clinic) {
    notFound()
  }

  const doctors = (clinic.publicDoctors || []).filter((d: PublicDoctor) => d.isVisible)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href={`/clinic/${clinic.slug}`} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <HeartPulse className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">{clinic.name}</span>
          </Link>
          
          <nav className="hidden items-center gap-6 md:flex">
            <Link href={`/clinic/${clinic.slug}`} className="text-sm text-muted-foreground hover:text-foreground">
              About
            </Link>
            <Link href={`/clinic/${clinic.slug}/services`} className="text-sm text-muted-foreground hover:text-foreground">
              Services
            </Link>
            <Link href={`/clinic/${clinic.slug}/doctors`} className="text-sm font-medium text-foreground">
              Doctors
            </Link>
            <Link href={`/clinic/${clinic.slug}/book`}>
              <Button size="sm">Book Now</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link href={`/clinic/${clinic.slug}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Clinic Profile
          </Link>
          
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Our Medical Team
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Meet our team of experienced healthcare professionals dedicated to providing you with the best care possible.
          </p>
        </div>
      </section>

      {/* Doctors Grid */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {doctors.length === 0 ? (
            <Card className="py-12 text-center">
              <CardContent>
                <Users className="mx-auto h-16 w-16 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-semibold text-foreground">Team Information Coming Soon</h2>
                <p className="mt-2 text-muted-foreground">
                  We&apos;re updating our doctors&apos; profiles. Check back soon!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor: PublicDoctor) => (
                <Card key={doctor.userId} className="overflow-hidden">
                  {/* Doctor Photo */}
                  <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/5">
                    {doctor.photo ? (
                      <img
                        src={doctor.photo}
                        alt={doctor.displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-background shadow-lg">
                          <Users className="h-12 w-12 text-primary" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="text-xl">{doctor.displayName}</CardTitle>
                    <CardDescription className="text-primary font-medium">
                      {doctor.specialization}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Experience */}
                    {doctor.experience && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Award className="h-4 w-4 text-primary" />
                        <span>{doctor.experience}+ years of experience</span>
                      </div>
                    )}
                    
                    {/* Qualifications */}
                    {doctor.qualifications && doctor.qualifications.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {doctor.qualifications.map((qual) => (
                          <Badge key={qual} variant="secondary" className="text-xs">
                            {qual}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Languages */}
                    {doctor.languages && doctor.languages.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MessageSquare className="h-4 w-4" />
                        <span>Speaks: {doctor.languages.join(', ')}</span>
                      </div>
                    )}
                    
                    {/* Bio */}
                    {doctor.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {doctor.bio}
                      </p>
                    )}
                    
                    {/* Rating */}
                    {doctor.consultationCount && doctor.consultationCount > 0 && (
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="font-medium">{doctor.consultationCount}+ consultations</span>
                      </div>
                    )}
                    
                    {/* Book Button */}
                    {doctor.availableForBooking && (
                      <Link href={`/clinic/${clinic.slug}/book?doctor=${encodeURIComponent(doctor.displayName)}`}>
                        <Button className="w-full">
                          Book Appointment
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

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
