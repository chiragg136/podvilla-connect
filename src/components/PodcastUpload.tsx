
import { useState, ChangeEvent } from 'react';
import { toast } from 'sonner';
import { Upload, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { podcastService } from '@/services/podcastService';
import { useUser } from '@/contexts/UserContext';

const PodcastUpload = () => {
  const { user } = useUser();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology');
  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);
  const [selectedCoverImage, setSelectedCoverImage] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

  const categories = [
    'Technology', 'Business', 'Arts', 'Science', 'Health', 'Education', 'News', 'Entertainment'
  ];

  const handleAudioFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.includes('audio')) {
        setSelectedAudioFile(file);
      } else {
        toast.error('Please select an audio file.');
      }
    }
  };

  const handleCoverImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.includes('image')) {
        setSelectedCoverImage(file);
        const reader = new FileReader();
        reader.onload = () => {
          setCoverImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error('Please select an image file.');
      }
    }
  };

  const clearCoverImage = () => {
    setSelectedCoverImage(null);
    setCoverImagePreview(null);
  };

  const handleUpload = async () => {
    if (!user) {
      toast.error('Please login to upload podcasts');
      return;
    }

    if (!title || !description || !category || !selectedAudioFile || !selectedCoverImage) {
      toast.error('Please fill in all fields and upload both audio and cover image');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 500);

    try {
      // Simulate podcast upload
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Complete upload
      setUploadProgress(100);
      clearInterval(progressInterval);

      // Save podcast data (in a real app, this would save to a database)
      const podcastData = {
        title,
        description,
        category,
        audioFileName: selectedAudioFile.name,
        coverImageName: selectedCoverImage.name,
        creator: user.name,
        creatorId: user.id,
        uploadDate: new Date().toISOString(),
      };

      console.log('Uploaded podcast:', podcastData);

      toast.success('Podcast uploaded successfully!');

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('Technology');
      setSelectedAudioFile(null);
      setSelectedCoverImage(null);
      setCoverImagePreview(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload podcast. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      clearInterval(progressInterval);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-primary-900">Upload New Podcast</h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Podcast Title</Label>
          <Input 
            id="title" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter podcast title"
            disabled={isUploading}
          />
        </div>
        
        <div>
          <Label htmlFor="category">Category</Label>
          <select 
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isUploading}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter podcast description"
            rows={4}
            disabled={isUploading}
          />
        </div>
        
        <div>
          <Label htmlFor="audio-file">Audio File</Label>
          <div className="mt-1 flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('audio-file')?.click()}
              disabled={isUploading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {selectedAudioFile ? 'Change Audio File' : 'Upload Audio File'}
            </Button>
            <input
              id="audio-file"
              type="file"
              accept="audio/*"
              onChange={handleAudioFileChange}
              className="hidden"
              disabled={isUploading}
            />
          </div>
          {selectedAudioFile && (
            <div className="mt-2 text-sm flex items-center text-primary-600">
              <File className="h-4 w-4 mr-1" />
              {selectedAudioFile.name}
            </div>
          )}
        </div>
        
        <div>
          <Label htmlFor="cover-image">Cover Image</Label>
          <div className="mt-1 flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('cover-image')?.click()}
              disabled={isUploading}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {selectedCoverImage ? 'Change Cover Image' : 'Upload Cover Image'}
            </Button>
            <input
              id="cover-image"
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              className="hidden"
              disabled={isUploading}
            />
          </div>
          {coverImagePreview && (
            <div className="mt-2 relative w-24 h-24">
              <img 
                src={coverImagePreview} 
                alt="Cover preview" 
                className="w-full h-full object-cover rounded-md"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={clearCoverImage}
                disabled={isUploading}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        
        {isUploading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-primary-900 h-2.5 rounded-full" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
            <p className="text-sm text-center mt-1 text-primary-600">
              Uploading: {uploadProgress}%
            </p>
          </div>
        )}
        
        <Button
          onClick={handleUpload}
          disabled={isUploading || !title || !description || !selectedAudioFile || !selectedCoverImage}
          className="w-full bg-primary-900"
        >
          {isUploading ? 'Uploading...' : 'Upload Podcast'}
        </Button>
      </div>
    </div>
  );
};

export default PodcastUpload;
