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

  const {
    name,
    email,
    phone,
    childName,
    birthYear,
    hasMoreChildren,
    secondChildName,
    secondBirthYear,
    experience,
    message,
    website,
  } = req.body ?? {};

  if (website) {
    return res.status(200).json({ ok: true });
  }

  if (!name || !email || !childName || !birthYear || !experience || !message) {
    return res.status(400).json({ error: "Vyplňte prosím údaje rodiče, dítěte a zprávu." });
  }

  if (hasMoreChildren && (!secondChildName || !secondBirthYear)) {
    return res.status(400).json({ error: "Doplňte prosím i údaje o dalším dítěti." });
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
    return res.status(500).json({ error: "Chybí nastavení e-mailové služby." });
  }

  const recipient = process.env.CONTACT_TO || "vybor@hchaje.cz";

  try {
    const safeName = escapeHtml(String(name));
    const safeEmail = escapeHtml(String(email));
    const safePhone = escapeHtml(String(phone || "—"));
    const safeChildName = escapeHtml(String(childName));
    const safeBirthYear = escapeHtml(String(birthYear));
    const safeSecondChildName = escapeHtml(String(secondChildName || "—"));
    const safeSecondBirthYear = escapeHtml(String(secondBirthYear || "—"));
    const experienceMap: Record<string, string> = {
      none: "0 - žádné",
      some: "1 - už někdy hrála",
      advanced: "2 - hraje dobře - přechod z jiného družstva",
    };
    const safeExperience = escapeHtml(experienceMap[String(experience)] || String(experience));
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
          <hr style="margin: 16px 0; border: none; border-top: 1px solid #ddd;" />
          <p><strong>Dítě:</strong> ${safeChildName}</p>
          <p><strong>Rok narození:</strong> ${safeBirthYear}</p>
          <p><strong>Zkušenosti s házenou:</strong> ${safeExperience}</p>
          ${hasMoreChildren ? `<p><strong>Další dítě:</strong> ${safeSecondChildName} (${safeSecondBirthYear})</p>` : ""}
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
