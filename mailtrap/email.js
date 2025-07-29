import { VERIFICATION_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } from "./emailTemplate.js";
import { transporter, sender } from './mailer.config.js';

export const sendVerificationEmail = async (email, verificationToken) => {
  const html = VERIFICATION_EMAIL_TEMPLATE.replace('{verificationCode}', verificationToken);

  try {
    const info = await transporter.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Verify your email address",
      html,
    });

    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Could not send verification email.");
  }
};

export const sendWelcomeEmail = async (email) => {
  try {
    const info = await transporter.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Welcome to our website",
      html: WELCOME_EMAIL_TEMPLATE,
    });

    console.log("Welcome email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error("Could not send welcome email.");
  }
};

export const sendPasswordResetEmail = async (email, token) => {
  const baseURL = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetURL = `${baseURL}/reset-password/${token}`;
  const html = PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL);

  try {
    const info = await transporter.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Password reset request",
      html,
    });

    console.log("Password reset email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Could not send password reset email.");
  }
};


export const sendResetSuccessEmail = async (email) => {
  try {
    const info = await transporter.sendMail({
      from: `"${sender.name}" <${sender.email}>`,
      to: email,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    });

    console.log("Password reset success email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending reset success email:", error);
    throw new Error("Could not send password reset success email.");
  }
};
