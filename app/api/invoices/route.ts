import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Invoice, Patient } from '@/lib/models'
import { getSession } from '@/lib/auth'

// GET - List invoices
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
    const hospitalId = session.hospitalId

    const query: Record<string, unknown> = {}
    
    if (hospitalId) {
      query.hospitalId = hospitalId
    }

    if (status && status !== 'all') {
      query.status = status
    }

    const total = await Invoice.countDocuments(query)
    const invoices = await Invoice.find(query)
      .populate('patientId', 'firstName lastName patientNumber phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      data: invoices.map(inv => ({
        ...inv,
        patient: inv.patientId,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Invoices GET error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const body = await request.json()

    // Generate invoice number
    const count = await Invoice.countDocuments({ hospitalId: session.hospitalId })
    const year = new Date().getFullYear()
    const invoiceNumber = `INV-${year}-${String(count + 1).padStart(5, '0')}`

    // Calculate totals
    const subtotal = body.items.reduce((sum: number, item: { total: number }) => sum + item.total, 0)
    const tax = body.tax || 0
    const discount = body.discount || 0
    const total = subtotal + tax - discount

    const invoice = await Invoice.create({
      ...body,
      hospitalId: session.hospitalId,
      invoiceNumber,
      subtotal,
      total,
      status: body.status || 'pending'
    })

    return NextResponse.json({
      success: true,
      data: invoice
    }, { status: 201 })
  } catch (error) {
    console.error('Invoices POST error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
