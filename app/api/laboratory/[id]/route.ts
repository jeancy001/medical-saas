import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { LabTest } from '@/lib/models'
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

    const labTest = await LabTest.findOne({ 
      _id: id, 
      hospitalId: user.hospitalId 
    })
      .populate('patientId', 'firstName lastName patientNumber dateOfBirth gender')
      .populate('doctorId', 'firstName lastName')
      .lean()

    if (!labTest) {
      return NextResponse.json({ success: false, error: 'Lab test not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: labTest })
  } catch (error) {
    console.error('Get lab test error:', error)
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

    // If completing the test, set completedAt and completedBy
    if (body.status === 'completed') {
      body.completedAt = new Date()
      body.completedBy = user._id
    }

    const labTest = await LabTest.findOneAndUpdate(
      { _id: id, hospitalId: user.hospitalId },
      { $set: body },
      { new: true }
    )
      .populate('patientId', 'firstName lastName patientNumber')
      .populate('doctorId', 'firstName lastName')

    if (!labTest) {
      return NextResponse.json({ success: false, error: 'Lab test not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: labTest })
  } catch (error) {
    console.error('Update lab test error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
