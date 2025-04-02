
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setAwsCredentials, getAwsCredentials, areAwsCredentialsConfigured } from '@/utils/awsS3Utils';
import { toast } from 'sonner';

interface S3ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const S3ConfigModal = ({ isOpen, onClose }: S3ConfigModalProps) => {
  const savedCredentials = getAwsCredentials();
  const [accessKeyId, setAccessKeyId] = useState(savedCredentials?.accessKeyId || '');
  const [secretAccessKey, setSecretAccessKey] = useState(savedCredentials?.secretAccessKey || '');

  const handleSave = () => {
    if (!accessKeyId || !secretAccessKey) {
      toast.error('Please enter both AWS Access Key ID and Secret Access Key');
      return;
    }

    setAwsCredentials({
      accessKeyId,
      secretAccessKey
    });

    toast.success('AWS S3 credentials saved successfully');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configure AWS S3 Storage</DialogTitle>
          <DialogDescription>
            Enter your AWS credentials to use S3 for podcast storage.
            These credentials will be stored locally in your browser.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="accessKeyId">AWS Access Key ID</Label>
            <Input
              id="accessKeyId"
              value={accessKeyId}
              onChange={(e) => setAccessKeyId(e.target.value)}
              placeholder="AKIAIOSFODNN7EXAMPLE"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="secretAccessKey">AWS Secret Access Key</Label>
            <Input
              id="secretAccessKey"
              type="password"
              value={secretAccessKey}
              onChange={(e) => setSecretAccessKey(e.target.value)}
              placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
            />
          </div>
          
          <div className="text-xs text-gray-500">
            <p>Note: For security, create an IAM user with limited S3 permissions for this application.</p>
            <p>Your credentials are stored only in your browser's local storage.</p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Credentials
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default S3ConfigModal;
