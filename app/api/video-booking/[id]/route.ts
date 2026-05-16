import { NextRequest, NextResponse } from 'next/server'
import {connectDB }from '@/lib/mongodb'
import { VideoBooking } from '@/lib/models'
import { verifyToken } from '@/lib/auth'

// GET - Get single booking by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params

    // Check if it's a meetingId or MongoDB _id
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id)
    const query = isMongoId ? { _id: id } : { meetingId: id }

    const booking = await VideoBooking.findOne(query)
      .populate('doctorId', 'firstName lastName specialization avatar')
      .populate('patientId', 'firstName lastName patientNumber phone email')
      .populate('hospitalId', 'name logo phone email address')
      .lean()

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: booking })
  } catch (error) {
    console.error('Get video booking error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// PUT - Update booking (admin or for payment confirmation)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const body = await request.json()

    // Check if it's a meetingId or MongoDB _id
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id)
    const query = isMongoId ? { _id: id } : { meetingId: id }

    const booking = await VideoBooking.findOne(query)
    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
    }

    // Handle different update types
    const { action, ...updateData } = body

    if (action === 'confirm_payment') {
      booking.isPaid = true
      booking.status = 'confirmed'
      booking.paymentDetails = {
        method: updateData.paymentMethod,
        transactionId: updateData.transactionId,
        paidAt: new Date(),
        amount: booking.consultationFee
      }
    } else if (action === 'start_call') {
      booking.status = 'in_progress'
      booking.startedAt = new Date()
    } else if (action === 'end_call') {
      booking.status = 'completed'
      booking.endedAt = new Date()
      if (updateData.diagnosis) booking.diagnosis = updateData.diagnosis
      if (updateData.prescriptions) booking.prescriptions = updateData.prescriptions
      if (updateData.notes) booking.notes = updateData.notes
      if (updateData.followUpRecommended !== undefined) {
        booking.followUpRecommended = updateData.followUpRecommended
      }
      if (updateData.followUpDate) booking.followUpDate = updateData.followUpDate
    } else if (action === 'cancel') {
      booking.status = 'cancelled'
      booking.cancelledAt = new Date()
      booking.cancelReason = updateData.cancelReason
    } else if (action === 'join_waiting') {
      booking.status = 'waiting'
    } else if (action === 'confirm') {
      booking.status = 'confirmed'
      booking.confirmedAt = new Date()
    } else {
      // General update
      Object.assign(booking, updateData)
    }

    await booking.save()

    return NextResponse.json({ success: true, data: booking })
  } catch (error) {
    console.error('Update video booking error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Cancel booking
export async function DELETE(
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

    const booking = await VideoBooking.findByIdAndUpdate(
      id,
      { 
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelReason: 'Cancelled by admin'
      },
      { new: true }
    )

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: booking })
  } catch (error) {
    console.error('Cancel video booking error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
