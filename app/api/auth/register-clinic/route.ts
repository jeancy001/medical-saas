import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { connectDB } from '@/lib/mongodb'
import { Hospital, User } from '@/lib/models'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function POST(request: Request) {
  try {
    await connectDB()
    
    const body = await request.json()
    const {
      // Admin account
      firstName,
      lastName,
      email,
      password,
      phone,
      // Clinic info
      clinicName,
      slug,
      facilityType,
      address,
      city,
      country,
      clinicPhone,
      clinicEmail,
      // Profile
      tagline,
      description,
      specialties,
      // Subscription
      subscription
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Admin account details are required' },
        { status: 400 }
      )
    }

    if (!clinicName || !slug || !address || !city) {
      return NextResponse.json(
        { error: 'Clinic information is required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Check if clinic slug is taken
    const existingHospital = await Hospital.findOne({ slug: slug.toLowerCase() })
    if (existingHospital) {
      return NextResponse.json(
        { error: 'This clinic URL is already taken. Please choose a different one.' },
        { status: 400 }
      )
    }

    // Check if clinic email is taken
    if (clinicEmail) {
      const existingClinicEmail = await Hospital.findOne({ email: clinicEmail.toLowerCase() })
      if (existingClinicEmail) {
        return NextResponse.json(
          { error: 'A clinic with this email already exists' },
          { status: 400 }
        )
      }
    }

    // Create the hospital/clinic
    const hospital = await Hospital.create({
      name: clinicName,
      slug: slug.toLowerCase(),
      subdomain: slug.toLowerCase(), // Use slug as subdomain
      address,
      city,
      country: country || 'DRC',
      phone: clinicPhone || phone,
      email: clinicEmail || email.toLowerCase(),
      subscription: subscription || 'free',
      subscriptionStartDate: new Date(),
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
      publicProfile: {
        tagline: tagline || '',
        description: description || '',
        facilityType: facilityType || 'clinic',
        specialties: specialties || [],
        languages: ['French', 'English'],
        certifications: [],
        achievements: [],
        gallery: [],
        amenities: [],
        insuranceAccepted: [],
        paymentMethods: ['cash', 'mobile_money'],
        isPubliclyListed: true,
        featuredOnHomepage: false,
        workingHours: [
          { day: 'monday', isOpen: true, openTime: '08:00', closeTime: '18:00' },
          { day: 'tuesday', isOpen: true, openTime: '08:00', closeTime: '18:00' },
          { day: 'wednesday', isOpen: true, openTime: '08:00', closeTime: '18:00' },
          { day: 'thursday', isOpen: true, openTime: '08:00', closeTime: '18:00' },
          { day: 'friday', isOpen: true, openTime: '08:00', closeTime: '18:00' },
          { day: 'saturday', isOpen: true, openTime: '08:00', closeTime: '14:00' },
          { day: 'sunday', isOpen: false, openTime: '', closeTime: '' }
        ]
      },
      services: [],
      publicDoctors: [],
      testimonials: [],
      stats: {
        totalPatients: 0,
        totalDoctors: 1,
        totalAppointments: 0,
        avgRating: 0,
        totalReviews: 0
      },
      isActive: true,
      isVerified: false
    })

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create the admin user
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName,
      role: 'hospital_admin',
      hospitalId: hospital._id,
      phone: phone || '',
      isActive: true
    })

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        hospitalId: hospital._id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    return NextResponse.json({
      success: true,
      message: 'Clinic registered successfully',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        hospital: {
          _id: hospital._id,
          name: hospital.name,
          slug: hospital.slug,
          subscription: hospital.subscription
        }
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}
