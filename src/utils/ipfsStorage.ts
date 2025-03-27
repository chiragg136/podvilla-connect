
import { create } from 'ipfs-http-client';

// Configure IPFS client to use the public Infura IPFS gateway
// In production, you might want to use your own IPFS node or a different service
const ipfs = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
});

/**
 * Get the IPFS gateway URL for a file
 * @param cid IPFS Content Identifier (CID)
 * @returns Public gateway URL
 */
export const getIpfsGatewayUrl = (cid: string): string => {
  // Use a public IPFS gateway to access the file
  // You can use other gateways like cloudflare, pinata, etc.
  return `https://ipfs.io/ipfs/${cid}`;
};

/**
 * Upload a file to IPFS
 * @param file File to upload
 * @param onProgress Progress callback
 * @returns Object with upload result
 */
export const uploadToIpfs = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ success: boolean; cid?: string; url?: string; error?: string }> => {
  try {
    // Start progress notification
    if (onProgress) onProgress(10);

    console.log(`Uploading ${file.name} (${file.size} bytes) to IPFS`);
    
    // Convert the file to buffer for IPFS
    const buffer = await file.arrayBuffer();
    
    // Using progress simulation until we get a real progress event
    if (onProgress) onProgress(30);

    // Add the file to IPFS
    const result = await ipfs.add(
      {
        path: file.name,
        content: buffer
      },
      {
        progress: (prog) => {
          // Calculate progress percentage
          const progressPercentage = Math.ceil((prog / file.size) * 100);
          // Update progress between 30-90%
          if (onProgress) onProgress(30 + (progressPercentage * 0.6));
        }
      }
    );

    if (onProgress) onProgress(90);

    // The result should have a CID (Content Identifier)
    const cid = result.cid.toString();
    const url = getIpfsGatewayUrl(cid);

    console.log(`Upload complete. IPFS CID: ${cid}`);
    console.log(`Gateway URL: ${url}`);

    // Save info to localStorage to simulate persistence
    const storedFiles = JSON.parse(localStorage.getItem('ipfsFiles') || '[]');
    storedFiles.push({
      cid,
      name: file.name,
      type: file.type,
      url,
      uploadDate: new Date().toISOString()
    });
    localStorage.setItem('ipfsFiles', JSON.stringify(storedFiles));

    if (onProgress) onProgress(100);

    return {
      success: true,
      cid,
      url
    };
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred during IPFS upload'
    };
  }
};

/**
 * Store podcast metadata in IPFS
 * @param metadata Podcast metadata object
 * @returns Success status and CID
 */
export const storePodcastMetadata = async (metadata: any) => {
  try {
    // Log the metadata that would be stored
    console.log('Storing podcast metadata in IPFS:', metadata);
    
    // Convert metadata to JSON string
    const metadataString = JSON.stringify(metadata);
    
    // Upload the metadata to IPFS
    const result = await ipfs.add(metadataString);
    const cid = result.cid.toString();
    const url = getIpfsGatewayUrl(cid);
    
    console.log(`Metadata stored with CID: ${cid}`);
    console.log(`Gateway URL: ${url}`);
    
    // Store in localStorage for demo purposes
    const storedPodcasts = JSON.parse(localStorage.getItem('podcastMetadata') || '[]');
    metadata.ipfsCid = cid; // Add the CID to the metadata
    storedPodcasts.push(metadata);
    localStorage.setItem('podcastMetadata', JSON.stringify(storedPodcasts));
    
    // Also store in the main podcasts list to make it immediately available
    const existingPodcasts = JSON.parse(localStorage.getItem('podcasts') || '[]');
    
    // Format the podcast for the main list if it's not already there
    const podcastForMainList = existingPodcasts.find((p: any) => p.id === metadata.id) || {
      id: metadata.id,
      title: metadata.title,
      description: metadata.description,
      category: metadata.category,
      coverImage: metadata.coverImage,
      coverImageCid: metadata.coverImageCid,
      creator: "You",
      totalEpisodes: metadata.episodes.length,
      createdAt: metadata.createdAt,
      ipfsCid: cid,
      episodes: metadata.episodes.map((ep: any) => ({
        id: ep.id,
        title: ep.title,
        description: ep.description,
        audioUrl: ep.audioUrl,
        audioCid: ep.audioCid,
        duration: typeof ep.duration === 'string' ? parseInt(ep.duration) : ep.duration,
        releaseDate: ep.createdAt,
        isExclusive: false
      }))
    };
    
    if (!existingPodcasts.find((p: any) => p.id === metadata.id)) {
      existingPodcasts.push(podcastForMainList);
      localStorage.setItem('podcasts', JSON.stringify(existingPodcasts));
    }
    
    return { success: true, cid };
  } catch (error) {
    console.error('Error storing podcast metadata in IPFS:', error);
    return { success: false, error };
  }
};

/**
 * Get podcast metadata from IPFS
 * @param cid IPFS Content Identifier of the metadata
 * @returns Podcast metadata object
 */
export const getPodcastMetadataFromIpfs = async (cid: string) => {
  try {
    // In a production app, this would fetch from IPFS using the CID
    // For now, we'll retrieve from localStorage
    const storedPodcasts = JSON.parse(localStorage.getItem('podcastMetadata') || '[]');
    return storedPodcasts.find((podcast: any) => podcast.ipfsCid === cid);
  } catch (error) {
    console.error('Error retrieving podcast metadata from IPFS:', error);
    return null;
  }
};

/**
 * Get a file by CID
 * @param cid IPFS Content Identifier
 * @returns File object if found, null otherwise
 */
export const getFileByCid = async (cid: string) => {
  try {
    // In a real implementation, this would make a call to IPFS
    // For now, we'll check localStorage
    const storedFiles = JSON.parse(localStorage.getItem('ipfsFiles') || '[]');
    const file = storedFiles.find((f: any) => f.cid === cid);
    
    if (file) {
      return {
        ...file,
        downloadUrl: getIpfsGatewayUrl(cid),
        viewUrl: getIpfsGatewayUrl(cid)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving file by CID:', error);
    return null;
  }
};

export default {
  uploadToIpfs,
  getIpfsGatewayUrl,
  storePodcastMetadata,
  getPodcastMetadataFromIpfs,
  getFileByCid
};
