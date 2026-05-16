import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  HeartPulse, 
  Clock,
  ArrowLeft,
  ArrowRight,
  Stethoscope
} from 'lucide-react'
import { connectDB } from '@/lib/mongodb'
import { Hospital } from '@/lib/models'
import type { Hospital as HospitalType, HospitalService } from '@/lib/types'

async function getClinic(slug: string): Promise<HospitalType | null> {
  await connectDB()
  
  const hospital = await Hospital.findOne({ 
    slug: slug.toLowerCase(),
    isActive: true
  }).lean()

  if (!hospital) {
    return null
  }

  return {
    ...hospital,
    _id: hospital._id.toString()
  } as HospitalType
}

export default async function ClinicServicesPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const clinic = await getClinic(slug)

  if (!clinic) {
    notFound()
  }

  const services = clinic.services?.filter((s: HospitalService) => s.isAvailable) || []
  
  // Group services by category
  const servicesByCategory = services.reduce((acc: Record<string, HospitalService[]>, service: HospitalService) => {
    const category = service.category || 'General'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(service)
    return acc
  }, {} as Record<string, HospitalService[]>)

  const categories = Object.keys(servicesByCategory).sort()

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
            <Link href={`/clinic/${clinic.slug}/services`} className="text-sm font-medium text-foreground">
              Services
            </Link>
            <Link href={`/clinic/${clinic.slug}/doctors`} className="text-sm text-muted-foreground hover:text-foreground">
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
            Our Services
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            Explore the range of medical services we offer. From routine check-ups to specialized treatments, we&apos;re here to care for your health.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {services.length === 0 ? (
            <Card className="py-12 text-center">
              <CardContent>
                <Stethoscope className="mx-auto h-16 w-16 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-semibold text-foreground">Services Coming Soon</h2>
                <p className="mt-2 text-muted-foreground">
                  We&apos;re currently updating our services list. Please contact us directly for more information.
                </p>
                <Link href={`/clinic/${clinic.slug}/book`}>
                  <Button className="mt-6">
                    Contact Us
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-12">
              {categories.map((category) => (
                <div key={category}>
                  <h2 className="mb-6 text-2xl font-bold text-foreground capitalize">
                    {category}
                  </h2>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {servicesByCategory[category].map((service) => (
                      <Card key={service._id} className="flex flex-col">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{service.name}</CardTitle>
                              {service.category && (
                                <Badge variant="secondary" className="mt-2 text-xs capitalize">
                                  {service.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="flex flex-1 flex-col">
                          {service.description && (
                            <CardDescription className="flex-1">
                              {service.description}
                            </CardDescription>
                          )}
                          
                          <div className="mt-4 space-y-2 border-t pt-4">
                            {service.duration && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{service.duration} minutes</span>
                              </div>
                            )}
                            
                            {(service.price || service.priceFrom) && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Price</span>
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
                          
                          <Link href={`/clinic/${clinic.slug}/book?service=${encodeURIComponent(service.name)}`} className="mt-4">
                            <Button variant="outline" className="w-full">
                              Book This Service
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/30 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-foreground">Not sure which service you need?</h2>
          <p className="mt-4 text-muted-foreground">
            Book a general consultation and our doctors will help determine the best treatment plan for you.
          </p>
          <Link href={`/clinic/${clinic.slug}/book`}>
            <Button size="lg" className="mt-6">
              Book a Consultation
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
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
