import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { 
  saveUser, 
  getPendingRegistration, 
  savePendingRegistration, 
  deletePendingRegistration,
  getUserByEmail
} from '@/utils/userStorage';

// Function to generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to send OTP email
async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Registration',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Your OTP for Registration</h2>
          <p>Thank you for registering. Please use the following OTP to complete your registration:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you did not request this OTP, please ignore this email.</p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
}

// Function to send welcome email
async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to Our Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Welcome to Our Platform!</h2>
          <p>Hello ${name},</p>
          <p>Thank you for registering with us. We're excited to have you on board!</p>
          <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
          <p>Best regards,<br>The Team</p>
        </div>
      `,
    });

    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    console.log('Registration request received');
    const body = await request.json();
    const { name, email, mobile, city, otp } = body;

    // If OTP is not provided, generate and send it
    if (!otp) {
      // Validate required fields
      if (!name || !email || !mobile || !city) {
        return NextResponse.json(
          { error: 'Name, email, mobile, and city are required' },
          { status: 400 }
        );
      }

      // Check if user already exists
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already registered' },
          { status: 400 }
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }

      // Validate mobile number format (10 digits)
      const mobileRegex = /^[0-9]{10}$/;
      if (!mobileRegex.test(mobile)) {
        return NextResponse.json(
          { error: 'Mobile number must be 10 digits' },
          { status: 400 }
        );
      }

      // Generate OTP
      const generatedOTP = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes from now

      // Save pending registration
      await savePendingRegistration(email, {
        id: email,
        name,
        email,
        mobile,
        city,
        otp,
        expiresAt,
      });

      // Send OTP email
      const emailSent = await sendOTPEmail(email, generatedOTP);
      if (!emailSent) {
        return NextResponse.json(
          { error: 'Failed to send OTP email' },
          { status: 500 }
        );
      }

      return NextResponse.json({ message: 'OTP sent successfully' });
    }

    // If OTP is provided, verify it and complete registration
    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required for verification' },
        { status: 400 }
      );
    }

    // Get pending registration
    const pendingRegistration = await getPendingRegistration(email);
    
    if (!pendingRegistration) {
      return NextResponse.json(
        { error: 'No pending registration found' },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    const expiresAt = new Date(pendingRegistration.expiresAt);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'OTP has expired' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (pendingRegistration.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Create user
    const user = {
      id: uuidv4(),
      name: pendingRegistration.name,
      email: pendingRegistration.email,
      mobile: pendingRegistration.mobile,
      city: pendingRegistration.city,
      registeredAt: new Date().toISOString(),
    };

    // Save user
    await saveUser(user);

    // Delete pending registration
    await deletePendingRegistration(email);

    // Send welcome email (don't wait for it to complete)
    await sendWelcomeEmail(user.email, user.name).catch(error => {
      console.error('Error sending welcome email:', error);
    });

    return NextResponse.json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
} 