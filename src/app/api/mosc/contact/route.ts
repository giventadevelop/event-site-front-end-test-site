import { NextRequest, NextResponse } from 'next/server';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();

    // Validate request body
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Log the contact form submission (for development)
    console.log('📧 Contact Form Submission:');
    console.log('Name:', body.name);
    console.log('Email:', body.email);
    console.log('Message:', body.message);
    console.log('Timestamp:', new Date().toISOString());

    // In production, you would send an actual email here using a service like:
    // - Resend: https://resend.com
    // - SendGrid: https://sendgrid.com
    // - AWS SES: https://aws.amazon.com/ses/
    // For now, we'll just return success

    return NextResponse.json(
      {
        success: true,
        message: 'Message sent successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}













