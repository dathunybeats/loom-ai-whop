import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, ChevronDown, Star, ArrowRight, Play, Shield, Zap, Target, Users, TrendingUp, Clock } from 'lucide-react'
import { PricingPlans } from '@/components/pricing-plans'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Server-side redirect for authenticated users
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-foreground">Meraki Reach</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
              <Badge variant="secondary" className="mb-6">
                <Zap className="w-4 h-4 mr-2" />
                AI-Powered Video Personalization
              </Badge>
            </div>
            <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-200">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 max-w-4xl mx-auto leading-tight">
                Turn Scattered Data Into{' '}
                <span className="text-primary">Smart Decisions</span>
              </h1>
            </div>
            <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-400">
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Create personalized video outreach campaigns with AI. Upload your video, add prospects, and generate unique videos for each person automatically.
              </p>
            </div>
            <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-600 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" variant="outline" className="h-12 px-8">
                <Play className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
              <Link href="/signup">
                <Button size="lg" className="h-12 px-8">
                  Try 5 Videos Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="mt-8 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000 delay-800">
              <p className="text-sm text-muted-foreground">No credit card required • Instant access after signup</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted Companies Marquee */}
      <section className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-sm text-muted-foreground">Trusted by teams at</p>
          </div>
          <div className="flex justify-center items-center space-x-12 opacity-60">
            <div className="text-2xl font-bold">Microsoft</div>
            <div className="text-2xl font-bold">Google</div>
            <div className="text-2xl font-bold">Salesforce</div>
            <div className="text-2xl font-bold">HubSpot</div>
            <div className="text-2xl font-bold">Stripe</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-in fade-in-0 slide-in-from-bottom-4 duration-1000">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Make Your Platform Work Harder For You
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create personalized video campaigns at scale
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="animate-in fade-in-0 slide-in-from-left-4 duration-1000">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI Video Personalization</CardTitle>
                <CardDescription>
                  Upload one video and let AI create thousands of personalized versions for each prospect
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="animate-in fade-in-0 slide-in-from-right-4 duration-1000">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Bulk Prospect Management</CardTitle>
                <CardDescription>
                  Import CSV files with prospect data and automatically generate landing pages for each contact
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="animate-in fade-in-0 slide-in-from-left-4 duration-1000 delay-200">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>
                  Track engagement, watch times, and conversion rates across all your personalized campaigns
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="animate-in fade-in-0 slide-in-from-right-4 duration-1000 delay-200">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Enterprise Security</CardTitle>
                <CardDescription>
                  Bank-level encryption and compliance standards to keep your data and videos secure
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Benefits That Truly Matter To You
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-4">Save 95% Time</h3>
              <p className="text-muted-foreground">
                Create hundreds of personalized videos in minutes instead of hours
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-4">Increase Response Rates</h3>
              <p className="text-muted-foreground">
                Personalized videos get 3x higher engagement than generic content
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-4">Scale Effortlessly</h3>
              <p className="text-muted-foreground">
                From 10 to 10,000 prospects without additional manual work
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Get Clear Answers In 3 Simple Steps
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
                <span className="text-blue-600 text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Upload Base Video
              </h3>
              <p className="text-muted-foreground">
                Record a talking head video with &ldquo;[FIRST_NAME]&rdquo; placeholder that AI will personalize for each prospect.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
                <span className="text-green-600 text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Add Prospects
              </h3>
              <p className="text-muted-foreground">
                Upload a CSV file with prospect names, websites, and contact information for personalization.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6 mx-auto">
                <span className="text-purple-600 text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                Generate & Share
              </h3>
              <p className="text-muted-foreground">
                AI creates personalized videos and landing pages for each prospect with tracking analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Hear What Others Say About Us
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  &ldquo;Meraki Reach increased our cold outreach response rate by 400%. The personalization is incredible.&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary rounded-full mr-3" />
                  <div>
                    <p className="font-semibold">Sarah Chen</p>
                    <p className="text-sm text-muted-foreground">VP Sales, TechCorp</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  &ldquo;We saved 20 hours per week on video creation while tripling our conversion rates.&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary rounded-full mr-3" />
                  <div>
                    <p className="font-semibold">Michael Rodriguez</p>
                    <p className="text-sm text-muted-foreground">Marketing Director, Growth Inc</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  &ldquo;The AI personalization is so natural, prospects think we made individual videos for them.&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary rounded-full mr-3" />
                  <div>
                    <p className="font-semibold">Emily Johnson</p>
                    <p className="text-sm text-muted-foreground">Founder, StartupXYZ</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PricingPlans />
        </div>
      </section>

      {/* Why Choose Us vs Competitors */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Meraki Reach Over Competitors
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-8 h-8 bg-red-100 rounded mr-3">
                    <span className="text-red-600 text-sm">×</span>
                  </div>
                  Others
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="text-muted-foreground">Manual video creation</li>
                  <li className="text-muted-foreground">Limited personalization</li>
                  <li className="text-muted-foreground">Complex setup process</li>
                  <li className="text-muted-foreground">Basic analytics</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded mr-3 flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  Meraki Reach
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="text-foreground">AI-powered automation</li>
                  <li className="text-foreground">Advanced personalization</li>
                  <li className="text-foreground">5-minute setup</li>
                  <li className="text-foreground">Comprehensive tracking</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Results</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="text-foreground font-semibold">95% time saved</li>
                  <li className="text-foreground font-semibold">3x higher engagement</li>
                  <li className="text-foreground font-semibold">Instant deployment</li>
                  <li className="text-foreground font-semibold">Actionable insights</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Common Questions With Clear Answers
            </h2>
          </div>
          <div className="space-y-4">
            <details className="group border border-border rounded-lg">
              <summary className="flex justify-between items-center p-6 cursor-pointer">
                <span className="text-lg font-semibold">How does AI video personalization work?</span>
                <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-6">
                <p className="text-muted-foreground">
                  Upload a base video with placeholder text like &ldquo;[FIRST_NAME]&rdquo;. Our AI replaces these placeholders with actual prospect names and generates unique videos for each person in your list.
                </p>
              </div>
            </details>
            
            <details className="group border border-border rounded-lg">
              <summary className="flex justify-between items-center p-6 cursor-pointer">
                <span className="text-lg font-semibold">Can I track who watches my videos?</span>
                <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-6">
                <p className="text-muted-foreground">
                  Yes! We provide detailed analytics including view time, engagement rates, and click-through rates for each personalized video and landing page.
                </p>
              </div>
            </details>
            
            <details className="group border border-border rounded-lg">
              <summary className="flex justify-between items-center p-6 cursor-pointer">
                <span className="text-lg font-semibold">What file formats do you support?</span>
                <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-6">
                <p className="text-muted-foreground">
                  We support MP4, MOV, and AVI video formats. For prospect data, we accept CSV files with standard contact information fields.
                </p>
              </div>
            </details>
            
            <details className="group border border-border rounded-lg">
              <summary className="flex justify-between items-center p-6 cursor-pointer">
                <span className="text-lg font-semibold">Is there a limit on video length?</span>
                <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-6">
                <p className="text-muted-foreground">
                  Base videos can be up to 5 minutes long. We recommend keeping them between 30-90 seconds for optimal engagement rates.
                </p>
              </div>
            </details>
            
            <details className="group border border-border rounded-lg">
              <summary className="flex justify-between items-center p-6 cursor-pointer">
                <span className="text-lg font-semibold">Do you offer integrations with CRM systems?</span>
                <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-6">
                <p className="text-muted-foreground">
                  Yes! We integrate with popular CRMs like Salesforce, HubSpot, and Pipedrive. Enterprise plans include custom integrations.
                </p>
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <span className="text-2xl font-bold text-foreground">Meraki Reach</span>
              <p className="text-muted-foreground mt-4">
                AI-powered video personalization for modern sales teams.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-muted-foreground hover:text-foreground">Features</a></li>
                <li><a href="#pricing" className="text-muted-foreground hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">API</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">About</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Blog</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Careers</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Help Center</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Documentation</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Meraki Reach. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}