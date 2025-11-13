import api from './api';

/**
 * Email service - sends emails via backend API
 */

export const sendEmail = async (to, subject, messageHTML) => {
  try {
    const response = await api.post('/email/send', {
      to,
      subject,
      htmlContent: messageHTML
    });
    return response.data;
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

export const sendApprovalEmail = async (email, tempPassword) => {
  try {
    const response = await api.post('/email/approval', {
      email,
      tempPassword
    });
    return response.data;
  } catch (error) {
    console.error('Error sending approval email:', error);
    return { success: false, error: error.message };
  }
};

export const sendRejectionEmail = async (email) => {
  try {
    const response = await api.post('/email/rejection', {
      email
    });
    return response.data;
  } catch (error) {
    console.error('Error sending rejection email:', error);
    return { success: false, error: error.message };
  }
};

export const sendApplicationReceivedEmail = async (name, email, phone, area) => {
  try {
    const response = await api.post('/email/application-received', {
      name,
      email,
      phone,
      area
    });
    return response.data;
  } catch (error) {
    console.error('Error sending application received email:', error);
    return { success: false, error: error.message };
  }
};
