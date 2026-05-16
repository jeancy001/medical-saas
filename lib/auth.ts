import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import type { User, UserRole } from './types'

const JWT_SECRET = process.env.JWT_SECRET || 'clinicdb'
const TOKEN_EXPIRY = '7d'

export interface TokenPayload {
  userId: string
  email: string
  role: UserRole
  hospitalId?: string
  firstName?: string
  lastName?: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

export function verifyTokenString(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

// Verify token from request (cookie or Authorization header)
export async function verifyToken(request: NextRequest): Promise<TokenPayload | null> {
  try {
    // Try to get token from cookie first
    let token = request.cookies.get('auth_token')?.value
    
    // If no cookie, try Authorization header
    if (!token) {
      const authHeader = request.headers.get('Authorization')
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }
    
    if (!token) return null
    
    return verifyTokenString(token)
  } catch {
    return null
  }
}

export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value
  
  if (!token) return null
  
  return verifyTokenString(token)
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('auth_token')
}

// Role-based access control
export const rolePermissions: Record<UserRole, string[]> = {
  super_admin: ['*'],
  hospital_admin: [
    'dashboard:view',
    'users:manage',
    'patients:manage',
    'appointments:manage',
    'consultations:view',
    'billing:manage',
    'reports:view',
    'settings:manage'
  ],
  doctor: [
    'dashboard:view',
    'patients:view',
    'patients:edit',
    'appointments:view',
    'appointments:edit',
    'consultations:manage',
    'prescriptions:manage'
  ],
  nurse: [
    'dashboard:view',
    'patients:view',
    'appointments:view',
    'consultations:view',
    'vitals:manage'
  ],
  pharmacist: [
    'dashboard:view',
    'patients:view',
    'prescriptions:view',
    'pharmacy:manage'
  ],
  accountant: [
    'dashboard:view',
    'billing:manage',
    'reports:view'
  ],
  receptionist: [
    'dashboard:view',
    'patients:create',
    'patients:view',
    'appointments:manage'
  ],
  patient: [
    'appointments:view:own',
    'records:view:own',
    'invoices:view:own'
  ]
}

export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = rolePermissions[role]
  if (permissions.includes('*')) return true
  return permissions.includes(permission)
}
