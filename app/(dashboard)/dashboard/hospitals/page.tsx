'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Building2,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Users,
  CheckCircle,
  XCircle
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Hospital } from '@/lib/types'

const mockHospitals: Hospital[] = [
  {
    _id: '1',
    name: 'Centre Hospitalier de Kinshasa',
    address: '123 Avenue de la Liberation',
    city: 'Kinshasa',
    phone: '+243 81 234 5678',
    email: 'contact@chkinshasa.cd',
    subscription: 'premium',
    isActive: true,
    createdAt: '2024-01-01'
  },
  {
    _id: '2',
    name: 'Hopital General de Lubumbashi',
    address: '456 Boulevard du Commerce',
    city: 'Lubumbashi',
    phone: '+243 82 345 6789',
    email: 'info@hglubumbashi.cd',
    subscription: 'standard',
    isActive: true,
    createdAt: '2024-02-15'
  },
  {
    _id: '3',
    name: 'Clinique Saint Joseph',
    address: '789 Rue de la Paix',
    city: 'Goma',
    phone: '+243 83 456 7890',
    email: 'admin@cliniquestjoseph.cd',
    subscription: 'basic',
    isActive: true,
    createdAt: '2024-03-10'
  },
  {
    _id: '4',
    name: 'Centre Medical de Matadi',
    address: '321 Avenue du Port',
    city: 'Matadi',
    phone: '+243 84 567 8901',
    email: 'contact@cmmatadi.cd',
    subscription: 'standard',
    isActive: false,
    createdAt: '2024-01-20'
  },
]

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>(mockHospitals)
  const [searchQuery, setSearchQuery] = useState('')
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>('')
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const filteredHospitals = hospitals.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         h.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubscription = !subscriptionFilter || subscriptionFilter === 'all' || h.subscription === subscriptionFilter
    return matchesSearch && matchesSubscription
  })

  const activeHospitals = hospitals.filter(h => h.isActive).length
  const premiumCount = hospitals.filter(h => h.subscription === 'premium').length
  const standardCount = hospitals.filter(h => h.subscription === 'standard').length
  const basicCount = hospitals.filter(h => h.subscription === 'basic').length

  const getSubscriptionBadge = (subscription: string) => {
    const colors: Record<string, string> = {
      premium: 'bg-purple-100 text-purple-800',
      standard: 'bg-blue-100 text-blue-800',
      basic: 'bg-gray-100 text-gray-800',
    }
    return <Badge variant="secondary" className={colors[subscription]}>{subscription.toUpperCase()}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hospitals Management</h1>
          <p className="text-muted-foreground">Manage all hospitals in the SaaS platform</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/hospitals/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Hospital
          </Link>
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hospitals</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hospitals.length}</div>
            <p className="text-xs text-muted-foreground">{activeHospitals} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium</CardTitle>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">PRE</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{premiumCount}</div>
            <p className="text-xs text-muted-foreground">Full features + Telemedicine</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Standard</CardTitle>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">STD</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{standardCount}</div>
            <p className="text-xs text-muted-foreground">Core hospital features</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Basic</CardTitle>
            <Badge variant="secondary" className="bg-gray-100 text-gray-800">BAS</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{basicCount}</div>
            <p className="text-xs text-muted-foreground">Essential features</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search hospitals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Subscription" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="basic">Basic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Hospitals Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hospital</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHospitals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No hospitals found
                  </TableCell>
                </TableRow>
              ) : (
                filteredHospitals.map((hospital) => (
                  <TableRow key={hospital._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{hospital.name}</div>
                          <div className="text-sm text-muted-foreground">{hospital.address}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{hospital.city}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{hospital.email}</div>
                        <div className="text-muted-foreground">{hospital.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getSubscriptionBadge(hospital.subscription)}</TableCell>
                    <TableCell>
                      {hospital.isActive ? (
                        <Badge variant="outline" className="border-green-500 text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-red-500 text-red-600">
                          <XCircle className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{new Date(hospital.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedHospital(hospital)
                            setIsViewDialogOpen(true)
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/hospitals/${hospital._id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Users className="h-4 w-4 mr-2" />
                            View Staff
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Deactivate
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

      {/* View Hospital Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Hospital Details</DialogTitle>
          </DialogHeader>
          {selectedHospital && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="font-medium">{selectedHospital.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Subscription</label>
                  <div className="mt-1">{getSubscriptionBadge(selectedHospital.subscription)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Address</label>
                  <p>{selectedHospital.address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">City</label>
                  <p>{selectedHospital.city}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p>{selectedHospital.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p>{selectedHospital.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p>{selectedHospital.isActive ? 'Active' : 'Inactive'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p>{new Date(selectedHospital.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
                <Button asChild>
                  <Link href={`/dashboard/hospitals/${selectedHospital._id}/edit`}>Edit Hospital</Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
