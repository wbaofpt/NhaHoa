import { randomInt, createHash } from "node:crypto";
import nodemailer from "nodemailer";
export const code = () => String(randomInt(100000, 1000000));
export const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const emailTemplate = (value: string) => `<!doctype html><html><body style="margin:0;background:#fbf9f5;color:#30392f;font-family:Arial,sans-serif"><div style="max-width:560px;margin:32px auto;padding:36px 28px;background:#fff;border:1px solid #e2e2d8"><div style="text-align:center;color:#354d3c;font-family:Georgia,serif;font-size:34px">nhà hoa</div><div style="height:1px;background:#e2e2d8;margin:24px 0"></div><p style="font-size:12px;letter-spacing:2px;color:#9c584e;text-align:center;text-transform:uppercase">Xác nhận tài khoản</p><h1 style="font:28px Georgia,serif;text-align:center;font-weight:400">Một chút yêu thương đang chờ bạn.</h1><p style="font-size:15px;line-height:1.7;text-align:center;color:#626957">Dùng mã dưới đây để hoàn tất đăng ký tài khoản Nhà Hoa.</p><div style="margin:28px auto;padding:18px;text-align:center;background:#f4f0e8;color:#354d3c;font:bold 32px Arial;letter-spacing:8px">${value}</div><p style="font-size:12px;line-height:1.7;text-align:center;color:#626957">Mã có hiệu lực trong 10 phút. Nếu bạn không yêu cầu đăng ký, hãy bỏ qua email này.</p><div style="height:1px;background:#e2e2d8;margin:28px 0"></div><p style="font:italic 14px Georgia,serif;text-align:center;color:#9c584e">From our garden, with love.</p></div></body></html>`;
export async function sendEmailCode(to: string, value: string) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  if (smtpUser && smtpPassword) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT || 465),
      secure: true,
      auth: { user: smtpUser, pass: smtpPassword },
    });
    await transporter.sendMail({ from: process.env.MAIL_FROM || smtpUser, to, subject: "Mã xác nhận · Nhà Hoa", html: emailTemplate(value) });
    return;
  }
  const key = process.env.RESEND_API_KEY; const from = process.env.MAIL_FROM;
  if (!key || !from) throw new Error("Thiếu cấu hình Resend (RESEND_API_KEY, MAIL_FROM).");
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to, subject: "Mã xác nhận · Nhà Hoa", html: emailTemplate(value) }) });
  if (!response.ok) throw new Error("Không thể gửi email xác nhận.");
}
export async function sendSmsCode(to: string, value: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID; const token = process.env.TWILIO_AUTH_TOKEN; const from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !token || !from) throw new Error("Thiếu cấu hình Twilio (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER).");
  const body = new URLSearchParams({ To: to, From: from, Body: `Ma xac nhan Nha Hoa: ${value}. Hieu luc 10 phut.` });
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, { method: "POST", headers: { Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" }, body, signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error("Không thể gửi SMS xác nhận.");
}
