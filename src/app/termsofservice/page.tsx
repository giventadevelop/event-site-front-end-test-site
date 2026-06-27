import React from 'react';

export default function TermsOfServicePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="mb-4">By using our service, you agree to the following terms and conditions. Please read them carefully.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">User Responsibilities</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
        <li>You agree not to use the service for any unlawful or prohibited activities.</li>
        <li>You are responsible for all activities that occur under your account.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">Acceptable Use</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>Do not upload or share content that is illegal, harmful, or violates the rights of others.</li>
        <li>Do not attempt to disrupt or compromise the security of the service.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">Account Termination</h2>
      <ul className="list-disc ml-6 mb-4">
        <li>We reserve the right to suspend or terminate your account if you violate these terms.</li>
        <li>You may terminate your account at any time by contacting support.</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">Disclaimer</h2>
      <p className="mb-4">Our service is provided "as is" without warranties of any kind. We are not liable for any damages or losses resulting from your use of the service.</p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Contact Us</h2>
      <p>If you have any questions about these Terms of Service, please contact us at <a href="mailto:support@example.com" className="text-blue-600 underline">support@example.com</a>.</p>
    </div>
  );
}