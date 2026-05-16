'use client'

import { useState } from 'react'
import { 
  Save, 
  Building2,
  CreditCard,
  Bell,
  Calendar,
  Globe,
  Shield,
  Plus,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

// Mock data
const mockInsuranceProviders = [
  { _id: '1', name: 'SONAS Assurance', coveragePercentage: 80, isActive: true },
  { _id: '2', name: 'Rawbank Health', coveragePercentage: 75, isActive: true },
  { _id: '3', name: 'SIFA Insurance', coveragePercentage: 70, isActive: false },
]

const mockTariffs = [
  { _id: '1', serviceName: 'General Consultation', category: 'consultation', price: 25, isActive: true },
  { _id: '2', serviceName: 'Specialist Consultation', category: 'consultation', price: 50, isActive: true },
  { _id: '3', serviceName: 'Complete Blood Count', category: 'lab_test', price: 15, isActive: true },
  { _id: '4', serviceName: 'X-Ray', category: 'imaging', price: 35, isActive: true },
  { _id: '5', serviceName: 'Ultrasound', category: 'imaging', price: 45, isActive: true },
]

const workingDays = [
  { day: 'Monday', start: '08:00', end: '18:00', isOpen: true },
  { day: 'Tuesday', start: '08:00', end: '18:00', isOpen: true },
  { day: 'Wednesday', start: '08:00', end: '18:00', isOpen: true },
  { day: 'Thursday', start: '08:00', end: '18:00', isOpen: true },
  { day: 'Friday', start: '08:00', end: '18:00', isOpen: true },
  { day: 'Saturday', start: '08:00', end: '14:00', isOpen: true },
  { day: 'Sunday', start: '00:00', end: '00:00', isOpen: false },
]

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [generalSettings, setGeneralSettings] = useState({
    hospitalName: 'Centre Hospitalier de Kinshasa',
    address: '123 Avenue de la Liberation',
    city: 'Kinshasa',
    phone: '+243 81 234 5678',
    email: 'contact@chkinshasa.cd',
    timezone: 'Africa/Kinshasa',
    currency: 'USD',
    language: 'fr',
  })

  const [billingSettings, setBillingSettings] = useState({
    taxRate: 0,
    invoicePrefix: 'INV',
    paymentTerms: 30,
    enableMobileMoney: true,
    enableCardPayment: false,
    enableInsurance: true,
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,
    smsEnabled: false,
    appointmentReminder: true,
    reminderHoursBefore: 24,
  })

  const [appointmentSettings, setAppointmentSettings] = useState({
    defaultDuration: 30,
    allowOnlineBooking: true,
    workingHours: workingDays,
  })

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('Settings saved successfully')
    setIsSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Configure hospital settings and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="tariffs">Tariffs</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Hospital Information
              </CardTitle>
              <CardDescription>Basic hospital details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hospitalName">Hospital Name</Label>
                  <Input
                    id="hospitalName"
                    value={generalSettings.hospitalName}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, hospitalName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={generalSettings.email}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={generalSettings.address}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={generalSettings.city}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, city: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={generalSettings.phone}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Regional Settings
              </CardTitle>
              <CardDescription>Timezone, currency, and language preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select 
                    value={generalSettings.timezone} 
                    onValueChange={(v) => setGeneralSettings(prev => ({ ...prev, timezone: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Kinshasa">Africa/Kinshasa (WAT)</SelectItem>
                      <SelectItem value="Africa/Lubumbashi">Africa/Lubumbashi (CAT)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select 
                    value={generalSettings.currency} 
                    onValueChange={(v) => setGeneralSettings(prev => ({ ...prev, currency: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="CDF">CDF (FC)</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select 
                    value={generalSettings.language} 
                    onValueChange={(v) => setGeneralSettings(prev => ({ ...prev, language: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Billing Configuration
              </CardTitle>
              <CardDescription>Configure invoicing and payment settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    min="0"
                    max="100"
                    value={billingSettings.taxRate}
                    onChange={(e) => setBillingSettings(prev => ({ ...prev, taxRate: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                  <Input
                    id="invoicePrefix"
                    value={billingSettings.invoicePrefix}
                    onChange={(e) => setBillingSettings(prev => ({ ...prev, invoicePrefix: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms (days)</Label>
                  <Input
                    id="paymentTerms"
                    type="number"
                    min="0"
                    value={billingSettings.paymentTerms}
                    onChange={(e) => setBillingSettings(prev => ({ ...prev, paymentTerms: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Payment Methods</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Mobile Money (M-Pesa, Airtel Money)</Label>
                      <p className="text-sm text-muted-foreground">Accept mobile money payments</p>
                    </div>
                    <Switch
                      checked={billingSettings.enableMobileMoney}
                      onCheckedChange={(v) => setBillingSettings(prev => ({ ...prev, enableMobileMoney: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Card Payments (Visa, MasterCard)</Label>
                      <p className="text-sm text-muted-foreground">Accept credit/debit cards</p>
                    </div>
                    <Switch
                      checked={billingSettings.enableCardPayment}
                      onCheckedChange={(v) => setBillingSettings(prev => ({ ...prev, enableCardPayment: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Insurance Billing</Label>
                      <p className="text-sm text-muted-foreground">Enable insurance provider billing</p>
                    </div>
                    <Switch
                      checked={billingSettings.enableInsurance}
                      onCheckedChange={(v) => setBillingSettings(prev => ({ ...prev, enableInsurance: v }))}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insurance Providers */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Insurance Providers
                </CardTitle>
                <CardDescription>Manage accepted insurance providers</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Provider
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Provider Name</TableHead>
                    <TableHead>Coverage %</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockInsuranceProviders.map((provider) => (
                    <TableRow key={provider._id}>
                      <TableCell className="font-medium">{provider.name}</TableCell>
                      <TableCell>{provider.coveragePercentage}%</TableCell>
                      <TableCell>
                        <Badge variant={provider.isActive ? 'outline' : 'secondary'}>
                          {provider.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Settings */}
        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Appointment Configuration
              </CardTitle>
              <CardDescription>Set default appointment duration and booking options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Duration (minutes)</Label>
                  <Select 
                    value={String(appointmentSettings.defaultDuration)} 
                    onValueChange={(v) => setAppointmentSettings(prev => ({ ...prev, defaultDuration: parseInt(v) }))}
                  >
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
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Online Booking</Label>
                    <p className="text-sm text-muted-foreground">Allow patients to book online</p>
                  </div>
                  <Switch
                    checked={appointmentSettings.allowOnlineBooking}
                    onCheckedChange={(v) => setAppointmentSettings(prev => ({ ...prev, allowOnlineBooking: v }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Working Hours</h4>
                <div className="space-y-2">
                  {appointmentSettings.workingHours.map((day, index) => (
                    <div key={day.day} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="w-24">
                        <Switch
                          checked={day.isOpen}
                          onCheckedChange={(v) => {
                            const newHours = [...appointmentSettings.workingHours]
                            newHours[index].isOpen = v
                            setAppointmentSettings(prev => ({ ...prev, workingHours: newHours }))
                          }}
                        />
                      </div>
                      <span className="w-24 font-medium">{day.day}</span>
                      {day.isOpen ? (
                        <>
                          <Input
                            type="time"
                            value={day.start}
                            onChange={(e) => {
                              const newHours = [...appointmentSettings.workingHours]
                              newHours[index].start = e.target.value
                              setAppointmentSettings(prev => ({ ...prev, workingHours: newHours }))
                            }}
                            className="w-32"
                          />
                          <span>to</span>
                          <Input
                            type="time"
                            value={day.end}
                            onChange={(e) => {
                              const newHours = [...appointmentSettings.workingHours]
                              newHours[index].end = e.target.value
                              setAppointmentSettings(prev => ({ ...prev, workingHours: newHours }))
                            }}
                            className="w-32"
                          />
                        </>
                      ) : (
                        <span className="text-muted-foreground">Closed</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Configure how and when notifications are sent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailEnabled}
                    onCheckedChange={(v) => setNotificationSettings(prev => ({ ...prev, emailEnabled: v }))}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                  </div>
                  <Switch
                    checked={notificationSettings.smsEnabled}
                    onCheckedChange={(v) => setNotificationSettings(prev => ({ ...prev, smsEnabled: v }))}
                  />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label>Appointment Reminders</Label>
                    <p className="text-sm text-muted-foreground">Send reminders before appointments</p>
                  </div>
                  <Switch
                    checked={notificationSettings.appointmentReminder}
                    onCheckedChange={(v) => setNotificationSettings(prev => ({ ...prev, appointmentReminder: v }))}
                  />
                </div>
                {notificationSettings.appointmentReminder && (
                  <div className="space-y-2 pl-4">
                    <Label>Reminder Time (hours before)</Label>
                    <Select 
                      value={String(notificationSettings.reminderHoursBefore)} 
                      onValueChange={(v) => setNotificationSettings(prev => ({ ...prev, reminderHoursBefore: parseInt(v) }))}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour before</SelectItem>
                        <SelectItem value="2">2 hours before</SelectItem>
                        <SelectItem value="12">12 hours before</SelectItem>
                        <SelectItem value="24">24 hours before</SelectItem>
                        <SelectItem value="48">48 hours before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tariffs Settings */}
        <TabsContent value="tariffs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Service Tariffs</CardTitle>
                <CardDescription>Set prices for medical services</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTariffs.map((tariff) => (
                    <TableRow key={tariff._id}>
                      <TableCell className="font-medium">{tariff.serviceName}</TableCell>
                      <TableCell className="capitalize">{tariff.category.replace('_', ' ')}</TableCell>
                      <TableCell className="text-right">${tariff.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={tariff.isActive ? 'outline' : 'secondary'}>
                          {tariff.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
