import { env } from "../config/env.js";
import nodemailer from "nodemailer";
import { sendGmailApiEmail } from "./gmail-api-service.js";

type CredentialEmailInput = {
  toEmail: string;
  recipientName: string;
  username: string;
  password: string;
};

type RegistrationAcknowledgementEmailInput = {
  toEmail: string;
  recipientName: string;
};

type DeliveryEmailInput = {
  toEmail: string;
  subject: string;
  html: string;
};

const directSmtpConfig = {
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  user: "asirmahmuhddd@gmail.com",
  pass: "uckq encg hsxz laqt",
  from: "Meeramoot <asirmahmuhddd@gmail.com>",
};

function hasSmtpConfig() {
  return Boolean(
    directSmtpConfig.host &&
      directSmtpConfig.port &&
      directSmtpConfig.user &&
      directSmtpConfig.pass &&
      directSmtpConfig.from,
  );
}

async function sendDeliveryModuleEmail(input: DeliveryEmailInput) {
  if (!env.enableEmailNotifications) {
    return { ok: false, skipped: true, reason: "email notifications disabled" };
  }

  if (!hasSmtpConfig()) {
    return { ok: false, skipped: true, reason: "missing smtp config" };
  }

  const transporter = nodemailer.createTransport({
    host: directSmtpConfig.host,
    port: directSmtpConfig.port,
    secure: directSmtpConfig.secure,
    auth: {
      user: directSmtpConfig.user,
      pass: directSmtpConfig.pass,
    },
  });

  await transporter.sendMail({
    from: directSmtpConfig.from,
    to: input.toEmail,
    subject: input.subject,
    html: input.html,
  });

  return { sent: true, provider: "nodemailer" };
}

export async function sendDeliveryCredentialsEmail(input: CredentialEmailInput) {
  if (!hasSmtpConfig()) {
    console.warn("[delivery-email] SMTP config missing. Credentials:", input.username, input.password);
    return { ok: false, skipped: true, reason: "missing smtp config" };
  }

  const subject = "Delivery Partner Approval - Login Credentials";
  const html = `
    <div style="font-family: Arial, sans-serif; color: #173626; line-height: 1.6;">
      <h2>Delivery Partner Registration Approved</h2>
      <p>Hello ${input.recipientName},</p>
      <p>Your delivery partner registration has been approved.</p>
      <p>Use the credentials below to sign in to the delivery portal:</p>
      <p>Username: <strong>${input.username}</strong></p>
      <p>Password: <strong>${input.password}</strong></p>
     
    </div>
  `;

  return sendDeliveryModuleEmail({
    toEmail: input.toEmail,
    subject,
    html,
  });
  // 1. Send via Gmail API over HTTPS (Added because Render blocks SMTP ports and Resend free tier is restricted to verified emails only)
  try {
    await sendGmailApiEmail({
      to: input.toEmail,
      subject,
      html,
    });
    console.log(`[DeliveryEmail] Gmail API successfully sent to ${input.toEmail}`);
  } catch (err) {
    console.error(`[DeliveryEmail] Gmail API error: ${err}`);
  }

  // 2. Send via Resend (Original Logic)
  if (env.resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Meramot Delivery <noreply@meramot.com>",
          to: input.toEmail,
          subject,
          html,
        }),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error(`[DeliveryEmail] Resend API error: ${res.status} ${errorBody}`);
      }
    } catch (err) {
      console.error(`[DeliveryEmail] Resend network error: ${err}`);
    }
  } else {
    console.warn("[email-fallback] Resend API Key is missing. Credentials:", input.username, input.password);
  }

  return { sent: true };
}

export async function sendDeliveryRegistrationAcknowledgementEmail(
  input: RegistrationAcknowledgementEmailInput,
) {
  if (!env.enableEmailNotifications) {
    return { ok: false, skipped: true };
  }


  const subject = "Delivery Registration Received - Under Review";
  const html = `
    <div style="font-family: Arial, sans-serif; color: #173626; line-height: 1.6;">
      <h2>Delivery Registration Received</h2>
      <p>Hello ${input.recipientName},</p>
      <p>We have successfully received your delivery partner registration details.</p>
      <p>Our team will review your submission and send a confirmation email after approval.</p>
      <p>Thank you for your patience.</p>
      <p>Meeramoot Delivery Team</p>
    </div>
  `;

  return sendDeliveryModuleEmail({
    toEmail: input.toEmail,
    subject,
    html,
  });
  // 1. Send via Gmail API over HTTPS (Added because Render blocks SMTP ports and Resend free tier is restricted to verified emails only)
  try {
    await sendGmailApiEmail({
      to: input.toEmail,
      subject,
      html,
    });
  } catch (err) {
    console.error(`[DeliveryEmail] Gmail API error: ${err}`);
  }

  // 2. Send via Resend (Original Logic)
  if (env.resendApiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Meramot Delivery <noreply@meramot.com>",
          to: input.toEmail,
          subject,
          html,
        }),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error(`[DeliveryEmail] Resend API error: ${res.status} ${errorBody}`);
      }
    } catch (err) {
      console.error(`[DeliveryEmail] Resend network error: ${err}`);
    }
  }

  return { sent: true };
}
