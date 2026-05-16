import { NextRequest, NextResponse } from 'next/server'
import {connectDB} from '@/lib/mongodb'
import { VideoBooking, Hospital } from '@/lib/models'
import { verifyToken } from '@/lib/auth'
import { nanoid } from 'nanoid'

// POST - Create a new video consultation booking (public)
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const body = await request.json()

    const {
      clinicSlug,
      patientInfo,
      scheduledDate,
      scheduledTime,
      duration,
      reason,
      symptoms,
      urgency,
      paymentOption,
      consultationFee,
      insuranceInfo,
      doctorId
    } = body

    // Find the hospital by slug
    const hospital = await Hospital.findOne({ slug: clinicSlug })
    if (!hospital) {
      return NextResponse.json({ success: false, error: 'Clinic not found' }, { status: 404 })
    }

    // Generate unique meeting ID
    const meetingId = `vc-${nanoid(10)}`
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const meetingLink = `${baseUrl}/video-call/${meetingId}`

    // Create the booking
    const booking = await VideoBooking.create({
      hospitalId: hospital._id,
      clinicSlug,
      patientInfo,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      duration: duration || 30,
      reason,
      symptoms: symptoms || [],
      urgency: urgency || 'routine',
      paymentOption,
      consultationFee,
      insuranceInfo,
      doctorId,
      meetingId,
      meetingLink,
      roomId: meetingId,
      status: paymentOption === 'pay_now' ? 'pending' : 'confirmed',
      isPaid: false
    })

    return NextResponse.json({ 
      success: true, 
      data: booking,
      meetingLink,
      meetingId
    }, { status: 201 })
  } catch (error) {
    console.error('Create video booking error:', error)
    return NextResponse.json({ success: false, error: 'Failed to create booking' }, { status: 500 })
  }
}

// GET - List video bookings (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const date = searchParams.get('date')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const query: Record<string, unknown> = { hospitalId: user.hospitalId }
    
    if (status && status !== 'all') {
      query.status = status
    }
    
    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      query.scheduledDate = { $gte: startOfDay, $lte: endOfDay }
    }

    const total = await VideoBooking.countDocuments(query)
    const bookings = await VideoBooking.find(query)
      .populate('doctorId', 'firstName lastName specialization')
      .populate('patientId', 'firstName lastName patientNumber')
      .sort({ scheduledDate: 1, scheduledTime: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get video bookings error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
