import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendPasswordResetEmail = async (email: string, token: string) => {
  
  const appUrl = "http://localhost:3000";
  const resetLink = `${appUrl}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"Planora Team" <${process.env.EMAIL_USER}>`, 
    to: email,
    subject: "Reset your Planora password",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>Hello,</p>
        <p>You requested to reset your Planora password. Click the button below to set a new password:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p style="margin-top: 20px; font-size: 12px; color: gray;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};