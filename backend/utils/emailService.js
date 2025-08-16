const nodemailer = require('nodemailer');

/**
 * Email Service for sending OTP codes and notifications
 * Supports multiple email providers (Gmail, SMTP, etc.)
 */

/**
 * Create email transporter based on environment configuration
 * @returns {Object} Nodemailer transporter
 */
const createTransporter = () => {
    // For development, use ethereal email (test emails)
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_HOST) {
        console.log('Using Ethereal Email for development (test emails only)');
        return nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'ethereal.user@ethereal.email',
                pass: 'ethereal.pass'
            }
        });
    }

    // Production configuration - supports multiple providers
    if (process.env.EMAIL_SERVICE === 'gmail') {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD // App-specific password
            }
        });
    } else {
        // Generic SMTP configuration
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }
};

/**
 * Send OTP code via email
 * @param {string} toEmail - Recipient email address
 * @param {string} otpCode - OTP code to send
 * @param {string} userName - User's name for personalization
 * @param {string} purpose - Purpose of the code ('registration', 'login')
 * @returns {Promise<Object>} Send result
 */
const sendOTPEmail = async (toEmail, otpCode, userName = '', purpose = 'login') => {
    try {
        const transporter = createTransporter();

        const subjects = {
            registration: 'TradeWise - Verify Your Email Address',
            login: 'TradeWise - Login Verification Code'
        };

        const mailOptions = {
            from: `"TradeWise Security" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to: toEmail,
            subject: subjects[purpose] || subjects.login,
            html: generateOTPEmailHTML(otpCode, userName, purpose),
            text: generateOTPEmailText(otpCode, userName, purpose)
        };

        const result = await transporter.sendMail(mailOptions);
        
        console.log('OTP email sent successfully:', {
            messageId: result.messageId,
            to: toEmail,
            preview: process.env.NODE_ENV === 'development' ? nodemailer.getTestMessageUrl(result) : undefined
        });

        return { 
            success: true, 
            messageId: result.messageId,
            previewUrl: process.env.NODE_ENV === 'development' ? nodemailer.getTestMessageUrl(result) : undefined
        };

    } catch (error) {
        console.error('Error sending OTP email:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
};

/**
 * Generate HTML email template for OTP
 * @param {string} otpCode - OTP code
 * @param {string} userName - User's name
 * @param {string} purpose - Purpose of verification
 * @returns {string} HTML email content
 */
const generateOTPEmailHTML = (otpCode, userName, purpose = 'login') => {
    const purposes = {
        registration: {
            title: 'Welcome to TradeWise!',
            subtitle: 'Email Verification Required',
            message: 'Thank you for creating your TradeWise account! To complete your registration, please verify your email address using the code below:'
        },
        login: {
            title: 'Login Verification',
            subtitle: 'Secure Login Attempt',
            message: 'Someone is trying to sign in to your TradeWise account. To complete the login process, please enter the verification code below:'
        }
    };
    
    const content = purposes[purpose] || purposes.login;
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TradeWise - Email Verification</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                line-height: 1.6; 
                color: #333; 
                background-color: #f8f9fa;
                margin: 0;
                padding: 20px;
            }
            .container { 
                max-width: 600px; 
                margin: 0 auto; 
                background: white; 
                border-radius: 8px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                overflow: hidden;
            }
            .header { 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                color: white; 
                padding: 30px; 
                text-align: center; 
            }
            .header h1 { 
                margin: 0; 
                font-size: 28px; 
                font-weight: 300; 
            }
            .content { 
                padding: 40px 30px; 
            }
            .otp-code { 
                background: #f8f9fa; 
                border: 2px dashed #667eea; 
                padding: 20px; 
                text-align: center; 
                font-size: 36px; 
                font-weight: bold; 
                letter-spacing: 8px; 
                color: #667eea; 
                margin: 30px 0; 
                border-radius: 8px;
            }
            .footer { 
                background: #f8f9fa; 
                padding: 20px 30px; 
                font-size: 14px; 
                color: #6c757d; 
                text-align: center; 
            }
            .btn {
                display: inline-block;
                padding: 12px 24px;
                background: #667eea;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 500;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${content.title}</h1>
                <p>${content.subtitle}</p>
            </div>
            
            <div class="content">
                <h2>Hello${userName ? ` ${userName}` : ''}!</h2>
                
                <p>${content.message}</p>
                
                <div class="otp-code">${otpCode}</div>
                
                <p><strong>This code will expire in 10 minutes.</strong></p>
            </div>
            
            <div class="footer">
                <p>This is an automated security message from TradeWise.<br>
                Please do not reply to this email.</p>
                <p>&copy; ${new Date().getFullYear()} TradeWise. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

/**
 * Generate plain text email for OTP
 * @param {string} otpCode - OTP code
 * @param {string} userName - User's name
 * @param {string} purpose - Purpose of verification
 * @returns {string} Plain text email content
 */
const generateOTPEmailText = (otpCode, userName, purpose = 'login') => {
    const purposes = {
        registration: {
            title: 'Welcome to TradeWise!',
            message: 'Thank you for creating your TradeWise account! To complete your registration, please verify your email address using the code below:'
        },
        login: {
            title: 'TradeWise - Login Verification',
            message: 'Someone is trying to sign in to your TradeWise account. To complete the login process, please enter the verification code below:'
        }
    };
    
    const content = purposes[purpose] || purposes.login;
    
    return `
${content.title}

Hello${userName ? ` ${userName}` : ''}!

${content.message}

VERIFICATION CODE: ${otpCode}

This code will expire in 10 minutes.

This is an automated security message from TradeWise.
Please do not reply to this email.

© ${new Date().getFullYear()} TradeWise. All rights reserved.
    `;
};


/**
 * Test email configuration
 * @returns {Promise<Object>} Test result
 */
const testEmailConfig = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        return { success: true, message: 'Email configuration is valid' };
    } catch (error) {
        console.error('Email configuration test failed:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendOTPEmail,
    testEmailConfig
};