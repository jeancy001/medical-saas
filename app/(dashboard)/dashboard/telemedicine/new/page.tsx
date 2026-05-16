'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Search, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

// Mock patients
const mockPatients = [
  { _id: '1', firstName: 'Jean', lastName: 'Mukendi', patientNumber: 'PAT-001', phone: '+243 812 345 678' },
  { _id: '2', firstName: 'Sarah', lastName: 'Mbala', patientNumber: 'PAT-002', phone: '+243 823 456 789' },
  { _id: '3', firstName: 'Pierre', lastName: 'Ngoy', patientNumber: 'PAT-003', phone: '+243 834 567 890' },
]

// Mock doctors
const mockDoctors = [
  { _id: '1', firstName: 'Marie', lastName: 'Kabongo', specialization: 'General Medicine' },
  { _id: '2', firstName: 'Joseph', lastName: 'Tshisekedi', specialization: 'Cardiology' },
  { _id: '3', firstName: 'Anne', lastName: 'Mutombo', specialization: 'Pediatrics' },
]

export default function NewTeleconsultationPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [patientSearch, setPatientSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<typeof mockPatients[0] | null>(null)
  const [formData, setFormData] = useState({
    doctorId: '',
    date: '',
    time: '',
    duration: '30',
    notes: '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const filteredPatients = mockPatients.filter(p =>
    `${p.firstName} ${p.lastName} ${p.patientNumber}`.toLowerCase().includes(patientSearch.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient) {
      toast.error('Please select a patient')
      return
    }
    if (!formData.doctorId || !formData.date || !formData.time) {
      toast.error('Please fill in all required fields')
      return
    }
    setIsSubmitting(true)

    try {
      const scheduledAt = new Date(`${formData.date}T${formData.time}`)
      
      const response = await fetch('/api/teleconsultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient._id,
          doctorId: formData.doctorId,
          scheduledAt: scheduledAt.toISOString(),
          duration: parseInt(formData.duration),
          notes: formData.notes,
        }),
      })

      if (response.ok) {
        toast.success('Teleconsultation scheduled successfully')
        router.push('/dashboard/telemedicine')
      } else {
        toast.error('Failed to schedule teleconsultation')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/telemedicine">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Schedule Teleconsultation</h1>
          <p className="text-muted-foreground">Set up a new video consultation with a patient</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Patient Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Search Patient *</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or patient number..."
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              {patientSearch && !selectedPatient && (
                <div className="border rounded-lg divide-y max-h-48 overflow-auto">
                  {filteredPatients.map((patient) => (
                    <button
                      key={patient._id}
                      type="button"
                      className="w-full px-4 py-3 text-left hover:bg-muted"
                      onClick={() => {
                        setSelectedPatient(patient)
                        setPatientSearch('')
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{patient.firstName} {patient.lastName}</span>
                        <span className="text-sm text-muted-foreground">{patient.patientNumber}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{patient.phone}</p>
                    </button>
                  ))}
                  {filteredPatients.length === 0 && (
                    <div className="px-4 py-3 text-muted-foreground text-sm">No patients found</div>
                  )}
                </div>
              )}
              {selectedPatient && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                      <p className="text-sm text-muted-foreground">{selectedPatient.patientNumber}</p>
                      <p className="text-sm text-muted-foreground">{selectedPatient.phone}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPatient(null)}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Consultation Details */}
          <Card>
            <CardHeader>
              <CardTitle>Consultation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doctorId">Doctor *</Label>
                <Select value={formData.doctorId} onValueChange={(v) => handleChange('doctorId', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDoctors.map((doctor) => (
                      <SelectItem key={doctor._id} value={doctor._id}>
                        Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="date"
                      type="date"
                      min={today}
                      value={formData.date}
                      onChange={(e) => handleChange('date', e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleChange('time', e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Select value={formData.duration} onValueChange={(v) => handleChange('duration', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Reason for consultation or additional notes..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/telemedicine">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting || !selectedPatient}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Scheduling...' : 'Schedule Consultation'}
          </Button>
        </div>
      </form>
    </div>
  )
}
