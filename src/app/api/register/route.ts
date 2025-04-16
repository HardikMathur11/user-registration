import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { 
  saveUser, 
  getPendingRegistration, 
  savePendingRegistration, 
  deletePendingRegistration,
  getUserByEmail,
  PendingRegistration
} from '@/utils/userStorage';

// Function to generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to send OTP email
async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    console.log('Sending OTP email to:', email);
    console.log('Using email user:', process.env.EMAIL_USER);
    
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
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully to:', email);
    console.log('Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
}

// Function to send welcome email
async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  try {
    console.log('Sending welcome email to:', email);
    console.log('Using email user:', process.env.EMAIL_USER);
    
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
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully to:', email);
    console.log('Message ID:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
    }
    return false;
  }
}

export async function POST(request: Request) {
  try {
    console.log('Registration request received');
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    let body;
    let bodyText = '';
    
    try {
      bodyText = await request.text();
      console.log('Request body text:', bodyText);
      
      if (!bodyText) {
        console.error('Empty request body');
        return NextResponse.json(
          { error: 'Empty request body' },
          { status: 400 }
        );
      }
      
      body = JSON.parse(bodyText);
      console.log('Parsed request body:', body);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      console.error('Raw body text:', bodyText);
      return NextResponse.json(
        { error: 'Invalid request body', details: parseError instanceof Error ? parseError.message : 'Unknown error' },
        { status: 400 }
      );
    }
    
    const { name, email, mobile, city, otp } = body;
    console.log('Extracted fields:', { name, email, mobile, city, otp: otp ? 'provided' : 'not provided' });

    // If OTP is not provided, generate and send it
    if (!otp) {
      // Validate required fields
      if (!name || !email || !mobile || !city) {
        console.log('Missing required fields:', { name, email, mobile, city });
        return NextResponse.json(
          { error: 'Name, email, mobile, and city are required' },
          { status: 400 }
        );
      }

      // Check if user already exists
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        console.log('User already exists:', email);
        return NextResponse.json(
          { error: 'User with this email already registered' },
          { status: 400 }
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log('Invalid email format:', email);
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }

      // Validate mobile number format (10 digits)
      const mobileRegex = /^[0-9]{10}$/;
      if (!mobileRegex.test(mobile)) {
        console.log('Invalid mobile format:', mobile);
        return NextResponse.json(
          { error: 'Mobile number must be 10 digits' },
          { status: 400 }
        );
      }

      // Generate OTP
      const generatedOTP = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes from now

      try {
        console.log('Creating pending registration for:', email);
        // Save pending registration
        await savePendingRegistration({
          id: email,
          name,
          email,
          mobile,
          city,
          otp: generatedOTP,
          expiresAt,
        } as PendingRegistration);
        console.log('Pending registration saved successfully');

        // Send OTP email
        console.log('Attempting to send OTP email to:', email);
        const emailSent = await sendOTPEmail(email, generatedOTP);
        if (!emailSent) {
          console.error('Failed to send OTP email to:', email);
          return NextResponse.json(
            { error: 'Failed to send OTP email' },
            { status: 500 }
          );
        }
        console.log('OTP email sent successfully to:', email);

        const response = { message: 'OTP sent successfully' };
        console.log('Sending response:', response);
        return NextResponse.json(response);
      } catch (error) {
        console.error('Error in registration process:', error);
        const errorResponse = { 
          error: 'Failed to process registration', 
          details: error instanceof Error ? error.message : 'Unknown error'
        };
        console.log('Sending error response:', errorResponse);
        return NextResponse.json(errorResponse, { status: 500 });
      }
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
      { error: 'Registration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 