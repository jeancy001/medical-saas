'use client'

import { 
  Users, 
  Calendar, 
  Stethoscope, 
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/lib/auth-context'
import { RevenueChart } from '@/components/dashboard/charts/revenue-chart'
import { ConsultationsChart } from '@/components/dashboard/charts/consultations-chart'
import { AppointmentsOverview } from '@/components/dashboard/appointments-overview'
import { RecentPatients } from '@/components/dashboard/recent-patients'

// Mock data - replace with real API calls
const stats = {
  totalPatients: 1284,
  patientsChange: 12.5,
  todayAppointments: 24,
  appointmentsChange: -2.3,
  pendingConsultations: 8,
  consultationsChange: 5.1,
  monthlyRevenue: 45750,
  revenueChange: 18.2
}

export default function DashboardPage() {
  const { user } = useAuth()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {getGreeting()}, {user?.firstName || 'Doctor'}
          </h1>
          <p className="text-muted-foreground">
            {"Here's what's happening at your hospital today."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            View Schedule
          </Button>
          <Button>
            <Users className="mr-2 h-4 w-4" />
            New Patient
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Patients"
          value={stats.totalPatients.toLocaleString()}
          change={stats.patientsChange}
          icon={Users}
          trend="up"
        />
        <StatsCard
          title="Today's Appointments"
          value={stats.todayAppointments.toString()}
          change={stats.appointmentsChange}
          icon={Calendar}
          trend="down"
        />
        <StatsCard
          title="Pending Consultations"
          value={stats.pendingConsultations.toString()}
          change={stats.consultationsChange}
          icon={Stethoscope}
          trend="up"
        />
        <StatsCard
          title="Monthly Revenue"
          value={`$${(stats.monthlyRevenue / 1000).toFixed(1)}K`}
          change={stats.revenueChange}
          icon={DollarSign}
          trend="up"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue for the current year</CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Consultations by Type</CardTitle>
            <CardDescription>Distribution of consultation types</CardDescription>
          </CardHeader>
          <CardContent>
            <ConsultationsChart />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <AppointmentsOverview />
        <RecentPatients />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <QuickAction
              icon={Users}
              title="Register Patient"
              description="Add a new patient record"
              href="/dashboard/patients/new"
            />
            <QuickAction
              icon={Calendar}
              title="Schedule Appointment"
              description="Book a new appointment"
              href="/dashboard/appointments/new"
            />
            <QuickAction
              icon={Stethoscope}
              title="Start Consultation"
              description="Begin a new consultation"
              href="/dashboard/consultations/new"
            />
            <QuickAction
              icon={DollarSign}
              title="Create Invoice"
              description="Generate a new invoice"
              href="/dashboard/billing/new"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: string
  change: number
  icon: React.ElementType
  trend: 'up' | 'down'
}

function StatsCard({ title, value, change, icon: Icon, trend }: StatsCardProps) {
  const isPositive = change > 0

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <Badge 
            variant={isPositive ? 'default' : 'destructive'}
            className="flex items-center gap-1"
          >
            {isPositive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(change)}%
          </Badge>
        </div>
        <div className="mt-4">
          <h3 className="text-2xl font-bold">{value}</h3>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  )
}

interface QuickActionProps {
  icon: React.ElementType
  title: string
  description: string
  href: string
}

function QuickAction({ icon: Icon, title, description, href }: QuickActionProps) {
  return (
    <a 
      href={href}
      className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </a>
  )
}
