'use client'

import { MoreHorizontal, Phone, Mail } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'

const recentPatients = [
  {
    id: '1',
    name: 'Marie Kabila',
    patientNumber: 'PT-2024-001',
    phone: '+243 812 345 678',
    lastVisit: '2024-01-15',
    condition: 'Hypertension'
  },
  {
    id: '2',
    name: 'Pierre Lumumba',
    patientNumber: 'PT-2024-002',
    phone: '+243 813 456 789',
    lastVisit: '2024-01-14',
    condition: 'Diabetes Type 2'
  },
  {
    id: '3',
    name: 'Anne Tshisekedi',
    patientNumber: 'PT-2024-003',
    phone: '+243 814 567 890',
    lastVisit: '2024-01-14',
    condition: 'Prenatal Care'
  },
  {
    id: '4',
    name: 'Joseph Kabange',
    patientNumber: 'PT-2024-004',
    phone: '+243 815 678 901',
    lastVisit: '2024-01-13',
    condition: 'Malaria Recovery'
  },
  {
    id: '5',
    name: 'Grace Kasavubu',
    patientNumber: 'PT-2024-005',
    phone: '+243 816 789 012',
    lastVisit: '2024-01-12',
    condition: 'Post-Surgery'
  },
]

export function RecentPatients() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Patients</CardTitle>
          <CardDescription>Latest patient registrations</CardDescription>
        </div>
        <Button variant="outline" size="sm">View All</Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px] pr-4">
          <div className="space-y-4">
            {recentPatients.map((patient) => (
              <div 
                key={patient.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{patient.name}</p>
                    <p className="text-xs text-muted-foreground">{patient.patientNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm">{patient.condition}</p>
                    <p className="text-xs text-muted-foreground">Last visit: {patient.lastVisit}</p>
                  </div>
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
