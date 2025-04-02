
import { useState, ChangeEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Upload, File, X, Music, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import Header from '@/components/Header';
import AppFooter from '@/components/AppFooter';
import { useUser } from '@/contexts/UserContext';
import { uploadPodcast } from '@/api/podcastStorageManager';
import { clearStoredMedia } from '@/utils/awsS3Utils';

const PodcastUpload = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUser();
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

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      toast.error('Please login first. You need to be logged in to upload podcasts');
    }
  }, [isAuthenticated, navigate]);

  const categories = [
    'Technology', 'Business', 'Arts', 'Science', 'Health', 'Education', 'News', 'Entertainment', 'Sports', 'True Crime', 'Fiction', 'Society & Culture'
  ];

  const handleAudioFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validAudioTypes = ['audio/mp3', 'audio/mpeg', 'audio/mp4', 'video/mp4', 'audio/wav', 'audio/x-m4a'];
      
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const isValidType = validAudioTypes.includes(file.type) || 
                          fileExtension === 'mp3' || 
                          fileExtension === 'mp4' || 
                          fileExtension === 'wav' || 
                          fileExtension === 'm4a';
      
      if (isValidType) {
        console.log(`Audio file selected: ${file.name}, type: ${file.type}, size: ${Math.round(file.size / 1024 / 1024 * 10) / 10} MB`);
        setSelectedAudioFile(file);
      } else {
        console.error(`Invalid audio file type: ${file.type}`);
        toast.error('Invalid file type. Please select an MP3, MP4, WAV or M4A audio file.');
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
        toast.error('Invalid file type. Please select an image file.');
      }
    }
  };

  const clearCoverImage = () => {
    setSelectedCoverImage(null);
    setCoverImagePreview(null);
  };

  const handleClearStoredMedia = () => {
    const confirmed = window.confirm('Are you sure you want to clear all stored media? This will remove all uploaded podcasts and episodes.');
    if (confirmed) {
      const success = clearStoredMedia();
      if (success) {
        toast.success('All stored media has been cleared');
      }
    }
  };

  const handleUpload = async () => {
    if (!user) {
      toast.error('Please login to upload. You need to be logged in to upload podcasts');
      return;
    }

    if (!title || !description || !category || !selectedAudioFile || !selectedCoverImage || !episodeTitle) {
      toast.error('Missing required fields. Please fill in all required fields and upload both audio and cover image');
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

      console.log('Uploading podcast with files:', {
        audioFile: selectedAudioFile.name,
        audioType: selectedAudioFile.type,
        audioSize: `${Math.round(selectedAudioFile.size / 1024 / 1024 * 10) / 10} MB`,
        coverImage: selectedCoverImage.name,
        title,
        category
      });

      toast.info('Uploading podcast to storage...');
      const result = await uploadPodcast(
        formData, 
        user.id,
        (progress) => setUploadProgress(progress)
      );

      if (result.success) {
        toast.success('Upload complete! Your podcast has been successfully uploaded.');
        
        setTitle('');
        setDescription('');
        setCategory('Technology');
        setSelectedAudioFile(null);
        setSelectedCoverImage(null);
        setCoverImagePreview(null);
        setEpisodeTitle('');
        setEpisodeDescription('');
        
        navigate('/profile');
      } else {
        toast.error(result.error || 'An error occurred while uploading your podcast.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. An error occurred while uploading your podcast.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-24 md:pt-32 px-4 md:px-6 pb-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-primary-900">Upload Your Podcast</h1>
            <p className="mt-2 text-lg text-primary-600">Share your voice with the world</p>
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-sm">
              <File className="h-4 w-4 mr-1" />
              Using Google Drive Storage
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Podcast Details</CardTitle>
              <CardDescription>
                Fill in the information about your podcast series
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-base">Podcast Title*</Label>
                  <Input 
                    id="title" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter podcast title"
                    disabled={isUploading}
                    className="mt-1.5"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category" className="text-base">Category*</Label>
                  <select 
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5"
                    disabled={isUploading}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="description" className="text-base">Podcast Description*</Label>
                  <Textarea 
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what your podcast is about"
                    rows={4}
                    disabled={isUploading}
                    className="mt-1.5"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="cover-image" className="text-base">Cover Image*</Label>
                    <div className="mt-1.5">
                      {coverImagePreview ? (
                        <div className="relative w-full aspect-square max-w-xs mx-auto mb-3">
                          <img 
                            src={coverImagePreview} 
                            alt="Cover preview" 
                            className="w-full h-full object-cover rounded-md"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                            onClick={clearCoverImage}
                            disabled={isUploading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div 
                          className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors"
                          onClick={() => document.getElementById('cover-image')?.click()}
                        >
                          <div className="rounded-full bg-primary-50 p-3 mb-3">
                            <Upload className="h-6 w-6 text-primary-600" />
                          </div>
                          <p className="text-sm text-center text-primary-600">
                            Click to upload or drag and drop<br />
                            <span className="text-xs text-primary-500">SVG, PNG, JPG or GIF (1:1 ratio recommended)</span>
                          </p>
                        </div>
                      )}
                      <input
                        id="cover-image"
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="audio-file" className="text-base">Audio File*</Label>
                    <div className="mt-1.5">
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors"
                        onClick={() => document.getElementById('audio-file')?.click()}
                      >
                        <div className="rounded-full bg-primary-50 p-3 mb-3">
                          <Music className="h-6 w-6 text-primary-600" />
                        </div>
                        <p className="text-sm text-center text-primary-600">
                          Click to upload or drag and drop<br />
                          <span className="text-xs text-primary-500">MP3, WAV, or M4A (max. 50MB)</span>
                        </p>
                      </div>
                      <input
                        id="audio-file"
                        type="file"
                        accept="audio/*"
                        onChange={handleAudioFileChange}
                        className="hidden"
                        disabled={isUploading}
                      />
                      {selectedAudioFile && (
                        <div className="mt-3 text-sm flex items-center text-primary-600 bg-primary-50 p-2 rounded-md">
                          <File className="h-4 w-4 mr-2" />
                          {selectedAudioFile.name}
                          <span className="ml-2 text-xs text-primary-500">
                            ({Math.round(selectedAudioFile.size / 1024 / 1024 * 10) / 10} MB)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="episode-title" className="text-base">Episode Title*</Label>
                  <Input 
                    id="episode-title" 
                    value={episodeTitle}
                    onChange={(e) => setEpisodeTitle(e.target.value)}
                    placeholder="Enter title for this episode"
                    disabled={isUploading}
                    className="mt-1.5"
                  />
                </div>
                
                <div>
                  <Label htmlFor="episode-description" className="text-base">Episode Description</Label>
                  <Textarea 
                    id="episode-description"
                    value={episodeDescription}
                    onChange={(e) => setEpisodeDescription(e.target.value)}
                    placeholder="Describe what this episode is about (optional)"
                    rows={3}
                    disabled={isUploading}
                    className="mt-1.5"
                  />
                  <p className="text-xs text-primary-500 mt-1">
                    If left blank, the podcast description will be used.
                  </p>
                </div>
                
                {isUploading && (
                  <div className="w-full space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-primary-600">Uploading podcast...</span>
                      <span className="text-primary-600 font-medium">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-primary-600 h-2.5 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="pt-4">
                  <Button
                    onClick={handleUpload}
                    disabled={isUploading || !title || !description || !selectedAudioFile || !selectedCoverImage || !episodeTitle}
                    className="w-full"
                  >
                    {isUploading ? 'Uploading...' : 'Upload Podcast'}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-4">
              <Button
                variant="destructive"
                onClick={handleClearStoredMedia}
                className="flex items-center gap-2"
                disabled={isUploading}
              >
                <Trash2 className="h-4 w-4" />
                Clear All Stored Media
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <AppFooter />
    </div>
  );
};

export default PodcastUpload;
