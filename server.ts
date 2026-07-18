import express from "express";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API: Send email
  app.post("/api/send-email", async (req, res) => {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
      return res.status(400).json({ error: "to, subject, and body are required fields." });
    }

    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = process.env.SMTP_PORT || "587";
    const smtpUser = process.env.SMTP_USER || "webdilowar@gmail.com";
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || smtpUser || "webdilowar@gmail.com";

    if (!smtpPass) {
      console.log("==================================================");
      console.log(`[SIMULATED EMAIL SENT] (Configure SMTP_PASS in secrets to send real emails via ${smtpUser})`);
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${body}`);
      console.log("==================================================");
      
      return res.json({
        success: true,
        simulated: true,
        message: `Email simulated successfully. Please add the SMTP_PASS environment variable in the Settings (Secrets) menu with your Gmail App Password to enable real delivery from ${smtpUser}.`
      });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort || "587"),
        secure: smtpPort === "465", // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'Sodi Euro'}" <${smtpFrom}>`,
        to,
        subject,
        text: body,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);">
            <div style="text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 20px; margin-bottom: 25px;">
              <h2 style="color: #0284c7; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Sodi Euro</h2>
              <p style="color: #64748b; font-size: 13px; margin: 6px 0 0 0; font-weight: 600;">ইউরোপিয়ান স্টুডেন্ট ভিসা পোর্টাল ও ট্র্যাকিং</p>
            </div>
            <div style="color: #334155; line-height: 1.7; font-size: 15px; margin-bottom: 25px;">
              ${body.replace(/\n/g, '<br/>')}
            </div>
            <div style="margin-top: 35px; border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; color: #94a3b8; font-size: 11px; line-height: 1.5;">
              <p style="margin: 0 0 5px 0; font-weight: bold; color: #64748b;">Sodi Euro - Connecting Bangladesh to Bulgaria</p>
              <p style="margin: 0 0 10px 0;">ঢাকা অফিস ও সোফিয়া শাখা, বুলগেরিয়া</p>
              <p style="margin: 0; color: #cbd5e1;">এই ইমেলটি একটি স্বয়ংক্রিয় সিস্টেম থেকে পাঠানো হয়েছে। অনুগ্রহ করে এই ইমেলের সরাসরি উত্তর দিবেন না।</p>
            </div>
          </div>
        `
      });

      console.log(`Email successfully sent to ${to}: ${info.messageId}`);
      return res.json({ success: true, messageId: info.messageId });
    } catch (error: any) {
      console.error("Nodemailer Email Delivery Error:", error);
      return res.status(500).json({
        error: "Failed to send email through SMTP.",
        details: error.message
      });
    }
  });

  // Serve assets and index.html
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
