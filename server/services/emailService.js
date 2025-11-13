const axios = require('axios');

/**
 * Brevo (formerly Sendinblue) Email Service
 */
class EmailService {
  constructor() {
    this.apiKey = process.env.BREVO_API_KEY;
    this.senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@ajakapharma.com';
    this.senderName = process.env.BREVO_SENDER_NAME || 'Ajaka Pharma';
    this.apiUrl = 'https://api.brevo.com/v3/smtp/email';
  }

  /**
   * Send email using Brevo API
   */
  async sendEmail(to, subject, htmlContent) {
    if (!this.apiKey || this.apiKey === 'your_brevo_api_key_here') {
      console.log('⚠️ Brevo API key not configured. Email not sent.');
      console.log('📧 Would send email to:', to);
      console.log('📧 Subject:', subject);
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          sender: {
            name: this.senderName,
            email: this.senderEmail
          },
          to: [
            {
              email: to,
              name: to.split('@')[0]
            }
          ],
          subject: subject,
          htmlContent: htmlContent
        },
        {
          headers: {
            'accept': 'application/json',
            'api-key': this.apiKey,
            'content-type': 'application/json'
          }
        }
      );

      console.log('✅ Email sent successfully to:', to);
      return { success: true, messageId: response.data.messageId };
    } catch (error) {
      console.error('❌ Error sending email:', error.response?.data || error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send approval email to new MR
   */
  async sendApprovalEmail(email, tempPassword) {
    const subject = "🎉 Your MR Account is Approved - Ajaka Pharma";
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #16a34a 0%, #22c55e 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
            <p style="color: #dcfce7; margin: 10px 0 0 0;">Your MR Account is Approved</p>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #16a34a; margin-bottom: 20px;">Welcome to Ajaka Pharma!</h2>
            
            <p style="color: #334155; line-height: 1.6; margin-bottom: 20px;">
              Congratulations! Your application for the Medical Representative position at Ajaka Pharma has been approved.
            </p>
            
            <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
              <h3 style="color: #16a34a; margin: 0 0 15px 0;">Your Login Credentials:</h3>
              <p style="margin: 8px 0; color: #334155;"><strong>Website:</strong> ${process.env.FRONTEND_URL}/login</p>
              <p style="margin: 8px 0; color: #334155;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 8px 0; color: #334155;"><strong>Temporary Password:</strong> <code style="background: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${tempPassword}</code></p>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e; font-weight: 600;">⚠️ Important Security Notice:</p>
              <p style="margin: 8px 0 0 0; color: #92400e;">
                You will be required to change your password on first login for security purposes.
              </p>
            </div>
            
            <p style="color: #334155; line-height: 1.6; margin-bottom: 20px;">
              Welcome to the Ajaka Pharma team! We're excited to have you on board.
            </p>
            
            <p style="color: #334155; line-height: 1.6;">
              Best regards,<br>
              <strong>Ajaka Pharma Admin Team</strong>
            </p>
          </div>
          
          <div style="background: #16a34a; padding: 20px; text-align: center;">
            <p style="color: #dcfce7; margin: 0; font-size: 14px;">
              © 2024 Ajaka Pharma Pvt Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return await this.sendEmail(email, subject, htmlContent);
  }

  /**
   * Send rejection email
   */
  async sendRejectionEmail(email) {
    const subject = "MR Application Update - Ajaka Pharma";
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #1E586E 0%, #2563eb 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Ajaka Pharma</h1>
            <p style="color: #e0f2fe; margin: 10px 0 0 0;">Healthcare Excellence</p>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1E586E; margin-bottom: 20px;">MR Application Update</h2>
            
            <p style="color: #334155; line-height: 1.6; margin-bottom: 20px;">
              Thank you for your interest in joining Ajaka Pharma as a Medical Representative.
            </p>
            
            <p style="color: #334155; line-height: 1.6; margin-bottom: 20px;">
              After careful review, we regret to inform you that your application was not approved at this time.
            </p>
            
            <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #1E586E; font-weight: 600;">Future Opportunities:</p>
              <p style="margin: 10px 0 0 0; color: #334155;">
                We encourage you to apply again in the future as opportunities become available.
              </p>
            </div>
            
            <p style="color: #334155; line-height: 1.6;">
              Best regards,<br>
              <strong>Ajaka Pharma Admin Team</strong>
            </p>
          </div>
          
          <div style="background: #1E586E; padding: 20px; text-align: center;">
            <p style="color: #e0f2fe; margin: 0; font-size: 14px;">
              © 2024 Ajaka Pharma Pvt Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return await this.sendEmail(email, subject, htmlContent);
  }

  /**
   * Send application received confirmation
   */
  async sendApplicationReceivedEmail(name, email, phone, area) {
    const subject = "MR Application Received - Ajaka Pharma";
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #1E586E 0%, #2563eb 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Ajaka Pharma</h1>
            <p style="color: #e0f2fe; margin: 10px 0 0 0;">Healthcare Excellence</p>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1E586E; margin-bottom: 20px;">Application Received</h2>
            
            <p style="color: #334155; line-height: 1.6; margin-bottom: 20px;">
              Dear ${name},
            </p>
            
            <p style="color: #334155; line-height: 1.6; margin-bottom: 20px;">
              Thank you for applying for the Medical Representative role at Ajaka Pharma. 
              Your application has been received and is currently under review by our admin team.
            </p>
            
            <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1E586E; margin: 0 0 10px 0;">Application Details:</h3>
              <p style="margin: 5px 0; color: #334155;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 5px 0; color: #334155;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 5px 0; color: #334155;"><strong>Phone:</strong> ${phone}</p>
              <p style="margin: 5px 0; color: #334155;"><strong>Area:</strong> ${area}</p>
            </div>
            
            <p style="color: #334155; line-height: 1.6; margin-bottom: 20px;">
              You will receive an email notification once your application has been reviewed. 
              This typically takes 2-3 business days.
            </p>
            
            <p style="color: #334155; line-height: 1.6;">
              Best regards,<br>
              <strong>Ajaka Pharma Admin Team</strong>
            </p>
          </div>
          
          <div style="background: #1E586E; padding: 20px; text-align: center;">
            <p style="color: #e0f2fe; margin: 0; font-size: 14px;">
              © 2024 Ajaka Pharma Pvt Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    return await this.sendEmail(email, subject, htmlContent);
  }
}

module.exports = new EmailService();
