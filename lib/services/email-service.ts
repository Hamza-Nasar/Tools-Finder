import { env } from "@/lib/env";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

function canSendEmail() {
  return Boolean(env.RESEND_API_KEY && env.EMAIL_FROM);
}

function canSendAdminInviteWithEmailJs() {
  return Boolean(env.EMAILJS_SERVICE_ID && env.EMAILJS_ADMIN_INVITE_TEMPLATE_ID && env.EMAILJS_PUBLIC_KEY);
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

async function sendAdminInviteWithEmailJs(input: {
  to: string;
  invitedByEmail: string;
  inviteUrl: string;
  expiresAt: string;
}) {
  if (!canSendAdminInviteWithEmailJs()) {
    return { delivered: false };
  }

  const body: Record<string, unknown> = {
    service_id: env.EMAILJS_SERVICE_ID,
    template_id: env.EMAILJS_ADMIN_INVITE_TEMPLATE_ID,
    user_id: env.EMAILJS_PUBLIC_KEY,
    template_params: {
      to_email: input.to,
      invited_by_email: input.invitedByEmail,
      invite_url: input.inviteUrl,
      expires_at: input.expiresAt
    }
  };

  if (env.EMAILJS_PRIVATE_KEY) {
    body.accessToken = env.EMAILJS_PRIVATE_KEY;
  }

  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("EmailJS admin invite delivery failed.", errorText);
    return { delivered: false };
  }

  return { delivered: true };
}

export class EmailService {
  static async sendAdminInviteEmail(input: {
    to: string;
    invitedByEmail: string;
    inviteUrl: string;
    expiresAt: string;
  }) {
    if (!canSendEmail()) {
      return sendAdminInviteWithEmailJs(input);
    }

    return sendEmail({
      to: input.to,
      subject: "Your AI Tools Finder admin invite",
      html: `
        <h1>Admin invite</h1>
        <p>${input.invitedByEmail} invited you to join AI Tools Finder as an admin.</p>
        <p>This invite expires on <strong>${input.expiresAt}</strong>.</p>
        <p><a href="${input.inviteUrl}">Accept admin invite</a></p>
        <p>If you did not expect this invite, ignore this email.</p>
      `
    });
  }

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
