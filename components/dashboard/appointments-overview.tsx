'use client'

import { Clock, User, MoreHorizontal } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'

const appointments = [
  {
    id: '1',
    patient: 'Marie Kabila',
    time: '09:00',
    type: 'consultation',
    status: 'confirmed',
    doctor: 'Dr. Jean Mukendi'
  },
  {
    id: '2',
    patient: 'Pierre Lumumba',
    time: '09:30',
    type: 'follow_up',
    status: 'in_progress',
    doctor: 'Dr. Sarah Nzuzi'
  },
  {
    id: '3',
    patient: 'Anne Tshisekedi',
    time: '10:00',
    type: 'emergency',
    status: 'scheduled',
    doctor: 'Dr. Jean Mukendi'
  },
  {
    id: '4',
    patient: 'Joseph Kabange',
    time: '10:30',
    type: 'telemedicine',
    status: 'scheduled',
    doctor: 'Dr. Celine Mobutu'
  },
  {
    id: '5',
    patient: 'Grace Kasavubu',
    time: '11:00',
    type: 'consultation',
    status: 'confirmed',
    doctor: 'Dr. Jean Mukendi'
  },
]

const statusColors: Record<string, string> = {
  scheduled: 'bg-secondary text-secondary-foreground',
  confirmed: 'bg-primary/10 text-primary',
  in_progress: 'bg-warning/10 text-warning',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-destructive/10 text-destructive',
}

const typeLabels: Record<string, string> = {
  consultation: 'Consultation',
  follow_up: 'Follow-up',
  emergency: 'Emergency',
  telemedicine: 'Telemedicine',
}

export function AppointmentsOverview() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{"Today's Appointments"}</CardTitle>
          <CardDescription>Upcoming appointments for today</CardDescription>
        </div>
        <Button variant="outline" size="sm">View All</Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px] pr-4">
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div 
                key={appointment.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {appointment.patient.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{appointment.patient}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{appointment.time}</span>
                      <span>•</span>
                      <span>{typeLabels[appointment.type]}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[appointment.status]}>
                    {appointment.status.replace('_', ' ')}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
