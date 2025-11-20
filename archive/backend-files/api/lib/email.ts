import nodemailer from 'nodemailer'

// Mock transporter for development
const transporter = {
  sendMail: async (options: any) => {
    console.log('Mock email sent:', options)
    return Promise.resolve()
  }
}

// Real transporter (commented out for now)
// const transporter = nodemailer.createTransporter({
//   service: 'sendgrid',
//   auth: {
//     api_key: process.env.SENDGRID_API_KEY!
//   }
// })

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@reweave.com',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    })
  } catch (error) {
    console.error('Failed to send email:', error)
    throw new Error('Failed to send email')
  }
}

export const sendWelcomeEmail = async (email: string, firstName: string): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1e3a8a, #8b4513); padding: 40px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px; font-family: 'Playfair Display', serif;">Welcome to Reweave!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">Discover the beauty of traditional Malaysian batik</p>
      </div>
      <div style="padding: 30px; background: #fef7ed;">
        <h2 style="color: #1e3a8a; font-family: 'Playfair Display', serif;">Hello ${firstName}!</h2>
        <p>Welcome to the Reweave family! We're thrilled to have you join our community of batik enthusiasts.</p>
        <p>Your account has been successfully created. You can now:</p>
        <ul style="color: #8b4513;">
          <li>Browse our exclusive collection of traditional batik</li>
          <li>Save your favorite items to your wishlist</li>
          <li>Track your orders in real-time</li>
          <li>Earn loyalty points with every purchase</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="background: #fbbf24; color: #1e3a8a; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Visit Your Dashboard
          </a>
        </div>
        <p style="font-size: 14px; color: #666;">If you have any questions, feel free to reach out to our customer support team.</p>
      </div>
      <div style="background: #1e3a8a; padding: 20px; text-align: center; color: white; font-size: 12px;">
        <p>© 2024 Reweave. All rights reserved.</p>
      </div>
    </div>
  `

  await sendEmail({
    to: email,
    subject: 'Welcome to Reweave - Your Account is Ready!',
    html
  })
}

export const sendOTPEmail = async (email: string, otp: string, type: 'verification' | 'login'): Promise<void> => {
  const subject = type === 'verification' ? 'Verify Your Email Address' : 'Your Login Code'
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1e3a8a, #8b4513); padding: 40px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px; font-family: 'Playfair Display', serif;">Reweave</h1>
      </div>
      <div style="padding: 30px; background: #fef7ed;">
        <h2 style="color: #1e3a8a; font-family: 'Playfair Display', serif;">${subject}</h2>
        <p>Hello,</p>
        <p>${type === 'verification' 
          ? 'Please use the following code to verify your email address:' 
          : 'Please use the following code to complete your login:'}</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background: white; border: 2px solid #fbbf24; border-radius: 8px; padding: 20px; display: inline-block;">
            <span style="font-size: 32px; font-weight: bold; color: #1e3a8a; letter-spacing: 4px;">${otp}</span>
          </div>
        </div>
        <p style="color: #8b4513; font-weight: bold;">This code will expire in 5 minutes.</p>
        <p style="font-size: 14px; color: #666;">If you didn't request this code, please ignore this email.</p>
      </div>
      <div style="background: #1e3a8a; padding: 20px; text-align: center; color: white; font-size: 12px;">
        <p>© 2024 Reweave. All rights reserved.</p>
      </div>
    </div>
  `

  await sendEmail({
    to: email,
    subject,
    html
  })
}

export const sendPasswordResetEmail = async (email: string, resetToken: string, firstName: string): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #1e3a8a, #8b4513); padding: 40px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 28px; font-family: 'Playfair Display', serif;">Reweave</h1>
      </div>
      <div style="padding: 30px; background: #fef7ed;">
        <h2 style="color: #1e3a8a; font-family: 'Playfair Display', serif;">Password Reset Request</h2>
        <p>Hello ${firstName},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background: #fbbf24; color: #1e3a8a; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Reset Your Password
          </a>
        </div>
        <p style="color: #8b4513;">This link will expire in 1 hour.</p>
        <p style="font-size: 14px; color: #666;">If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
      </div>
      <div style="background: #1e3a8a; padding: 20px; text-align: center; color: white; font-size: 12px;">
        <p>© 2024 Reweave. All rights reserved.</p>
      </div>
    </div>
  `

  await sendEmail({
    to: email,
    subject: 'Reset Your Reweave Password',
    html
  })
}