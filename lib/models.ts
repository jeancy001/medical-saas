import mongoose, { Schema, Document } from 'mongoose'

// Hospital Schema
const hospitalSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  logo: String,
  subscription: { 
    type: String, 
    enum: ['free', 'basic', 'standard', 'premium', 'enterprise'],
    default: 'free'
  },
  slug: { type: String, unique: true, sparse: true },
  subdomain: { type: String, unique: true, sparse: true },
  customDomain: { type: String, unique: true, sparse: true },
  country: { type: String, default: 'DRC' },
  coverImage: String,
  publicProfile: {
    tagline: String,
    description: String,
    aboutUs: String,
    specialties: [String],
    languages: [String],
    isPubliclyListed: { type: Boolean, default: true }
  },
  services: [{
    name: String,
    category: String,
    description: String,
    price: Number,
    isAvailable: { type: Boolean, default: true }
  }],
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

// User Schema
const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['super_admin', 'hospital_admin', 'doctor', 'nurse', 'pharmacist', 'accountant', 'receptionist', 'patient'],
    required: true
  },
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital' },
  phone: String,
  avatar: String,
  specialization: String, // For doctors
  licenseNumber: String, // For medical staff
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

// Patient Schema
const patientSchema = new Schema({
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  patientNumber: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  email: String,
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  bloodType: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  allergies: [String],
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    expiryDate: Date
  },
  medicalHistory: [{
    condition: String,
    diagnosisDate: Date,
    notes: String,
    doctorId: { type: Schema.Types.ObjectId, ref: 'User' }
  }]
}, { timestamps: true })

// Appointment Schema
const appointmentSchema = new Schema({
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['consultation', 'follow_up', 'emergency', 'telemedicine'],
    default: 'consultation'
  },
  status: { 
    type: String, 
    enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  reason: { type: String, required: true },
  notes: String
}, { timestamps: true })

// Consultation Schema
const consultationSchema = new Schema({
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['external', 'hospitalization', 'emergency', 'surgery'],
    required: true
  },
  chiefComplaint: { type: String, required: true },
  symptoms: [String],
  diagnosis: String,
  vitalSigns: {
    bloodPressure: String,
    heartRate: Number,
    temperature: Number,
    weight: Number,
    height: Number,
    oxygenSaturation: Number,
    respiratoryRate: Number
  },
  prescriptions: [{
    medicationName: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String,
    quantity: Number
  }],
  labTests: [{
    testName: String,
    status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
    results: String,
    completedAt: Date
  }],
  notes: String,
  status: { 
    type: String, 
    enum: ['in_progress', 'completed', 'pending_results'],
    default: 'in_progress'
  },
  followUpDate: Date
}, { timestamps: true })

// Invoice Schema
const invoiceSchema = new Schema({
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  invoiceNumber: { type: String, required: true, unique: true },
  consultationId: { type: Schema.Types.ObjectId, ref: 'Consultation' },
  items: [{
    description: String,
    quantity: Number,
    unitPrice: Number,
    total: Number,
    category: { 
      type: String, 
      enum: ['consultation', 'medication', 'lab_test', 'procedure', 'hospitalization', 'other']
    }
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['draft', 'pending', 'paid', 'partial', 'overdue', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'mobile_money', 'card', 'insurance', 'bank_transfer']
  },
  payments: [{
    amount: Number,
    method: { type: String, enum: ['cash', 'mobile_money', 'card', 'insurance', 'bank_transfer'] },
    reference: String,
    paidAt: { type: Date, default: Date.now },
    receivedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  }],
  dueDate: { type: Date, required: true },
  notes: String
}, { timestamps: true })

// Export models
export const Hospital = mongoose.models.Hospital || mongoose.model('Hospital', hospitalSchema)
export const User = mongoose.models.User || mongoose.model('User', userSchema)
export const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema)
export const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema)
export const Consultation = mongoose.models.Consultation || mongoose.model('Consultation', consultationSchema)
export const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema)

