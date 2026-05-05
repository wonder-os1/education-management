import dotenv from 'dotenv'
dotenv.config()

// Fail fast in production if critical secrets are missing
if (process.env.NODE_ENV === 'production') {
  const required = ['DATABASE_URL', 'JWT_SECRET']
  const missing = required.filter((key) => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

export const env = {
  PORT: parseInt(process.env.PORT || '4000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-secret-DO-NOT-USE-IN-PRODUCTION'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  APP_NAME: process.env.APP_NAME || 'Education Management',
  APP_URL: process.env.APP_URL || 'http://localhost:3000',
  API_URL: process.env.API_URL || 'http://localhost:4000',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@wonderos.in',
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  BUSINESS_CURRENCY: process.env.BUSINESS_CURRENCY || 'INR',
  BUSINESS_TIMEZONE: process.env.BUSINESS_TIMEZONE || 'Asia/Kolkata',
  BUSINESS_ACADEMIC_YEAR: process.env.BUSINESS_ACADEMIC_YEAR || '2024-2025',
  BUSINESS_SCHOOL_HOURS_START: process.env.BUSINESS_SCHOOL_HOURS_START || '08:00',
  BUSINESS_SCHOOL_HOURS_END: process.env.BUSINESS_SCHOOL_HOURS_END || '15:00',
  BUSINESS_GRADING_SYSTEM: process.env.BUSINESS_GRADING_SYSTEM || 'PERCENTAGE',
  BUSINESS_PASSING_PERCENTAGE: parseInt(process.env.BUSINESS_PASSING_PERCENTAGE || '33', 10),
  BUSINESS_MAX_STUDENTS_PER_CLASS: parseInt(process.env.BUSINESS_MAX_STUDENTS_PER_CLASS || '40', 10),
  BUSINESS_FEE_REMINDER_DAYS: parseInt(process.env.BUSINESS_FEE_REMINDER_DAYS || '7', 10),
} as const
