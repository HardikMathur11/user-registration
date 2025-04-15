import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { 
  saveUser, 
  User, 
  getPendingRegistration, 
  savePendingRegistration, 
  deletePendingRegistration,
  PendingRegistration
} from '@/utils/userStorage';

// Function to generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to send OTP email
async function sendOTPEmail(email: string, otp: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for Registration',
    text: `Your OTP for registration is: ${otp}. This OTP will expire in 5 minutes.`,
  };

  await transporter.sendMail(mailOptions);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, mobile, city, otp } = data;

    console.log('Registration request:', { name, email, mobile, city, otp });

    // Validate required fields
    if (!name || !email || !mobile || !city) {
      return NextResponse.json(
        { error: 'All fields are required' },
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

    // If OTP is not provided, generate and send it
    if (!otp) {
      const generatedOTP = generateOTP();
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes from now

      const pendingRegistration: PendingRegistration = {
        name,
        email,
        mobile,
        city,
        otp: generatedOTP,
        expiresAt,
      };

      savePendingRegistration(email, pendingRegistration);

      try {
        await sendOTPEmail(email, generatedOTP);
        return NextResponse.json({ message: 'OTP sent successfully' });
      } catch (error) {
        console.error('Error sending OTP:', error);
        deletePendingRegistration(email);
        return NextResponse.json(
          { error: 'Failed to send OTP. Please try again.' },
          { status: 500 }
        );
      }
    }

    // If OTP is provided, verify it
    if (otp) {
      const pendingRegistration = getPendingRegistration(email);
      
      if (!pendingRegistration) {
        return NextResponse.json(
          { error: 'No pending registration found. Please start the registration process again.' },
          { status: 400 }
        );
      }

      if (pendingRegistration.otp !== otp) {
        return NextResponse.json(
          { error: 'Invalid OTP' },
          { status: 400 }
        );
      }

      if (Date.now() > pendingRegistration.expiresAt) {
        deletePendingRegistration(email);
        return NextResponse.json(
          { error: 'OTP has expired. Please request a new one.' },
          { status: 400 }
        );
      }

      // Create new user with a unique ID
      const newUser: User = {
        id: uuidv4(),
        name: pendingRegistration.name,
        email: pendingRegistration.email,
        mobile: pendingRegistration.mobile,
        city: pendingRegistration.city,
        registeredAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      // Save user to JSON file
      saveUser(newUser);
      console.log('New user registered:', newUser);

      // Remove pending registration
      deletePendingRegistration(email);

      // Send welcome email
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: newUser.email,
          subject: 'Welcome to Our Platform',
          text: `Dear ${newUser.name},\n\nWelcome to our platform! We're excited to have you on board.\n\nBest regards,\nThe Team`,
        };

        await transporter.sendMail(mailOptions);
      } catch (error) {
        console.error('Error sending welcome email:', error);
        // Don't fail registration if welcome email fails
      }

      return NextResponse.json({
        message: 'Registration successful',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        },
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
} 