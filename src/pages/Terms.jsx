import React from 'react'
import { Link } from 'react-router-dom'

const LAST_UPDATED = 'June 2026'

const Section = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="text-lg font-bold text-white mb-4 pb-2 border-b border-[#2D2D4E]">{title}</h2>
    <div className="space-y-3 text-sm text-slate-300 leading-relaxed">{children}</div>
  </section>
)

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#0B0B2E] text-white">

      {/* Top bar */}
      <header className="h-14 bg-[#1E1E35] border-b border-[#2D2D4E] flex items-center px-6 gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/logo.jpg" alt="Co-Found" className="w-7 h-7 rounded-lg object-cover border border-[#2D2D4E]" />
          <span className="font-bold text-white tracking-tight">Co-Found</span>
        </Link>
        <span className="text-[#2D2D4E]">|</span>
        <span className="text-sm text-slate-400">Terms of Service</span>
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
          <h1 className="text-3xl font-extrabold mb-3 tracking-tight">Terms of Service</h1>
          <p className="text-slate-400 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="bg-[#1A1A3E] border border-[#2D2D4E] rounded-2xl p-8">

          <p className="text-sm text-slate-300 leading-relaxed mb-8">
            Welcome to Co-Found. By accessing or using our platform, you agree to be bound by these
            Terms of Service. Please read them carefully before using Co-Found.
          </p>

          <Section title="1. Acceptance of Terms">
            <p>
              By creating an account or using Co-Found in any way, you acknowledge that you have read,
              understood, and agree to be bound by these Terms of Service and our Privacy Policy.
            </p>
            <p>
              If you do not agree to these terms, you may not use Co-Found. We reserve the right to
              update these terms at any time, and continued use of the platform constitutes acceptance
              of any changes.
            </p>
          </Section>

          <Section title="2. Eligibility">
            <p>
              You must be at least 18 years old to use Co-Found. By using the platform, you represent
              and warrant that you meet this age requirement and have the legal capacity to enter into
              a binding agreement.
            </p>
          </Section>

          <Section title="3. User Accounts">
            <p>
              You are responsible for maintaining the security of your account and password. Co-Found
              cannot and will not be liable for any loss or damage from your failure to comply with
              this security obligation.
            </p>
            <p>
              You agree to provide accurate, current, and complete information when creating your
              account and to keep your information up to date. You may not use another user's account
              without permission.
            </p>
          </Section>

          <Section title="4. Acceptable Use">
            <p>You agree not to use Co-Found to:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
              <li>Post false, misleading, or fraudulent content</li>
              <li>Harass, abuse, or threaten other users</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on the intellectual property rights of others</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the platform for spam or unsolicited commercial messages</li>
            </ul>
          </Section>

          <Section title="5. User Content">
            <p>
              You retain ownership of content you post on Co-Found. By posting content, you grant
              Co-Found a non-exclusive, worldwide, royalty-free license to use, display, and distribute
              your content in connection with operating the platform.
            </p>
            <p>
              You are solely responsible for the content you post and any consequences arising from it.
              We reserve the right to remove content that violates these terms.
            </p>
          </Section>

          <Section title="6. Collaborations and Projects">
            <p>
              Co-Found facilitates connections between founders and collaborators but is not a party to
              any agreements made between users. We are not responsible for the outcome of any
              collaboration, project, or business relationship formed through the platform.
            </p>
            <p>
              Users are encouraged to use written agreements when entering into collaborations,
              co-founder relationships, or any business arrangements.
            </p>
          </Section>

          <Section title="7. Privacy">
            <p>
              Your use of Co-Found is also governed by our{' '}
              <Link to="/privacy" className="text-[#6C63FF] hover:underline">Privacy Policy</Link>,
              which is incorporated into these Terms by reference.
            </p>
          </Section>

          <Section title="8. Termination">
            <p>
              We may suspend or terminate your account at any time for violation of these Terms or for
              any other reason at our discretion. You may also delete your account at any time from
              your profile settings.
            </p>
          </Section>

          <Section title="9. Disclaimer of Warranties">
            <p>
              Co-Found is provided "as is" without warranties of any kind. We do not warrant that the
              platform will be uninterrupted, error-free, or free of harmful components.
            </p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>
              To the fullest extent permitted by law, Co-Found shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages arising from your use of or
              inability to use the platform.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              If you have any questions about these Terms, please contact us at{' '}
              <a href="mailto:legal@cofound.dpdns.org" className="text-[#6C63FF] hover:underline">
                legal@cofound.dpdns.org
              </a>{' '}
              or visit our <Link to="/support" className="text-[#6C63FF] hover:underline">support page</Link>.
            </p>
          </Section>

        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500">
          <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
          <span>·</span>
          <Link to="/support" className="hover:text-slate-300 transition-colors">Support</Link>
          <span>·</span>
          <Link to="/" className="hover:text-slate-300 transition-colors">Home</Link>
        </div>

      </div>
    </div>
  )
}
