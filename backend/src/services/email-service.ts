import { env } from "../config/env";

export type OrderStatusEmailInput = {
  to: string;
  customerName?: string | null;
  orderTitle: string;
  status: string;
  shopName?: string | null;
};

function subjectForStatus(status: string, orderTitle: string) {
  const normalized = status.toUpperCase();
  if (normalized === "PROCESSING") return `Your Meramot order ${orderTitle} is being processed`;
  if (normalized === "ON_THE_WAY" || normalized === "RETURNING") return `Your Meramot order ${orderTitle} is on the way`;
  if (normalized === "COMPLETED") return `Your Meramot order ${orderTitle} is complete`;
  return `Update for your Meramot order ${orderTitle}`;
}

function htmlForStatus({ customerName, orderTitle, status, shopName }: OrderStatusEmailInput) {
  const greeting = customerName ? `Hi ${customerName},` : "Hello,";
  const readableStatus = status.replace(/_/g, " ").toLowerCase();
  return `
    <div style="font-family: Arial, sans-serif; color: #173626; line-height: 1.6;">
      <h2 style="margin-bottom: 8px;">Meramot order update</h2>
      <p>${greeting}</p>
      <p>Your order <strong>${orderTitle}</strong> is now <strong>${readableStatus}</strong>.</p>
      ${shopName ? `<p>Shop: <strong>${shopName}</strong></p>` : ""}
      <p>You can check your order progress in your Meramot account.</p>
      <p style="margin-top: 24px;">Thanks,<br />Meramot</p>
    </div>
  `;
}

export async function sendOrderStatusEmail(input: OrderStatusEmailInput) {
  if (!env.enableEmailNotifications) {
    return { ok: false, skipped: true, reason: "email notifications disabled" };
  }

  if (!env.resendApiKey) {
    throw new Error("RESEND_API_KEY is missing");
  }

  if (!env.emailFrom) {
    throw new Error("EMAIL_FROM is missing");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.emailFrom,
      to: [input.to],
      subject: subjectForStatus(input.status, input.orderTitle),
      html: htmlForStatus(input),
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.error || `Resend request failed with ${response.status}`);
  }

  return { ok: true, skipped: false, provider: "resend", data };
}
