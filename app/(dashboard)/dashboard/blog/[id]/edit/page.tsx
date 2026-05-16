'use client'

import { useState, useRef, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  X, 
  Loader2,
  MessageSquare,
  Check,
  Trash2,
  Eye,
  Heart
} from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'

const categories = [
  'general',
  'health-tips',
  'telemedicine',
  'clinic-news',
  'medical-research',
  'patient-stories',
  'wellness',
  'nutrition',
  'mental-health',
  'pediatrics',
  'womens-health'
]

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
  isPublished: boolean
  isFeatured: boolean
  commentsEnabled: boolean
  comments?: Comment[]
  views: number
  likes: number
  metaTitle?: string
  metaDescription?: string
}

export default function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [post, setPost] = useState<BlogPost | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'general',
    tags: '',
    featuredImage: '',
    isPublished: false,
    isFeatured: false,
    commentsEnabled: true,
    metaTitle: '',
    metaDescription: ''
  })

  useEffect(() => {
    fetchPost()
  }, [id])

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/blog/${id}`)
      const data = await response.json()

      if (!data.success || !data.data) {
        router.push('/dashboard/blog')
        return
      }

      const postData = data.data
      setPost(postData)
      setFormData({
        title: postData.title,
        slug: postData.slug,
        excerpt: postData.excerpt || '',
        content: postData.content,
        category: postData.category,
        tags: postData.tags?.join(', ') || '',
        featuredImage: postData.featuredImage || '',
        isPublished: postData.isPublished,
        isFeatured: postData.isFeatured,
        commentsEnabled: postData.commentsEnabled ?? true,
        metaTitle: postData.metaTitle || '',
        metaDescription: postData.metaDescription || ''
      })
    } catch (error) {
      console.error('Error fetching post:', error)
      router.push('/dashboard/blog')
    } finally {
      setFetching(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user?.hospitalId) return

    setUploading(true)
    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.hospitalId}/${Date.now()}.${fileExt}`

      const { error } = await supabase.storage
        .from('clinic-images')
        .upload(fileName, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('clinic-images')
        .getPublicUrl(fileName)

      setFormData(prev => ({ ...prev, featuredImage: publicUrl }))
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.hospitalId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []
        })
      })

      const data = await response.json()
      if (data.success) {
        router.push('/dashboard/blog')
      } else {
        alert(data.error || 'Failed to update post')
      }
    } catch (error) {
      console.error('Error updating post:', error)
      alert('Failed to update post. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const approveComment = async (index: number) => {
    if (!post?.comments) return
    
    const updatedComments = [...post.comments]
    updatedComments[index].isApproved = true
    
    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments: updatedComments })
      })
      
      if (response.ok) {
        setPost(prev => prev ? { ...prev, comments: updatedComments } : null)
      }
    } catch (error) {
      console.error('Error approving comment:', error)
    }
  }

  const deleteComment = async (index: number) => {
    if (!post?.comments) return
    
    const updatedComments = post.comments.filter((_, i) => i !== index)
    
    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments: updatedComments })
      })
      
      if (response.ok) {
        setPost(prev => prev ? { ...prev, comments: updatedComments } : null)
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  if (fetching) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/blog">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Edit Blog Post</h1>
          <p className="text-muted-foreground">Update your article</p>
        </div>
        {post && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" /> {post.views || 0} views
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" /> {post.likes || 0} likes
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" /> {post.comments?.length || 0} comments
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Post Content</CardTitle>
                <CardDescription>Edit your blog post content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter post title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">/blog/</span>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="post-url-slug"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Brief summary of the post (optional)"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Write your blog post content here..."
                    rows={15}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* SEO Settings */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>Optimize for search engines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={formData.metaTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                    placeholder={formData.title || 'Leave blank to use post title'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                    placeholder={formData.excerpt || 'Leave blank to use excerpt'}
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Comments Management */}
            {post?.comments && post.comments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Comments ({post.comments.length})</CardTitle>
                  <CardDescription>Manage comments on this post</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Author</TableHead>
                        <TableHead>Comment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-24">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {post.comments.map((comment, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{comment.name}</p>
                              <p className="text-xs text-muted-foreground">{comment.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="line-clamp-2 text-sm">{comment.content}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge variant={comment.isApproved ? 'default' : 'secondary'}>
                              {comment.isApproved ? 'Approved' : 'Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {!comment.isApproved && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => approveComment(index)}
                                >
                                  <Check className="h-4 w-4 text-green-500" />
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => deleteComment(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle>Featured Image</CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                
                {formData.featuredImage ? (
                  <div className="relative">
                    <div className="aspect-video overflow-hidden rounded-lg border bg-muted">
                      <Image
                        src={formData.featuredImage}
                        alt="Featured"
                        width={400}
                        height={225}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -right-2 -top-2 h-6 w-6"
                      onClick={() => setFormData(prev => ({ ...prev, featuredImage: '' }))}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-primary/50 hover:bg-muted"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Upload image</span>
                      </>
                    )}
                  </button>
                )}
              </CardContent>
            </Card>

            {/* Post Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Post Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="health, wellness, tips"
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium text-sm">Featured Post</p>
                    <p className="text-xs text-muted-foreground">Show on homepage</p>
                  </div>
                  <Switch
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium text-sm">Enable Comments</p>
                    <p className="text-xs text-muted-foreground">Allow readers to comment</p>
                  </div>
                  <Switch
                    checked={formData.commentsEnabled}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, commentsEnabled: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium text-sm">Published</p>
                    <p className="text-xs text-muted-foreground">Visible to public</p>
                  </div>
                  <Switch
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={loading || !formData.title || !formData.content}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/blog">Cancel</Link>
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
