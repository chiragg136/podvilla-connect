
import { toast } from "sonner";

// AWS S3 Configuration
// These would normally come from environment variables in a production app
const AWS_REGION = "us-east-1";
const AWS_BUCKET_NAME = "your-podcast-bucket";

// For demo purposes, we're using a mechanism where the user can provide their own credentials
// In a production app, these would be securely stored on the backend
let awsCredentials: {
  accessKeyId: string;
  secretAccessKey: string;
} | null = null;

/**
 * Set AWS credentials for S3 operations
 */
export const setAwsCredentials = (credentials: { accessKeyId: string; secretAccessKey: string }) => {
  awsCredentials = credentials;
  // Store in localStorage for persistence across sessions
  localStorage.setItem('awsCredentials', JSON.stringify(credentials));
  console.log('AWS credentials set successfully');
};

/**
 * Get stored AWS credentials
 */
export const getAwsCredentials = (): { accessKeyId: string; secretAccessKey: string } | null => {
  if (awsCredentials) return awsCredentials;
  
  try {
    const storedCredentials = localStorage.getItem('awsCredentials');
    if (storedCredentials) {
      awsCredentials = JSON.parse(storedCredentials);
      return awsCredentials;
    }
  } catch (error) {
    console.error('Error retrieving AWS credentials:', error);
  }
  
  return null;
};

/**
 * Check if AWS credentials are configured
 */
export const areAwsCredentialsConfigured = (): boolean => {
  const credentials = getAwsCredentials();
  return !!credentials?.accessKeyId && !!credentials?.secretAccessKey;
};

/**
 * Simulated S3 client for demo purposes
 */
export const getS3Client = () => {
  const credentials = getAwsCredentials();
  
  if (!credentials) {
    console.error('AWS credentials not configured');
    return null;
  }
  
  // For demo purposes, we'll return a simple object that simulates an S3 client
  return {
    region: AWS_REGION,
    credentials
  };
};

/**
 * Upload file to S3 (simulated for demo)
 * @param file File to upload
 * @param key Object key (path in S3)
 * @returns URL of uploaded file or null if upload failed
 */
export const uploadFileToS3 = async (
  file: File, 
  key: string,
  onProgress?: (progress: number) => void
): Promise<string | null> => {
  const s3Client = getS3Client();
  
  if (!s3Client) {
    toast.error('AWS S3 is not configured. Please set up your credentials.');
    return null;
  }
  
  try {
    if (onProgress) onProgress(10);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (onProgress) onProgress(30);
    
    // Generate a unique ID for this file
    const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Store file in localStorage (in a real app, this would be S3)
    const objectUrl = URL.createObjectURL(file);
    
    if (onProgress) onProgress(70);
    
    // Create a simulated S3 URL
    const simulatedS3Url = `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}?X-Amz-Signature=${fileId}`;
    
    // Save mapping of simulated URL to actual object URL
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const urlMappings = JSON.parse(localStorage.getItem('urlMappings') || '{}');
        // Store both the object URL and the simulated S3 URL
        urlMappings[objectUrl] = reader.result;
        urlMappings[simulatedS3Url] = reader.result;
        localStorage.setItem('urlMappings', JSON.stringify(urlMappings));
        
        // Also store mapping from key to simulated URL
        const keyMappings = JSON.parse(localStorage.getItem('s3KeyMappings') || '{}');
        keyMappings[key] = simulatedS3Url;
        localStorage.setItem('s3KeyMappings', JSON.stringify(keyMappings));
      } catch (e) {
        console.error("Error storing file data URL:", e);
      }
    };
    reader.readAsDataURL(file);
    
    if (onProgress) onProgress(100);
    
    console.log('File uploaded successfully to simulated S3:', simulatedS3Url);
    return simulatedS3Url;
  } catch (error) {
    console.error('Error in simulated S3 upload:', error);
    toast.error('Failed to upload file. Please try again.');
    
    // Create a fallback URL using localStorage
    const objectUrl = URL.createObjectURL(file);
    
    // Save to local storage as a data URL for persistence
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const urlMappings = JSON.parse(localStorage.getItem('urlMappings') || '{}');
        urlMappings[objectUrl] = reader.result;
        localStorage.setItem('urlMappings', JSON.stringify(urlMappings));
      } catch (e) {
        console.error("Error storing file data URL:", e);
      }
    };
    reader.readAsDataURL(file);
    
    return objectUrl;
  }
};

/**
 * Check if a URL is an S3 presigned URL
 */
export const isS3PresignedUrl = (url: string): boolean => {
  return url.includes(AWS_BUCKET_NAME + '.s3.') && url.includes('X-Amz-Signature=');
};

/**
 * Extract the object key from an S3 presigned URL
 */
export const getKeyFromS3Url = (url: string): string | null => {
  try {
    const parsedUrl = new URL(url);
    const pathParts = parsedUrl.pathname.split('/');
    // Remove the first empty string and bucket name
    pathParts.shift(); // Remove empty string before first /
    pathParts.shift(); // Remove bucket name
    return pathParts.join('/');
  } catch (error) {
    console.error('Error parsing S3 URL:', error);
    return null;
  }
};

/**
 * Get a fresh presigned URL for an existing S3 object
 */
export const refreshS3Url = async (url: string): Promise<string | null> => {
  if (!isS3PresignedUrl(url)) {
    return url; // Not an S3 URL, return as is
  }
  
  const key = getKeyFromS3Url(url);
  if (!key) return null;
  
  try {
    // Get the stored key mapping
    const keyMappings = JSON.parse(localStorage.getItem('s3KeyMappings') || '{}');
    if (keyMappings[key]) {
      return keyMappings[key];
    }
    
    // Generate a new signature
    const fileId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const newUrl = `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}?X-Amz-Signature=${fileId}`;
    
    // Get the data URL from the old URL mapping
    const urlMappings = JSON.parse(localStorage.getItem('urlMappings') || '{}');
    if (urlMappings[url]) {
      urlMappings[newUrl] = urlMappings[url];
      localStorage.setItem('urlMappings', JSON.stringify(urlMappings));
      
      // Update key mapping
      keyMappings[key] = newUrl;
      localStorage.setItem('s3KeyMappings', JSON.stringify(keyMappings));
      
      return newUrl;
    }
    
    return url;
  } catch (error) {
    console.error('Error refreshing simulated S3 URL:', error);
    return url;
  }
};

/**
 * Clear all stored media from simulated storage
 */
export const clearStoredMedia = (): boolean => {
  try {
    // Clear all URL mappings
    localStorage.removeItem('urlMappings');
    localStorage.removeItem('s3KeyMappings');
    
    // Clear podcast data
    localStorage.removeItem('podcasts');
    
    // Clear other related storage data
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('podcast_') || key.startsWith('episode_'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    toast.success('All stored media has been cleared');
    console.log('Cleared all stored media from simulated storage');
    return true;
  } catch (error) {
    console.error('Error clearing stored media:', error);
    toast.error('Failed to clear stored media');
    return false;
  }
};
