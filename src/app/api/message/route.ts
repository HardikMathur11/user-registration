import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getUsersByIds } from '@/utils/userStorage';

export async function POST(request: Request) {
  try {
    // Parse the request body
    let data;
    try {
      const text = await request.text();
      data = JSON.parse(text);
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    const { message, userIds } = data;

    console.log('Message request:', { message, userIds });

    // Validate required fields
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

    // Get selected users
    const selectedUsers = getUsersByIds(userIds);
    console.log(`Found ${selectedUsers.length} users to send message to`);

    if (selectedUsers.length === 0) {
      return NextResponse.json(
        { error: 'No valid users found' },
        { status: 400 }
      );
    }

    // Check if email configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email configuration is missing');
      return NextResponse.json(
        { error: 'Email service is not configured' },
        { status: 500 }
      );
    }

    // Send emails to selected users
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const results = await Promise.allSettled(
      selectedUsers.map(async (user) => {
        try {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Message from Admin',
            text: `Dear ${user.name},\n\n${message}\n\nBest regards,\nAdmin`,
          };

          await transporter.sendMail(mailOptions);
          return { success: true, userId: user.id };
        } catch (error) {
          console.error(`Failed to send email to ${user.email}:`, error);
          return { success: false, userId: user.id, error };
        }
      })
    );

    // Count successful and failed emails
    const successful = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.filter((r) => r.status === 'rejected' || !r.value.success).length;

    console.log(`Message sent to ${successful} users, failed for ${failed} users`);

    return NextResponse.json({
      message: 'Message sent successfully',
      sent: successful,
      failed,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
} 