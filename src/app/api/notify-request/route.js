import sgMail from "@sendgrid/mail";

export async function POST(req) {
  try {
    const body = await req.json();
    const { to, name, pin, status } = body || {};
    const apiKey = process.env.SENDGRID_API_KEY;
    const from = process.env.EMAIL_FROM;
    if (!apiKey || !from) {
      console.warn("SendGrid credentials missing");
      return new Response(JSON.stringify({ error: "SendGrid not configured" }), { status: 500 });
    }
    if (!to) {
      return new Response(JSON.stringify({ error: "Missing recipient" }), { status: 400 });
    }

    sgMail.setApiKey(apiKey);
    const subject = `Your custom build request — ${status}`;
    const text = `Hi ${name || "there"},\n\nYour custom build request (PIN: ${pin || "—"}) status is now: ${status}.\n\nThanks,\nTeam`;
    const html = `<p>Hi ${name || "there"},</p><p>Your custom build request (PIN: <strong>${pin || "—"}</strong>) status is now: <strong>${status}</strong>.</p><p>Thanks,<br/>Team</p>`;

    const msg = {
      to,
      from,
      subject,
      text,
      html,
    };

    await sgMail.send(msg);
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500 });
  }
}
