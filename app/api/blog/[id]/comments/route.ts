import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { BlogPost } from '@/lib/models'

// POST - Add comment to blog post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    const body = await request.json()
    
    const { name, email, content } = body
    
    if (!name || !email || !content) {
      return NextResponse.json(
        { success: false, error: 'Name, email and content are required' },
        { status: 400 }
      )
    }
    
    const post = await BlogPost.findById(id)
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }
    
    if (!post.commentsEnabled) {
      return NextResponse.json(
        { success: false, error: 'Comments are disabled for this post' },
        { status: 400 }
      )
    }
    
    const comment = {
      name,
      email,
      content,
      isApproved: false,
      createdAt: new Date()
    }
    
    await BlogPost.findByIdAndUpdate(
      id,
      { $push: { comments: comment } }
    )
    
    return NextResponse.json({ 
      success: true, 
      message: 'Comment submitted for approval' 
    })
  } catch (error) {
    console.error('Add comment error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
