'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Eye, 
  Heart, 
  MessageSquare, 
  Share2, 
  HeartPulse,
  Clock,
  Tag,
  Loader2,
  Send
} from 'lucide-react'

interface Comment {
  name: string
  email: string
  content: string
  isApproved: boolean
  createdAt: string
}

interface BlogPost {
  _id: string
  hospitalId: string
  title: string
  slug: string
  excerpt?: string
  content: string
  featuredImage?: string
  category: string
  tags?: string[]
  authorName?: string
  authorImage?: string
  views: number
  likes: number
  comments?: Comment[]
  commentsEnabled: boolean
  publishedAt?: string
  createdAt: string
}

interface Clinic {
  _id: string
  name: string
  slug: string
  logo?: string
}

export default function BlogPostPage() {
  const params = useParams()
  const clinicSlug = params.slug as string
  const postSlug = params.postSlug as string
  
  const [post, setPost] = useState<BlogPost | null>(null)
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [commentForm, setCommentForm] = useState({ name: '', email: '', content: '' })
  const [submittingComment, setSubmittingComment] = useState(false)
  const [commentSuccess, setCommentSuccess] = useState(false)

  useEffect(() => {
    fetchData()
  }, [clinicSlug, postSlug])

  const fetchData = async () => {
    try {
      // Fetch post with view increment
      const response = await fetch(`/api/public/blog/${clinicSlug}?post=${postSlug}`)
      const data = await response.json()
      
      if (data.success) {
        setPost(data.data)
        setLikeCount(data.data.likes || 0)
        setRelatedPosts(data.relatedPosts || [])
        
        // Fetch clinic info
        const clinicRes = await fetch(`/api/public/clinics/${clinicSlug}`)
        const clinicData = await clinicRes.json()
        if (clinicData.success) {
          setClinic(clinicData.data)
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    if (liked || !post) return
    
    try {
      const response = await fetch(`/api/blog/${post._id}/like`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setLiked(true)
        setLikeCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!post || !commentForm.name || !commentForm.email || !commentForm.content) return
    
    setSubmittingComment(true)
    try {
      const response = await fetch(`/api/blog/${post._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentForm)
      })
      
      if (response.ok) {
        setCommentSuccess(true)
        setCommentForm({ name: '', email: '', content: '' })
        setTimeout(() => setCommentSuccess(false), 5000)
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt || post?.title,
          url: window.location.href
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const formatContent = (content: string) => {
    return content.split('\n').map((paragraph, index) => {
      if (!paragraph.trim()) return null
      return <p key={index} className="mb-4 leading-relaxed">{paragraph}</p>
    })
  }

  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.split(/\s+/).length
    return Math.ceil(words / wordsPerMinute)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!post || !clinic) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <HeartPulse className="h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Article Not Found</h1>
        <p className="mt-2 text-muted-foreground">The article you&apos;re looking for doesn&apos;t exist.</p>
        <Button asChild className="mt-6">
          <Link href={`/clinic/${clinicSlug}/blog`}>Back to Blog</Link>
        </Button>
      </div>
    )
  }

  const approvedComments = post.comments?.filter(c => c.isApproved) || []

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link href={`/clinic/${clinicSlug}/blog`} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Back to Blog</span>
          </Link>
          <Button asChild>
            <Link href={`/clinic/${clinicSlug}/book`}>Book Appointment</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12">
        {/* Article Header */}
        <article>
          <header className="mb-8">
            <Badge variant="secondary" className="mb-4">{post.category}</Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
              {post.title}
            </h1>
            
            {post.excerpt && (
              <p className="mt-4 text-xl text-muted-foreground">
                {post.excerpt}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                {post.authorImage ? (
                  <Image
                    src={post.authorImage}
                    alt={post.authorName || 'Author'}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                )}
                <span className="font-medium text-foreground">{post.authorName || clinic.name}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Recent'}
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {estimateReadTime(post.content)} min read
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="mb-8 aspect-video overflow-hidden rounded-xl bg-muted">
              <Image
                src={post.featuredImage}
                alt={post.title}
                width={1200}
                height={675}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          )}

          {/* Article Stats & Actions */}
          <div className="mb-8 flex items-center justify-between rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" /> {post.views || 0} views
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" /> {likeCount} likes
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" /> {approvedComments.length} comments
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant={liked ? 'default' : 'outline'} 
                size="sm"
                onClick={handleLike}
                disabled={liked}
              >
                <Heart className={`mr-2 h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                {liked ? 'Liked' : 'Like'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none text-foreground">
            {formatContent(post.content)}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {post.tags.map((tag, index) => (
                <Badge key={index} variant="outline">{tag}</Badge>
              ))}
            </div>
          )}
        </article>

        <Separator className="my-12" />

        {/* Comments Section */}
        {post.commentsEnabled !== false && (
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-foreground">
              Comments ({approvedComments.length})
            </h2>

            {/* Comment Form */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg">Leave a Comment</CardTitle>
              </CardHeader>
              <CardContent>
                {commentSuccess ? (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-200">
                    Thank you for your comment! It will be visible once approved.
                  </div>
                ) : (
                  <form onSubmit={handleComment} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          value={commentForm.name}
                          onChange={(e) => setCommentForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Your name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={commentForm.email}
                          onChange={(e) => setCommentForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="comment">Comment *</Label>
                      <Textarea
                        id="comment"
                        value={commentForm.content}
                        onChange={(e) => setCommentForm(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Write your comment..."
                        rows={4}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={submittingComment}>
                      {submittingComment ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="mr-2 h-4 w-4" />
                      )}
                      Submit Comment
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Existing Comments */}
            {approvedComments.length > 0 ? (
              <div className="space-y-4">
                {approvedComments.map((comment, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{comment.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="mt-2 text-muted-foreground">{comment.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                No comments yet. Be the first to share your thoughts!
              </p>
            )}
          </section>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-foreground">Related Articles</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <Link 
                  key={relatedPost._id} 
                  href={`/clinic/${clinicSlug}/blog/${relatedPost.slug}`}
                  className="group"
                >
                  <Card className="overflow-hidden transition-shadow hover:shadow-lg h-full">
                    <div className="aspect-video overflow-hidden bg-muted">
                      {relatedPost.featuredImage ? (
                        <Image
                          src={relatedPost.featuredImage}
                          alt={relatedPost.title}
                          width={400}
                          height={225}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                          <HeartPulse className="h-12 w-12 text-primary/40" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground group-hover:text-primary line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {relatedPost.excerpt || relatedPost.content.substring(0, 100)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="rounded-xl bg-primary/5 p-8 text-center">
          <h2 className="text-xl font-semibold text-foreground">Need Medical Advice?</h2>
          <p className="mt-2 text-muted-foreground">
            Book an appointment with our healthcare professionals at {clinic.name}
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Button asChild>
              <Link href={`/clinic/${clinicSlug}/book`}>Book Appointment</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/clinic/${clinicSlug}`}>View Clinic</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  )
}
