'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { haptic, pressScale } from '@/lib/haptics';

export default function PrivacyPolicyPage() {
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
        <h1 className="font-heading font-bold text-2xl text-text">privacy policy</h1>
      </header>

      <main className="px-6 py-8 space-y-6 text-sm text-text leading-relaxed">
        <p className="text-xs text-muted font-mono">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">1. Introduction</h2>
          <p className="text-muted">
            multiply. ("we," "us," or "our") operates as a marketplace connecting content creators and businesses in India. 
            We are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, 
            use, disclose, and safeguard your information when you use our platform.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">2. Information We Collect</h2>
          <div className="space-y-3 text-muted">
            <div>
              <p className="font-bold text-text mb-1">2.1 Information You Provide</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Account details: username, email address, role (creator/business)</li>
                <li>Location: state and city information</li>
                <li>Profile information: bio, Instagram handle, content categories, business details</li>
                <li>Payment information: processed securely through Razorpay (we do not store card details)</li>
                <li>Communications: messages, gig descriptions, reviews</li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-text mb-1">2.2 Information Collected Automatically</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Device information: IP address, browser type, operating system</li>
                <li>Usage data: pages visited, features used, time spent</li>
                <li>Transaction data: gig details, payment status, platform fees</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">3. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-2 text-muted ml-4">
            <li>To provide and maintain our marketplace services</li>
            <li>To facilitate connections between creators and businesses</li>
            <li>To process payments and calculate platform fees</li>
            <li>To send notifications about gigs, messages, and transactions</li>
            <li>To detect and prevent fraud or unauthorized activities</li>
            <li>To improve our services and develop new features</li>
            <li>To comply with legal obligations under Indian law</li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">4. Information Sharing</h2>
          <div className="space-y-3 text-muted">
            <p>We may share your information with:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><span className="font-bold text-text">Other Users:</span> Profile information is visible to other users in your city</li>
              <li><span className="font-bold text-text">Payment Processors:</span> Razorpay processes payments on our behalf</li>
              <li><span className="font-bold text-text">Service Providers:</span> Convex (database), email service providers</li>
              <li><span className="font-bold text-text">Legal Authorities:</span> When required by Indian law or to protect rights and safety</li>
            </ul>
            <p className="mt-3">We do not sell your personal information to third parties.</p>
          </div>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">5. Data Security</h2>
          <p className="text-muted">
            We implement industry-standard security measures including encryption, secure authentication (OTP-based login), 
            and regular security audits. However, no method of transmission over the internet is 100% secure. 
            You are responsible for maintaining the confidentiality of your account credentials.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">6. Your Rights</h2>
          <p className="text-muted mb-2">Under Indian data protection laws, you have the right to:</p>
          <ul className="list-disc list-inside space-y-2 text-muted ml-4">
            <li>Access and review your personal information</li>
            <li>Correct inaccurate or incomplete data</li>
            <li>Request deletion of your account and data (subject to legal retention requirements)</li>
            <li>Withdraw consent for data processing</li>
            <li>File a complaint with the appropriate data protection authority</li>
          </ul>
          <p className="text-muted mt-3">To exercise these rights, contact us at the details provided below.</p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">7. Data Retention</h2>
          <p className="text-muted">
            We retain your information for as long as your account is active or as needed to provide services. 
            After account deletion, we may retain certain information for legal, tax, or audit purposes as required 
            by Indian law, typically for a period of 7 years.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">8. Children's Privacy</h2>
          <p className="text-muted">
            Our services are intended for users aged 18 and above. We do not knowingly collect information from 
            individuals under 18 years of age. If we discover such information has been collected, we will delete it promptly.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">9. Changes to This Policy</h2>
          <p className="text-muted">
            We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated 
            "Last updated" date. Continued use of our services after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="font-heading font-bold text-lg mb-3">10. Contact Us</h2>
          <div className="text-muted space-y-2">
            <p>For questions about this Privacy Policy or to exercise your rights, contact us at:</p>
            <div className="bg-surface border border-border rounded-card p-4 font-mono text-xs">
              <p>multiply. platform</p>
              <p className="mt-2">Email: privacy@multiply.in</p>
              <p>Address: [Your registered business address in India]</p>
            </div>
          </div>
        </section>

        <section className="pt-4 border-t border-border">
          <p className="text-xs text-dim font-mono">
            This Privacy Policy is governed by the Information Technology Act, 2000 and the Information Technology 
            (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011.
          </p>
        </section>
      </main>
    </div>
  );
}
