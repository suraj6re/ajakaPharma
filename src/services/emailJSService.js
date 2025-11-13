// Email service using EmailJS (designed for frontend)
import emailjs from '@emailjs/browser';

// EmailJS configuration - you'll need to set these up at emailjs.com
const EMAILJS_SERVICE_ID = 'service_ajaka'; // Gmail service
const EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY'; // Get from emailjs.com

// Template IDs for different email types
const TEMPLATES = {
  APPROVAL: 'template_approval',
  REJECTION: 'template_rejection', 
  APPLICATION: 'template_application'
};

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

// Send email using EmailJS
const sendEmailViaEmailJS = async (templateId, templateParams) => {
  try {
    console.log('🚀 Sending email via EmailJS');
    console.log('📧 Template:', templateId);
    console.log('📧 Params:', templateParams);
    
    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      templateId,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );
    
    console.log('✅ Email sent successfully via EmailJS');
    console.log('📧 Result:', result);
    
    return { success: true, service: 'emailjs', result };
  } catch (error) {
    console.error('❌ EmailJS failed:', error);
    throw error;
  }
};

// Send approval email
export const sendApprovalEmail = async (email, tempPassword, name = 'User') => {
  const templateParams = {
    to_email: email,
    to_name: name,
    temp_password: tempPassword,
    login_url: window.location.origin + '/login',
    from_name: 'Ajaka Pharma Admin Team',
    reply_to: 'suraj6re@gmail.com'
  };
  
  return await sendEmailViaEmailJS(TEMPLATES.APPROVAL, templateParams);
};

// Send rejection email
export const sendRejectionEmail = async (email, name = 'User') => {
  const templateParams = {
    to_email: email,
    to_name: name,
    from_name: 'Ajaka Pharma Admin Team',
    reply_to: 'suraj6re@gmail.com'
  };
  
  return await sendEmailViaEmailJS(TEMPLATES.REJECTION, templateParams);
};

// Send application received email
export const sendApplicationReceivedEmail = async (name, email, phone, area) => {
  const templateParams = {
    to_email: email,
    to_name: name,
    applicant_phone: phone,
    applicant_area: area,
    from_name: 'Ajaka Pharma Admin Team',
    reply_to: 'suraj6re@gmail.com'
  };
  
  return await sendEmailViaEmailJS(TEMPLATES.APPLICATION, templateParams);
};