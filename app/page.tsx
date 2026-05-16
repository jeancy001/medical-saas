import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Calendar, 
  Users, 
  FileText, 
  Pill, 
  TestTube, 
  Video, 
  BarChart3,
  Shield,
  Globe,
  Zap,
  HeartPulse,
  CheckCircle2,
  ArrowRight,
  Star,
  Play,
  Clock,
  Stethoscope,
  Smartphone,
  MessageCircle
} from 'lucide-react'
import {connectDB} from '@/lib/mongodb'
import { BlogPost } from '@/lib/models'

const features = [
  {
    icon: Users,
    title: 'Patient Management',
    description: 'Complete electronic health records with medical history, allergies, and insurance tracking.'
  },
  {
    icon: Calendar,
    title: 'Appointment Scheduling',
    description: 'Online booking system with calendar management and automated reminders.'
  },
  {
    icon: FileText,
    title: 'Billing & Invoicing',
    description: 'Generate invoices, track payments, and manage insurance claims effortlessly.'
  },
  {
    icon: Pill,
    title: 'Pharmacy Management',
    description: 'Inventory tracking, prescription management, and stock alerts.'
  },
  {
    icon: TestTube,
    title: 'Laboratory Module',
    description: 'Order tests, track samples, and manage results all in one place.'
  },
  {
    icon: Video,
    title: 'Telemedicine',
    description: 'Video consultations with integrated scheduling and prescription delivery.'
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Real-time dashboards and comprehensive reporting for informed decisions.'
  },
  {
    icon: Globe,
    title: 'Public Profile',
    description: 'Showcase your clinic online with a custom subdomain and public booking page.'
  }
]

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for small clinics getting started',
    features: [
      'Up to 50 patients',
      'Basic appointment scheduling',
      'Simple invoicing',
      'Public profile page',
      'Email support'
    ],
    cta: 'Start Free',
    popular: false
  },
  {
    name: 'Standard',
    price: '$49',
    period: '/month',
    description: 'For growing clinics with more needs',
    features: [
      'Unlimited patients',
      'Advanced scheduling',
      'Full billing & payments',
      'Laboratory module',
      'Pharmacy management',
      'Custom subdomain',
      'Priority support'
    ],
    cta: 'Start Trial',
    popular: true
  },
  {
    name: 'Premium',
    price: '$99',
    period: '/month',
    description: 'For hospitals and multi-location clinics',
    features: [
      'Everything in Standard',
      'Telemedicine module',
      'Multi-location support',
      'Custom domain',
      'API access',
      'White-label options',
      'Dedicated support',
      'Staff training'
    ],
    cta: 'Contact Sales',
    popular: false
  }
]

const testimonials = [
  {
    name: 'Dr. Marie Kabongo',
    role: 'Director, Clinique Espoir',
    image: null,
    content: 'MediCare Pro transformed how we manage our clinic. Patient records are now organized, appointments run smoothly, and billing is automated.'
  },
  {
    name: 'Dr. Jean-Pierre Mukendi',
    role: 'Founder, Centre Medical Lubumbashi',
    image: null,
    content: 'The telemedicine feature has been a game-changer. We can now serve patients in remote areas without them traveling long distances.'
  },
  {
    name: 'Dr. Grace Mutombo',
    role: 'Head Pharmacist, Pharmacy Plus',
    image: null,
    content: 'Managing inventory used to be a nightmare. Now with stock alerts and expiry tracking, we never run out of essential medications.'
  }
]

interface BlogPostType {
  _id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  featuredImage?: string
  category: string
  authorName?: string
  publishedAt?: Date
}

