// src/services/contactServices.ts
"use server"

import { Resend } from "resend";

const resend = new Resend("re_AD1opuL2_QEwn4pebz697W2nKRMMDncCr"); 

 export async function sendContactMessage(payload: { fullName: string; email: string; message: string }) {
  try {
    const { fullName, email, message } = payload;

    await resend.emails.send({
      from: "Universe System <onboarding@resend.dev>", 
      to: "rashedymahmoud66@gmail.com", 
      subject: `New Message from ${fullName} (Universe)`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; direction: rtl; text-align: right;">
          <h2 style="color: #1a62ff;">رسالة جديدة من سيستم Universe</h2>
          <p><strong>الاسم:</strong> ${fullName}</p>
          <p><strong>الإيميل:</strong> ${email}</p>
          <p><strong>الرسالة:</strong></p>
          <p style="background: #f8f9fa; padding: 15px; border-radius: 8px;">${message}</p>
        </div>
      `,
    });

    return { success: true };
  } catch (error: any) {
    throw new Error(error.message || "Failed to send email");
  }
}