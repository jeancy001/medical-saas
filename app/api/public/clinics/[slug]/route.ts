import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Hospital, User } from '@/lib/models'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB()
    
    const { slug } = await params

    // Find hospital by slug
    const hospital = await Hospital.findOne({ 
      slug: slug.toLowerCase(),
      isActive: true
    }).lean()

    if (!hospital) {
      return NextResponse.json(
        { error: 'Clinic not found' },
        { status: 404 }
      )
    }

    // Get doctors for this hospital if they have publicDoctors
    let doctors = hospital.publicDoctors || []
    
    // If no public doctors array, fetch from Users
    if (doctors.length === 0) {
      const hospitalDoctors = await User.find({
        hospitalId: hospital._id,
        role: 'doctor',
        isActive: true
      })
      .select('firstName lastName specialization avatar')
      .lean()

      doctors = hospitalDoctors.map(doc => ({
        userId: doc._id,
        displayName: `Dr. ${doc.firstName} ${doc.lastName}`,
        specialization: doc.specialization || 'General Practitioner',
        photo: doc.avatar,
        isVisible: true,
        availableForBooking: true
      }))
    }

    return NextResponse.json({
      success: true,
      data: {
        ...hospital,
        publicDoctors: doctors
      }
    })
  } catch (error) {
    console.error('Error fetching clinic:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clinic' },
      { status: 500 }
    )
  }
}
