import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

interface SendVerificationEmailParams {
  to: string;
  name: string;
  otp: string;
  expiresInMinutes: number;
}

const SMTP_HOST = process.env.SMTP_HOST ?? "localhost";
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 1025);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM =
  process.env.SMTP_FROM ?? SMTP_USER ?? "no-reply@ojtracker.local";
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME ?? "OJTracker";
const SMTP_SECURE = process.env.SMTP_SECURE === "true";

let transporter: nodemailer.Transporter | null = null;

const getTransporter = () => {
  if (!SMTP_HOST || !SMTP_FROM) {
    throw new Error("Email service is not configured.");
  }

  if (!transporter) {
    const transportOptions: SMTPTransport.Options = {
      host: SMTP_HOST,
      port: Number.isNaN(SMTP_PORT) ? 587 : SMTP_PORT,
      secure: SMTP_SECURE,
    };

    if (SMTP_USER && SMTP_PASS) {
      transportOptions.auth = {
        user: SMTP_USER,
        pass: SMTP_PASS,
      };
    }

    transporter = nodemailer.createTransport(transportOptions);
  }

  return transporter;
};

export const sendVerificationEmail = async (
  params: SendVerificationEmailParams,
): Promise<void> => {
  const { to, name, otp, expiresInMinutes } = params;
  const transporterInstance = getTransporter();
  const fromAddress = `${SMTP_FROM_NAME} <${SMTP_FROM}>`;

  await transporterInstance.sendMail({
    from: fromAddress,
    to,
    subject: "Verify your OJTracker account",
    text: [
      `Hello ${name},`,
      "",
      `Your verification code is: ${otp}`,
      `This code expires in ${expiresInMinutes} minutes.`,
      "If you did not create this account, you can ignore this email.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2 style="margin: 0 0 12px;">Verify your OJTracker account</h2>
        <p>Hello ${name},</p>
        <p>Your verification code is:</p>
        <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 16px 0;">${otp}</div>
        <p>This code expires in ${expiresInMinutes} minutes.</p>
        <p style="color: #6b7280;">If you did not create this account, you can ignore this email.</p>
      </div>
    `,
  });
};