// Medication Schema
const medicationSchema = new Schema({
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  name: { type: String, required: true },
  genericName: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['antibiotics', 'analgesics', 'antivirals', 'vitamins', 'vaccines', 'other'],
    required: true
  },
  dosageForm: { 
    type: String, 
    enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'other'],
    required: true
  },
  strength: { type: String, required: true },
  unit: { type: String, required: true },
  manufacturer: { type: String, required: true },
  batchNumber: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  stockQuantity: { type: Number, required: true, default: 0 },
  minStockLevel: { type: Number, required: true, default: 10 },
  unitPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
  location: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

// Supplier Schema
const supplierSchema = new Schema({
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  name: { type: String, required: true },
  contactPerson: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

// Pharmacy Sale Schema
const pharmacySaleSchema = new Schema({
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  saleNumber: { type: String, required: true, unique: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient' },
  type: { type: String, enum: ['internal', 'external'], required: true },
  items: [{
    medicationId: { type: Schema.Types.ObjectId, ref: 'Medication' },
    medicationName: String,
    quantity: Number,
    unitPrice: Number,
    total: Number
  }],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['cash', 'mobile_money', 'card', 'insurance'],
    required: true
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  },
  soldBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  notes: String
}, { timestamps: true })

// Lab Test Schema
const labTestSchema = new Schema({
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  testNumber: { type: String, required: true, unique: true },
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  consultationId: { type: Schema.Types.ObjectId, ref: 'Consultation' },
  testType: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['hematology', 'biochemistry', 'microbiology', 'immunology', 'urinalysis', 'imaging', 'other'],
    required: true
  },
  priority: { 
    type: String, 
    enum: ['routine', 'urgent', 'stat'],
    default: 'routine'
  },
  status: { 
    type: String, 
    enum: ['pending', 'sample_collected', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  sampleType: String,
  sampleCollectedAt: Date,
  sampleCollectedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  results: [{
    parameter: String,
    value: String,
    unit: String,
    referenceRange: String,
    flag: { type: String, enum: ['normal', 'low', 'high', 'critical'] }
  }],
  notes: String,
  completedAt: Date,
  completedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

// Teleconsultation Schema
const teleconsultationSchema = new Schema({
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment' },
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, default: 30 },
  status: { 
    type: String, 
    enum: ['scheduled', 'waiting', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  meetingLink: String,
  meetingId: String,
  notes: String,
  diagnosis: String,
  prescriptions: [{
    medicationName: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String,
    quantity: Number
  }],
  recordingUrl: String,
  startedAt: Date,
  endedAt: Date
}, { timestamps: true })

// Hospital Settings Schema
const hospitalSettingsSchema = new Schema({
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, unique: true },
  general: {
    timezone: { type: String, default: 'Africa/Kinshasa' },
    currency: { type: String, default: 'USD' },
    language: { type: String, default: 'fr' },
    dateFormat: { type: String, default: 'DD/MM/YYYY' }
  },
  billing: {
    taxRate: { type: Number, default: 0 },
    invoicePrefix: { type: String, default: 'INV' },
    paymentTerms: { type: Number, default: 30 },
    enableMobileMoney: { type: Boolean, default: true },
    enableCardPayment: { type: Boolean, default: false },
    enableInsurance: { type: Boolean, default: true }
  },
  appointments: {
    defaultDuration: { type: Number, default: 30 },
    workingHours: [{
      day: String,
      start: String,
      end: String,
      isOpen: Boolean
    }],
    allowOnlineBooking: { type: Boolean, default: true }
  },
  notifications: {
    emailEnabled: { type: Boolean, default: true },
    smsEnabled: { type: Boolean, default: false },
    appointmentReminder: { type: Boolean, default: true },
    reminderHoursBefore: { type: Number, default: 24 }
  }
}, { timestamps: true })

// Insurance Provider Schema
const insuranceProviderSchema = new Schema({
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  name: { type: String, required: true },
  contactEmail: String,
  contactPhone: String,
  coveragePercentage: { type: Number, default: 80 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

// Service Tariff Schema
const serviceTariffSchema = new Schema({
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  serviceName: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['consultation', 'procedure', 'lab_test', 'imaging', 'hospitalization', 'other'],
    required: true
  },
  price: { type: Number, required: true },
  insuranceCovered: { type: Boolean, default: true },
  description: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true })

// Export new models
export const Medication = mongoose.models.Medication || mongoose.model('Medication', medicationSchema)
export const Supplier = mongoose.models.Supplier || mongoose.model('Supplier', supplierSchema)
export const PharmacySale = mongoose.models.PharmacySale || mongoose.model('PharmacySale', pharmacySaleSchema)
export const LabTest = mongoose.models.LabTest || mongoose.model('LabTest', labTestSchema)
export const Teleconsultation = mongoose.models.Teleconsultation || mongoose.model('Teleconsultation', teleconsultationSchema)
export const HospitalSettings = mongoose.models.HospitalSettings || mongoose.model('HospitalSettings', hospitalSettingsSchema)
export const InsuranceProvider = mongoose.models.InsuranceProvider || mongoose.model('InsuranceProvider', insuranceProviderSchema)
export const ServiceTariff = mongoose.models.ServiceTariff || mongoose.model('ServiceTariff', serviceTariffSchema)

// Blog Post Schema
const blogPostSchema = new Schema({
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  title: { type: String, required: true },
  slug: { type: String, required: true },
  excerpt: String,
  content: { type: String, required: true },
  featuredImage: String,
  category: { type: String, default: 'general' },
  tags: [String],
  authorId: { type: Schema.Types.ObjectId, ref: 'User' },
  authorName: String,
  authorImage: String,
  isPublished: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  publishedAt: Date,
  // SEO fields
  metaTitle: String,
  metaDescription: String,
  // Comments
  commentsEnabled: { type: Boolean, default: true },
  comments: [{
    name: String,
    email: String,
    content: String,
    isApproved: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true })

// Ensure unique slug per hospital
blogPostSchema.index({ hospitalId: 1, slug: 1 }, { unique: true })

export const BlogPost = mongoose.models.BlogPost || mongoose.model('BlogPost', blogPostSchema)

// Online Video Consultation Booking Schema
const videoBookingSchema = new Schema({
  hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true },
  clinicSlug: { type: String, required: true },
  // Patient info (can be guest or registered)
  patientId: { type: Schema.Types.ObjectId, ref: 'Patient' },
  patientInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] }
  },
  // Doctor selection
  doctorId: { type: Schema.Types.ObjectId, ref: 'User' },
  preferredDoctor: String,
  // Appointment details
  scheduledDate: { type: Date, required: true },
  scheduledTime: { type: String, required: true },
  duration: { type: Number, default: 30 },
  reason: { type: String, required: true },
  symptoms: [String],
  urgency: { type: String, enum: ['routine', 'urgent', 'emergency'], default: 'routine' },
  // Video call details
  meetingId: { type: String, unique: true, sparse: true },
  meetingLink: String,
  roomId: String,
  // Status tracking
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'paid', 'waiting', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },
  // Payment details
  paymentOption: { 
    type: String, 
    enum: ['pay_now', 'pay_later', 'insurance'],
    required: true
  },
  consultationFee: { type: Number, required: true },
  isPaid: { type: Boolean, default: false },
  paymentDetails: {
    method: { type: String, enum: ['card', 'mobile_money', 'bank_transfer', 'cash'] },
    transactionId: String,
    paidAt: Date,
    amount: Number
  },
  // Insurance info if applicable
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    memberName: String
  },
  // Consultation outcome
  diagnosis: String,
  prescriptions: [{
    medicationName: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String
  }],
  notes: String,
  followUpRecommended: { type: Boolean, default: false },
  followUpDate: Date,
  // Timestamps for tracking
  confirmedAt: Date,
  startedAt: Date,
  endedAt: Date,
  cancelledAt: Date,
  cancelReason: String
}, { timestamps: true })

// Index for efficient queries
videoBookingSchema.index({ hospitalId: 1, scheduledDate: 1 })
videoBookingSchema.index({ clinicSlug: 1, status: 1 })
videoBookingSchema.index({ 'patientInfo.email': 1 })

export const VideoBooking = mongoose.models.VideoBooking || mongoose.model('VideoBooking', videoBookingSchema)
