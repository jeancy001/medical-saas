'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Filter, 
  AlertTriangle, 
  Package, 
  Clock, 
  TrendingDown,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Medication } from '@/lib/types'

// Mock data for display
const mockMedications: Medication[] = [
  {
    _id: '1',
    hospitalId: '1',
    name: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin',
    category: 'antibiotics',
    dosageForm: 'capsule',
    strength: '500mg',
    unit: 'capsule',
    manufacturer: 'Pfizer',
    batchNumber: 'AMX-2024-001',
    expiryDate: '2025-06-15',
    stockQuantity: 150,
    minStockLevel: 50,
    unitPrice: 0.5,
    sellingPrice: 0.75,
    isActive: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    _id: '2',
    hospitalId: '1',
    name: 'Paracetamol 500mg',
    genericName: 'Acetaminophen',
    category: 'analgesics',
    dosageForm: 'tablet',
    strength: '500mg',
    unit: 'tablet',
    manufacturer: 'GSK',
    batchNumber: 'PCT-2024-002',
    expiryDate: '2024-12-30',
    stockQuantity: 25,
    minStockLevel: 100,
    unitPrice: 0.1,
    sellingPrice: 0.2,
    isActive: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10'
  },
  {
    _id: '3',
    hospitalId: '1',
    name: 'Metformin 850mg',
    genericName: 'Metformin',
    category: 'other',
    dosageForm: 'tablet',
    strength: '850mg',
    unit: 'tablet',
    manufacturer: 'Merck',
    batchNumber: 'MET-2024-003',
    expiryDate: '2024-08-20',
    stockQuantity: 200,
    minStockLevel: 75,
    unitPrice: 0.3,
    sellingPrice: 0.5,
    isActive: true,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-05'
  },
  {
    _id: '4',
    hospitalId: '1',
    name: 'Omeprazole 20mg',
    genericName: 'Omeprazole',
    category: 'other',
    dosageForm: 'capsule',
    strength: '20mg',
    unit: 'capsule',
    manufacturer: 'AstraZeneca',
    batchNumber: 'OMP-2024-004',
    expiryDate: '2025-03-10',
    stockQuantity: 80,
    minStockLevel: 50,
    unitPrice: 0.4,
    sellingPrice: 0.6,
    isActive: true,
    createdAt: '2024-01-08',
    updatedAt: '2024-01-08'
  },
]

const categories = [
  { value: 'antibiotics', label: 'Antibiotics' },
  { value: 'analgesics', label: 'Analgesics' },
  { value: 'antivirals', label: 'Antivirals' },
  { value: 'vitamins', label: 'Vitamins' },
  { value: 'vaccines', label: 'Vaccines' },
  { value: 'other', label: 'Other' },
]

export default function PharmacyPage() {
  const [medications, setMedications] = useState<Medication[]>(mockMedications)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [activeTab, setActiveTab] = useState('all')
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Calculate statistics
  const lowStockItems = medications.filter(m => m.stockQuantity <= m.minStockLevel)
  const expiringSoon = medications.filter(m => {
    const expiryDate = new Date(m.expiryDate)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return expiryDate <= thirtyDaysFromNow
  })
  const totalValue = medications.reduce((sum, m) => sum + (m.stockQuantity * m.unitPrice), 0)

  // Filter medications
  const filteredMedications = medications.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         m.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         m.batchNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !categoryFilter || categoryFilter === 'all' || m.category === categoryFilter
    
    if (activeTab === 'low-stock') {
      return matchesSearch && matchesCategory && m.stockQuantity <= m.minStockLevel
    }
    if (activeTab === 'expiring') {
      const expiryDate = new Date(m.expiryDate)
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      return matchesSearch && matchesCategory && expiryDate <= thirtyDaysFromNow
    }
    return matchesSearch && matchesCategory
  })

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      antibiotics: 'bg-red-100 text-red-800',
      analgesics: 'bg-blue-100 text-blue-800',
      antivirals: 'bg-purple-100 text-purple-800',
      vitamins: 'bg-green-100 text-green-800',
      vaccines: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    }
    return colors[category] || colors.other
  }

  const getStockStatus = (medication: Medication) => {
    if (medication.stockQuantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    }
    if (medication.stockQuantity <= medication.minStockLevel) {
      return <Badge variant="outline" className="border-orange-500 text-orange-600">Low Stock</Badge>
    }
    return <Badge variant="outline" className="border-green-500 text-green-600">In Stock</Badge>
  }

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return expiry <= thirtyDaysFromNow
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pharmacy</h1>
          <p className="text-muted-foreground">Manage medications, stock, and sales</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild>
            <Link href="/dashboard/pharmacy/sales">View Sales</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/pharmacy/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Medication
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{medications.length}</div>
            <p className="text-xs text-muted-foreground">Active medications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Items need restocking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiringSoon.length}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total inventory value</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="low-stock" className="relative">
              Low Stock
              {lowStockItems.length > 0 && (
                <span className="ml-2 rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">
                  {lowStockItems.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="expiring" className="relative">
              Expiring
              {expiringSoon.length > 0 && (
                <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                  {expiringSoon.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search medications..."
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

      {/* Medications Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medication</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Batch No.</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMedications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No medications found
                  </TableCell>
                </TableRow>
              ) : (
                filteredMedications.map((medication) => (
                  <TableRow key={medication._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{medication.name}</div>
                        <div className="text-sm text-muted-foreground">{medication.genericName}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getCategoryBadge(medication.category)}>
                        {medication.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{medication.batchNumber}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={medication.stockQuantity <= medication.minStockLevel ? 'text-orange-600 font-medium' : ''}>
                          {medication.stockQuantity}
                        </span>
                        <span className="text-muted-foreground text-sm">/ {medication.minStockLevel} min</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={isExpiringSoon(medication.expiryDate) ? 'text-red-600 font-medium' : ''}>
                        {new Date(medication.expiryDate).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>${medication.sellingPrice.toFixed(2)}</TableCell>
                    <TableCell>{getStockStatus(medication)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedMedication(medication)
                            setIsViewDialogOpen(true)
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/pharmacy/${medication._id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
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

      {/* View Medication Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Medication Details</DialogTitle>
          </DialogHeader>
          {selectedMedication && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="font-medium">{selectedMedication.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Generic Name</label>
                  <p>{selectedMedication.genericName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <p className="capitalize">{selectedMedication.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Dosage Form</label>
                  <p className="capitalize">{selectedMedication.dosageForm}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Strength</label>
                  <p>{selectedMedication.strength}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Manufacturer</label>
                  <p>{selectedMedication.manufacturer}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Batch Number</label>
                  <p className="font-mono">{selectedMedication.batchNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Expiry Date</label>
                  <p className={isExpiringSoon(selectedMedication.expiryDate) ? 'text-red-600' : ''}>
                    {new Date(selectedMedication.expiryDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Current Stock</label>
                  <p className={selectedMedication.stockQuantity <= selectedMedication.minStockLevel ? 'text-orange-600 font-medium' : ''}>
                    {selectedMedication.stockQuantity} {selectedMedication.unit}s
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Minimum Stock Level</label>
                  <p>{selectedMedication.minStockLevel} {selectedMedication.unit}s</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Unit Price (Cost)</label>
                  <p>${selectedMedication.unitPrice.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Selling Price</label>
                  <p>${selectedMedication.sellingPrice.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
                <Button asChild>
                  <Link href={`/dashboard/pharmacy/${selectedMedication._id}/edit`}>Edit Medication</Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
