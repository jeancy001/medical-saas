'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  ArrowLeft,
  ShoppingCart,
  Receipt
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

interface Sale {
  _id: string
  saleNumber: string
  patientName: string | null
  type: 'internal' | 'external'
  items: { medicationName: string; quantity: number; total: number }[]
  total: number
  paymentMethod: string
  status: string
  soldBy: string
  createdAt: string
}

const mockSales: Sale[] = [
  {
    _id: '1',
    saleNumber: 'PHS-000001',
    patientName: 'Jean Mukendi',
    type: 'internal',
    items: [
      { medicationName: 'Amoxicillin 500mg', quantity: 20, total: 15 },
      { medicationName: 'Paracetamol 500mg', quantity: 10, total: 2 },
    ],
    total: 17,
    paymentMethod: 'cash',
    status: 'completed',
    soldBy: 'Dr. Marie',
    createdAt: '2024-01-15T10:30:00'
  },
  {
    _id: '2',
    saleNumber: 'PHS-000002',
    patientName: null,
    type: 'external',
    items: [
      { medicationName: 'Omeprazole 20mg', quantity: 14, total: 8.4 },
    ],
    total: 8.4,
    paymentMethod: 'mobile_money',
    status: 'completed',
    soldBy: 'Jean Pierre',
    createdAt: '2024-01-15T11:45:00'
  },
]

export default function PharmacySalesPage() {
  const [sales] = useState<Sale[]>(mockSales)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('')

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.saleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (sale.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    const matchesType = !typeFilter || typeFilter === 'all' || sale.type === typeFilter
    return matchesSearch && matchesType
  })

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0)
  const internalSales = sales.filter(s => s.type === 'internal').length
  const externalSales = sales.filter(s => s.type === 'external').length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/pharmacy">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Pharmacy Sales</h1>
          <p className="text-muted-foreground">Track and manage medication sales</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/pharmacy/sales/new">
            <Plus className="h-4 w-4 mr-2" />
            New Sale
          </Link>
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Today&apos;s sales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Internal Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{internalSales}</div>
            <p className="text-xs text-muted-foreground">Patient prescriptions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">External Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{externalSales}</div>
            <p className="text-xs text-muted-foreground">Walk-in customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by sale number or patient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sale Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="internal">Internal</SelectItem>
            <SelectItem value="external">External</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sales Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sale #</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Patient/Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Sold By</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No sales found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSales.map((sale) => (
                  <TableRow key={sale._id}>
                    <TableCell className="font-mono">{sale.saleNumber}</TableCell>
                    <TableCell>
                      <Badge variant={sale.type === 'internal' ? 'default' : 'secondary'}>
                        {sale.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{sale.patientName || 'Walk-in Customer'}</TableCell>
                    <TableCell>{sale.items.length} item(s)</TableCell>
                    <TableCell className="font-medium">${sale.total.toFixed(2)}</TableCell>
                    <TableCell className="capitalize">{sale.paymentMethod.replace('_', ' ')}</TableCell>
                    <TableCell>{sale.soldBy}</TableCell>
                    <TableCell>{new Date(sale.createdAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
