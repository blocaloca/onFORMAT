import { Resend } from 'resend';

// Initialize Resend with the API key from environment variables
export const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Utility to send a transactional email
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = 'onFORMAT <onboarding@resend.dev>'
}: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('❌ Resend Error:', error);
      return { error };
    }

    return { data };
  } catch (err) {
    console.error('🚨 Unexpected Email Error:', err);
    return { error: err };
  }
}
