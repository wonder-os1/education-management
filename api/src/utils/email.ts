import { Resend } from 'resend'
import { env } from '../config/env'

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!resend) {
    console.log('[email] Skipping (no API key):', { to, subject })
    return { success: true, mock: true }
  }

  try {
    const data = await resend.emails.send({
      from: env.EMAIL_FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    })
    return { success: true, data }
  } catch (error) {
    console.error('[email] Send failed:', error)
    return { success: false, error }
  }
}

export async function sendFeeReminder(
  email: string,
  details: { studentName: string; amount: string; dueDate: string }
) {
  return sendEmail({
    to: email,
    subject: `Fee Payment Reminder - ${env.APP_NAME}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2>Fee Payment Reminder</h2>
        <p>Dear Parent/Guardian of ${details.studentName},</p>
        <p>This is a reminder that a fee payment is due:</p>
        <ul>
          <li><strong>Amount:</strong> ${details.amount}</li>
          <li><strong>Due Date:</strong> ${details.dueDate}</li>
        </ul>
        <p>Please ensure timely payment to avoid any late fees.</p>
        <p>— ${env.APP_NAME}</p>
      </div>
    `,
  })
}

export async function sendFeeReceipt(
  email: string,
  details: { studentName: string; receiptNumber: string; amount: string }
) {
  return sendEmail({
    to: email,
    subject: `Fee Receipt ${details.receiptNumber} - ${env.APP_NAME}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2>Fee Payment Received</h2>
        <p>Dear Parent/Guardian of ${details.studentName},</p>
        <p>We have received the fee payment of <strong>${details.amount}</strong>.</p>
        <p>Receipt: ${details.receiptNumber}</p>
        <p>— ${env.APP_NAME}</p>
      </div>
    `,
  })
}
