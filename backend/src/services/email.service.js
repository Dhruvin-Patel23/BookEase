const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOTPEmail = async (toEmail, otp) => {
  await transporter.sendMail({
    from: `"BookEase" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your BookEase password reset OTP",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px">
        <h2 style="color:#1e3a8a;margin-bottom:8px">Reset your password</h2>
        <p style="color:#475569;margin-bottom:24px">
          Use the OTP below to reset your BookEase password.
          It expires in <strong>10 minutes</strong>.
        </p>
        <div style="background:#eff6ff;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
          <span style="font-size:36px;font-weight:800;letter-spacing:12px;color:#2563eb">
            ${otp}
          </span>
        </div>
        <p style="color:#94a3b8;font-size:12px">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
};
