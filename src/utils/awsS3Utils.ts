
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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
 * Initialize S3 client with credentials
 */
export const getS3Client = (): S3Client | null => {
  const credentials = getAwsCredentials();
  
  if (!credentials) {
    console.error('AWS credentials not configured');
    return null;
  }
  
  try {
    return new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey
      }
    });
  } catch (error) {
    console.error('Error initializing S3 client:', error);
    return null;
  }
};

/**
 * Upload file to S3
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
    
    // Create the PutObject command
    const command = new PutObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: key,
      Body: await file.arrayBuffer(),
      ContentType: file.type
    });
    
    if (onProgress) onProgress(30);
    
    // Upload the file
    const response = await s3Client.send(command);
    console.log('S3 Upload response:', response);
    
    if (onProgress) onProgress(70);
    
    // Generate a pre-signed URL for the uploaded file
    const getObjectCommand = new GetObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: key
    });
    
    const presignedUrl = await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 3600 });
    
    if (onProgress) onProgress(100);
    
    console.log('File uploaded successfully to S3:', presignedUrl);
    return presignedUrl;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    toast.error('Failed to upload file to S3. Please check your credentials and try again.');
    
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
  const s3Client = getS3Client();
  
  if (!s3Client) {
    console.error('AWS credentials not configured');
    return null;
  }
  
  const key = getKeyFromS3Url(url);
  if (!key) return null;
  
  try {
    const getObjectCommand = new GetObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: key
    });
    
    return await getSignedUrl(s3Client, getObjectCommand, { expiresIn: 3600 });
  } catch (error) {
    console.error('Error refreshing S3 URL:', error);
    return null;
  }
};
