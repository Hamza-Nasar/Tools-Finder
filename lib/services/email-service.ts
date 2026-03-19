import { env } from "@/lib/env";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

function canSendEmail() {
  return Boolean(env.RESEND_API_KEY && env.EMAIL_FROM);
}

async function sendEmail(payload: EmailPayload) {
  if (!canSendEmail()) {
    return { delivered: false };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Email delivery failed.", errorText);
    return { delivered: false };
  }

  return { delivered: true };
}

export class EmailService {
  static async sendSubmissionReceivedEmail(input: {
    toolName: string;
    categoryName: string;
    submissionUrl?: string;
  }) {
    const to = env.ADMIN_NOTIFICATION_EMAIL ?? env.ADMIN_EMAIL;

    if (!to) {
      return { delivered: false };
    }

    return sendEmail({
      to,
      subject: `New AI tool submission: ${input.toolName}`,
      html: `
        <h1>New tool submission received</h1>
        <p><strong>Tool:</strong> ${input.toolName}</p>
        <p><strong>Category:</strong> ${input.categoryName}</p>
        ${
          input.submissionUrl
            ? `<p><a href="${input.submissionUrl}">Open moderation queue</a></p>`
            : ""
        }
      `
    });
  }

  static async sendSubmissionApprovedEmail(input: {
    to: string;
    toolName: string;
    toolUrl?: string;
  }) {
    return sendEmail({
      to: input.to,
      subject: `${input.toolName} was approved on AI Tools Finder`,
      html: `
        <h1>Your submission was approved</h1>
        <p>${input.toolName} is now live on AI Tools Finder.</p>
        ${
          input.toolUrl
            ? `<p><a href="${input.toolUrl}">View the live listing</a></p>`
            : ""
        }
      `
    });
  }

  static async sendSubmissionConfirmationEmail(input: {
    to: string;
    toolName: string;
    queueUrl?: string;
  }) {
    return sendEmail({
      to: input.to,
      subject: `${input.toolName} was submitted to AI Tools Finder`,
      html: `
        <h1>Your tool is in review</h1>
        <p>We received <strong>${input.toolName}</strong> and added it to the moderation queue.</p>
        <p>We will email you again when the listing is approved.</p>
        ${input.queueUrl ? `<p><a href="${input.queueUrl}">Submit another tool</a></p>` : ""}
      `
    });
  }

  static async sendFeaturedPurchaseEmail(input: {
    to: string;
    toolName: string;
    featuredUntil: string;
    manageUrl?: string;
  }) {
    return sendEmail({
      to: input.to,
      subject: `${input.toolName} is now featured`,
      html: `
        <h1>Your featured listing is active</h1>
        <p><strong>${input.toolName}</strong> has been upgraded to a featured listing.</p>
        <p>The placement is active until <strong>${input.featuredUntil}</strong>.</p>
        ${
          input.manageUrl
            ? `<p><a href="${input.manageUrl}">Open the listing</a></p>`
            : ""
        }
      `
    });
  }
}
