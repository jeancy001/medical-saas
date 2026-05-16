import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Medication } from '@/lib/models'
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

    const medication = await Medication.findOne({ 
      _id: id, 
      hospitalId: user.hospitalId 
    }).lean()

    if (!medication) {
      return NextResponse.json({ success: false, error: 'Medication not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: medication })
  } catch (error) {
    console.error('Get medication error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyToken(request)
    if (!user || !['super_admin', 'hospital_admin', 'pharmacist'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const { id } = await params
    const body = await request.json()

    const medication = await Medication.findOneAndUpdate(
      { _id: id, hospitalId: user.hospitalId },
      { $set: body },
      { new: true }
    )

    if (!medication) {
      return NextResponse.json({ success: false, error: 'Medication not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: medication })
  } catch (error) {
    console.error('Update medication error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyToken(request)
    if (!user || !['super_admin', 'hospital_admin', 'pharmacist'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const { id } = await params

    const medication = await Medication.findOneAndUpdate(
      { _id: id, hospitalId: user.hospitalId },
      { $set: { isActive: false } },
      { new: true }
    )

    if (!medication) {
      return NextResponse.json({ success: false, error: 'Medication not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Medication deleted successfully' })
  } catch (error) {
    console.error('Delete medication error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
