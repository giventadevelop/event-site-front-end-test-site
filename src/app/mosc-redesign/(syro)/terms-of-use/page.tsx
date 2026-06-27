import React from 'react';
import Link from 'next/link';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';

export const metadata = {
  title: 'Terms of Use',
  description:
    'Terms of Use governing access to and use of the Malankara Orthodox Syrian Church website (mosc.in).',
};

const LAST_UPDATED = 'June 2026';

type TermsSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

const SECTIONS: TermsSection[] = [
  {
    heading: '1. Acceptance of Terms',
    paragraphs: [
      'These Terms of Use ("Terms") govern your access to and use of the website mosc.in and its related sub-sites and services, operated by the Malankara Orthodox Syrian Church ("the Church", "we", "us", or "our").',
      'By accessing or using this website, you agree to be bound by these Terms. If you do not agree with any part of these Terms, please do not use the website.',
    ],
  },
  {
    heading: '2. Purpose of the Website',
    paragraphs: [
      'This website is provided to share information about the faith, history, administration, dioceses, institutions, events, and spiritual resources of the Malankara Orthodox Syrian Church. It is intended for informational, devotional, and community purposes.',
    ],
  },
  {
    heading: '3. Use of the Website',
    paragraphs: ['When using this website, you agree that you will not:'],
    bullets: [
      'Use the website for any unlawful, harmful, or fraudulent purpose.',
      'Attempt to gain unauthorised access to any part of the website, its servers, or connected systems.',
      'Interfere with, disrupt, or place an undue burden on the website or its infrastructure.',
      'Upload or transmit viruses, malicious code, or any content that is unlawful, defamatory, or offensive.',
      'Misrepresent your identity or impersonate any person or organisation.',
      'Reproduce, distribute, or exploit website content except as expressly permitted by these Terms.',
    ],
  },
  {
    heading: '4. Intellectual Property',
    paragraphs: [
      'Unless otherwise stated, all content on this website — including text, images, logos, the church crest, graphics, liturgical material, and design — is the property of the Malankara Orthodox Syrian Church or its content providers and is protected by applicable intellectual property laws.',
      'You may view and download content for personal, non-commercial, and devotional use only. Any other use, including reproduction or redistribution for commercial purposes, requires prior written permission from the Church.',
    ],
  },
  {
    heading: '5. Submissions and Communications',
    paragraphs: [
      'When you submit information through contact forms, feedback, or other channels, you confirm that the information is accurate and that you have the right to share it. We may use your submissions to respond to you and to improve our services, in accordance with our Privacy Policy.',
    ],
  },
  {
    heading: '6. Third-Party Links and Content',
    paragraphs: [
      'This website may contain links to external websites operated by dioceses, institutions, or other organisations. These links are provided for convenience only. The Church does not control and is not responsible for the content, policies, or practices of any third-party websites.',
    ],
  },
  {
    heading: '7. Accuracy of Information',
    paragraphs: [
      'We make reasonable efforts to ensure that the information on this website is accurate and up to date. However, we do not warrant that all content is complete, current, or error-free. Information may be changed or updated at any time without notice.',
    ],
  },
  {
    heading: '8. Disclaimer of Warranties',
    paragraphs: [
      'This website is provided on an "as is" and "as available" basis. To the fullest extent permitted by law, the Church disclaims all warranties, express or implied, regarding the website and its content, including warranties of merchantability, fitness for a particular purpose, and non-infringement.',
    ],
  },
  {
    heading: '9. Limitation of Liability',
    paragraphs: [
      'To the fullest extent permitted by applicable law, the Church shall not be liable for any direct, indirect, incidental, or consequential damages arising from your access to or use of, or inability to use, the website or its content.',
    ],
  },
  {
    heading: '10. Privacy',
    paragraphs: [
      'Your use of this website is also governed by our Privacy Policy, which explains how we collect and handle your personal information. Please review it to understand our practices.',
    ],
  },
  {
    heading: '11. Changes to These Terms',
    paragraphs: [
      'We may revise these Terms from time to time. Updated Terms will be posted on this page with a revised date, and your continued use of the website after such changes constitutes acceptance of the updated Terms.',
    ],
  },
  {
    heading: '12. Governing Law',
    paragraphs: [
      'These Terms shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles. Any disputes arising from these Terms or your use of the website shall be subject to the jurisdiction of the competent courts in Kerala, India.',
    ],
  },
];

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-parchment">
      <SyroPageBanner
        title="Terms of Use"
        breadcrumbFrom="home"
        description="The terms and conditions governing your use of the Malankara Orthodox Syrian Church website."
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
                These Terms of Use govern your access to and use of the website{' '}
                <span className="font-semibold text-warmBrown-dark">mosc.in</span> and its related online services.
                Please read them carefully.
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
                  <h2 className="text-lg md:text-xl font-semibold text-warmBrown-dark mb-3">13. Contact Us</h2>
                  <p className="text-warmGray-dark leading-relaxed">
                    If you have any questions about these Terms of Use, please contact us at{' '}
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
                  href="/mosc-redesign/privacy-policy"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border-2 border-burgundy text-burgundy font-semibold text-sm hover:bg-burgundy hover:text-white transition-all duration-300"
                >
                  Privacy Policy
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
