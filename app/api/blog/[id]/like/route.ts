import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import { BlogPost } from '@/lib/models'

// POST - Like a blog post
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    const { id } = await params
    
    const post = await BlogPost.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true }
    )
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ 
      success: true, 
      data: { likes: post.likes }
    })
  } catch (error) {
    console.error('Like post error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
