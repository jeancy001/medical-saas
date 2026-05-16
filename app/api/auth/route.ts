import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { User } from '@/lib/models'
import { hashPassword, verifyPassword, generateToken, setAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body
    
    await connectDB()

    if (action === 'register') {
      return handleRegister(body)
    } else if (action === 'login') {
      return handleLogin(body)
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleRegister(body: {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: string
  hospitalId?: string
}) {
  const { email, password, firstName, lastName, role = 'patient', hospitalId } = body

  // Validate required fields
  if (!email || !password || !firstName || !lastName) {
    return NextResponse.json(
      { success: false, error: 'Missing required fields' },
      { status: 400 }
    )
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    return NextResponse.json(
      { success: false, error: 'Email already registered' },
      { status: 409 }
    )
  }

  // Hash password and create user
  const hashedPassword = await hashPassword(password)
  const user = await User.create({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    role,
    hospitalId,
    isActive: true
  })

  // Generate token
  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    hospitalId: user.hospitalId?.toString(),
    firstName: user.firstName,
    lastName: user.lastName
  })

  await setAuthCookie(token)

  return NextResponse.json({
    success: true,
    data: {
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        hospitalId: user.hospitalId
      },
      token
    }
  })
}

async function handleLogin(body: { email: string; password: string }) {
  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: 'Email and password are required' },
      { status: 400 }
    )
  }

  // Find user
  const user = await User.findOne({ email })
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    )
  }

  // Check if user is active
  if (!user.isActive) {
    return NextResponse.json(
      { success: false, error: 'Account is deactivated' },
      { status: 403 }
    )
  }

  // Verify password
  const isValid = await verifyPassword(password, user.password)
  if (!isValid) {
    return NextResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    )
  }

  // Generate token with all user info
  const token = generateToken({
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
    hospitalId: user.hospitalId?.toString(),
    firstName: user.firstName,
    lastName: user.lastName
  })

  await setAuthCookie(token)

  return NextResponse.json({
    success: true,
    data: {
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        hospitalId: user.hospitalId
      },
      token
    }
  })
}
