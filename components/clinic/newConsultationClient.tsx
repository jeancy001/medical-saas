'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Save, Plus, Trash2, Search, Pill, TestTube, Activity } from 'lucide-react'
import Link from 'next/link'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { toast } from 'sonner'
import type { Patient, Prescription, LabTestRequest } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface VitalSignsForm {
  bloodPressure: string
  heartRate: string
  temperature: string
  weight: string
  height: string
  oxygenSaturation: string
  respiratoryRate: string
}

interface PrescriptionForm {
  medicationName: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
  quantity: string
}

interface LabTestForm {
  testName: string
  status: 'pending' | 'in_progress' | 'completed'
}

export default function NewConsultationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedPatientId = searchParams.get('patientId')
  const appointmentId = searchParams.get('appointmentId')
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [patientSearch, setPatientSearch] = useState('')
  const [patientOpen, setPatientOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  
  const [formData, setFormData] = useState({
    patientId: preselectedPatientId || '',
    type: 'external',
    chiefComplaint: '',
    symptoms: '',
    diagnosis: '',
    notes: '',
    followUpDate: '',
  })

  const [vitalSigns, setVitalSigns] = useState<VitalSignsForm>({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    weight: '',
    height: '',
    oxygenSaturation: '',
    respiratoryRate: '',
  })

  const [prescriptions, setPrescriptions] = useState<PrescriptionForm[]>([])
  const [labTests, setLabTests] = useState<LabTestForm[]>([])

  // Fetch patients for search
  const { data: patientsData } = useSWR(
    patientSearch ? `/api/patients?search=${encodeURIComponent(patientSearch)}&limit=5` : null,
    fetcher
  )
  const patients: Patient[] = patientsData?.data || []

  // Fetch preselected patient
  const { data: preselectedPatientData } = useSWR(
    preselectedPatientId ? `/api/patients/${preselectedPatientId}` : null,
    fetcher
  )

  useEffect(() => {
    if (preselectedPatientData?.data) {
      setSelectedPatient(preselectedPatientData.data)
    }
  }, [preselectedPatientData])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleVitalChange = (field: string, value: string) => {
    setVitalSigns(prev => ({ ...prev, [field]: value }))
  }

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    setFormData(prev => ({ ...prev, patientId: patient._id }))
    setPatientOpen(false)
  }

  // Prescription management
  const addPrescription = () => {
    setPrescriptions(prev => [...prev, {
      medicationName: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      quantity: '',
    }])
  }

  const updatePrescription = (index: number, field: keyof PrescriptionForm, value: string) => {
    setPrescriptions(prev => prev.map((p, i) => 
      i === index ? { ...p, [field]: value } : p
    ))
  }

  const removePrescription = (index: number) => {
    setPrescriptions(prev => prev.filter((_, i) => i !== index))
  }

  // Lab test management
  const addLabTest = () => {
    setLabTests(prev => [...prev, { testName: '', status: 'pending' }])
  }

  const updateLabTest = (index: number, field: keyof LabTestForm, value: string) => {
    setLabTests(prev => prev.map((t, i) => 
      i === index ? { ...t, [field]: value } : t
    ))
  }

  const removeLabTest = (index: number) => {
    setLabTests(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.patientId) {
      setError('Please select a patient')
      return
    }

    if (!formData.chiefComplaint) {
      setError('Please enter the chief complaint')
      return
    }

    setIsLoading(true)

    try {
      // Build vital signs object (only include non-empty values)
      const vitalSignsData: Record<string, string | number> = {}
      if (vitalSigns.bloodPressure) vitalSignsData.bloodPressure = vitalSigns.bloodPressure
      if (vitalSigns.heartRate) vitalSignsData.heartRate = parseInt(vitalSigns.heartRate)
      if (vitalSigns.temperature) vitalSignsData.temperature = parseFloat(vitalSigns.temperature)
      if (vitalSigns.weight) vitalSignsData.weight = parseFloat(vitalSigns.weight)
      if (vitalSigns.height) vitalSignsData.height = parseFloat(vitalSigns.height)
      if (vitalSigns.oxygenSaturation) vitalSignsData.oxygenSaturation = parseInt(vitalSigns.oxygenSaturation)
      if (vitalSigns.respiratoryRate) vitalSignsData.respiratoryRate = parseInt(vitalSigns.respiratoryRate)

      // Build prescriptions array
      const prescriptionsData = prescriptions
        .filter(p => p.medicationName.trim())
        .map(p => ({
          medicationName: p.medicationName,
          dosage: p.dosage,
          frequency: p.frequency,
          duration: p.duration,
          instructions: p.instructions,
          quantity: parseInt(p.quantity) || 1,
        }))

      // Build lab tests array
      const labTestsData = labTests
        .filter(t => t.testName.trim())
        .map(t => ({
          testName: t.testName,
          status: t.status,
        }))

      const payload = {
        patientId: formData.patientId,
        appointmentId: appointmentId || undefined,
        type: formData.type,
        chiefComplaint: formData.chiefComplaint,
        symptoms: formData.symptoms ? formData.symptoms.split(',').map(s => s.trim()) : [],
        diagnosis: formData.diagnosis || undefined,
        notes: formData.notes,
        followUpDate: formData.followUpDate || undefined,
        vitalSigns: Object.keys(vitalSignsData).length > 0 ? vitalSignsData : undefined,
        prescriptions: prescriptionsData.length > 0 ? prescriptionsData : undefined,
        labTests: labTestsData.length > 0 ? labTestsData : undefined,
      }

      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create consultation')
      }

      toast.success('Consultation created successfully')
      router.push('/dashboard/consultations')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/consultations">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Consultation</h1>
          <p className="text-muted-foreground">
            Record a patient consultation with prescriptions and lab tests
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
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Patient
            </CardTitle>
            <CardDescription>Select the patient for this consultation</CardDescription>
          </CardHeader>
          <CardContent>
            <Popover open={patientOpen} onOpenChange={setPatientOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={patientOpen}
                  className="w-full justify-between"
                  disabled={!!preselectedPatientId}
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

            {selectedPatient && (
              <div className="mt-4 p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedPatient.patientNumber} | {selectedPatient.phone}
                    </p>
                  </div>
                  {selectedPatient.bloodType && (
                    <Badge variant="secondary">Blood: {selectedPatient.bloodType}</Badge>
                  )}
                </div>
                {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm font-medium text-warning">Allergies:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedPatient.allergies.map((allergy, idx) => (
                        <Badge key={idx} variant="outline" className="border-warning text-warning text-xs">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Consultation Details */}
        <Card>
          <CardHeader>
            <CardTitle>Consultation Details</CardTitle>
            <CardDescription>Main complaint and diagnosis information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Consultation Type *</Label>
                <Select value={formData.type} onValueChange={(v) => handleChange('type', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="external">External Consultation</SelectItem>
                    <SelectItem value="hospitalization">Hospitalization</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="surgery">Surgery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="followUpDate">Follow-up Date</Label>
                <Input
                  id="followUpDate"
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => handleChange('followUpDate', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="chiefComplaint">Chief Complaint *</Label>
              <Textarea
                id="chiefComplaint"
                placeholder="Main reason for the visit"
                value={formData.chiefComplaint}
                onChange={(e) => handleChange('chiefComplaint', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="symptoms">Symptoms</Label>
              <Textarea
                id="symptoms"
                placeholder="Enter symptoms separated by commas (e.g., Fever, Headache, Fatigue)"
                value={formData.symptoms}
                onChange={(e) => handleChange('symptoms', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Textarea
                id="diagnosis"
                placeholder="Medical diagnosis"
                value={formData.diagnosis}
                onChange={(e) => handleChange('diagnosis', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Clinical Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional clinical notes and observations"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Vital Signs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Vital Signs
            </CardTitle>
            <CardDescription>Record patient vital measurements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bloodPressure">Blood Pressure</Label>
                <Input
                  id="bloodPressure"
                  placeholder="120/80"
                  value={vitalSigns.bloodPressure}
                  onChange={(e) => handleVitalChange('bloodPressure', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                <Input
                  id="heartRate"
                  type="number"
                  placeholder="72"
                  value={vitalSigns.heartRate}
                  onChange={(e) => handleVitalChange('heartRate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature (C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  placeholder="37.0"
                  value={vitalSigns.temperature}
                  onChange={(e) => handleVitalChange('temperature', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oxygenSaturation">SpO2 (%)</Label>
                <Input
                  id="oxygenSaturation"
                  type="number"
                  placeholder="98"
                  value={vitalSigns.oxygenSaturation}
                  onChange={(e) => handleVitalChange('oxygenSaturation', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="70"
                  value={vitalSigns.weight}
                  onChange={(e) => handleVitalChange('weight', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="175"
                  value={vitalSigns.height}
                  onChange={(e) => handleVitalChange('height', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="respiratoryRate">Resp. Rate (/min)</Label>
                <Input
                  id="respiratoryRate"
                  type="number"
                  placeholder="16"
                  value={vitalSigns.respiratoryRate}
                  onChange={(e) => handleVitalChange('respiratoryRate', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prescriptions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Prescriptions
                </CardTitle>
                <CardDescription>Medications prescribed to the patient</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addPrescription}>
                <Plus className="mr-2 h-4 w-4" />
                Add Medication
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {prescriptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No prescriptions added yet</p>
                <Button type="button" variant="link" onClick={addPrescription}>
                  Add a prescription
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {prescriptions.map((prescription, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">Medication {index + 1}</Badge>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removePrescription(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Medication Name *</Label>
                        <Input
                          placeholder="e.g., Paracetamol"
                          value={prescription.medicationName}
                          onChange={(e) => updatePrescription(index, 'medicationName', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Dosage</Label>
                        <Input
                          placeholder="e.g., 500mg"
                          value={prescription.dosage}
                          onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Frequency</Label>
                        <Select 
                          value={prescription.frequency} 
                          onValueChange={(v) => updatePrescription(index, 'frequency', v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="once_daily">Once daily</SelectItem>
                            <SelectItem value="twice_daily">Twice daily</SelectItem>
                            <SelectItem value="three_times_daily">Three times daily</SelectItem>
                            <SelectItem value="four_times_daily">Four times daily</SelectItem>
                            <SelectItem value="as_needed">As needed</SelectItem>
                            <SelectItem value="before_meals">Before meals</SelectItem>
                            <SelectItem value="after_meals">After meals</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Duration</Label>
                        <Input
                          placeholder="e.g., 7 days"
                          value={prescription.duration}
                          onChange={(e) => updatePrescription(index, 'duration', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          placeholder="e.g., 21"
                          value={prescription.quantity}
                          onChange={(e) => updatePrescription(index, 'quantity', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Instructions</Label>
                        <Input
                          placeholder="e.g., Take with water"
                          value={prescription.instructions}
                          onChange={(e) => updatePrescription(index, 'instructions', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lab Tests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Laboratory Tests
                </CardTitle>
                <CardDescription>Request laboratory examinations</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addLabTest}>
                <Plus className="mr-2 h-4 w-4" />
                Add Lab Test
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {labTests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No lab tests requested yet</p>
                <Button type="button" variant="link" onClick={addLabTest}>
                  Request a lab test
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {labTests.map((test, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <Label className="sr-only">Test Name</Label>
                      <Select 
                        value={test.testName} 
                        onValueChange={(v) => updateLabTest(index, 'testName', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select lab test" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Complete Blood Count (CBC)">Complete Blood Count (CBC)</SelectItem>
                          <SelectItem value="Blood Glucose">Blood Glucose</SelectItem>
                          <SelectItem value="Liver Function Test (LFT)">Liver Function Test (LFT)</SelectItem>
                          <SelectItem value="Kidney Function Test (KFT)">Kidney Function Test (KFT)</SelectItem>
                          <SelectItem value="Lipid Profile">Lipid Profile</SelectItem>
                          <SelectItem value="Urinalysis">Urinalysis</SelectItem>
                          <SelectItem value="Thyroid Function Test">Thyroid Function Test</SelectItem>
                          <SelectItem value="HIV Test">HIV Test</SelectItem>
                          <SelectItem value="Malaria Test">Malaria Test</SelectItem>
                          <SelectItem value="Typhoid Test">Typhoid Test</SelectItem>
                          <SelectItem value="Hepatitis B">Hepatitis B</SelectItem>
                          <SelectItem value="Hepatitis C">Hepatitis C</SelectItem>
                          <SelectItem value="X-Ray">X-Ray</SelectItem>
                          <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                          <SelectItem value="ECG">ECG</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeLabTest(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Consultation
              </>
            )}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/consultations">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
