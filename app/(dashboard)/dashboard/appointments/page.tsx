'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns'
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  User,
  MoreHorizontal,
  Filter
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import type { Appointment } from '@/lib/types'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const statusColors: Record<string, string> = {
  scheduled: 'bg-secondary text-secondary-foreground',
  confirmed: 'bg-primary/10 text-primary',
  in_progress: 'bg-warning/10 text-warning-foreground border-warning',
  completed: 'bg-success/10 text-success-foreground border-success',
  cancelled: 'bg-destructive/10 text-destructive',
  no_show: 'bg-muted text-muted-foreground',
}

const typeColors: Record<string, string> = {
  consultation: 'bg-chart-1/10 text-chart-1 border-chart-1',
  follow_up: 'bg-chart-2/10 text-chart-2 border-chart-2',
  emergency: 'bg-destructive/10 text-destructive border-destructive',
  telemedicine: 'bg-chart-3/10 text-chart-3 border-chart-3',
}

export default function AppointmentsPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [view, setView] = useState<'list' | 'calendar'>('list')

  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  const { data, error, isLoading, mutate } = useSWR(
    `/api/appointments?date=${dateStr}&status=${statusFilter}`,
    fetcher
  )

  const appointments: Appointment[] = data?.data || []

  const handleStatusChange = async (id: string, newStatus: string) => {
    await fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    mutate()
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const days = direction === 'prev' ? -7 : 7
    setSelectedDate(prev => addDays(prev, days))
  }

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Group appointments by time
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">
            Schedule and manage patient appointments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/dashboard/appointments/new">
              <Plus className="mr-2 h-4 w-4" />
              New Appointment
            </Link>
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="min-w-[200px]">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, 'MMMM d, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="icon" onClick={() => navigateWeek('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => setSelectedDate(new Date())}>
                Today
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'calendar')}>
                <TabsList>
                  <TabsTrigger value="list">List</TabsTrigger>
                  <TabsTrigger value="calendar">Week</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Week View */}
      {view === 'calendar' && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-8 gap-2">
              {/* Time column */}
              <div className="space-y-2">
                <div className="h-12" /> {/* Header spacer */}
                {timeSlots.map((time) => (
                  <div key={time} className="h-16 text-xs text-muted-foreground text-right pr-2 pt-1">
                    {time}
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {weekDays.map((day) => (
                <div key={day.toISOString()} className="space-y-2">
                  <div className={cn(
                    "h-12 flex flex-col items-center justify-center rounded-lg",
                    isSameDay(day, new Date()) && "bg-primary text-primary-foreground",
                    isSameDay(day, selectedDate) && !isSameDay(day, new Date()) && "bg-secondary"
                  )}>
                    <span className="text-xs">{format(day, 'EEE')}</span>
                    <span className="text-lg font-semibold">{format(day, 'd')}</span>
                  </div>
                  {timeSlots.map((time) => {
                    const dayAppointments = appointments.filter(
                      apt => apt.startTime === time && isSameDay(parseISO(apt.date), day)
                    )
                    return (
                      <div key={`${day.toISOString()}-${time}`} className="h-16 border border-dashed border-border rounded p-1">
                        {dayAppointments.map((apt) => (
                          <div 
                            key={apt._id}
                            className={cn(
                              "text-xs p-1 rounded truncate cursor-pointer",
                              typeColors[apt.type]
                            )}
                          >
                            {apt.patient?.firstName} {apt.patient?.lastName?.charAt(0)}.
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {view === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle>Appointments for {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
            <CardDescription>
              {appointments.length} appointments scheduled
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No appointments for this date.
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div 
                      key={appointment._id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-secondary">
                          <Clock className="h-4 w-4 text-muted-foreground mb-1" />
                          <span className="text-sm font-medium">{appointment.startTime}</span>
                          <span className="text-xs text-muted-foreground">{appointment.endTime}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {appointment.patient?.firstName?.[0]}{appointment.patient?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {appointment.patient?.firstName} {appointment.patient?.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.patient?.patientNumber}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={typeColors[appointment.type]}>
                                {appointment.type.replace('_', ' ')}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                with Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Select 
                          value={appointment.status} 
                          onValueChange={(value) => handleStatusChange(appointment._id, value)}
                        >
                          <SelectTrigger className={cn("w-[130px]", statusColors[appointment.status])}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="no_show">No Show</SelectItem>
                          </SelectContent>
                        </Select>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/consultations/new?appointmentId=${appointment._id}`}>
                                Start Consultation
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/appointments/${appointment._id}/edit`}>
                                Edit Appointment
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/patients/${appointment.patientId}`}>
                                View Patient
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
