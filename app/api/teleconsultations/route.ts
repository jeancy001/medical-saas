import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Teleconsultation } from '@/lib/models'
import { verifyToken } from '@/lib/auth'
import { randomUUID } from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status') || ''
    const date = searchParams.get('date') || ''

    const query: Record<string, unknown> = { hospitalId: user.hospitalId }

    // If user is a doctor, only show their teleconsultations
    if (user.role === 'doctor') {
      query.doctorId = user._id
    }

    if (status) query.status = status
    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      query.scheduledAt = { $gte: startOfDay, $lte: endOfDay }
    }

    const total = await Teleconsultation.countDocuments(query)
    const teleconsultations = await Teleconsultation.find(query)
      .populate('patientId', 'firstName lastName patientNumber phone email')
      .populate('doctorId', 'firstName lastName specialization')
      .sort({ scheduledAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      data: teleconsultations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get teleconsultations error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user || !['super_admin', 'hospital_admin', 'doctor', 'receptionist'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()

    // Generate meeting ID and link
    const meetingId = randomUUID()
    const meetingLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/telemedicine/room/${meetingId}`

    const teleconsultation = new Teleconsultation({
      ...body,
      hospitalId: user.hospitalId,
      doctorId: body.doctorId || user._id,
      meetingId,
      meetingLink
    })

    await teleconsultation.save()

    // Populate for response
    await teleconsultation.populate('patientId', 'firstName lastName patientNumber phone email')
    await teleconsultation.populate('doctorId', 'firstName lastName specialization')

    return NextResponse.json({ success: true, data: teleconsultation }, { status: 201 })
  } catch (error) {
    console.error('Create teleconsultation error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
