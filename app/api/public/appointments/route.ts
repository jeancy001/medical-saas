import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Hospital, Appointment } from '@/lib/models'
import mongoose from 'mongoose'

export async function POST(request: Request) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { clinicSlug, name, email, phone, date, time, reason } = body

    // Validate required fields
    if (!clinicSlug || !name || !email || !phone || !date || !time) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      )
    }

    // Find the clinic
    const hospital = await Hospital.findOne({ 
      slug: clinicSlug.toLowerCase(),
      isActive: true
    })

    if (!hospital) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      )
    }

    // Parse date and time
    const appointmentDate = new Date(`${date}T${time}`)
    
    // Validate date is in the future
    if (appointmentDate < new Date()) {
      return NextResponse.json(
        { error: 'Appointment date must be in the future' },
        { status: 400 }
      )
    }

    // Create the appointment request
    const appointment = await Appointment.create({
      hospitalId: hospital._id,
      // For public appointments, we create a guest patient record
      patientId: new mongoose.Types.ObjectId(), // Placeholder for guest
      patientDetails: {
        name,
        email,
        phone,
        isGuest: true
      },
      date: appointmentDate,
      time,
      type: 'consultation',
      status: 'pending',
      reason: reason || 'General consultation',
      notes: `Public booking request from ${name} (${email}, ${phone})`,
      source: 'public_profile',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // TODO: Send email notification to clinic
    // TODO: Send confirmation email to patient

    return NextResponse.json({
      success: true,
      message: 'Appointment request submitted successfully',
      data: {
        appointmentId: appointment._id,
        clinic: hospital.name,
        date: appointmentDate,
        status: 'pending'
      }
    })
  } catch (error) {
    console.error('Appointment booking error:', error)
    return NextResponse.json(
      { error: 'Failed to submit appointment request' },
      { status: 500 }
    )
  }
}
