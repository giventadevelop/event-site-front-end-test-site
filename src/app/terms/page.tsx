import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms and Conditions</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using this website and our event registration services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Event Registration</h2>
            <div className="text-gray-700 mb-4">
              <p className="mb-3">When registering for events through our platform:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All registrations are subject to approval by event organizers</li>
                <li>You must provide accurate and complete information</li>
                <li>Registration does not guarantee event attendance</li>
                <li>Event organizers reserve the right to cancel or modify events</li>
                <li>Guest information must be accurate and complete</li>
                <li>You are responsible for your guests' behavior at events</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts and Profiles</h2>
            <div className="text-gray-700 mb-4">
              <p className="mb-3">When creating an account or profile:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must provide accurate and current information</li>
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>You must notify us immediately of any unauthorized use</li>
                <li>We reserve the right to suspend or terminate accounts for violations</li>
                <li>Profile information may be subject to review and approval</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Privacy and Data Protection</h2>
            <p className="text-gray-700 mb-4">
              We are committed to protecting your privacy. Please review our Privacy Policy to understand how we collect, use, and protect your personal information. By using our services, you consent to the collection and use of information as outlined in our Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Event Conduct and Behavior</h2>
            <div className="text-gray-700 mb-4">
              <p className="mb-3">All event attendees and guests must:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Follow all event rules and guidelines</li>
                <li>Respect other attendees and event staff</li>
                <li>Comply with venue policies and local laws</li>
                <li>Not engage in disruptive or inappropriate behavior</li>
                <li>Follow health and safety protocols</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cancellation and Refunds</h2>
            <div className="text-gray-700 mb-4">
              <p className="mb-3">Regarding event cancellations and refunds:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Event organizers may cancel events due to circumstances beyond their control</li>
                <li>Refund policies vary by event and are determined by the event organizer</li>
                <li>We are not responsible for refunds for third-party events</li>
                <li>Registration fees may be non-refundable in certain circumstances</li>
                <li>Contact the event organizer directly for refund inquiries</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of our services or attendance at events.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              All content, trademarks, and intellectual property on this platform are owned by us or our licensors. You may not use, reproduce, or distribute any content without our express written permission.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Modifications to Terms</h2>
            <p className="text-gray-700 mb-4">
              We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new terms on this page. Your continued use of our services after any modifications constitutes acceptance of the updated terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms and Conditions, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong> support@malayalees-us.org<br />
                <strong>Phone:</strong> (555) 123-4567<br />
                <strong>Address:</strong> 123 Community Center, City, State 12345
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Governing Law</h2>
            <p className="text-gray-700 mb-4">
              These terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions. Any disputes arising from these terms or your use of our services shall be subject to the exclusive jurisdiction of the courts in our jurisdiction.
            </p>
          </section>

          <div className="border-t pt-6 mt-8">
            <p className="text-sm text-gray-500">
              By using our event registration services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
            </p>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Link
            href="/"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
