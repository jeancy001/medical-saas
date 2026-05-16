'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Search } from 'lucide-react'
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

const testTypes = [
  { value: 'cbc', label: 'Complete Blood Count (CBC)', category: 'hematology' },
  { value: 'bmp', label: 'Basic Metabolic Panel', category: 'biochemistry' },
  { value: 'cmp', label: 'Comprehensive Metabolic Panel', category: 'biochemistry' },
  { value: 'lipid', label: 'Lipid Panel', category: 'biochemistry' },
  { value: 'glucose_fasting', label: 'Blood Glucose (Fasting)', category: 'biochemistry' },
  { value: 'hba1c', label: 'HbA1c (Glycated Hemoglobin)', category: 'biochemistry' },
  { value: 'liver', label: 'Liver Function Tests', category: 'biochemistry' },
  { value: 'kidney', label: 'Kidney Function Tests', category: 'biochemistry' },
  { value: 'thyroid', label: 'Thyroid Panel (TSH, T3, T4)', category: 'biochemistry' },
  { value: 'urinalysis', label: 'Urinalysis', category: 'urinalysis' },
  { value: 'urine_culture', label: 'Urine Culture', category: 'microbiology' },
  { value: 'blood_culture', label: 'Blood Culture', category: 'microbiology' },
  { value: 'hiv', label: 'HIV Antibody Test', category: 'immunology' },
  { value: 'hepatitis', label: 'Hepatitis Panel (A, B, C)', category: 'immunology' },
  { value: 'malaria', label: 'Malaria Rapid Test', category: 'microbiology' },
  { value: 'pregnancy', label: 'Pregnancy Test (Beta-hCG)', category: 'immunology' },
  { value: 'stool', label: 'Stool Analysis', category: 'microbiology' },
  { value: 'xray', label: 'X-Ray', category: 'imaging' },
  { value: 'ultrasound', label: 'Ultrasound', category: 'imaging' },
  { value: 'ct', label: 'CT Scan', category: 'imaging' },
  { value: 'other', label: 'Other', category: 'other' },
]

const sampleTypes = [
  { value: 'blood', label: 'Blood' },
  { value: 'urine', label: 'Urine' },
  { value: 'stool', label: 'Stool' },
  { value: 'sputum', label: 'Sputum' },
  { value: 'swab', label: 'Swab' },
  { value: 'tissue', label: 'Tissue' },
  { value: 'other', label: 'Other' },
]

// Mock patients for selection
const mockPatients = [
  { _id: '1', firstName: 'Jean', lastName: 'Mukendi', patientNumber: 'PAT-001' },
  { _id: '2', firstName: 'Sarah', lastName: 'Mbala', patientNumber: 'PAT-002' },
  { _id: '3', firstName: 'Pierre', lastName: 'Ngoy', patientNumber: 'PAT-003' },
]

export default function NewLabRequestPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [patientSearch, setPatientSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<typeof mockPatients[0] | null>(null)
  const [formData, setFormData] = useState({
    testType: '',
    category: '',
    priority: 'routine',
    sampleType: '',
    notes: '',
  })

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleTestTypeChange = (value: string) => {
    const test = testTypes.find(t => t.value === value)
    setFormData(prev => ({
      ...prev,
      testType: test?.label || value,
      category: test?.category || 'other'
    }))
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
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/laboratory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          patientId: selectedPatient._id,
        }),
      })

      if (response.ok) {
        toast.success('Lab request created successfully')
        router.push('/dashboard/laboratory')
      } else {
        toast.error('Failed to create lab request')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/laboratory">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Lab Request</h1>
          <p className="text-muted-foreground">Request a new laboratory test for a patient</p>
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
                      className="w-full px-4 py-3 text-left hover:bg-muted flex justify-between items-center"
                      onClick={() => {
                        setSelectedPatient(patient)
                        setPatientSearch('')
                      }}
                    >
                      <span className="font-medium">{patient.firstName} {patient.lastName}</span>
                      <span className="text-sm text-muted-foreground">{patient.patientNumber}</span>
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

          {/* Test Details */}
          <Card>
            <CardHeader>
              <CardTitle>Test Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testType">Test Type *</Label>
                <Select value={formData.testType} onValueChange={handleTestTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select test type" />
                  </SelectTrigger>
                  <SelectContent>
                    {testTypes.map((test) => (
                      <SelectItem key={test.value} value={test.value}>{test.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority *</Label>
                  <Select value={formData.priority} onValueChange={(v) => handleChange('priority', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="stat">STAT (Emergency)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sampleType">Sample Type</Label>
                  <Select value={formData.sampleType} onValueChange={(v) => handleChange('sampleType', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sample" />
                    </SelectTrigger>
                    <SelectContent>
                      {sampleTypes.map((sample) => (
                        <SelectItem key={sample.value} value={sample.value}>{sample.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Clinical Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Add any relevant clinical information..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/laboratory">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting || !selectedPatient}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Creating...' : 'Create Lab Request'}
          </Button>
        </div>
      </form>
    </div>
  )
}
