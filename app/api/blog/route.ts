import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { BlogPost, Hospital } from '@/lib/models'
import { verifyToken } from '@/lib/auth'

// GET - Fetch blog posts (admin or public)
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const hospitalId = searchParams.get('hospitalId')
    const slug = searchParams.get('slug')
    const isPublic = searchParams.get('public') === 'true'
    const featured = searchParams.get('featured') === 'true'
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    
    // Build query
    const query: Record<string, unknown> = {}
    
    if (hospitalId) {
      query.hospitalId = hospitalId
    }
    
    if (slug) {
      query.slug = slug
    }
    
    // Public requests only see published posts
    if (isPublic) {
      query.isPublished = true
    }
    
    if (featured) {
      query.isFeatured = true
    }
    
    const skip = (page - 1) * limit
    
    const [posts, total] = await Promise.all([
      BlogPost.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BlogPost.countDocuments(query)
    ])
    
    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get blog posts error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new blog post
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    
    // Only hospital_admin or super_admin can create posts
    if (!['super_admin', 'hospital_admin'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    
    if (!user.hospitalId) {
      return NextResponse.json({ success: false, error: 'No hospital assigned' }, { status: 400 })
    }
    
    await connectDB()
    const body = await request.json()
    
    // Generate slug if not provided
    let slug = body.slug || body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    
    // Check if slug already exists for this hospital
    const existingPost = await BlogPost.findOne({
      hospitalId: user.hospitalId,
      slug
    })
    
    if (existingPost) {
      slug = `${slug}-${Date.now()}`
    }
    
    // Get author name from token or body
    const authorName = body.authorName || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Admin')
    
    const post = await BlogPost.create({
      ...body,
      slug,
      hospitalId: user.hospitalId,
      authorId: user.userId,
      authorName,
      publishedAt: body.isPublished ? new Date() : null
    })
    
    return NextResponse.json({ success: true, data: post }, { status: 201 })
  } catch (error) {
    console.error('Create blog post error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
