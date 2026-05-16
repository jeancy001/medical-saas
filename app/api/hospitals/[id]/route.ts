import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Hospital } from '@/lib/models'
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

    // Allow super_admin to view any hospital, or hospital_admin to view their own
    if (user.role !== 'super_admin' && user.hospitalId?.toString() !== id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const hospital = await Hospital.findById(id).lean()

    if (!hospital) {
      return NextResponse.json({ success: false, error: 'Hospital not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: hospital })
  } catch (error) {
    console.error('Get hospital error:', error)
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

    // Allow super_admin to update any hospital, or hospital_admin to update their own
    if (user.role !== 'super_admin' && user.hospitalId?.toString() !== id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const hospital = await Hospital.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    )

    if (!hospital) {
      return NextResponse.json({ success: false, error: 'Hospital not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: hospital })
  } catch (error) {
    console.error('Update hospital error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyToken(request)
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const { id } = await params

    const hospital = await Hospital.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    )

    if (!hospital) {
      return NextResponse.json({ success: false, error: 'Hospital not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: 'Hospital deactivated' })
  } catch (error) {
    console.error('Delete hospital error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
