
import { authService } from "@/services/authService";

export const handleRegistration = async (email: string, password: string) => {
  try {
    // Register user
    const user = await authService.register(email, password);
    
    if (user) {
      // Send welcome email
      await sendWelcomeEmail(email, user.name || email.split('@')[0]);
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
    console.log(`Sending welcome email to ${email}`);
    
    // Mock email sending API call with improved formatting
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #6366f1;">Welcome to PodVilla!</h1>
        <p>Hi ${name},</p>
        <p>Thank you for joining PodVilla, the premier platform for podcast creators and listeners!</p>
        <p>With PodVilla, you can:</p>
        <ul>
          <li>Discover amazing podcasts across various categories</li>
          <li>Upload and share your own podcasts</li>
          <li>Create personalized playlists</li>
          <li>Connect with other podcast enthusiasts</li>
        </ul>
        <p>Get started by exploring our trending podcasts or upload your first episode today!</p>
        <p>Happy listening!</p>
        <p>The PodVilla Team</p>
      </div>
    `;
    
    // Simulating sending the email
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(`Email sent successfully to ${email}`);
    console.log("Email content:", emailContent);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};
