import sgMail from "@sendgrid/mail";

export async function POST(req) {
  try {
    const body = await req.json();
    const to = body?.to;
    const apiKey = process.env.SENDGRID_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!apiKey || !from) {
      return new Response(JSON.stringify({ error: "SendGrid not configured" }), { status: 500 });
    }
    if (!to) {
      return new Response(JSON.stringify({ error: "Missing recipient" }), { status: 400 });
    }

    sgMail.setApiKey(apiKey);
    const msg = {
      to,
      from,
      subject: "Test email from AttendX",
      text: "This is a test message sent via SendGrid.",
    };
    await sgMail.send(msg);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500 });
  }
}
