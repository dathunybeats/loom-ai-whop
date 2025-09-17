import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/">
                <span className="text-2xl font-bold text-foreground">Meraki Reach</span>
              </Link>
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

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8">Refund Policy</h1>

        <div className="prose prose-lg max-w-none">
          <p className="text-muted-foreground mb-12">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Refund Eligibility</h2>
            <p className="text-muted-foreground mb-4">
              We offer refunds under the following circumstances:
            </p>
            <ul className="list-disc ml-6 space-y-3 text-muted-foreground">
              <li>Technical issues that prevent you from using the Service for more than 48 hours</li>
              <li>Billing errors or duplicate charges</li>
              <li>Cancellation within 7 days of initial subscription (first-time subscribers only)</li>
              <li>Service downtime exceeding our uptime guarantee</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Refund Process</h2>
            <p className="text-muted-foreground mb-4">
              To request a refund:
            </p>
            <ol className="list-decimal ml-6 space-y-3 text-muted-foreground">
              <li>Contact our support team at support@merakirearch.com</li>
              <li>Provide your account information and reason for the refund request</li>
              <li>Allow up to 5 business days for review</li>
              <li>Approved refunds will be processed within 7-10 business days</li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Non-Refundable Items</h2>
            <p className="text-muted-foreground mb-4">
              The following are not eligible for refunds:
            </p>
            <ul className="list-disc ml-6 space-y-3 text-muted-foreground">
              <li>Subscription fees after the 7-day trial period (except for technical issues)</li>
              <li>Usage-based charges for services already consumed</li>
              <li>Partial month charges when canceling mid-cycle</li>
              <li>Refund requests made more than 30 days after the billing date</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Cancellation</h2>
            <p className="text-muted-foreground mb-4">
              You may cancel your subscription at any time:
            </p>
            <ul className="list-disc ml-6 space-y-3 text-muted-foreground">
              <li>Cancellations take effect at the end of the current billing period</li>
              <li>You will retain access to the Service until the end of the paid period</li>
              <li>No automatic refund is provided for unused time in the current billing cycle</li>
              <li>You can reactivate your subscription at any time</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Pro-Rated Refunds</h2>
            <p className="text-muted-foreground mb-4">
              In exceptional circumstances, we may provide pro-rated refunds for:
            </p>
            <ul className="list-disc ml-6 space-y-3 text-muted-foreground">
              <li>Extended service outages beyond our control</li>
              <li>Significant feature removals that affect your usage</li>
              <li>Account termination due to our policy violations (at our discretion)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Payment Method</h2>
            <p className="text-muted-foreground">
              Refunds will be issued to the original payment method used for the purchase. If the original payment method is no longer available, alternative arrangements will be made.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Dispute Resolution</h2>
            <p className="text-muted-foreground">
              If you disagree with a refund decision, you may escalate the matter by contacting our management team at disputes@merakirearch.com within 14 days of the initial decision.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Free Trial</h2>
            <p className="text-muted-foreground">
              Free trial periods do not require refunds as no payment is charged. You may cancel during the trial period to avoid future charges.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify this refund policy at any time. Changes will be effective immediately upon posting and will apply to future transactions only.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Contact Information</h2>
            <p className="text-muted-foreground mb-4">
              For refund requests or questions about this policy, please contact us at:
            </p>
            <ul className="list-none ml-0 space-y-2 text-muted-foreground">
              <li>Email: support@merakirearch.com</li>
              <li>Subject line: Refund Request - [Your Account Email]</li>
            </ul>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link href="/">
                <span className="text-2xl font-bold text-foreground">Meraki Reach</span>
              </Link>
              <p className="text-muted-foreground mt-4">
                AI-powered video personalization for modern sales teams.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="/#features" className="text-muted-foreground hover:text-foreground">Features</a></li>
                <li><a href="/#pricing" className="text-muted-foreground hover:text-foreground">Pricing</a></li>
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
                <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
                <li><Link href="/refund" className="text-muted-foreground hover:text-foreground">Refund Policy</Link></li>
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