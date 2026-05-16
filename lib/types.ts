// User & Authentication Types
export type UserRole = 
  | 'super_admin' 
  | 'hospital_admin' 
  | 'doctor' 
  | 'nurse' 
  | 'pharmacist' 
  | 'accountant' 
  | 'receptionist'
  | 'patient'

export interface User {
  _id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  hospitalId?: string
  phone?: string
  avatar?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Hospital {
  _id: string
  name: string
  address: string
  city: string
  phone: string
  email: string
  logo?: string
  subscription: 'basic' | 'standard' | 'premium'
  isActive: boolean
  createdAt: string
}

// Patient Types
export interface Patient {
  _id: string
  hospitalId: string
  patientNumber: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'male' | 'female' | 'other'
  email?: string
  phone: string
  address: string
  city: string
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
  allergies?: string[]
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  insuranceInfo?: {
    provider: string
    policyNumber: string
    expiryDate: string
  }
  medicalHistory?: MedicalHistory[]
  createdAt: string
  updatedAt: string
}

export interface MedicalHistory {
  _id: string
  condition: string
  diagnosisDate: string
  notes: string
  doctorId: string
}

// Appointment Types
export interface Appointment {
  _id: string
  hospitalId: string
  patientId: string
  patient?: Patient
  doctorId: string
  doctor?: User
  date: string
  startTime: string
  endTime: string
  type: 'consultation' | 'follow_up' | 'emergency' | 'telemedicine'
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  reason: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// Consultation Types
export interface Consultation {
  _id: string
  hospitalId: string
  appointmentId?: string
  patientId: string
  patient?: Patient
  doctorId: string
  doctor?: User
  type: 'external' | 'hospitalization' | 'emergency' | 'surgery'
  chiefComplaint: string
  symptoms: string[]
  diagnosis?: string
  vitalSigns?: VitalSigns
  prescriptions?: Prescription[]
  labTests?: LabTestRequest[]
  notes: string
  status: 'in_progress' | 'completed' | 'pending_results'
  followUpDate?: string
  createdAt: string
  updatedAt: string
}

export interface VitalSigns {
  bloodPressure?: string
  heartRate?: number
  temperature?: number
  weight?: number
  height?: number
  oxygenSaturation?: number
  respiratoryRate?: number
}

export interface Prescription {
  _id: string
  medicationName: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
  quantity: number
}

export interface LabTestRequest {
  _id: string
  testName: string
  status: 'pending' | 'in_progress' | 'completed'
  results?: string
  completedAt?: string
}

// Billing Types
export interface Invoice {
  _id: string
  hospitalId: string
  patientId: string
  patient?: Patient
  invoiceNumber: string
  consultationId?: string
  items: InvoiceItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  status: 'draft' | 'pending' | 'paid' | 'partial' | 'overdue' | 'cancelled'
  paymentMethod?: 'cash' | 'mobile_money' | 'card' | 'insurance' | 'bank_transfer'
  payments?: Payment[]
  dueDate: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
  category: 'consultation' | 'medication' | 'lab_test' | 'procedure' | 'hospitalization' | 'other'
}

export interface Payment {
  _id: string
  amount: number
  method: 'cash' | 'mobile_money' | 'card' | 'insurance' | 'bank_transfer'
  reference?: string
  paidAt: string
  receivedBy: string
}

// Dashboard Statistics
export interface DashboardStats {
  totalPatients: number
  totalAppointments: number
  todayAppointments: number
  pendingConsultations: number
  totalRevenue: number
  monthlyRevenue: number
  unpaidInvoices: number
  recentPatients: Patient[]
  upcomingAppointments: Appointment[]
  revenueByMonth: { month: string; revenue: number }[]
  consultationsByType: { type: string; count: number }[]
}

// Pharmacy Types
export interface Medication {
  _id: string
  hospitalId: string
  name: string
  genericName: string
  category: 'antibiotics' | 'analgesics' | 'antivirals' | 'vitamins' | 'vaccines' | 'other'
  dosageForm: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'cream' | 'drops' | 'other'
  strength: string
  unit: string
  manufacturer: string
  batchNumber: string
  expiryDate: string
  stockQuantity: number
  minStockLevel: number
  unitPrice: number
  sellingPrice: number
  supplierId?: string
  location?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Supplier {
  _id: string
  hospitalId: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  isActive: boolean
  createdAt: string
}

export interface PharmacySale {
  _id: string
  hospitalId: string
  saleNumber: string
  patientId?: string
  patient?: Patient
  type: 'internal' | 'external'
  items: PharmacySaleItem[]
  subtotal: number
  discount: number
  total: number
  paymentMethod: 'cash' | 'mobile_money' | 'card' | 'insurance'
  status: 'pending' | 'completed' | 'cancelled'
  soldBy: string
  notes?: string
  createdAt: string
}

export interface PharmacySaleItem {
  medicationId: string
  medicationName: string
  quantity: number
  unitPrice: number
  total: number
}

// Laboratory Types
export interface LabTest {
  _id: string
  hospitalId: string
  testNumber: string
  patientId: string
  patient?: Patient
  doctorId: string
  doctor?: User
  consultationId?: string
  testType: string
  category: 'hematology' | 'biochemistry' | 'microbiology' | 'immunology' | 'urinalysis' | 'imaging' | 'other'
  priority: 'routine' | 'urgent' | 'stat'
  status: 'pending' | 'sample_collected' | 'processing' | 'completed' | 'cancelled'
  sampleType?: string
  sampleCollectedAt?: string
  sampleCollectedBy?: string
  results?: LabTestResult[]
  notes?: string
  completedAt?: string
  completedBy?: string
  createdAt: string
  updatedAt: string
}

export interface LabTestResult {
  parameter: string
  value: string
  unit: string
  referenceRange: string
  flag?: 'normal' | 'low' | 'high' | 'critical'
}

// Telemedicine Types
export interface Teleconsultation {
  _id: string
  hospitalId: string
  appointmentId?: string
  patientId: string
  patient?: Patient
  doctorId: string
  doctor?: User
  scheduledAt: string
  duration: number
  status: 'scheduled' | 'waiting' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  meetingLink?: string
  meetingId?: string
  notes?: string
  diagnosis?: string
  prescriptions?: Prescription[]
  recordingUrl?: string
  startedAt?: string
  endedAt?: string
  createdAt: string
  updatedAt: string
}

// Hospital Settings Types
export interface HospitalSettings {
  _id: string
  hospitalId: string
  general: {
    timezone: string
    currency: string
    language: string
    dateFormat: string
  }
  billing: {
    taxRate: number
    invoicePrefix: string
    paymentTerms: number
    enableMobileMoney: boolean
    enableCardPayment: boolean
    enableInsurance: boolean
  }
  appointments: {
    defaultDuration: number
    workingHours: { day: string; start: string; end: string; isOpen: boolean }[]
    allowOnlineBooking: boolean
  }
  notifications: {
    emailEnabled: boolean
    smsEnabled: boolean
    appointmentReminder: boolean
    reminderHoursBefore: number
  }
}

export interface InsuranceProvider {
  _id: string
  hospitalId: string
  name: string
  contactEmail: string
  contactPhone: string
  coveragePercentage: number
  isActive: boolean
  createdAt: string
}

export interface ServiceTariff {
  _id: string
  hospitalId: string
  serviceName: string
  category: 'consultation' | 'procedure' | 'lab_test' | 'imaging' | 'hospitalization' | 'other'
  price: number
  insuranceCovered: boolean
  description?: string
  isActive: boolean
  createdAt: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
