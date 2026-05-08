// server/utils/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const APP = 'EventRevo';
const URL = process.env.CLIENT_URL || 'http://localhost:3000';
const FROM = process.env.EMAIL_FROM || 'noreply@eventrevo.com.au';

const base = (content) => `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
body{font-family:Arial,sans-serif;background:#090c09;color:#eef5e8;margin:0;padding:0}
.wrap{max-width:560px;margin:0 auto;padding:40px 20px}
.logo{font-size:26px;font-weight:900;letter-spacing:4px;margin-bottom:32px}
.logo span{color:#a8ff3e}
.card{background:#111511;border:1px solid rgba(168,255,62,0.12);border-radius:6px;padding:28px}
.btn{display:inline-block;background:#a8ff3e;color:#090c09;padding:12px 28px;border-radius:4px;text-decoration:none;font-weight:700;margin-top:16px}
.muted{color:rgba(238,245,232,0.45);font-size:13px}
hr{border:none;border-top:1px solid rgba(168,255,62,0.1);margin:20px 0}
</style></head><body>
<div class="wrap">
  <div class="logo">EVENT<span>REVO</span></div>
  ${content}
  <hr><p class="muted">© ${new Date().getFullYear()} EventRevo — Canberra, ACT</p>
</div></body></html>`;

exports.sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({ from: FROM, to, subject, html });
};

exports.sendBookingRequestEmail = async ({ djEmail, djName, customerName, eventType, eventDate, location, bookingId }) => {
  await transporter.sendMail({
    from: FROM, to: djEmail,
    subject: `New booking request — ${eventType} on ${eventDate}`,
    html: base(`<div class="card">
      <h2>New Booking Request 🎧</h2>
      <p>Hi ${djName},</p>
      <p><strong>${customerName}</strong> wants to book you for a <strong>${eventType}</strong> on <strong>${eventDate}</strong> at ${location}.</p>
      <a href="${URL}/dashboard/dj" class="btn">Review Request →</a>
    </div><p class="muted" style="margin-top:12px">Log in to confirm or decline within 48 hours.</p>`),
  });
};

exports.sendBookingConfirmedEmail = async ({ customerEmail, customerName, djStageName, eventType, eventDate, location, bookingId, depositAmount }) => {
  await transporter.sendMail({
    from: FROM, to: customerEmail,
    subject: `Booking confirmed — ${djStageName} for your ${eventType}`,
    html: base(`<div class="card">
      <h2>Booking Confirmed! 🎉</h2>
      <p>Hi ${customerName},</p>
      <p><strong>${djStageName}</strong> has confirmed your booking!</p>
      <p><strong>Event:</strong> ${eventType}<br><strong>Date:</strong> ${eventDate}<br><strong>Venue:</strong> ${location}</p>
      <p><strong>Deposit due:</strong> A$${depositAmount.toFixed(2)}</p>
      <a href="${URL}/dashboard/customer" class="btn">Pay Deposit →</a>
    </div><p class="muted" style="margin-top:12px">Your booking is held for 48 hours pending deposit payment.</p>`),
  });
};

exports.sendBookingDeclinedEmail = async ({ customerEmail, customerName, djStageName, eventDate }) => {
  await transporter.sendMail({
    from: FROM, to: customerEmail,
    subject: `Booking update — ${djStageName}`,
    html: base(`<div class="card">
      <h2>Booking Update</h2>
      <p>Hi ${customerName},</p>
      <p>Unfortunately <strong>${djStageName}</strong> is unavailable for ${eventDate}.</p>
      <p>Don't worry — we have plenty of other great DJs available.</p>
      <a href="${URL}/djs" class="btn">Browse Other DJs →</a>
    </div>`),
  });
};
