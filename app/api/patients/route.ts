import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Patient } from '@/lib/models'
import { getSession } from '@/lib/auth'

// GET - List patients with pagination and search
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
    const search = searchParams.get('search') || ''
    const hospitalId = session.hospitalId

    const query: Record<string, unknown> = {}
    
    if (hospitalId) {
      query.hospitalId = hospitalId
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { patientNumber: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ]
    }

    const total = await Patient.countDocuments(query)
    const patients = await Patient.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      data: patients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Patients GET error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new patient
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const body = await request.json()

    // Generate patient number
    const count = await Patient.countDocuments({ hospitalId: session.hospitalId })
    const year = new Date().getFullYear()
    const patientNumber = `PT-${year}-${String(count + 1).padStart(4, '0')}`

    const patient = await Patient.create({
      ...body,
      hospitalId: session.hospitalId,
      patientNumber,
    })

    return NextResponse.json({
      success: true,
      data: patient
    }, { status: 201 })
  } catch (error) {
    console.error('Patients POST error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
