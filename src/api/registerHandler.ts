
import { authService } from "@/services/authService";

export const handleRegistration = async (email: string, password: string) => {
  try {
    // Register user
    const user = await authService.register(email, password);
    
    if (user) {
      // Send welcome email
      await sendWelcomeEmail(email, user.name);
      return { success: true, user };
    }
    
    return { success: false, error: 'Registration failed' };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Registration failed' };
  }
};

const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    // In a real app, this would connect to an email service
    // For this demo, we'll simulate sending an email
    console.log(`Sending welcome email to ${email}`);
    
    // Mock email sending API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`Email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};
