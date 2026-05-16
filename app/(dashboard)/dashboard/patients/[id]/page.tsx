'use client'

import { use } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { format } from 'date-fns'
import { 
  ArrowLeft, 
  Edit, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Heart,
  AlertTriangle,
  Shield,
  User,
  Activity,
  FileText,
  Stethoscope,
  Receipt
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import type { Patient, Consultation, Appointment, Invoice } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  
  const { data: patientData, isLoading: patientLoading } = useSWR(
    `/api/patients/${id}`,
    fetcher
  )
  
  const patient: Patient | null = patientData?.data || null

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birth = new Date(dateOfBirth)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  if (patientLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64 lg:col-span-2" />
        </div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-xl font-semibold">Patient not found</h2>
        <p className="text-muted-foreground mt-2">The patient record you are looking for does not exist.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/patients">Back to Patients</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/patients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-muted-foreground">
              Patient ID: {patient.patientNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/appointments/new?patientId=${patient._id}`}>
              <Calendar className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Schedule</span>
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/consultations/new?patientId=${patient._id}`}>
              <Stethoscope className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Consultation</span>
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/patients/${patient._id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Patient Info Card */}
        <Card className="lg:row-span-2">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {patient.firstName[0]}{patient.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold">
                {patient.firstName} {patient.lastName}
              </h2>
              <p className="text-muted-foreground mb-4">
                {calculateAge(patient.dateOfBirth)} years old, {patient.gender}
              </p>
              
              {patient.bloodType && (
                <Badge variant="secondary" className="mb-4">
                  <Heart className="mr-1 h-3 w-3" />
                  Blood Type: {patient.bloodType}
                </Badge>
              )}

              <Separator className="my-4 w-full" />

              <div className="w-full space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="break-all">{patient.phone}</span>
                </div>
                {patient.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="break-all">{patient.email}</span>
                  </div>
                )}
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span>{patient.address}, {patient.city}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span>Born {format(new Date(patient.dateOfBirth), 'MMMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Info Cards */}
          <div className="grid grid-cols-2 gap-4">
            {patient.allergies && patient.allergies.length > 0 && (
              <Card className="col-span-2 border-warning/50 bg-warning/5">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0" />
                    <div>
                      <p className="font-medium text-warning">Allergies</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {patient.allergies.map((allergy, idx) => (
                          <Badge key={idx} variant="outline" className="border-warning text-warning">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="history">Medical History</TabsTrigger>
              <TabsTrigger value="emergency">Emergency Contact</TabsTrigger>
              <TabsTrigger value="insurance">Insurance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                  <CardDescription>Latest consultations and appointments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activity to display</p>
                    <Button variant="link" asChild className="mt-2">
                      <Link href={`/dashboard/consultations/new?patientId=${patient._id}`}>
                        Start a new consultation
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Medical History</CardTitle>
                  <CardDescription>Past conditions and diagnoses</CardDescription>
                </CardHeader>
                <CardContent>
                  {patient.medicalHistory && patient.medicalHistory.length > 0 ? (
                    <div className="space-y-4">
                      {patient.medicalHistory.map((record, idx) => (
                        <div key={idx} className="flex items-start gap-4 p-4 rounded-lg border">
                          <div className="p-2 rounded-full bg-primary/10">
                            <FileText className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{record.condition}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {record.notes}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Diagnosed: {format(new Date(record.diagnosisDate), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No medical history recorded</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="emergency" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Emergency Contact</CardTitle>
                  <CardDescription>Person to contact in case of emergency</CardDescription>
                </CardHeader>
                <CardContent>
                  {patient.emergencyContact?.name ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-secondary">
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{patient.emergencyContact.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {patient.emergencyContact.relationship}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{patient.emergencyContact.phone}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No emergency contact on file</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insurance" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Insurance Information</CardTitle>
                  <CardDescription>Health insurance coverage details</CardDescription>
                </CardHeader>
                <CardContent>
                  {patient.insuranceInfo?.provider ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{patient.insuranceInfo.provider}</p>
                          <p className="text-sm text-muted-foreground">
                            Policy: {patient.insuranceInfo.policyNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          Expires: {format(new Date(patient.insuranceInfo.expiryDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No insurance information on file</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
