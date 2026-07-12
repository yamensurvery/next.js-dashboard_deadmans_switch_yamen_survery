import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTestEmail(to: string) {
  const { data, error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to,
    subject: "Dead Man's Switch — Test Notification",
    html: "<p>This is a test notification from your dead man's switch app. If you're seeing this, the Resend integration works.</p>",
  });

  if (error) {
    throw new Error(`Resend send failed: ${error.message}`);
  }

  return data;
}