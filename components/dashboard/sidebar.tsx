'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Stethoscope, 
  Receipt, 
  FileText,
  Settings,
  Heart,
  UserPlus,
  Building2,
  Pill,
  TestTube,
  Video,
  PenSquare,
  Palette,
  Globe
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'

const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['super_admin', 'hospital_admin', 'doctor', 'nurse', 'pharmacist', 'accountant', 'receptionist']
  },
  {
    title: 'Patients',
    href: '/dashboard/patients',
    icon: Users,
    roles: ['super_admin', 'hospital_admin', 'doctor', 'nurse', 'receptionist']
  },
  {
    title: 'Appointments',
    href: '/dashboard/appointments',
    icon: Calendar,
    roles: ['super_admin', 'hospital_admin', 'doctor', 'nurse', 'receptionist']
  },
  {
    title: 'Consultations',
    href: '/dashboard/consultations',
    icon: Stethoscope,
    roles: ['super_admin', 'hospital_admin', 'doctor', 'nurse']
  },
  {
    title: 'Billing',
    href: '/dashboard/billing',
    icon: Receipt,
    roles: ['super_admin', 'hospital_admin', 'accountant', 'receptionist']
  },
]

const servicesNavItems = [
  {
    title: 'Pharmacy',
    href: '/dashboard/pharmacy',
    icon: Pill,
    roles: ['super_admin', 'hospital_admin', 'pharmacist', 'doctor']
  },
  {
    title: 'Laboratory',
    href: '/dashboard/laboratory',
    icon: TestTube,
    roles: ['super_admin', 'hospital_admin', 'doctor', 'nurse']
  },
  {
    title: 'Telemedicine',
    href: '/dashboard/telemedicine',
    icon: Video,
    roles: ['super_admin', 'hospital_admin', 'doctor']
  },
]

const adminNavItems = [
  {
    title: 'Customize Clinic',
    href: '/dashboard/customize',
    icon: Palette,
    roles: ['super_admin', 'hospital_admin']
  },
  {
    title: 'Blog Management',
    href: '/dashboard/blog',
    icon: PenSquare,
    roles: ['super_admin', 'hospital_admin']
  },
  {
    title: 'Staff Management',
    href: '/dashboard/staff',
    icon: UserPlus,
    roles: ['super_admin', 'hospital_admin']
  },
  {
    title: 'Hospitals',
    href: '/dashboard/hospitals',
    icon: Building2,
    roles: ['super_admin']
  },
  {
    title: 'Reports',
    href: '/dashboard/reports',
    icon: FileText,
    roles: ['super_admin', 'hospital_admin', 'accountant']
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    roles: ['super_admin', 'hospital_admin']
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const userRole = user?.role || 'patient'

  const filterByRole = (items: typeof mainNavItems) => {
    return items.filter(item => item.roles.includes(userRole))
  }

  return (
    <Sidebar variant="inset" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
            <Heart className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sidebar-foreground">MediCare Pro</span>
            <span className="text-xs text-muted-foreground">Hospital Management</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filterByRole(mainNavItems).map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton 
                    asChild
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href} className={cn(
                      "flex items-center gap-3",
                      pathname === item.href && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {filterByRole(servicesNavItems).length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Services</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filterByRole(servicesNavItems).map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild
                      isActive={pathname === item.href}
                    >
                      <Link href={item.href} className={cn(
                        "flex items-center gap-3",
                        pathname === item.href && "bg-sidebar-accent text-sidebar-accent-foreground"
                      )}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {filterByRole(adminNavItems).length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filterByRole(adminNavItems).map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild
                      isActive={pathname === item.href}
                    >
                      <Link href={item.href} className={cn(
                        "flex items-center gap-3",
                        pathname === item.href && "bg-sidebar-accent text-sidebar-accent-foreground"
                      )}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user?.firstName} {user?.lastName}</span>
            <span className="text-xs text-muted-foreground capitalize">{user?.role?.replace('_', ' ')}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
