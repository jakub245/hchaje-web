import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, phone, category, message, website } = req.body ?? {};

  if (website) {
    return res.status(200).json({ ok: true });
  }

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Vyplňte prosím jméno, e-mail a zprávu." });
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
    return res.status(500).json({ error: "Chybí nastavení e-mailové služby." });
  }

  const recipient = process.env.CONTACT_TO || "vybor@hchaje.cz";

  try {
    const safeName = escapeHtml(String(name));
    const safeEmail = escapeHtml(String(email));
    const safePhone = escapeHtml(String(phone || "—"));
    const safeCategory = escapeHtml(String(category || "—"));
    const safeMessage = escapeHtml(String(message)).replace(/\n/g, "<br />");

    await resend.emails.send({
      from: process.env.RESEND_FROM,
      to: [recipient],
      replyTo: email,
      subject: `Nová zpráva z formuláře HC Háje — ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
          <h2>Nová zpráva z webu HC Háje</h2>
          <p><strong>Jméno:</strong> ${safeName}</p>
          <p><strong>E-mail:</strong> ${safeEmail}</p>
          <p><strong>Telefon:</strong> ${safePhone}</p>
          <p><strong>Kategorie / ročník:</strong> ${safeCategory}</p>
          <p><strong>Zpráva:</strong><br />${safeMessage}</p>
        </div>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return res.status(500).json({ error: "Zprávu se nepodařilo odeslat. Zkuste to prosím znovu." });
  }
}
