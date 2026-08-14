'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { haptic, pressScale } from '@/lib/haptics';

export default function RefundPolicyPage() {
  const router = useRouter();

  return (
    <div className="app-container bg-bg min-h-screen pb-12">
      <header className="px-6 pt-14 pb-6 flex items-center gap-4">
        <motion.button
          className="p-2 text-muted hover:text-text transition-colors -ml-2"
          onClick={() => { haptic.tap(); router.back(); }}
          {...pressScale}
        >
          <ArrowLeft size={20} />
        </motion.button>
        <h1 className="font-heading font-bold text-2xl text-text">refund policy</h1>
      </header>

      <main className="px-6 py-8 space-y-6 text-sm text-text leading-relaxed">
        <p className="text-xs text-muted font-mono">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">1. Overview</h2>
          <p className="text-muted">
            This Refund Policy outlines the conditions under which refunds may be issued for transactions on multiply. 
            As a marketplace connecting creators and businesses, refund eligibility depends on the nature of the 
            transaction and the stage at which a dispute or cancellation occurs.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">2. Platform Fee Refunds</h2>
          <div className="space-y-3 text-muted">
            <div>
              <p className="font-bold text-text mb-1">2.1 Non-Refundable Platform Fees</p>
              <p>
                The 5% platform fee charged to free users is non-refundable once a gig payment is processed, 
                regardless of gig completion status. This fee covers platform services, payment processing, 
                and operational costs.
              </p>
            </div>
            <div>
              <p className="font-bold text-text mb-1">2.2 Pro Subscription Refunds</p>
              <p>
                Pro subscription fees (₹190/month) are non-refundable. If you cancel your subscription, 
                Pro benefits remain active until the end of your current billing period. No refunds are 
                issued for partial months or unused subscription time.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">3. Gig Payment Refunds</h2>
          <div className="space-y-3 text-muted">
            <div>
              <p className="font-bold text-text mb-1">3.1 Before Work Begins</p>
              <p>
                If a gig is cancelled before the creator begins work, the business may request a full refund 
                of the gig payment (excluding platform fees and payment processing charges). Refund requests 
                must be submitted within 24 hours of payment.
              </p>
            </div>
            <div>
              <p className="font-bold text-text mb-1">3.2 After Work Has Started</p>
              <p>
                Once a creator has commenced work on a gig, refunds are subject to mutual agreement between 
                both parties. multiply. does not automatically issue refunds for work-in-progress disputes. 
                Users should resolve such matters directly or through our dispute resolution process.
              </p>
            </div>
            <div>
              <p className="font-bold text-text mb-1">3.3 Non-Delivery or Breach</p>
              <p>
                If a creator fails to deliver agreed services or breaches the gig agreement, the business 
                may raise a dispute. After investigation, we may facilitate a full or partial refund at our discretion.
              </p>
            </div>
            <div>
              <p className="font-bold text-text mb-1">3.4 Quality Disputes</p>
              <p>
                Refunds for subjective quality issues are not guaranteed. Users are encouraged to communicate 
                expectations clearly before agreeing to gigs. multiply. is not liable for creative differences 
                or subjective dissatisfaction with delivered work.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">4. Refund Request Process</h2>
          <div className="space-y-3 text-muted">
            <div>
              <p className="font-bold text-text mb-1">4.1 Submitting a Request</p>
              <p>To request a refund:</p>
              <ul className="list-decimal list-inside space-y-1 ml-4 mt-2">
                <li>Raise a dispute through the Platform within 7 days of payment or gig completion</li>
                <li>Provide a detailed explanation and supporting evidence (screenshots, messages)</li>
                <li>Allow the other party to respond (48-hour response window)</li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-text mb-1">4.2 Review Process</p>
              <p>
                Our team reviews disputes within 5-7 business days. We may contact both parties for additional 
                information. Decisions are made based on Terms of Service, evidence provided, and platform 
                transaction records.
              </p>
            </div>
            <div>
              <p className="font-bold text-text mb-1">4.3 Refund Issuance</p>
              <p>
                Approved refunds are processed within 7-10 business days to the original payment method. 
                Refund timelines depend on your bank or payment provider (typically 5-7 business days after processing).
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">5. Payment Processing Failures</h2>
          <div className="space-y-2 text-muted">
            <div>
              <p className="font-bold text-text mb-1">5.1 Failed Transactions</p>
              <p>
                If a payment is debited from your account but the transaction fails on our Platform, 
                a refund will be automatically initiated within 5-7 business days. Contact Razorpay 
                customer support for payment gateway issues.
              </p>
            </div>
            <div>
              <p className="font-bold text-text mb-1">5.2 Duplicate Charges</p>
              <p>
                In case of accidental duplicate charges, contact us immediately with transaction details. 
                We will investigate and process refunds for verified duplicate transactions within 7-10 business days.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">6. Non-Refundable Scenarios</h2>
          <p className="text-muted mb-2">Refunds will not be issued in the following cases:</p>
          <ul className="list-disc list-inside space-y-1 text-muted ml-4">
            <li>Gig marked as complete by both parties</li>
            <li>Disputes raised more than 7 days after gig completion</li>
            <li>Change of mind after work delivery</li>
            <li>Failure to communicate requirements clearly</li>
            <li>Violations of Terms of Service by the requesting party</li>
            <li>Third-party services or content purchased outside multiply.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">7. Partial Refunds</h2>
          <p className="text-muted">
            In cases where work is partially completed or partially satisfactory, we may issue partial refunds 
            based on the percentage of work completed and accepted. Both parties must agree to the partial 
            refund amount, or multiply. will determine a fair resolution.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">8. Refund Method</h2>
          <div className="space-y-2 text-muted">
            <p>All refunds are processed to the original payment method used for the transaction:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Credit/Debit Card: 5-7 business days after refund initiation</li>
              <li>UPI: 2-3 business days after refund initiation</li>
              <li>Net Banking: 5-7 business days after refund initiation</li>
              <li>Wallet: 1-2 business days after refund initiation</li>
            </ul>
            <p className="mt-3">
              Refund timelines are estimates and may vary depending on your bank or payment provider.
            </p>
          </div>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">9. Cancellation by multiply.</h2>
          <p className="text-muted">
            If we cancel a gig due to policy violations, fraud detection, or platform maintenance, 
            full refunds (including platform fees) will be issued to the business within 7-10 business days.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">10. Tax Implications</h2>
          <p className="text-muted">
            Refunds are processed for the gross amount paid. Tax deductions (TDS) and GST implications 
            are the responsibility of users as per Indian tax laws. multiply. does not provide tax advice; 
            consult a tax professional for guidance on refund-related tax matters.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">11. Dispute Escalation</h2>
          <p className="text-muted">
            If you are unsatisfied with a refund decision, you may escalate the matter by emailing our 
            support team with "REFUND ESCALATION" in the subject line. Escalated disputes are reviewed 
            by senior management within 10-15 business days.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">12. Amendments to Policy</h2>
          <p className="text-muted">
            We reserve the right to modify this Refund Policy at any time. Changes will be effective 
            immediately upon posting on the Platform. Users will be notified of significant changes via 
            email or platform notifications.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">13. Contact for Refunds</h2>
          <div className="text-muted space-y-2">
            <p>For refund requests or questions, contact us at:</p>
            <div className="bg-surface rounded-card p-4 font-mono text-xs">
              <p>multiply. refunds team</p>
              <p className="mt-2">Email: refunds@multiply.in</p>
              <p>Support: support@multiply.in</p>
              <p>Address: [Your registered business address in India]</p>
              <p className="mt-2">Response time: 24-48 hours</p>
            </div>
          </div>
        </section>

        <section className="pt-4">
          <p className="text-xs text-dim font-mono">
            This Refund Policy is governed by Indian consumer protection laws and the Information Technology Act, 2000. 
            By using multiply., you acknowledge and accept this policy.
          </p>
        </section>
      </main>
    </div>
  );
}
