'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  HeartPulse, 
  CheckCircle2, 
  Copy, 
  ExternalLink,
  LayoutDashboard,
  Settings,
  PenSquare,
  Globe,
  ArrowRight
} from 'lucide-react'

export default function RegistrationSuccessPage() {
  const [clinicData, setClinicData] = useState<{
    name: string
    slug: string
    subscription: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Get clinic data from session storage (set during registration)
    const data = sessionStorage.getItem('newClinic')
    if (data) {
      setClinicData(JSON.parse(data))
    }
  }, [])

  const clinicUrl = clinicData 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/clinic/${clinicData.slug}`
    : ''

  const copyToClipboard = async () => {
    if (clinicUrl) {
      await navigator.clipboard.writeText(clinicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <HeartPulse className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">MediCare Pro</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Success Icon */}
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-foreground">
            Congratulations! Your Clinic is Ready
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            {clinicData?.name || 'Your clinic'} has been successfully created.
          </p>
        </div>

        {/* Clinic URL Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Your Public Clinic Page
            </CardTitle>
            <CardDescription>
              Share this link with patients to let them view your clinic profile and book appointments.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
              <code className="flex-1 text-sm font-medium text-primary">
                {clinicUrl || `${typeof window !== 'undefined' ? window.location.origin : ''}/clinic/your-clinic`}
              </code>
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                {copied ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={clinicUrl || '#'} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
            
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Badge variant="secondary" className="text-xs">Tip</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Customize Your Public Page
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Go to Settings in your dashboard to add your logo, services, doctor profiles, 
                    and customize how patients see your clinic.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>What&apos;s Next?</CardTitle>
            <CardDescription>
              Here are some quick actions to get your clinic up and running.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  icon: Settings,
                  title: 'Customize Your Profile',
                  description: 'Add logo, services, working hours, and more',
                  href: '/dashboard/customize',
                  badge: 'Recommended'
                },
                {
                  icon: PenSquare,
                  title: 'Write Your First Blog Post',
                  description: 'Share health tips and attract patients',
                  href: '/dashboard/blog/new',
                  badge: null
                },
                {
                  icon: LayoutDashboard,
                  title: 'Explore Your Dashboard',
                  description: 'Manage patients, appointments, and more',
                  href: '/dashboard',
                  badge: null
                }
              ].map((action) => (
                <Link 
                  key={action.title} 
                  href={action.href}
                  className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <action.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">{action.title}</h3>
                      {action.badge && (
                        <Badge variant="secondary" className="text-xs">{action.badge}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Go to Dashboard Button */}
        <div className="mt-8 text-center">
          <Button size="lg" asChild>
            <Link href="/dashboard">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