export default async function LandingPage() {
  // Fetch featured blog posts from MongoDB
  await connectDB()
  const blogPosts = await BlogPost.find({
    isPublished: true,
    isFeatured: true
  })
    .sort({ publishedAt: -1 })
    .limit(3)
    .lean() as unknown as BlogPostType[]

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <HeartPulse className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">MediCare Pro</span>
          </Link>
          
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Testimonials
            </Link>
            <Link href="/clinics" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Find Clinics
            </Link>
          </nav>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/get-started">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.1),transparent_50%)]" />
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-6">
              Trusted by 500+ Healthcare Providers
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance">
              The Complete Hospital Management Platform for{' '}
              <span className="text-primary">Modern Healthcare</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
              Streamline your clinic operations with our all-in-one SaaS solution. 
              Manage patients, appointments, billing, pharmacy, laboratory, and telemedicine 
              from a single powerful dashboard.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/get-started">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/demo">Watch Demo</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required. 14-day free trial.
            </p>
          </div>
          
          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              { value: '500+', label: 'Active Clinics' },
              { value: '50K+', label: 'Patients Managed' },
              { value: '1M+', label: 'Appointments' },
              { value: '99.9%', label: 'Uptime' }
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="border-t bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
              Everything You Need to Run Your Clinic
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A comprehensive suite of tools designed specifically for healthcare providers.
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border/50 bg-card transition-shadow hover:shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <CardDescription className="mt-2 text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
                Why Healthcare Providers Choose MediCare Pro
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Built by healthcare professionals, for healthcare professionals. 
                We understand the unique challenges of running a medical practice.
              </p>
              
              <div className="mt-8 space-y-4">
                {[
                  { icon: Shield, title: 'HIPAA Compliant', desc: 'Your patient data is secure and compliant with healthcare regulations.' },
                  { icon: Zap, title: 'Easy Setup', desc: 'Get started in minutes. No technical knowledge required.' },
                  { icon: Globe, title: 'Your Own Clinic Page', desc: 'Get a custom subdomain and public profile to attract new patients.' },
                  { icon: Building2, title: 'Multi-Location Support', desc: 'Manage multiple clinics from a single dashboard.' }
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-video overflow-hidden rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 shadow-2xl">
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <HeartPulse className="h-8 w-8 text-primary" />
                    </div>
                    <p className="mt-4 text-muted-foreground">Dashboard Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Consultation Section */}
      <section className="border-t bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <div className="relative aspect-video overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 to-primary/5 shadow-2xl">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary shadow-lg">
                      <Play className="h-8 w-8 text-primary-foreground ml-1" />
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground">Watch how telemedicine works</p>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 shadow-md">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  <span className="text-xs font-medium">Live Session</span>
                </div>
                <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 shadow-md">
                  <Video className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium">HD Quality</span>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <Badge variant="secondary" className="mb-4">
                Telemedicine
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
                Consult Doctors from Anywhere via Video Call
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Connect with healthcare professionals instantly through secure video consultations. 
                No need to travel - get expert medical advice from the comfort of your home.
              </p>
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: Video, title: 'HD Video Calls', desc: 'Crystal clear video consultations' },
                  { icon: Clock, title: '24/7 Available', desc: 'Book appointments anytime' },
                  { icon: Stethoscope, title: 'Expert Doctors', desc: 'Certified healthcare providers' },
                  { icon: MessageCircle, title: 'Chat Support', desc: 'In-call messaging enabled' }
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/clinics">
                    <Smartphone className="mr-2 h-4 w-4" />
                    Book Video Consultation
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/get-started">For Clinics: Enable Telemedicine</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog/News Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between">
            <div>
              <Badge variant="secondary" className="mb-4">
                Health Insights
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
                Latest from Our Blog
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
                Stay informed with the latest healthcare news, tips, and insights from medical professionals.
              </p>
            </div>
            <Button variant="outline" asChild className="hidden sm:flex">
              <Link href="/blog">
                View All Articles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {blogPosts && blogPosts.length > 0 ? (
              blogPosts.map((post) => (
                <Card key={post._id.toString()} className="group overflow-hidden border-border/50 transition-shadow hover:shadow-lg">
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
                    <Badge variant="secondary" className="mb-3 text-xs">
                      {post.category || 'Health'}
                    </Badge>
                    <h3 className="line-clamp-2 text-lg font-semibold text-foreground group-hover:text-primary">
                      {post.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {post.excerpt || post.content.substring(0, 150)}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-xs font-medium text-primary">
                            {post.authorName?.split(' ').map((n: string) => n[0]).join('') || 'MC'}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">{post.authorName || 'MediCare Pro'}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Placeholder cards when no blog posts
              [
                { title: 'Understanding Telemedicine: A Complete Guide', category: 'Telemedicine', excerpt: 'Learn how video consultations are transforming healthcare delivery and making medical advice more accessible.' },
                { title: '10 Tips for Managing Your Clinic Efficiently', category: 'Practice Management', excerpt: 'Discover proven strategies to streamline operations and improve patient satisfaction at your clinic.' },
                { title: 'The Future of Electronic Health Records', category: 'Technology', excerpt: 'Explore how EHR systems are evolving and what it means for healthcare providers and patients.' }
              ].map((placeholder, index) => (
                <Card key={index} className="group overflow-hidden border-border/50 transition-shadow hover:shadow-lg">
                  <div className="aspect-video overflow-hidden bg-muted">
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                      <HeartPulse className="h-12 w-12 text-primary/40" />
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <Badge variant="secondary" className="mb-3 text-xs">
                      {placeholder.category}
                    </Badge>
                    <h3 className="line-clamp-2 text-lg font-semibold text-foreground group-hover:text-primary">
                      {placeholder.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {placeholder.excerpt}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-xs font-medium text-primary">MC</span>
                        </div>
                        <span className="text-xs text-muted-foreground">MediCare Pro</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Coming Soon</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          
          <div className="mt-8 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/blog">
                View All Articles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose the plan that fits your clinic. Upgrade or downgrade anytime.
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative flex flex-col ${plan.popular ? 'border-primary shadow-lg' : 'border-border/50'}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most Popular
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <ul className="flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="mt-8 w-full" 
                    variant={plan.popular ? 'default' : 'outline'}
                    asChild
                  >
                    <Link href="/get-started">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
              Trusted by Healthcare Providers
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              See what clinic owners and doctors are saying about MediCare Pro.
            </p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    {`"${testimonial.content}"`}
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-medium text-primary">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-primary px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl text-balance">
            Ready to Transform Your Clinic?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">
            Join hundreds of healthcare providers who have streamlined their operations with MediCare Pro.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/get-started">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <HeartPulse className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">MediCare Pro</span>
              </Link>
              <p className="mt-4 text-sm text-muted-foreground">
                The complete hospital management platform for modern healthcare providers.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-foreground">Product</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</Link></li>
                <li><Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">Pricing</Link></li>
                <li><Link href="/demo" className="text-sm text-muted-foreground hover:text-foreground">Demo</Link></li>
                <li><Link href="/clinics" className="text-sm text-muted-foreground hover:text-foreground">Find Clinics</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-foreground">Company</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">About Us</Link></li>
                <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link></li>
                <li><Link href="/careers" className="text-sm text-muted-foreground hover:text-foreground">Careers</Link></li>
                <li><Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-foreground">Legal</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
                <li><Link href="/hipaa" className="text-sm text-muted-foreground hover:text-foreground">HIPAA Compliance</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 border-t pt-8">
            <p className="text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} MediCare Pro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
