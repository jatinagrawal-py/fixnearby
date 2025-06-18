import { Resend } from 'resend';

//const resend = new Resend("re_PAAUdv4c_3K3jX4T3btZJqtA2Vstp8P4o"); // ye api key env file mai rakhne se chal nahi rahi idek why //customer
const resend = new Resend("re_g8NU8sVV_GuQDPB5crVTf7xycxQgqwXnj"); // repairer

export const send_email = async (to, otp) => {
  const html = `
  <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9; color: #333; text-align: center;">
    <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); text-align: center;">
      <h2 style="color: #4CAF50;">🔐 Your One-Time Password (OTP)</h2>
      <p>Hello,</p>
      <p>Your OTP for verification is:</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 2px; color: #4CAF50; margin: 20px 0;">${otp}</p>
      <p>This OTP is valid for 1 hour. Please do not share it with anyone.</p>
      <hr style="margin: 30px 0;">
      <p style="font-size: 12px; color: #888;">If you didn’t request this, you can safely ignore this email.</p>
      <p style="font-size: 12px; color: #aaa;">— FixNearby Team</p>
    </div>
  </div>
`;


  try {
    const { data, error } = await resend.emails.send({
      from: 'FixNearby <onboarding@resend.dev>',
      to,
      subject:"Your OTP Code for FixNearby",
      html,
    });

    if (error) {
      console.error('Failed to send email:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Email send error:', err);
    return false;
  }
};
