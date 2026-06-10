import React from 'react'
import { Link } from 'react-router-dom'

const LAST_UPDATED = 'June 2025'

const Section = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="text-lg font-bold text-white mb-4 pb-2 border-b border-[#2D2D4E]">{title}</h2>
    <div className="space-y-3 text-sm text-slate-300 leading-relaxed">{children}</div>
  </section>
)

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0B0B2E] text-white">

      {/* Top bar */}
      <header className="h-14 bg-[#1E1E35] border-b border-[#2D2D4E] flex items-center px-6 gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo.jpg" alt="Co-Found" className="w-7 h-7 rounded-lg object-cover border border-[#2D2D4E]" />
          <span className="font-bold text-white tracking-tight">Co-Found</span>
        </Link>
        <span className="text-[#2D2D4E]">|</span>
        <span className="text-sm text-slate-400">Privacy Policy</span>
        <Link to="/" className="ml-auto text-sm text-[#6C63FF] hover:text-[#4F46E5] transition-colors">
          ← Back
        </Link>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Hero */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#00D4AA] mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00D4AA]" />
            Legal
          </div>
          <h1 className="text-3xl font-extrabold mb-3 tracking-tight">Privacy Policy</h1>
          <p className="text-slate-400 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="bg-[#1A1A3E] border border-[#2D2D4E] rounded-2xl p-8">

          <p className="text-sm text-slate-300 leading-relaxed mb-8">
            At Co-Found, we take your privacy seriously. This Privacy Policy explains how we collect,
            use, and protect your personal information when you use our platform.
          </p>

          <Section title="1. Information We Collect">
            <p><strong className="text-white">Account information:</strong> When you register, we collect your name, email address, username, and password.</p>
            <p><strong className="text-white">Profile information:</strong> Information you choose to add to your profile, such as your bio, skills, location, portfolio, and profile picture.</p>
            <p><strong className="text-white">Usage data:</strong> Information about how you use Co-Found, including pages visited, features used, and interactions with other users.</p>
            <p><strong className="text-white">Communications:</strong> Messages and content you send or post on the platform.</p>
            <p><strong className="text-white">Identity verification:</strong> If you submit identity verification, we collect the documents you provide for that purpose.</p>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
              <li>Provide, operate, and improve Co-Found</li>
              <li>Match you with relevant projects and collaborators</li>
              <li>Send transactional emails (verification, password reset, notifications)</li>
              <li>Monitor and enforce our Terms of Service</li>
              <li>Prevent fraud, abuse, and security issues</li>
              <li>Respond to your support requests</li>
            </ul>
          </Section>

          <Section title="3. Information Sharing">
            <p>
              We do not sell your personal information to third parties. We may share your information:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
              <li>With other users as part of your public profile (only information you choose to make visible)</li>
              <li>With service providers who assist in operating the platform (under confidentiality agreements)</li>
              <li>When required by law or to protect the rights and safety of Co-Found and its users</li>
            </ul>
          </Section>

          <Section title="4. Data Retention">
            <p>
              We retain your personal information for as long as your account is active or as needed
              to provide services. You may delete your account at any time, which will result in the
              deletion of your personal information, subject to legal retention requirements.
            </p>
          </Section>

          <Section title="5. Security">
            <p>
              We implement industry-standard security measures to protect your personal information,
              including encryption in transit and at rest, secure authentication, and regular security
              reviews.
            </p>
            <p>
              However, no method of transmission over the internet is 100% secure. We encourage you
              to use a strong, unique password and to contact us immediately if you suspect any
              unauthorized access to your account.
            </p>
          </Section>

          <Section title="6. Your Rights">
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal information</li>
              <li>Object to or restrict certain processing of your data</li>
              <li>Export your data in a portable format</li>
            </ul>
            <p>
              To exercise these rights, contact us at{' '}
              <a href="mailto:privacy@cofound.dpdns.org" className="text-[#6C63FF] hover:underline">
                privacy@cofound.dpdns.org
              </a>.
            </p>
          </Section>

          <Section title="7. Cookies">
            <p>
              Co-Found uses cookies and similar technologies to maintain your session, remember your
              preferences, and understand how you use the platform. You can control cookies through
              your browser settings, though disabling them may affect platform functionality.
            </p>
          </Section>

          <Section title="8. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant
              changes by email or through a notice on the platform. Your continued use of Co-Found
              after changes take effect constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="9. Contact">
            <p>
              For privacy-related questions or requests, contact us at{' '}
              <a href="mailto:privacy@cofound.dpdns.org" className="text-[#6C63FF] hover:underline">
                privacy@cofound.dpdns.org
              </a>{' '}
              or visit our <Link to="/support" className="text-[#6C63FF] hover:underline">support page</Link>.
            </p>
          </Section>

        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500">
          <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
          <span>·</span>
          <Link to="/support" className="hover:text-slate-300 transition-colors">Support</Link>
          <span>·</span>
          <Link to="/" className="hover:text-slate-300 transition-colors">Home</Link>
        </div>

      </div>
    </div>
  )
}
