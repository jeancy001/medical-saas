import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Appointment, Patient, User } from '@/lib/models'
import { getSession } from '@/lib/auth'

// GET - List appointments
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
    const date = searchParams.get('date')
    const status = searchParams.get('status')
    const doctorId = searchParams.get('doctorId')
    const hospitalId = session.hospitalId

    const query: Record<string, unknown> = {}
    
    if (hospitalId) {
      query.hospitalId = hospitalId
    }

    if (date) {
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)
      query.date = { $gte: startDate, $lte: endDate }
    }

    if (status && status !== 'all') {
      query.status = status
    }

    if (doctorId) {
      query.doctorId = doctorId
    }

    // If user is a doctor, only show their appointments
    if (session.role === 'doctor') {
      query.doctorId = session.userId
    }

    const total = await Appointment.countDocuments(query)
    const appointments = await Appointment.find(query)
      .populate('patientId', 'firstName lastName patientNumber phone')
      .populate('doctorId', 'firstName lastName specialization')
      .sort({ date: 1, startTime: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      data: appointments.map(apt => ({
        ...apt,
        patient: apt.patientId,
        doctor: apt.doctorId,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Appointments GET error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new appointment
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const body = await request.json()

    // Check for conflicting appointments
    const conflictingAppointment = await Appointment.findOne({
      doctorId: body.doctorId,
      date: new Date(body.date),
      startTime: body.startTime,
      status: { $nin: ['cancelled', 'no_show'] }
    })

    if (conflictingAppointment) {
      return NextResponse.json({
        success: false,
        error: 'Doctor already has an appointment at this time'
      }, { status: 409 })
    }

    const appointment = await Appointment.create({
      ...body,
      hospitalId: session.hospitalId,
      status: body.status || 'scheduled'
    })

    return NextResponse.json({
      success: true,
      data: appointment
    }, { status: 201 })
  } catch (error) {
    console.error('Appointments POST error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
