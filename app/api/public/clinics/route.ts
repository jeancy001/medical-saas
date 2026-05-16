import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { Hospital } from '@/lib/models'

export async function GET(request: Request) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const facilityType = searchParams.get('facilityType') || ''
    const city = searchParams.get('city') || ''
    const specialty = searchParams.get('specialty') || ''
    const featured = searchParams.get('featured') === 'true'
    
    const skip = (page - 1) * limit

    // Build filter query
    const filter: Record<string, unknown> = {
      isActive: true,
      'publicProfile.isPubliclyListed': true
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'publicProfile.tagline': { $regex: search, $options: 'i' } },
        { 'publicProfile.description': { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ]
    }

    if (facilityType) {
      filter['publicProfile.facilityType'] = facilityType
    }

    if (city) {
      filter.city = { $regex: city, $options: 'i' }
    }

    if (specialty) {
      filter['publicProfile.specialties'] = { $in: [specialty] }
    }

    if (featured) {
      filter['publicProfile.featuredOnHomepage'] = true
    }

    // Get hospitals
    const hospitals = await Hospital.find(filter)
      .select('name slug logo coverImage city address phone publicProfile stats')
      .sort({ 'publicProfile.featuredOnHomepage': -1, 'stats.avgRating': -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    // Get total count
    const total = await Hospital.countDocuments(filter)

    // Get unique cities for filter options
    const cities = await Hospital.distinct('city', { 
      isActive: true, 
      'publicProfile.isPubliclyListed': true 
    })

    // Get unique specialties for filter options
    const allSpecialties = await Hospital.aggregate([
      { $match: { isActive: true, 'publicProfile.isPubliclyListed': true } },
      { $unwind: '$publicProfile.specialties' },
      { $group: { _id: '$publicProfile.specialties' } },
      { $sort: { _id: 1 } }
    ])

    return NextResponse.json({
      success: true,
      data: hospitals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        cities: cities.sort(),
        specialties: allSpecialties.map(s => s._id)
      }
    })
  } catch (error) {
    console.error('Error fetching clinics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clinics' },
      { status: 500 }
    )
  }
}
