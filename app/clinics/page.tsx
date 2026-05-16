'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  HeartPulse, 
  Search, 
  MapPin, 
  Phone, 
  Star,
  Building2,
  Clock,
  ArrowRight,
  Loader2
} from 'lucide-react'
import type { Hospital } from '@/lib/types'

const facilityTypes = [
  { value: '', label: 'All Types' },
  { value: 'hospital', label: 'Hospital' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'diagnostic_center', label: 'Diagnostic Center' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'dental', label: 'Dental Practice' },
  { value: 'eye_care', label: 'Eye Care' },
  { value: 'maternity', label: 'Maternity' },
  { value: 'specialty_center', label: 'Specialty Center' }
]

export default function ClinicsPage() {
  const [clinics, setClinics] = useState<Hospital[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [facilityType, setFacilityType] = useState('')
  const [city, setCity] = useState('')
  const [cities, setCities] = useState<string[]>([])
  const [specialties, setSpecialties] = useState<string[]>([])
  const [specialty, setSpecialty] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })

  const fetchClinics = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })
      
      if (search) params.append('search', search)
      if (facilityType) params.append('facilityType', facilityType)
      if (city) params.append('city', city)
      if (specialty) params.append('specialty', specialty)

      const response = await fetch(`/api/public/clinics?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setClinics(data.data)
        setPagination(data.pagination)
        setCities(data.filters?.cities || [])
        setSpecialties(data.filters?.specialties || [])
      }
    } catch (error) {
      console.error('Error fetching clinics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClinics()
  }, [pagination.page, facilityType, city, specialty])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchClinics()
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
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Register Your Clinic</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-primary/5 to-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
              Find Healthcare Providers Near You
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Browse our directory of verified clinics and hospitals. Book appointments online.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mx-auto mt-8 max-w-3xl">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, specialty, or location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit">Search</Button>
            </div>
          </form>

          {/* Filters */}
          <div className="mx-auto mt-4 flex max-w-3xl flex-wrap justify-center gap-3">
            <Select value={facilityType} onValueChange={setFacilityType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Facility Type" />
              </SelectTrigger>
              <SelectContent>
                {facilityTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value || 'all'}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={specialty} onValueChange={setSpecialty}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Clinics Grid */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : clinics.length === 0 ? (
            <div className="py-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No clinics found</h3>
              <p className="mt-2 text-muted-foreground">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {clinics.length} of {pagination.total} clinics
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {clinics.map((clinic) => (
                  <Link key={clinic._id} href={`/clinic/${clinic.slug}`}>
                    <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                      {/* Cover Image */}
                      <div className="relative h-40 bg-gradient-to-br from-primary/10 to-primary/5">
                        {clinic.coverImage ? (
                          <img
                            src={clinic.coverImage}
                            alt={clinic.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Building2 className="h-12 w-12 text-primary/30" />
                          </div>
                        )}
                        {clinic.logo && (
                          <div className="absolute -bottom-6 left-4">
                            <img
                              src={clinic.logo}
                              alt=""
                              className="h-14 w-14 rounded-lg border-2 border-background bg-background object-cover shadow-sm"
                            />
                          </div>
                        )}
                      </div>

                      <CardHeader className={clinic.logo ? 'pt-8' : ''}>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{clinic.name}</CardTitle>
                            {clinic.publicProfile?.tagline && (
                              <CardDescription className="mt-1 line-clamp-1">
                                {clinic.publicProfile.tagline}
                              </CardDescription>
                            )}
                          </div>
                          {clinic.stats?.avgRating && clinic.stats.avgRating > 0 && (
                            <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1">
                              <Star className="h-3 w-3 fill-primary text-primary" />
                              <span className="text-xs font-medium text-primary">
                                {clinic.stats.avgRating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        {/* Location */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span className="line-clamp-1">{clinic.address}, {clinic.city}</span>
                        </div>

                        {/* Phone */}
                        {clinic.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4 shrink-0" />
                            <span>{clinic.phone}</span>
                          </div>
                        )}

                        {/* Working Hours */}
                        {clinic.publicProfile?.workingHours && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 shrink-0" />
                            <span>Open today</span>
                          </div>
                        )}

                        {/* Specialties */}
                        {clinic.publicProfile?.specialties && clinic.publicProfile.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {clinic.publicProfile.specialties.slice(0, 3).map((spec) => (
                              <Badge key={spec} variant="secondary" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                            {clinic.publicProfile.specialties.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{clinic.publicProfile.specialties.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* CTA */}
                        <div className="pt-2">
                          <Button variant="outline" className="w-full" size="sm">
                            View Details
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 1)
                      .map((p, i, arr) => (
                        <div key={p} className="flex items-center">
                          {i > 0 && arr[i - 1] !== p - 1 && (
                            <span className="px-2 text-muted-foreground">...</span>
                          )}
                          <Button
                            variant={p === pagination.page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPagination(prev => ({ ...prev, page: p }))}
                          >
                            {p}
                          </Button>
                        </div>
                      ))}
                  </div>
                  <Button
                    variant="outline"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-foreground">Are you a healthcare provider?</h2>
          <p className="mt-4 text-muted-foreground">
            Join MediCare Pro and showcase your clinic to thousands of potential patients.
            Get your own clinic page and manage appointments online.
          </p>
          <Button size="lg" className="mt-6" asChild>
            <Link href="/register">
              Register Your Clinic
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
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
