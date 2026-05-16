'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Filter, 
  FlaskConical,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Eye,
  Edit,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { LabTest } from '@/lib/types'

const mockLabTests: LabTest[] = [
  {
    _id: '1',
    hospitalId: '1',
    testNumber: 'LAB-000001',
    patientId: '1',
    patient: { _id: '1', firstName: 'Jean', lastName: 'Mukendi', patientNumber: 'PAT-001' } as any,
    doctorId: '1',
    doctor: { _id: '1', firstName: 'Marie', lastName: 'Kabongo' } as any,
    testType: 'Complete Blood Count (CBC)',
    category: 'hematology',
    priority: 'routine',
    status: 'completed',
    sampleType: 'Blood',
    sampleCollectedAt: '2024-01-15T08:30:00',
    results: [
      { parameter: 'WBC', value: '7.5', unit: '10^3/uL', referenceRange: '4.5-11.0', flag: 'normal' },
      { parameter: 'RBC', value: '4.8', unit: '10^6/uL', referenceRange: '4.5-5.5', flag: 'normal' },
      { parameter: 'Hemoglobin', value: '14.2', unit: 'g/dL', referenceRange: '13.5-17.5', flag: 'normal' },
      { parameter: 'Platelets', value: '250', unit: '10^3/uL', referenceRange: '150-400', flag: 'normal' },
    ],
    completedAt: '2024-01-15T14:00:00',
    createdAt: '2024-01-15T08:00:00',
    updatedAt: '2024-01-15T14:00:00'
  },
  {
    _id: '2',
    hospitalId: '1',
    testNumber: 'LAB-000002',
    patientId: '2',
    patient: { _id: '2', firstName: 'Sarah', lastName: 'Mbala', patientNumber: 'PAT-002' } as any,
    doctorId: '1',
    doctor: { _id: '1', firstName: 'Marie', lastName: 'Kabongo' } as any,
    testType: 'Blood Glucose (Fasting)',
    category: 'biochemistry',
    priority: 'urgent',
    status: 'processing',
    sampleType: 'Blood',
    sampleCollectedAt: '2024-01-15T09:00:00',
    createdAt: '2024-01-15T08:30:00',
    updatedAt: '2024-01-15T09:00:00'
  },
  {
    _id: '3',
    hospitalId: '1',
    testNumber: 'LAB-000003',
    patientId: '3',
    patient: { _id: '3', firstName: 'Pierre', lastName: 'Ngoy', patientNumber: 'PAT-003' } as any,
    doctorId: '1',
    doctor: { _id: '1', firstName: 'Marie', lastName: 'Kabongo' } as any,
    testType: 'Urinalysis',
    category: 'urinalysis',
    priority: 'routine',
    status: 'pending',
    sampleType: 'Urine',
    createdAt: '2024-01-15T10:00:00',
    updatedAt: '2024-01-15T10:00:00'
  },
  {
    _id: '4',
    hospitalId: '1',
    testNumber: 'LAB-000004',
    patientId: '4',
    patient: { _id: '4', firstName: 'Marie', lastName: 'Tshombe', patientNumber: 'PAT-004' } as any,
    doctorId: '1',
    doctor: { _id: '1', firstName: 'Marie', lastName: 'Kabongo' } as any,
    testType: 'HIV Antibody Test',
    category: 'immunology',
    priority: 'stat',
    status: 'sample_collected',
    sampleType: 'Blood',
    sampleCollectedAt: '2024-01-15T10:30:00',
    createdAt: '2024-01-15T10:15:00',
    updatedAt: '2024-01-15T10:30:00'
  },
]

const categories = [
  { value: 'hematology', label: 'Hematology' },
  { value: 'biochemistry', label: 'Biochemistry' },
  { value: 'microbiology', label: 'Microbiology' },
  { value: 'immunology', label: 'Immunology' },
  { value: 'urinalysis', label: 'Urinalysis' },
  { value: 'imaging', label: 'Imaging' },
  { value: 'other', label: 'Other' },
]

