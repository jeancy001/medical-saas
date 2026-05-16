'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Save, Plus, Trash2, Search, Calculator, Receipt } from 'lucide-react'
import Link from 'next/link'
import useSWR from 'swr'
import { format, addDays } from 'date-fns'
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
import type { Patient, InvoiceItem } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

interface InvoiceItemForm {
  description: string
  quantity: number
  unitPrice: number
  category: string
}

const categories = [
  { value: 'consultation', label: 'Consultation' },
  { value: 'medication', label: 'Medication' },
  { value: 'lab_test', label: 'Laboratory Test' },
  { value: 'procedure', label: 'Procedure' },
  { value: 'hospitalization', label: 'Hospitalization' },
  { value: 'other', label: 'Other' },
]

const commonItems = [
  { description: 'General Consultation', unitPrice: 50, category: 'consultation' },
  { description: 'Specialist Consultation', unitPrice: 100, category: 'consultation' },
  { description: 'Follow-up Visit', unitPrice: 30, category: 'consultation' },
  { description: 'Emergency Consultation', unitPrice: 150, category: 'consultation' },
  { description: 'Blood Test - CBC', unitPrice: 25, category: 'lab_test' },
  { description: 'Blood Test - Full Panel', unitPrice: 75, category: 'lab_test' },
  { description: 'Urinalysis', unitPrice: 20, category: 'lab_test' },
  { description: 'X-Ray', unitPrice: 50, category: 'lab_test' },
  { description: 'Ultrasound', unitPrice: 80, category: 'lab_test' },
  { description: 'ECG', unitPrice: 40, category: 'lab_test' },
  { description: 'Minor Procedure', unitPrice: 100, category: 'procedure' },
  { description: 'Major Procedure', unitPrice: 300, category: 'procedure' },
  { description: 'Hospital Room - Standard (per day)', unitPrice: 150, category: 'hospitalization' },
  { description: 'Hospital Room - Private (per day)', unitPrice: 300, category: 'hospitalization' },
  { description: 'ICU Room (per day)', unitPrice: 500, category: 'hospitalization' },
]

export default function NewInvoicePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedPatientId = searchParams.get('patientId')
  const consultationId = searchParams.get('consultationId')
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [patientSearch, setPatientSearch] = useState('')
  const [patientOpen, setPatientOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  
  const [formData, setFormData] = useState({
    patientId: preselectedPatientId || '',
    dueDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    notes: '',
    tax: 0,
    discount: 0,
  })

  const [items, setItems] = useState<InvoiceItemForm[]>([
    { description: '', quantity: 1, unitPrice: 0, category: 'consultation' }
  ])

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

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    setFormData(prev => ({ ...prev, patientId: patient._id }))
    setPatientOpen(false)
  }

  // Item management
  const addItem = () => {
    setItems(prev => [...prev, { description: '', quantity: 1, unitPrice: 0, category: 'other' }])
  }

  const addCommonItem = (item: typeof commonItems[0]) => {
    setItems(prev => [...prev, { 
      description: item.description, 
      quantity: 1, 
      unitPrice: item.unitPrice, 
      category: item.category 
    }])
  }

  const updateItem = (index: number, field: keyof InvoiceItemForm, value: string | number) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== index))
    }
  }

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const taxAmount = (subtotal * formData.tax) / 100
  const discountAmount = (subtotal * formData.discount) / 100
  const total = subtotal + taxAmount - discountAmount

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.patientId) {
      setError('Please select a patient')
      return
    }

    const validItems = items.filter(item => item.description.trim() && item.unitPrice > 0)
    if (validItems.length === 0) {
      setError('Please add at least one item with a description and price')
      return
    }

    setIsLoading(true)

    try {
      const payload = {
        patientId: formData.patientId,
        consultationId: consultationId || undefined,
        items: validItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
          category: item.category,
        })),
        subtotal,
        tax: taxAmount,
        discount: discountAmount,
        total,
        dueDate: formData.dueDate,
        notes: formData.notes || undefined,
      }

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create invoice')
      }

      toast.success('Invoice created successfully')
      router.push('/dashboard/billing')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/billing">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Invoice</h1>
          <p className="text-muted-foreground">
            Generate a new invoice for a patient
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Patient Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Patient Information
                </CardTitle>
                <CardDescription>Select the patient for this invoice</CardDescription>
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
                        {selectedPatient.email && (
                          <p className="text-sm text-muted-foreground">{selectedPatient.email}</p>
                        )}
                      </div>
                      {selectedPatient.insuranceInfo?.provider && (
                        <Badge variant="secondary">
                          {selectedPatient.insuranceInfo.provider}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invoice Items */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Receipt className="h-5 w-5" />
                      Invoice Items
                    </CardTitle>
                    <CardDescription>Add items and services to the invoice</CardDescription>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Quick Add Common Items */}
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-sm font-medium mb-2">Quick Add Common Items:</p>
                  <div className="flex flex-wrap gap-2">
                    {commonItems.slice(0, 6).map((item, idx) => (
                      <Button 
                        key={idx} 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                        onClick={() => addCommonItem(item)}
                      >
                        {item.description} ({formatCurrency(item.unitPrice)})
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Items List */}
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-4 space-y-2">
                        <Label className={index === 0 ? '' : 'sr-only'}>Description</Label>
                        <Input
                          placeholder="Item description"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label className={index === 0 ? '' : 'sr-only'}>Category</Label>
                        <Select 
                          value={item.category} 
                          onValueChange={(v) => updateItem(index, 'category', v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label className={index === 0 ? '' : 'sr-only'}>Qty</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label className={index === 0 ? '' : 'sr-only'}>Unit Price</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={item.unitPrice || ''}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-1 space-y-2">
                        <Label className={index === 0 ? '' : 'sr-only'}>Total</Label>
                        <div className="h-9 flex items-center text-sm font-medium">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleChange('dueDate', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes or payment instructions"
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Invoice Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="tax" className="text-sm text-muted-foreground">Tax (%)</Label>
                      <Input
                        id="tax"
                        type="number"
                        min="0"
                        max="100"
                        className="w-16 h-8 text-right"
                        value={formData.tax}
                        onChange={(e) => handleChange('tax', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <span className="text-sm">{formatCurrency(taxAmount)}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="discount" className="text-sm text-muted-foreground">Discount (%)</Label>
                      <Input
                        id="discount"
                        type="number"
                        min="0"
                        max="100"
                        className="w-16 h-8 text-right"
                        value={formData.discount}
                        onChange={(e) => handleChange('discount', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <span className="text-sm text-destructive">-{formatCurrency(discountAmount)}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Due</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Invoice
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" className="w-full" asChild>
                    <Link href="/dashboard/billing">Cancel</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items</span>
                    <Badge variant="secondary">{items.filter(i => i.description).length}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Due Date</span>
                    <span>{format(new Date(formData.dueDate), 'MMM d, yyyy')}</span>
                  </div>
                  {selectedPatient?.insuranceInfo?.provider && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Insurance</span>
                      <Badge variant="outline">{selectedPatient.insuranceInfo.provider}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
