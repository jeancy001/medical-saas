'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  Video,
  Clock,
  CheckCircle,
  Users,
  MoreHorizontal,
  Eye,
  Play,
  X,
  Calendar,
  Phone,
  Mail,
  DollarSign,
  ExternalLink,
  Loader2,
  RefreshCw
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
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface VideoBooking {
  _id: string
  patientInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
  }
  doctorId?: {
    _id: string
    firstName: string
    lastName: string
    specialization: string
  }
  scheduledDate: string
  scheduledTime: string
  duration: number
  reason: string
  symptoms: string[]
  urgency: string
  status: string
  paymentOption: string
  consultationFee: number
  isPaid: boolean
  meetingLink: string
  meetingId: string
  diagnosis?: string
  notes?: string
  startedAt?: string
  endedAt?: string
  createdAt: string
}

export default function TelemedicinePage() {
  const [bookings, setBookings] = useState<VideoBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState<VideoBooking | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false)
  const [isEndCallDialogOpen, setIsEndCallDialogOpen] = useState(false)
  const [endCallNotes, setEndCallNotes] = useState({ diagnosis: '', notes: '' })
  const [actionLoading, setActionLoading] = useState(false)

  // Fetch bookings
  const fetchBookings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/video-booking')
      const data = await response.json()
      if (data.success) {
        setBookings(data.data)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  // Calculate statistics
  const today = new Date().toDateString()
  const scheduledToday = bookings.filter(b => {
    const bookingDate = new Date(b.scheduledDate).toDateString()
    return bookingDate === today && ['pending', 'confirmed', 'paid', 'waiting'].includes(b.status)
  })
  const waitingNow = bookings.filter(b => b.status === 'waiting')
  const inProgress = bookings.filter(b => b.status === 'in_progress')
  const completedToday = bookings.filter(b => {
    if (!b.endedAt) return false
    return new Date(b.endedAt).toDateString() === today
  })

  // Filter bookings
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      `${b.patientInfo.firstName} ${b.patientInfo.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.patientInfo.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (activeTab === 'upcoming') return matchesSearch && ['pending', 'confirmed', 'paid', 'waiting'].includes(b.status)
    if (activeTab === 'in-progress') return matchesSearch && b.status === 'in_progress'
    if (activeTab === 'completed') return matchesSearch && b.status === 'completed'
    return matchesSearch
  })

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string, className?: string }> = {
      pending: { variant: 'outline', label: 'Pending' },
      confirmed: { variant: 'outline', label: 'Confirmed', className: 'border-blue-500 text-blue-600' },
      paid: { variant: 'default', label: 'Paid', className: 'bg-green-500 hover:bg-green-500' },
      waiting: { variant: 'default', label: 'Waiting', className: 'bg-yellow-500 hover:bg-yellow-500' },
      in_progress: { variant: 'default', label: 'In Progress', className: 'bg-blue-500 hover:bg-blue-500' },
      completed: { variant: 'secondary', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
      no_show: { variant: 'destructive', label: 'No Show' },
    }
    const config = statusConfig[status] || { variant: 'secondary', label: status }
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>
  }

  const getPaymentBadge = (booking: VideoBooking) => {
    if (booking.isPaid) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge>
    }
    if (booking.paymentOption === 'pay_later') {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pay Later</Badge>
    }
    if (booking.paymentOption === 'insurance') {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Insurance</Badge>
    }
    return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Unpaid</Badge>
  }

  const formatTime = (timeString: string) => {
    return timeString
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Action handlers
  const handleConfirm = async (booking: VideoBooking) => {
    setActionLoading(true)
    try {
      await fetch(`/api/video-booking/${booking._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm' })
      })
      fetchBookings()
    } catch (error) {
      console.error('Error confirming:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleStartCall = async (booking: VideoBooking) => {
    setActionLoading(true)
    try {
      await fetch(`/api/video-booking/${booking._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start_call' })
      })
      // Open video call in new tab
      window.open(booking.meetingLink, '_blank')
      fetchBookings()
    } catch (error) {
      console.error('Error starting call:', error)
    } finally {
      setActionLoading(false)
      setIsJoinDialogOpen(false)
    }
  }

  const handleEndCall = async () => {
    if (!selectedBooking) return
    setActionLoading(true)
    try {
      await fetch(`/api/video-booking/${selectedBooking._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'end_call',
          diagnosis: endCallNotes.diagnosis,
          notes: endCallNotes.notes
        })
      })
      setIsEndCallDialogOpen(false)
      setEndCallNotes({ diagnosis: '', notes: '' })
      fetchBookings()
    } catch (error) {
      console.error('Error ending call:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async (booking: VideoBooking) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    setActionLoading(true)
    try {
      await fetch(`/api/video-booking/${booking._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', cancelReason: 'Cancelled by admin' })
      })
      fetchBookings()
    } catch (error) {
      console.error('Error cancelling:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleJoinCall = (booking: VideoBooking) => {
    setSelectedBooking(booking)
    setIsJoinDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Telemedicine</h1>
          <p className="text-muted-foreground">Manage video consultations with patients</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchBookings} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button asChild>
            <Link href="/dashboard/telemedicine/new">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Consultation
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledToday.length}</div>
            <p className="text-xs text-muted-foreground">Upcoming consultations</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waiting Room</CardTitle>
            <Users className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{waitingNow.length}</div>
            <p className="text-xs text-muted-foreground">Patients waiting</p>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Video className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgress.length}</div>
            <p className="text-xs text-muted-foreground">Active calls</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedToday.length}</div>
            <p className="text-xs text-muted-foreground">Finished consultations</p>
          </CardContent>
        </Card>
      </div>

      {/* Waiting Room Alert */}
      {waitingNow.length > 0 && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium">Patients in Waiting Room</p>
                  <p className="text-sm text-muted-foreground">{waitingNow.length} patient(s) waiting for their consultation</p>
                </div>
              </div>
              <Button onClick={() => handleJoinCall(waitingNow[0])}>
                <Video className="h-4 w-4 mr-2" />
                Join Next Call
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No video consultations found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback>
                              {booking.patientInfo.firstName[0]}{booking.patientInfo.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{booking.patientInfo.firstName} {booking.patientInfo.lastName}</div>
                            <div className="text-sm text-muted-foreground">{booking.patientInfo.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{formatDate(booking.scheduledDate)}</div>
                          <div className="text-sm text-muted-foreground">{formatTime(booking.scheduledTime)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate" title={booking.reason}>
                          {booking.reason}
                        </div>
                        {booking.urgency !== 'routine' && (
                          <Badge variant={booking.urgency === 'emergency' ? 'destructive' : 'default'} className="mt-1">
                            {booking.urgency}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getPaymentBadge(booking)}
                          <div className="text-sm text-muted-foreground">${booking.consultationFee}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedBooking(booking)
                              setIsViewDialogOpen(true)
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            
                            {booking.status === 'pending' && (
                              <DropdownMenuItem onClick={() => handleConfirm(booking)}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirm Booking
                              </DropdownMenuItem>
                            )}
                            
                            {['confirmed', 'paid', 'waiting'].includes(booking.status) && (
                              <DropdownMenuItem onClick={() => handleJoinCall(booking)}>
                                <Play className="h-4 w-4 mr-2" />
                                Start Call
                              </DropdownMenuItem>
                            )}
                            
                            {booking.status === 'in_progress' && (
                              <>
                                <DropdownMenuItem onClick={() => window.open(booking.meetingLink, '_blank')}>
                                  <Video className="h-4 w-4 mr-2" />
                                  Rejoin Call
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setSelectedBooking(booking)
                                  setIsEndCallDialogOpen(true)
                                }}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  End & Complete
                                </DropdownMenuItem>
                              </>
                            )}
                            
                            <DropdownMenuSeparator />
                            
                            {['pending', 'confirmed', 'paid'].includes(booking.status) && (
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleCancel(booking)}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancel
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
          )}
        </CardContent>
      </Card>

      {/* View Booking Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Patient</label>
                  <p className="font-medium">{selectedBooking.patientInfo.firstName} {selectedBooking.patientInfo.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {selectedBooking.patientInfo.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {selectedBooking.patientInfo.phone}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Scheduled</label>
                  <p>{formatDate(selectedBooking.scheduledDate)} at {selectedBooking.scheduledTime}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Duration</label>
                  <p>{selectedBooking.duration} minutes</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment</label>
                  <div className="flex items-center gap-2">
                    {getPaymentBadge(selectedBooking)}
                    <span className="text-sm">${selectedBooking.consultationFee}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Urgency</label>
                  <p className="capitalize">{selectedBooking.urgency}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Reason for Consultation</label>
                <p className="mt-1">{selectedBooking.reason}</p>
              </div>

              {selectedBooking.symptoms.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Symptoms</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedBooking.symptoms.map((symptom, i) => (
                      <Badge key={i} variant="outline">{symptom}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedBooking.diagnosis && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Diagnosis</label>
                  <p className="mt-1">{selectedBooking.diagnosis}</p>
                </div>
              )}

              {selectedBooking.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notes</label>
                  <p className="mt-1">{selectedBooking.notes}</p>
                </div>
              )}

              <div className="rounded-lg bg-muted p-4">
                <label className="text-sm font-medium text-muted-foreground">Meeting Link</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 text-sm bg-background px-2 py-1 rounded break-all">{selectedBooking.meetingLink}</code>
                  <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(selectedBooking.meetingLink)}>
                    Copy
                  </Button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Close</Button>
                {['confirmed', 'paid', 'waiting'].includes(selectedBooking.status) && (
                  <Button onClick={() => {
                    setIsViewDialogOpen(false)
                    handleJoinCall(selectedBooking)
                  }}>
                    <Video className="h-4 w-4 mr-2" />
                    Start Call
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Join Call Dialog */}
      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Video Consultation</DialogTitle>
            <DialogDescription>
              You are about to start a video call with {selectedBooking?.patientInfo.firstName} {selectedBooking?.patientInfo.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Meeting Link</p>
              <code className="text-sm break-all">{selectedBooking?.meetingLink}</code>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsJoinDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => selectedBooking && handleStartCall(selectedBooking)} disabled={actionLoading}>
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Video className="h-4 w-4 mr-2" />
                )}
                Join Call
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* End Call Dialog */}
      <Dialog open={isEndCallDialogOpen} onOpenChange={setIsEndCallDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Consultation</DialogTitle>
            <DialogDescription>
              Add diagnosis and notes for this consultation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Input
                id="diagnosis"
                value={endCallNotes.diagnosis}
                onChange={(e) => setEndCallNotes(prev => ({ ...prev, diagnosis: e.target.value }))}
                placeholder="Enter diagnosis..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={endCallNotes.notes}
                onChange={(e) => setEndCallNotes(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsEndCallDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleEndCall} disabled={actionLoading}>
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Complete Consultation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
