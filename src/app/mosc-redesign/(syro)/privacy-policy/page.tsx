import React from 'react';
import Link from 'next/link';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';

export const metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy Policy of the Malankara Orthodox Syrian Church (mosc.in) — how we collect, use, and protect your personal information.',
};

const LAST_UPDATED = 'June 2026';

type PolicySection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

const SECTIONS: PolicySection[] = [
  {
    heading: '1. Introduction',
    paragraphs: [
      'The Malankara Orthodox Syrian Church ("the Church", "we", "us", or "our") operates the website mosc.in and its related sub-sites and services. We respect your privacy and are committed to protecting the personal information you share with us.',
      'This Privacy Policy explains what information we collect when you visit or interact with our website, how we use it, and the choices you have. By using mosc.in, you agree to the practices described in this policy.',
    ],
  },
  {
    heading: '2. Information We Collect',
    paragraphs: [
      'We collect information in the following ways:',
    ],
    bullets: [
      'Information you provide directly — such as your name, email address, and phone number when you submit a contact or feedback form, register for an event, or correspond with us.',
      'Information collected automatically — such as your IP address, browser type, device information, pages visited, and the date and time of your visit, gathered through cookies and similar technologies.',
      'Event and donation details — when you participate in events, programs, or offerings facilitated through the website, we may process the details necessary to fulfil those requests.',
    ],
  },
  {
    heading: '3. How We Use Your Information',
    paragraphs: ['We use the information we collect to:'],
    bullets: [
      'Respond to your enquiries, feedback, and prayer or service requests.',
      'Provide and improve our website, content, and online services.',
      'Communicate church news, events, announcements, and spiritual resources where you have requested them.',
      'Process event registrations and related administrative tasks.',
      'Maintain the security and integrity of our website and prevent misuse.',
      'Comply with applicable legal and regulatory obligations.',
    ],
  },
  {
    heading: '4. Cookies and Similar Technologies',
    paragraphs: [
      'Our website uses cookies and similar technologies to remember your preferences, understand how the site is used, and improve your experience. You can control or disable cookies through your browser settings, although some features of the site may not function properly without them.',
    ],
  },
  {
    heading: '5. Sharing of Information',
    paragraphs: [
      'We do not sell or rent your personal information. We may share information only in limited circumstances:',
    ],
    bullets: [
      'With trusted service providers who help us operate the website (for example, hosting, email delivery, or payment processing), bound by confidentiality obligations.',
      'With church administrative bodies, dioceses, or institutions where necessary to respond to your request.',
      'When required by law, regulation, legal process, or to protect the rights, safety, and property of the Church or others.',
    ],
  },
  {
    heading: '6. Data Security',
    paragraphs: [
      'We implement reasonable technical and organisational measures to safeguard your personal information against unauthorised access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is completely secure, and we cannot guarantee absolute security.',
    ],
  },
  {
    heading: '7. Data Retention',
    paragraphs: [
      'We retain personal information only for as long as necessary to fulfil the purposes described in this policy, to comply with our legal obligations, resolve disputes, and enforce our agreements.',
    ],
  },
  {
    heading: '8. Your Rights and Choices',
    paragraphs: [
      'Subject to applicable law, you may request access to, correction of, or deletion of your personal information, and you may opt out of non-essential communications at any time. To exercise these rights, please contact us using the details below.',
    ],
  },
  {
    heading: '9. Third-Party Links',
    paragraphs: [
      'Our website may contain links to external sites operated by dioceses, institutions, or other organisations. We are not responsible for the privacy practices or content of those websites. We encourage you to review their privacy policies separately.',
    ],
  },
  {
    heading: "10. Children's Privacy",
    paragraphs: [
      'Our website is intended for a general audience and is not directed at collecting personal information from children. If you believe a child has provided us with personal information, please contact us so we can take appropriate action.',
    ],
  },
  {
    heading: '11. Changes to This Policy',
    paragraphs: [
      'We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons. Any changes will be posted on this page with an updated revision date.',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-parchment">
      <SyroPageBanner
        title="Privacy Policy"
        breadcrumbFrom="home"
        description="How the Malankara Orthodox Syrian Church collects, uses, and protects your personal information."
      />

      <section className="py-14 md:py-20 bg-parchment border-b border-burgundy/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="rounded-2xl border border-burgundy/15 bg-white/80 shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-burgundy via-burgundy-light to-warmGold" />
            <div className="p-7 md:p-10">
              <p className="text-xs uppercase tracking-widest text-warmGold font-semibold">
                Last updated: {LAST_UPDATED}
              </p>
              <p className="mt-4 text-warmGray-dark leading-relaxed">
                This Privacy Policy describes how the Malankara Orthodox Syrian Church handles personal information in
                connection with the website{' '}
                <span className="font-semibold text-warmBrown-dark">mosc.in</span> and its related online services.
              </p>

              <div className="mt-8 space-y-8">
                {SECTIONS.map((section) => (
                  <div key={section.heading}>
                    <h2 className="text-lg md:text-xl font-semibold text-warmBrown-dark mb-3">{section.heading}</h2>
                    {section.paragraphs?.map((p, i) => (
                      <p key={i} className="text-warmGray-dark leading-relaxed mb-3 last:mb-0">
                        {p}
                      </p>
                    ))}
                    {section.bullets && (
                      <ul className="mt-2 space-y-2">
                        {section.bullets.map((b, i) => (
                          <li key={i} className="flex items-start gap-2 text-warmGray-dark leading-relaxed">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-burgundy/40" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-warmBrown-dark mb-3">12. Contact Us</h2>
                  <p className="text-warmGray-dark leading-relaxed">
                    If you have any questions about this Privacy Policy or how your information is handled, please
                    contact us at{' '}
                    <a
                      href="mailto:info@mosc.in"
                      className="text-burgundy font-semibold hover:text-burgundy-dark transition-colors"
                    >
                      info@mosc.in
                    </a>
                    .
                  </p>
                </div>
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/mosc-redesign/terms-of-use"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border-2 border-burgundy text-burgundy font-semibold text-sm hover:bg-burgundy hover:text-white transition-all duration-300"
                >
                  Terms of Use
                </Link>
                <Link
                  href="/mosc-redesign"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-burgundy/30 text-warmBrown-dark font-semibold text-sm hover:border-burgundy/50 hover:bg-white transition-all duration-300"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
}
