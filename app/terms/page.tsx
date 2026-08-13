'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { haptic, pressScale } from '@/lib/haptics';

export default function TermsOfServicePage() {
  const router = useRouter();

  return (
    <div className="app-container bg-bg min-h-screen pb-12">
      <header className="px-6 pt-14 pb-6 flex items-center gap-4 border-b border-border">
        <motion.button
          className="p-2 text-muted hover:text-text transition-colors -ml-2"
          onClick={() => { haptic.tap(); router.back(); }}
          {...pressScale}
        >
          <ArrowLeft size={20} />
        </motion.button>
        <h1 className="font-heading font-bold text-2xl text-text">terms of service</h1>
      </header>

      <main className="px-6 py-8 space-y-6 text-sm text-text leading-relaxed">
        <p className="text-xs text-muted font-mono">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">1. Acceptance of Terms</h2>
          <p className="text-muted">
            By accessing or using multiply. ("Platform," "Service," "we," "us," or "our"), you agree to be bound by these 
            Terms of Service and all applicable laws and regulations of India. If you do not agree with these terms, 
            you must not use our Platform.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">2. Service Description</h2>
          <p className="text-muted mb-2">
            multiply. is a hyperlocal marketplace connecting content creators with businesses in India. Our Platform enables:
          </p>
          <ul className="list-disc list-inside space-y-1 text-muted ml-4">
            <li>Creators to post gigs and offer content creation services</li>
            <li>Businesses to discover and hire local creators</li>
            <li>Secure communication and payment processing</li>
            <li>Review and rating systems</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">3. Eligibility</h2>
          <div className="space-y-2 text-muted">
            <p>To use our Platform, you must:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Be at least 18 years of age</li>
              <li>Be a resident of India</li>
              <li>Have the legal capacity to enter into contracts</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">4. User Accounts</h2>
          <div className="space-y-3 text-muted">
            <div>
              <p className="font-bold text-text mb-1">4.1 Account Types</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><span className="font-bold text-text">Creator:</span> Post gigs, offer services, receive payments</li>
                <li><span className="font-bold text-text">Business:</span> Browse gigs, hire creators, make payments</li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-text mb-1">4.2 Account Responsibilities</p>
              <p>You are responsible for all activities under your account. Notify us immediately of unauthorized access.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">5. Platform Fees</h2>
          <div className="space-y-3 text-muted">
            <div>
              <p className="font-bold text-text mb-1">5.1 Standard Users</p>
              <p>Free users pay a 5% platform fee on each gig's value. This fee is charged to businesses at checkout.</p>
            </div>
            <div>
              <p className="font-bold text-text mb-1">5.2 Pro Subscription</p>
              <p>Pro users (₹190/month) pay zero platform fees. Benefits include verified badge and top placement in search.</p>
            </div>
            <div>
              <p className="font-bold text-text mb-1">5.3 Payment Processing</p>
              <p>
                All payments are processed through Razorpay. Payment processing fees, GST, and applicable taxes 
                are as per Razorpay's terms and Indian tax laws.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">6. Gigs and Transactions</h2>
          <div className="space-y-3 text-muted">
            <div>
              <p className="font-bold text-text mb-1">6.1 Posting Gigs</p>
              <p>
                Creators may post gigs with a minimum value of ₹500. Gigs must accurately describe services offered. 
                False or misleading information may result in account suspension.
              </p>
            </div>
            <div>
              <p className="font-bold text-text mb-1">6.2 Gig Agreements</p>
              <p>
                When a business accepts a gig, both parties enter into a binding agreement. Payment must be made 
                before work commences (advance or direct payment as agreed).
              </p>
            </div>
            <div>
              <p className="font-bold text-text mb-1">6.3 Completion and Ratings</p>
              <p>
                Both parties must mark gigs as complete to finalize the transaction. Users are encouraged to rate 
                their experience honestly and constructively.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">7. Prohibited Conduct</h2>
          <p className="text-muted mb-2">You must not:</p>
          <ul className="list-disc list-inside space-y-1 text-muted ml-4">
            <li>Post false, misleading, or fraudulent information</li>
            <li>Attempt to circumvent platform fees by transacting outside the Platform</li>
            <li>Harass, abuse, or threaten other users</li>
            <li>Violate intellectual property rights</li>
            <li>Post illegal, obscene, or offensive content</li>
            <li>Use the Platform for money laundering or illegal activities</li>
            <li>Create multiple accounts to manipulate ratings or reviews</li>
            <li>Scrape, copy, or reverse-engineer the Platform</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">8. Dispute Resolution</h2>
          <div className="space-y-3 text-muted">
            <div>
              <p className="font-bold text-text mb-1">8.1 Reporting Disputes</p>
              <p>
                Users may raise disputes through the Platform. We review disputes on a case-by-case basis 
                but are not obligated to resolve them.
              </p>
            </div>
            <div>
              <p className="font-bold text-text mb-1">8.2 Mediation</p>
              <p>
                We encourage parties to resolve disputes amicably. multiply. may provide non-binding guidance 
                but is not a party to user agreements.
              </p>
            </div>
            <div>
              <p className="font-bold text-text mb-1">8.3 Legal Action</p>
              <p>
                Disputes not resolved through the Platform are subject to the jurisdiction of courts in 
                [Your city], India.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">9. Intellectual Property</h2>
          <p className="text-muted">
            All Platform content, including design, logos, and code, is owned by multiply. or its licensors. 
            User-generated content (profiles, gigs, messages) remains owned by users, but you grant us a 
            license to use, display, and distribute it on the Platform.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">10. Limitation of Liability</h2>
          <div className="space-y-2 text-muted">
            <p>multiply. provides the Platform "as is" without warranties. We are not liable for:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Quality, safety, or legality of gigs or services</li>
              <li>Actions or conduct of users</li>
              <li>Disputes between users</li>
              <li>Loss of data, revenue, or business opportunities</li>
              <li>Payment processing failures (Razorpay's responsibility)</li>
            </ul>
            <p className="mt-3">
              Our total liability shall not exceed the platform fees paid by you in the 12 months preceding the claim.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">11. Indemnification</h2>
          <p className="text-muted">
            You agree to indemnify and hold multiply., its officers, employees, and partners harmless from any 
            claims, damages, or expenses arising from your use of the Platform, violation of these Terms, 
            or infringement of third-party rights.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">12. Termination</h2>
          <div className="space-y-2 text-muted">
            <p>We may suspend or terminate your account if you:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Violate these Terms</li>
              <li>Engage in fraudulent or illegal activities</li>
              <li>Receive multiple user complaints</li>
              <li>Fail to pay applicable fees</li>
            </ul>
            <p className="mt-3">
              You may delete your account at any time through the Profile settings. Termination does not 
              absolve obligations for completed transactions.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">13. Governing Law</h2>
          <p className="text-muted">
            These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive 
            jurisdiction of courts in [Your city], India. The United Nations Convention on Contracts for 
            the International Sale of Goods does not apply.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">14. Changes to Terms</h2>
          <p className="text-muted">
            We reserve the right to modify these Terms at any time. Changes will be effective immediately 
            upon posting. Continued use of the Platform constitutes acceptance of updated Terms.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">15. Contact Information</h2>
          <div className="text-muted space-y-2">
            <p>For questions about these Terms, contact us at:</p>
            <div className="bg-surface border border-border rounded-card p-4 font-mono text-xs">
              <p>multiply. platform</p>
              <p className="mt-2">Email: legal@multiply.in</p>
              <p>Address: [Your registered business address in India]</p>
            </div>
          </div>
        </section>

        <section className="pt-4 border-t border-border">
          <p className="text-xs text-dim font-mono">
            These Terms constitute the entire agreement between you and multiply. regarding use of the Platform.
          </p>
        </section>
      </main>
    </div>
  );
}
