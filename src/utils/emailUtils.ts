// src/utils/emailUtils.ts

import axios from 'axios';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const SENDGRID_API_KEY = process.env.REACT_APP_SENDGRID_API_KEY!;
    const senderEmail = 'bryan@stemgreenhouse.org'; // Replace with your verified sender email

    await axios.post(
      'https://api.sendgrid.com/v3/mail/send',
      {
        personalizations: [{ to: [{ email: options.to }] }],
        from: { email: senderEmail },
        subject: options.subject,
        content: [{ type: 'text/html', value: options.html }],
      },
      {
        headers: {
          Authorization: `Bearer ${SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
