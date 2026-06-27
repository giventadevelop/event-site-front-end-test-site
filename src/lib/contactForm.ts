import type { TenantEmailAddressDTO } from '@/types';

/** Email type for public contact / footer inquiry forms (matches admin tenant-email-addresses select). */
export const CONTACT_FORM_EMAIL_TYPE: TenantEmailAddressDTO['emailType'] = 'CONTACT';

export interface ContactFormSubmitPayload {
  firstName: string;
  lastName: string;
  messageBody: string;
  senderEmail: string;
  emailType: TenantEmailAddressDTO['emailType'];
}

export function buildContactFormPayload(input: {
  firstName: string;
  lastName: string;
  messageBody: string;
  senderEmail: string;
  emailType?: TenantEmailAddressDTO['emailType'];
}): ContactFormSubmitPayload {
  return {
    firstName: input.firstName,
    lastName: input.lastName,
    messageBody: input.messageBody,
    senderEmail: input.senderEmail.trim(),
    emailType: input.emailType ?? CONTACT_FORM_EMAIL_TYPE,
  };
}
