'use client'

import { useState } from 'react'
import { 
  Download, 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  Activity,
  FileText,
  Stethoscope,
  Pill,
  TestTube,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

// Mock data for charts
const revenueData = [
  { month: 'Jan', revenue: 12500, consultations: 145, patients: 89 },
  { month: 'Feb', revenue: 15200, consultations: 178, patients: 102 },
  { month: 'Mar', revenue: 18900, consultations: 212, patients: 134 },
  { month: 'Apr', revenue: 16800, consultations: 195, patients: 118 },
  { month: 'May', revenue: 21500, consultations: 248, patients: 156 },
  { month: 'Jun', revenue: 19800, consultations: 225, patients: 142 },
]

const consultationsByType = [
  { name: 'External', value: 450, color: '#0ea5e9' },
  { name: 'Emergency', value: 120, color: '#ef4444' },
  { name: 'Hospitalization', value: 80, color: '#f59e0b' },
  { name: 'Telemedicine', value: 150, color: '#22c55e' },
]

const paymentMethods = [
  { name: 'Cash', value: 45, color: '#22c55e' },
  { name: 'Mobile Money', value: 35, color: '#0ea5e9' },
  { name: 'Insurance', value: 15, color: '#8b5cf6' },
  { name: 'Card', value: 5, color: '#f59e0b' },
]

const topDiseases = [
  { disease: 'Malaria', count: 156, percentage: 24 },
  { disease: 'Upper Respiratory Infection', count: 98, percentage: 15 },
  { disease: 'Typhoid Fever', count: 76, percentage: 12 },
  { disease: 'Hypertension', count: 65, percentage: 10 },
  { disease: 'Diabetes', count: 54, percentage: 8 },
  { disease: 'Gastritis', count: 48, percentage: 7 },
  { disease: 'UTI', count: 42, percentage: 6 },
  { disease: 'Other', count: 117, percentage: 18 },
]

const pharmacyReport = [
  { medication: 'Amoxicillin 500mg', soldQty: 450, revenue: 337.5, stockLevel: 150 },
  { medication: 'Paracetamol 500mg', soldQty: 890, revenue: 178, stockLevel: 25 },
  { medication: 'Metformin 850mg', soldQty: 320, revenue: 160, stockLevel: 200 },
  { medication: 'Omeprazole 20mg', soldQty: 280, revenue: 168, stockLevel: 80 },
  { medication: 'Ciprofloxacin 500mg', soldQty: 210, revenue: 231, stockLevel: 95 },
]

const labTestsReport = [
  { test: 'Complete Blood Count', count: 245, revenue: 2450 },
  { test: 'Malaria Rapid Test', count: 189, revenue: 945 },
  { test: 'Blood Glucose', count: 156, revenue: 780 },
  { test: 'Urinalysis', count: 134, revenue: 670 },
  { test: 'HIV Test', count: 98, revenue: 980 },
]

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('this-month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Calculate totals
  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0)
  const totalConsultations = revenueData.reduce((sum, d) => sum + d.consultations, 0)
  const totalPatients = revenueData.reduce((sum, d) => sum + d.patients, 0)
  const averagePerConsultation = totalRevenue / totalConsultations

  const handleExport = (reportType: string) => {
    // In a real app, this would generate and download a report
    console.log(`Exporting ${reportType} report...`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive hospital statistics and reports</p>
        </div>
        <Button onClick={() => handleExport('comprehensive')}>
          <Download className="h-4 w-4 mr-2" />
          Export All Reports
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>Period</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="this-quarter">This Quarter</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {dateRange === 'custom' && (
              <>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-40"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-40"
                  />
                </div>
                <Button variant="secondary">
                  <Filter className="h-4 w-4 mr-2" />
                  Apply
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12.5% from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultations</CardTitle>
            <Stethoscope className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConsultations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ${averagePerConsultation.toFixed(2)} avg per consultation
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patients Served</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPatients}</div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +8.2% from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">
              32 of 41 beds occupied
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue="financial" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="pharmacy">Pharmacy</TabsTrigger>
          <TabsTrigger value="laboratory">Laboratory</TabsTrigger>
          <TabsTrigger value="diseases">Diseases</TabsTrigger>
        </TabsList>

        {/* Financial Report */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Monthly revenue over time</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleExport('financial')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#0ea5e9" 
                      strokeWidth={2}
                      dot={{ fill: '#0ea5e9' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Revenue distribution by payment type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethods}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {paymentMethods.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Daily Cash Report */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Daily Cash Report</CardTitle>
                <CardDescription>Today&apos;s financial summary</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Print Report
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Cash Received</p>
                  <p className="text-2xl font-bold text-green-600">$1,245.00</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Mobile Money</p>
                  <p className="text-2xl font-bold text-blue-600">$890.00</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Insurance Claims</p>
                  <p className="text-2xl font-bold text-purple-600">$456.00</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Outstanding</p>
                  <p className="text-2xl font-bold text-orange-600">$320.00</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consultations Report */}
        <TabsContent value="consultations" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Consultations by Type</CardTitle>
                  <CardDescription>Distribution of consultation types</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleExport('consultations')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={consultationsByType}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {consultationsByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Consultations</CardTitle>
                <CardDescription>Consultation volume over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="consultations" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Pharmacy Report */}
        <TabsContent value="pharmacy" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pharmacy Sales Report</CardTitle>
                <CardDescription>Top selling medications and stock levels</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleExport('pharmacy')}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medication</TableHead>
                    <TableHead className="text-right">Qty Sold</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pharmacyReport.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.medication}</TableCell>
                      <TableCell className="text-right">{item.soldQty}</TableCell>
                      <TableCell className="text-right">${item.revenue.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{item.stockLevel}</TableCell>
                      <TableCell>
                        {item.stockLevel < 50 ? (
                          <span className="text-orange-600 font-medium">Low Stock</span>
                        ) : (
                          <span className="text-green-600">OK</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Laboratory Report */}
        <TabsContent value="laboratory" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Laboratory Tests Report</CardTitle>
                <CardDescription>Most requested tests and revenue</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleExport('laboratory')}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Name</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {labTestsReport.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.test}</TableCell>
                      <TableCell className="text-right">{item.count}</TableCell>
                      <TableCell className="text-right">${item.revenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Diseases Report */}
        <TabsContent value="diseases" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Disease Statistics</CardTitle>
                <CardDescription>Most common diagnoses</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleExport('diseases')}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Disease</TableHead>
                        <TableHead className="text-right">Cases</TableHead>
                        <TableHead className="text-right">%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topDiseases.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{item.disease}</TableCell>
                          <TableCell className="text-right">{item.count}</TableCell>
                          <TableCell className="text-right">{item.percentage}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={topDiseases.slice(0, 7)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="disease" type="category" width={150} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
