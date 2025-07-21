import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, company, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Create transporter for SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Send email to amjad.jibon@gmail.com
    const notificationMailOptions = {
      from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
      to: 'amjad.jibon@gmail.com',
      subject: `[FinExtractPro Contact] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
            <div style="background: white; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
              <h2 style="color: #111827; margin-top: 0;">Contact Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 120px;">Name:</td>
                  <td style="padding: 8px 0; color: #111827;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td>
                  <td style="padding: 8px 0; color: #111827;">
                    <a href="mailto:${email}" style="color: #10b981; text-decoration: none;">${email}</a>
                  </td>
                </tr>
                ${company ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Company:</td>
                  <td style="padding: 8px 0; color: #111827;">${company}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #374151;">Subject:</td>
                  <td style="padding: 8px 0; color: #111827;">${subject}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 6px;">
              <h3 style="color: #111827; margin-top: 0;">Message</h3>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 4px; border-left: 4px solid #10b981;">
                <p style="margin: 0; color: #374151; line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #ecfdf5; border-radius: 6px; border: 1px solid #d1fae5;">
              <p style="margin: 0; font-size: 14px; color: #065f46;">
                <strong>Reply to:</strong> <a href="mailto:${email}" style="color: #10b981; text-decoration: none;">${email}</a>
              </p>
            </div>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>This email was sent from the FinExtractPro contact form at ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
      replyTo: email,
    }

    await transporter.sendMail(notificationMailOptions)

    // Send confirmation email to the user
    const confirmationMailOptions = {
      from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
      to: email,
      subject: 'Thank you for contacting FinExtractPro',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 20px; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Thank You for Contacting Us!</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
            <div style="background: white; padding: 20px; border-radius: 6px;">
              <p style="color: #111827; margin-top: 0;">Hi ${name},</p>
              
              <p style="color: #374151; line-height: 1.6;">
                Thank you for reaching out to FinExtractPro! We've received your message and will get back to you within 24 hours.
              </p>
              
              <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <h3 style="color: #111827; margin-top: 0; margin-bottom: 10px;">Your Message Summary:</h3>
                <p style="margin: 5px 0; color: #374151;"><strong>Subject:</strong> ${subject}</p>
                <p style="margin: 5px 0; color: #374151;"><strong>Message:</strong></p>
                <div style="background: white; padding: 10px; border-radius: 4px; margin-top: 5px;">
                  <p style="margin: 0; color: #374151; white-space: pre-wrap;">${message}</p>
                </div>
              </div>
              
              <p style="color: #374151; line-height: 1.6;">
                In the meantime, feel free to explore our platform features or schedule a demo if you'd like to see FinExtractPro in action.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://finextractpro.vercel.app/auth/signup" 
                   style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Start Free Trial
                </a>
              </div>
              
              <p style="color: #374151; line-height: 1.6;">
                Best regards,<br>
                The FinExtractPro Team
              </p>
            </div>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>FinExtractPro - AI-powered financial document processing</p>
            <p>
              <a href="mailto:support@finextractpro.com" style="color: #10b981; text-decoration: none;">support@finextractpro.com</a> | 
              <a href="tel:1-800-EXTRACT" style="color: #10b981; text-decoration: none;">1-800-EXTRACT</a>
            </p>
          </div>
        </div>
      `,
    }

    await transporter.sendMail(confirmationMailOptions)

    return NextResponse.json(
      { success: true, message: 'Email sent successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}