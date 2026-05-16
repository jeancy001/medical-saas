import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Teleconsultation } from '@/lib/models'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const { id } = await params

    const teleconsultation = await Teleconsultation.findOne({ 
      _id: id, 
      hospitalId: user.hospitalId 
    })
      .populate('patientId', 'firstName lastName patientNumber phone email dateOfBirth gender')
      .populate('doctorId', 'firstName lastName specialization')
      .lean()

    if (!teleconsultation) {
      return NextResponse.json({ success: false, error: 'Teleconsultation not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: teleconsultation })
  } catch (error) {
    console.error('Get teleconsultation error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const { id } = await params
    const body = await request.json()

    // Handle status transitions
    if (body.status === 'in_progress' && !body.startedAt) {
      body.startedAt = new Date()
    }
    if (body.status === 'completed' && !body.endedAt) {
      body.endedAt = new Date()
    }

    const teleconsultation = await Teleconsultation.findOneAndUpdate(
      { _id: id, hospitalId: user.hospitalId },
      { $set: body },
      { new: true }
    )
      .populate('patientId', 'firstName lastName patientNumber phone email')
      .populate('doctorId', 'firstName lastName specialization')

    if (!teleconsultation) {
      return NextResponse.json({ success: false, error: 'Teleconsultation not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: teleconsultation })
  } catch (error) {
    console.error('Update teleconsultation error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyToken(request)
    if (!user || !['super_admin', 'hospital_admin', 'doctor'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const { id } = await params

    const teleconsultation = await Teleconsultation.findOneAndUpdate(
      { _id: id, hospitalId: user.hospitalId },
      { $set: { status: 'cancelled' } },
      { new: true }
    )

    if (!teleconsultation) {
      return NextResponse.json({ success: false, error: 'Teleconsultation not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Teleconsultation cancelled' })
  } catch (error) {
    console.error('Cancel teleconsultation error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
