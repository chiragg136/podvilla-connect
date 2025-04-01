
import { useState, ChangeEvent } from 'react';
import { toast } from 'sonner';
import { Upload, File, X, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { podcastService } from '@/services/podcastService';
import { useUser } from '@/contexts/UserContext';
import { uploadPodcast, setStoragePreference, getStoragePreference } from '@/api/podcastStorageManager';

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
  const [episodeTitle, setEpisodeTitle] = useState('');
  const [episodeDescription, setEpisodeDescription] = useState('');
  const [storageType, setStorageType] = useState<'supabase' | 'neon'>('supabase');

  const categories = [
    'Technology', 'Business', 'Arts', 'Science', 'Health', 'Education', 'News', 'Entertainment'
  ];

  const handleStorageChange = (value: 'supabase' | 'neon') => {
    setStorageType(value);
    setStoragePreference(value);
    toast.success(`Storage preference set to ${value}`);
  };

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

    if (!title || !description || !category || !selectedAudioFile || !selectedCoverImage || !episodeTitle) {
      toast.error('Please fill in all fields and upload both audio and cover image');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('audio', selectedAudioFile);
      formData.append('coverImage', selectedCoverImage);
      formData.append('episodeTitle', episodeTitle);
      formData.append('episodeDescription', episodeDescription || description);

      toast.info(`Uploading podcast with ${storageType} metadata storage...`);
      
      const result = await uploadPodcast(
        formData, 
        user.id,
        (progress) => setUploadProgress(progress)
      );

      if (result.success) {
        toast.success('Podcast uploaded successfully!');
        
        // Reset form
        setTitle('');
        setDescription('');
        setCategory('Technology');
        setSelectedAudioFile(null);
        setSelectedCoverImage(null);
        setCoverImagePreview(null);
        setEpisodeTitle('');
        setEpisodeDescription('');
      } else {
        toast.error(result.error || 'Failed to upload podcast');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload podcast. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-primary-900">Upload New Podcast</h2>
      
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="flex items-center text-sm font-medium text-blue-800 mb-2">
          <Database className="h-4 w-4 mr-1" />
          Storage Configuration
        </h3>
        <RadioGroup 
          defaultValue={storageType} 
          onValueChange={(value) => handleStorageChange(value as 'supabase' | 'neon')}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="supabase" id="supabase" />
            <Label htmlFor="supabase">Supabase</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="neon" id="neon" />
            <Label htmlFor="neon">Neon PostgreSQL</Label>
          </div>
        </RadioGroup>
        <p className="text-xs text-blue-600 mt-1">
          Files will always be stored in Supabase Storage. This setting controls where metadata is stored.
        </p>
      </div>
      
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
          <Label htmlFor="episodeTitle">Episode Title</Label>
          <Input 
            id="episodeTitle" 
            value={episodeTitle}
            onChange={(e) => setEpisodeTitle(e.target.value)}
            placeholder="Enter episode title"
            disabled={isUploading}
          />
        </div>
        
        <div>
          <Label htmlFor="category">Category</Label>
          <Select 
            value={category} 
            onValueChange={setCategory}
            disabled={isUploading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
          <Label htmlFor="episodeDescription">Episode Description</Label>
          <Textarea 
            id="episodeDescription"
            value={episodeDescription}
            onChange={(e) => setEpisodeDescription(e.target.value)}
            placeholder="Enter episode description (optional)"
            rows={3}
            disabled={isUploading}
          />
          <p className="text-xs text-gray-500 mt-1">
            If left blank, the podcast description will be used.
          </p>
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
          disabled={isUploading || !title || !description || !selectedAudioFile || !selectedCoverImage || !episodeTitle}
          className="w-full bg-primary-900"
        >
          {isUploading ? 'Uploading...' : 'Upload Podcast'}
        </Button>
      </div>
    </div>
  );
};

export default PodcastUpload;
