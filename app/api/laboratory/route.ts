import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { LabTest } from '@/lib/models'
import { verifyToken } from '@/lib/auth'

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
    const category = searchParams.get('category') || ''
    const priority = searchParams.get('priority') || ''

    const query: Record<string, unknown> = { hospitalId: user.hospitalId }

    if (status) query.status = status
    if (category) query.category = category
    if (priority) query.priority = priority

    const total = await LabTest.countDocuments(query)
    const tests = await LabTest.find(query)
      .populate('patientId', 'firstName lastName patientNumber')
      .populate('doctorId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      data: tests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get lab tests error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user || !['super_admin', 'hospital_admin', 'doctor', 'nurse'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()

    // Generate test number
    const lastTest = await LabTest.findOne({ hospitalId: user.hospitalId })
      .sort({ createdAt: -1 })
    const testCount = lastTest ? parseInt(lastTest.testNumber.split('-')[1] || '0') + 1 : 1
    const testNumber = `LAB-${String(testCount).padStart(6, '0')}`

    const labTest = new LabTest({
      ...body,
      hospitalId: user.hospitalId,
      testNumber,
      doctorId: user._id
    })

    await labTest.save()

    return NextResponse.json({ success: true, data: labTest }, { status: 201 })
  } catch (error) {
    console.error('Create lab test error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
