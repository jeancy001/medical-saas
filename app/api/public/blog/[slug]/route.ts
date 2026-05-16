import { NextRequest, NextResponse } from 'next/server'
import {connectDB} from '@/lib/mongodb'
import { BlogPost, Hospital } from '@/lib/models'

// GET - Fetch public blog posts for a clinic
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB()
    const { slug } = await params
    
    const { searchParams } = new URL(request.url)
    const postSlug = searchParams.get('post')
    const featured = searchParams.get('featured') === 'true'
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    
    // Find hospital by slug
    const hospital = await Hospital.findOne({ slug }).lean()
    if (!hospital) {
      return NextResponse.json(
        { success: false, error: 'Clinic not found' },
        { status: 404 }
      )
    }
    
    // If requesting a specific post
    if (postSlug) {
      const post = await BlogPost.findOneAndUpdate(
        { hospitalId: hospital._id, slug: postSlug, isPublished: true },
        { $inc: { views: 1 } },
        { new: true }
      ).lean()
      
      if (!post) {
        return NextResponse.json(
          { success: false, error: 'Post not found' },
          { status: 404 }
        )
      }
      
      // Get related posts
      const relatedPosts = await BlogPost.find({
        hospitalId: hospital._id,
        isPublished: true,
        _id: { $ne: post._id },
        category: post.category
      })
        .sort({ publishedAt: -1 })
        .limit(3)
        .lean()
      
      return NextResponse.json({
        success: true,
        data: post,
        relatedPosts
      })
    }
    
    // Build query for list
    const query: Record<string, unknown> = {
      hospitalId: hospital._id,
      isPublished: true
    }
    
    if (featured) {
      query.isFeatured = true
    }
    
    const skip = (page - 1) * limit
    
    const [posts, total] = await Promise.all([
      BlogPost.find(query)
        .sort({ publishedAt: -1 })
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
    console.error('Get public blog posts error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
