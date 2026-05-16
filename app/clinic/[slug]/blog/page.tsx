import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Calendar, User, Eye, HeartPulse, Heart, MessageSquare } from 'lucide-react'
import connectDB from '@/lib/mongodb'
import { Hospital, BlogPost } from '@/lib/models'

interface BlogPostType {
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
  views: number
  likes: number
  comments?: { isApproved: boolean }[]
  publishedAt?: Date
  createdAt: Date
  isFeatured: boolean
}

export default async function ClinicBlogPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  
  await connectDB()

  // Get clinic by slug
  const clinic = await Hospital.findOne({ slug }).lean()
  if (!clinic) {
    notFound()
  }

  // Get blog posts for this clinic
  const posts = await BlogPost.find({
    hospitalId: clinic._id,
    isPublished: true
  })
    .sort({ publishedAt: -1 })
    .lean() as unknown as BlogPostType[]

  const featuredPosts = posts.filter(p => p.isFeatured)
  const regularPosts = posts.filter(p => !p.isFeatured)

  // Get unique categories
  const categories = [...new Set(posts.map(p => p.category))]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href={`/clinic/${slug}`} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">{clinic.name}</span>
          </Link>
          <Button asChild>
            <Link href={`/clinic/${slug}/book`}>Book Appointment</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12">
        {/* Page Title */}
        <div className="mb-12 text-center">
          <Badge variant="secondary" className="mb-4">Health Insights</Badge>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            {clinic.name} Blog
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Stay informed with the latest health tips, news, and insights from our medical professionals.
          </p>
        </div>

        {/* Categories Filter */}
        {categories.length > 1 && (
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            <Badge variant="default">All</Badge>
            {categories.map((cat) => (
              <Badge key={cat} variant="outline" className="cursor-pointer hover:bg-secondary">
                {cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </Badge>
            ))}
          </div>
        )}

        {posts && posts.length > 0 ? (
          <>
            {/* Featured Posts */}
            {featuredPosts.length > 0 && (
              <section className="mb-16">
                <h2 className="mb-6 text-xl font-semibold text-foreground">Featured Articles</h2>
                <div className="grid gap-8 md:grid-cols-2">
                  {featuredPosts.slice(0, 2).map((post) => (
                    <Link 
                      key={post._id.toString()} 
                      href={`/clinic/${slug}/blog/${post.slug}`}
                      className="group"
                    >
                      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                        <div className="aspect-video overflow-hidden bg-muted">
                          {post.featuredImage ? (
                            <Image
                              src={post.featuredImage}
                              alt={post.title}
                              width={600}
                              height={340}
                              className="h-full w-full object-cover transition-transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                              <HeartPulse className="h-16 w-16 text-primary/40" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-6">
                          <Badge variant="secondary" className="mb-3">{post.category}</Badge>
                          <h3 className="text-xl font-semibold text-foreground group-hover:text-primary line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="mt-2 text-muted-foreground line-clamp-2">
                            {post.excerpt || post.content.substring(0, 150)}
                          </p>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {post.authorName || clinic.name}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Recent'}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" /> {post.views || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" /> {post.likes || 0}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* All Posts */}
            <section>
              <h2 className="mb-6 text-xl font-semibold text-foreground">
                {featuredPosts.length > 0 ? 'All Articles' : 'Latest Articles'}
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {(featuredPosts.length > 0 ? regularPosts : posts).map((post) => (
                  <Link 
                    key={post._id.toString()} 
                    href={`/clinic/${slug}/blog/${post.slug}`}
                    className="group"
                  >
                    <Card className="overflow-hidden transition-shadow hover:shadow-lg h-full">
                      <div className="aspect-video overflow-hidden bg-muted">
                        {post.featuredImage ? (
                          <Image
                            src={post.featuredImage}
                            alt={post.title}
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
                      <CardContent className="p-5">
                        <Badge variant="secondary" className="mb-3 text-xs">{post.category}</Badge>
                        <h3 className="font-semibold text-foreground group-hover:text-primary line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {post.excerpt || post.content.substring(0, 100)}
                        </p>
                        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{post.authorName || clinic.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" /> {post.views || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" /> {post.likes || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" /> {post.comments?.filter(c => c.isApproved).length || 0}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <HeartPulse className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-6 text-lg font-semibold text-foreground">No articles yet</h3>
            <p className="mt-2 max-w-sm text-muted-foreground">
              {clinic.name} hasn&apos;t published any blog posts yet. Check back soon for health tips and insights!
            </p>
            <Button asChild className="mt-6">
              <Link href={`/clinic/${slug}`}>Back to Clinic</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
