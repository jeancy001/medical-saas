'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Search } from 'lucide-react'
import Link from 'next/link'
import useSWR from 'swr'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Patient } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30'
]

export default function NewAppointmentPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [patientSearch, setPatientSearch] = useState('')
  const [patientOpen, setPatientOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: new Date(),
    startTime: '',
    endTime: '',
    type: 'consultation',
    reason: '',
    notes: '',
  })

  // Fetch patients for search
  const { data: patientsData } = useSWR(
    patientSearch ? `/api/patients?search=${encodeURIComponent(patientSearch)}&limit=5` : null,
    fetcher
  )
  const patients: Patient[] = patientsData?.data || []

  // Fetch doctors
  const { data: usersData } = useSWR('/api/users?role=doctor', fetcher)
  const doctors = usersData?.data || []

  const handleChange = (field: string, value: string | Date) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    setFormData(prev => ({ ...prev, patientId: patient._id }))
    setPatientOpen(false)
  }

  const calculateEndTime = (startTime: string): string => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const endMinutes = minutes + 30
    const endHours = hours + Math.floor(endMinutes / 60)
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`
  }

  useEffect(() => {
    if (formData.startTime) {
      setFormData(prev => ({ ...prev, endTime: calculateEndTime(formData.startTime) }))
    }
  }, [formData.startTime])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.patientId || !formData.doctorId || !formData.startTime) {
      setError('Please fill in all required fields')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          date: format(formData.date, 'yyyy-MM-dd'),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create appointment')
      }

      toast.success('Appointment scheduled successfully')
      router.push('/dashboard/appointments')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/appointments">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Schedule Appointment</h1>
          <p className="text-muted-foreground">
            Book a new appointment for a patient
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Patient Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Patient</CardTitle>
            <CardDescription>Select the patient for this appointment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Popover open={patientOpen} onOpenChange={setPatientOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={patientOpen}
                    className="w-full justify-between"
                  >
                    {selectedPatient ? (
                      <span>
                        {selectedPatient.firstName} {selectedPatient.lastName} ({selectedPatient.patientNumber})
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Search and select a patient...</span>
                    )}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Search patients..." 
                      value={patientSearch}
                      onValueChange={setPatientSearch}
                    />
                    <CommandList>
                      <CommandEmpty>No patients found.</CommandEmpty>
                      <CommandGroup>
                        {patients.map((patient) => (
                          <CommandItem
                            key={patient._id}
                            value={patient._id}
                            onSelect={() => handlePatientSelect(patient)}
                          >
                            <div className="flex flex-col">
                              <span>{patient.firstName} {patient.lastName}</span>
                              <span className="text-xs text-muted-foreground">
                                {patient.patientNumber} - {patient.phone}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
            <CardDescription>Set the date, time, and type of appointment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      {formData.date ? format(formData.date, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => date && handleChange('date', date)}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Type *</Label>
                <Select value={formData.type} onValueChange={(v) => handleChange('type', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="telemedicine">Telemedicine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time *</Label>
                <Select value={formData.startTime} onValueChange={(v) => handleChange('startTime', v)}>
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

              <div className="space-y-2">
                <Label>End Time</Label>
                <Input value={formData.endTime} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Doctor *</Label>
              <Select value={formData.doctorId} onValueChange={(v) => handleChange('doctorId', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor: { _id: string; firstName: string; lastName: string; specialization?: string }) => (
                    <SelectItem key={doctor._id} value={doctor._id}>
                      Dr. {doctor.firstName} {doctor.lastName}
                      {doctor.specialization && ` - ${doctor.specialization}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reason for Visit *</Label>
              <Textarea
                placeholder="Describe the reason for this appointment"
                value={formData.reason}
                onChange={(e) => handleChange('reason', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea
                placeholder="Any additional notes or instructions"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Scheduling...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Schedule Appointment
              </>
            )}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/appointments">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
