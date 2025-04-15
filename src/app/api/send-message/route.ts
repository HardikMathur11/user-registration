import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

export async function POST(req: Request) {
  try {
    const { users, subject, message } = await req.json();

    if (!users || !Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { message: 'No users selected' },
        { status: 400 }
      );
    }

    if (!subject || !message) {
      return NextResponse.json(
        { message: 'Subject and message are required' },
        { status: 400 }
      );
    }

    // Send email to all selected users
    await Promise.all(users.map(async (email) => {
      await transporter.sendMail({
        from: {
          name: 'Hardik Mathur',
          address: process.env.EMAIL_USER as string
        },
        to: email,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="color: #374151; font-size: 16px; line-height: 24px;">
              ${message}
            </div>
            <p style="color: #6B7280; font-size: 14px; text-align: center; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              Best regards,<br>
              Hardik Mathur
            </p>
          </div>
        `
      });
    }));

    return NextResponse.json(
      { message: 'Messages sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending messages:', error);
    return NextResponse.json(
      { message: 'Error sending messages' },
      { status: 500 }
    );
  }
} 