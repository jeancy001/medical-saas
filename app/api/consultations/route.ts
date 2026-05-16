import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Consultation, Patient, User } from '@/lib/models'
import { getSession } from '@/lib/auth'

// GET - List consultations
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const hospitalId = session.hospitalId

    const query: Record<string, unknown> = {}
    
    if (hospitalId) {
      query.hospitalId = hospitalId
    }

    if (status && status !== 'all') {
      query.status = status
    }

    if (type && type !== 'all') {
      query.type = type
    }

    // If user is a doctor, only show their consultations
    if (session.role === 'doctor') {
      query.doctorId = session.userId
    }

    const total = await Consultation.countDocuments(query)
    const consultations = await Consultation.find(query)
      .populate('patientId', 'firstName lastName patientNumber phone')
      .populate('doctorId', 'firstName lastName specialization')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      data: consultations.map(c => ({
        ...c,
        patient: c.patientId,
        doctor: c.doctorId,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Consultations GET error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new consultation
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const body = await request.json()

    const consultation = await Consultation.create({
      ...body,
      hospitalId: session.hospitalId,
      doctorId: session.role === 'doctor' ? session.userId : body.doctorId,
      status: 'in_progress'
    })

    return NextResponse.json({
      success: true,
      data: consultation
    }, { status: 201 })
  } catch (error) {
    console.error('Consultations POST error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
