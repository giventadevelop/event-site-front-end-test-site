import { redirect } from 'next/navigation';

export default function LegacyEmailPageRedirect() {
  // Preserve backward compatibility but move traffic to the new route
  redirect('/mosc/contact-form-email');
}











