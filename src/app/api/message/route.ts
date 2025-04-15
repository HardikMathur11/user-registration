import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getUsersByIds } from '@/utils/userStorage';

// Create email transporter with secure configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const { message, userIds } = await request.json();
    console.log('Received request:', { message, userIds });

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one user must be selected' },
        { status: 400 }
      );
    }

    // Get selected users from JSON storage
    const selectedUsers = getUsersByIds(userIds);
    console.log('Selected users:', selectedUsers);
    
    if (selectedUsers.length === 0) {
      console.log('No valid users found. UserIds:', userIds);
      return NextResponse.json(
        { error: 'No valid users found' },
        { status: 400 }
      );
    }

    // Verify email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email configuration missing');
      return NextResponse.json(
        { error: 'Email configuration is missing' },
        { status: 500 }
      );
    }

    // Send email to each selected user
    const emailPromises = selectedUsers.map(async (user) => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Message from Admin',
        text: `Dear ${user.name},\n\n${message}\n\nBest regards,\nAdmin`,
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Message sent to ${user.email}:`, info.messageId);
        return { success: true, email: user.email };
      } catch (error) {
        console.error(`Failed to send message to ${user.email}:`, error);
        return { success: false, email: user.email, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    });

    const results = await Promise.all(emailPromises);
    const failedEmails = results.filter(result => !result.success);

    if (failedEmails.length > 0) {
      console.error('Failed to send messages to some users:', failedEmails);
      return NextResponse.json({
        success: false,
        message: 'Some messages failed to send',
        failedEmails: failedEmails.map(f => f.email)
      }, { status: 207 });
    }

    return NextResponse.json({
      success: true,
      message: 'Messages sent successfully',
      sentTo: results.filter(r => r.success).map(r => r.email)
    });

  } catch (error) {
    console.error('Error in message API:', error);
    return NextResponse.json(
      { error: 'Failed to send messages', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 