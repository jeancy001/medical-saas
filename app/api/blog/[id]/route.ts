import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { BlogPost } from '@/lib/models'
import { verifyToken } from '@/lib/auth'

// GET - Fetch single blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    
    const { searchParams } = new URL(request.url)
    const incrementViews = searchParams.get('view') === 'true'
    
    let post
    
    if (incrementViews) {
      post = await BlogPost.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } },
        { new: true }
      ).lean()
    } else {
      post = await BlogPost.findById(id).lean()
    }
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, data: post })
  } catch (error) {
    console.error('Get blog post error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    
    if (!['super_admin', 'hospital_admin'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    
    await connectDB()
    const { id } = await params
    const body = await request.json()
    
    // Check if post belongs to user's hospital
    const existingPost = await BlogPost.findById(id)
    if (!existingPost) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
    }
    
    if (user.role !== 'super_admin' && existingPost.hospitalId?.toString() !== user.hospitalId?.toString()) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    
    // If publishing for the first time, set publishedAt
    if (body.isPublished && !existingPost.isPublished) {
      body.publishedAt = new Date()
    }
    
    const post = await BlogPost.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    )
    
    return NextResponse.json({ success: true, data: post })
  } catch (error) {
    console.error('Update blog post error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    
    if (!['super_admin', 'hospital_admin'].includes(user.role)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    
    await connectDB()
    const { id } = await params
    
    // Check if post belongs to user's hospital
    const existingPost = await BlogPost.findById(id)
    if (!existingPost) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
    }
    
    if (user.role !== 'super_admin' && existingPost.hospitalId?.toString() !== user.hospitalId?.toString()) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    
    await BlogPost.findByIdAndDelete(id)
    
    return NextResponse.json({ success: true, message: 'Post deleted' })
  } catch (error) {
    console.error('Delete blog post error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
