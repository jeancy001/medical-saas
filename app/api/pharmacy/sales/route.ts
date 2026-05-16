import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { PharmacySale, Medication } from '@/lib/models'
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
    const type = searchParams.get('type') || ''
    const status = searchParams.get('status') || ''

    const query: Record<string, unknown> = { hospitalId: user.hospitalId }

    if (type) query.type = type
    if (status) query.status = status

    const total = await PharmacySale.countDocuments(query)
    const sales = await PharmacySale.find(query)
      .populate('patientId', 'firstName lastName patientNumber')
      .populate('soldBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      data: sales,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get sales error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user || !['super_admin', 'hospital_admin', 'pharmacist'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()

    // Generate sale number
    const lastSale = await PharmacySale.findOne({ hospitalId: user.hospitalId })
      .sort({ createdAt: -1 })
    const saleCount = lastSale ? parseInt(lastSale.saleNumber.split('-')[1] || '0') + 1 : 1
    const saleNumber = `PHS-${String(saleCount).padStart(6, '0')}`

    // Update stock for each item
    for (const item of body.items) {
      await Medication.findByIdAndUpdate(
        item.medicationId,
        { $inc: { stockQuantity: -item.quantity } }
      )
    }

    const sale = new PharmacySale({
      ...body,
      hospitalId: user.hospitalId,
      saleNumber,
      soldBy: user._id,
      status: 'completed'
    })

    await sale.save()

    return NextResponse.json({ success: true, data: sale }, { status: 201 })
  } catch (error) {
    console.error('Create sale error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