export default function LaboratoryPage() {
  const [labTests, setLabTests] = useState<LabTest[]>(mockLabTests)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [activeTab, setActiveTab] = useState('all')
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Calculate statistics
  const pendingTests = labTests.filter(t => t.status === 'pending')
  const inProgressTests = labTests.filter(t => ['sample_collected', 'processing'].includes(t.status))
  const completedToday = labTests.filter(t => {
    if (!t.completedAt) return false
    const today = new Date().toDateString()
    return new Date(t.completedAt).toDateString() === today
  })
  const urgentTests = labTests.filter(t => ['urgent', 'stat'].includes(t.priority) && t.status !== 'completed')

  // Filter tests
  const filteredTests = labTests.filter(t => {
    const matchesSearch = t.testNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         t.testType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (t.patient?.firstName + ' ' + t.patient?.lastName).toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !categoryFilter || categoryFilter === 'all' || t.category === categoryFilter
    
    if (activeTab === 'pending') return matchesSearch && matchesCategory && t.status === 'pending'
    if (activeTab === 'in-progress') return matchesSearch && matchesCategory && ['sample_collected', 'processing'].includes(t.status)
    if (activeTab === 'completed') return matchesSearch && matchesCategory && t.status === 'completed'
    return matchesSearch && matchesCategory
  })

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      pending: { variant: 'outline', label: 'Pending' },
      sample_collected: { variant: 'secondary', label: 'Sample Collected' },
      processing: { variant: 'default', label: 'Processing' },
      completed: { variant: 'outline', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    }
    const config = statusConfig[status] || { variant: 'secondary', label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      routine: 'bg-gray-100 text-gray-800',
      urgent: 'bg-orange-100 text-orange-800',
      stat: 'bg-red-100 text-red-800',
    }
    return <Badge variant="secondary" className={colors[priority]}>{priority.toUpperCase()}</Badge>
  }

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      hematology: 'bg-red-100 text-red-800',
      biochemistry: 'bg-blue-100 text-blue-800',
      microbiology: 'bg-green-100 text-green-800',
      immunology: 'bg-purple-100 text-purple-800',
      urinalysis: 'bg-yellow-100 text-yellow-800',
      imaging: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800',
    }
    return colors[category] || colors.other
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Laboratory</h1>
          <p className="text-muted-foreground">Manage lab test requests and results</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/laboratory/new">
            <Plus className="h-4 w-4 mr-2" />
            New Lab Request
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTests.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting sample</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <FlaskConical className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTests.length}</div>
            <p className="text-xs text-muted-foreground">Being processed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedToday.length}</div>
            <p className="text-xs text-muted-foreground">Results ready</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent/STAT</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{urgentTests.length}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="all">All Tests</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Lab Tests Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test #</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Test Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No lab tests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTests.map((test) => (
                  <TableRow key={test._id}>
                    <TableCell className="font-mono">{test.testNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{test.patient?.firstName} {test.patient?.lastName}</div>
                        <div className="text-sm text-muted-foreground">{test.patient?.patientNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>{test.testType}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getCategoryBadge(test.category)}>
                        {test.category}
                      </Badge>
                    </TableCell>
                    <TableCell>{getPriorityBadge(test.priority)}</TableCell>
                    <TableCell>{getStatusBadge(test.status)}</TableCell>
                    <TableCell>{new Date(test.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedTest(test)
                            setIsViewDialogOpen(true)
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {test.status !== 'completed' && (
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/laboratory/${test._id}/results`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Enter Results
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {test.status === 'completed' && (
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              Print Report
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Test Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Lab Test Details - {selectedTest?.testNumber}</DialogTitle>
          </DialogHeader>
          {selectedTest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Patient</label>
                  <p className="font-medium">{selectedTest.patient?.firstName} {selectedTest.patient?.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Doctor</label>
                  <p>Dr. {selectedTest.doctor?.firstName} {selectedTest.doctor?.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Test Type</label>
                  <p>{selectedTest.testType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <p className="capitalize">{selectedTest.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sample Type</label>
                  <p>{selectedTest.sampleType || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedTest.status)}</div>
                </div>
              </div>

              {selectedTest.results && selectedTest.results.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Results</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Parameter</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Reference Range</TableHead>
                        <TableHead>Flag</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTest.results.map((result, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{result.parameter}</TableCell>
                          <TableCell>{result.value}</TableCell>
                          <TableCell>{result.unit}</TableCell>
                          <TableCell>{result.referenceRange}</TableCell>
                          <TableCell>
                            {result.flag && (
                              <Badge variant={result.flag === 'normal' ? 'outline' : 'destructive'}>
                                {result.flag}
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
                {selectedTest.status === 'completed' && (
                  <Button>Print Report</Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
