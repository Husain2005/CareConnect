import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export const sendOTPEmail = async (email, otp) => {
  // If no API key is configured, log OTP to console for development
  if (!resend) {
    console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
    return;
  }
  
  try {
    await resend.emails.send({
      from: "CareConnect <onboarding@resend.dev>",
      to: email,
      subject: "Your OTP Code - CareConnect",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>CareConnect OTP Verification</h2>
          <p>Your OTP is: <strong style="font-size: 24px;">${otp}</strong></p>
          <p style="color: #666;">This code is valid for 5 minutes.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send email:", error);
    // Fallback to console logging
    console.log(`[FALLBACK] OTP for ${email}: ${otp}`);
  }
};
