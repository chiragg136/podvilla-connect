
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { toast } from 'sonner';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  PhoneOff, 
  Volume2, 
  VolumeX,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  name: string;
  avatar: string;
}

interface VideoChatProps {
  roomId: string;
  isActive: boolean;
  isVideo: boolean;
  onClose: () => void;
  participants: User[];
}

const VideoChat = ({ 
  roomId, 
  isActive, 
  isVideo, 
  onClose, 
  participants 
}: VideoChatProps) => {
  const { user } = useUser();
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(isVideo);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const streamRef = useRef<MediaStream | null>(null);
  const connectionRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<RTCDataChannel | null>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  
  // Initialize WebRTC connection
  useEffect(() => {
    if (!isActive) return;
    
    let localStream: MediaStream | null = null;
    
    const initializeMedia = async () => {
      try {
        // Request user media based on current settings
        const constraints = {
          audio: micEnabled,
          video: isVideo && videoEnabled
        };
        
        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = localStream;
        
        // Display local video if video is enabled
        if (isVideo && videoEnabled && localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
        
        // Set up WebRTC connection
        setupPeerConnection(localStream);
        setCallStatus('connected');
        
        // Connect to Supabase channel for signaling
        connectToSignalingChannel();
        
        // Store call metadata in Supabase
        await recordCallStart();
      } catch (error) {
        console.error('Error accessing media devices:', error);
        toast.error('Could not access camera or microphone');
        onClose();
      }
    };
    
    initializeMedia();
    
    // Clean up on unmount
    return () => {
      cleanupCall();
    };
  }, [isActive]);
  
  // Update stream when mic or video settings change
  useEffect(() => {
    if (!isActive || !streamRef.current) return;
    
    const updateTracks = async () => {
      try {
        // Get current stream tracks
        const audioTracks = streamRef.current?.getAudioTracks() || [];
        const videoTracks = streamRef.current?.getVideoTracks() || [];
        
        // Handle audio enable/disable
        audioTracks.forEach(track => {
          track.enabled = micEnabled;
        });
        
        // Handle video enable/disable
        if (isVideo) {
          if (videoEnabled && videoTracks.length === 0) {
            // Add video if needed
            try {
              const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
              const videoTrack = videoStream.getVideoTracks()[0];
              streamRef.current?.addTrack(videoTrack);
              
              // Update local video display
              if (localVideoRef.current) {
                localVideoRef.current.srcObject = streamRef.current;
              }
              
              // Update the connection with the new track
              if (connectionRef.current) {
                connectionRef.current.getSenders().find(sender => 
                  sender.track?.kind === 'video'
                )?.replaceTrack(videoTrack);
              }
            } catch (err) {
              console.error('Error adding video track:', err);
              toast.error('Could not enable video');
              setVideoEnabled(false);
            }
          } else if (!videoEnabled) {
            // Disable existing video tracks
            videoTracks.forEach(track => {
              track.enabled = false;
            });
          } else {
            // Enable existing video tracks
            videoTracks.forEach(track => {
              track.enabled = true;
            });
          }
        }
        
        // Notify other participants about the change
        sendMediaStateUpdate({
          micEnabled,
          videoEnabled: isVideo && videoEnabled
        });
      } catch (error) {
        console.error('Error updating media tracks:', error);
      }
    };
    
    updateTracks();
  }, [micEnabled, videoEnabled, isVideo]);
  
  // Set up peer connection
  const setupPeerConnection = (stream: MediaStream) => {
    try {
      // Create new RTCPeerConnection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      connectionRef.current = pc;
      
      // Add all tracks from local stream to connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });
      
      // Handle ICE candidates
      pc.onicecandidate = event => {
        if (event.candidate) {
          sendSignalingMessage({
            type: 'ice-candidate',
            candidate: event.candidate,
            from: user?.id,
            to: 'all' // In a group call, we broadcast to all
          });
        }
      };
      
      // Handle incoming tracks (remote streams)
      pc.ontrack = event => {
        const [remoteStream] = event.streams;
        const senderId = remoteStream.id;
        
        // Find or create a video element for this participant
        if (remoteVideoRefs.current[senderId]) {
          remoteVideoRefs.current[senderId]!.srcObject = remoteStream;
        } else {
          // Will be assigned when participant elements are rendered
          setTimeout(() => {
            if (remoteVideoRefs.current[senderId]) {
              remoteVideoRefs.current[senderId]!.srcObject = remoteStream;
            }
          }, 500);
        }
      };
      
      // Create data channel for messaging
      const dataChannel = pc.createDataChannel('chat');
      channelRef.current = dataChannel;
      
      dataChannel.onopen = () => {
        console.log('Data channel is open');
      };
      
      dataChannel.onmessage = event => {
        try {
          const message = JSON.parse(event.data);
          handleDataChannelMessage(message);
        } catch (error) {
          console.error('Error parsing data channel message:', error);
        }
      };
      
    } catch (error) {
      console.error('Error setting up peer connection:', error);
      toast.error('Failed to establish call connection');
      onClose();
    }
  };
  
  // Connect to Supabase Realtime for signaling
  const connectToSignalingChannel = async () => {
    try {
      const channel = supabase.channel(`room-${roomId}`, {
        config: {
          broadcast: {
            self: true
          }
        }
      });
      
      channel.on('broadcast', { event: 'signaling' }, ({ payload }) => {
        handleSignalingMessage(payload);
      });
      
      await channel.subscribe();
      
      // Send an initial presence message
      sendSignalingMessage({
        type: 'join',
        userId: user?.id,
        userName: user?.name,
        userAvatar: user?.profileImage
      });
    } catch (error) {
      console.error('Error connecting to signaling channel:', error);
      toast.error('Failed to connect to call server');
    }
  };
  
  // Send a signaling message through Supabase Realtime
  const sendSignalingMessage = async (message: any) => {
    try {
      await supabase.channel(`room-${roomId}`).send({
        type: 'broadcast',
        event: 'signaling',
        payload: message
      });
    } catch (error) {
      console.error('Error sending signaling message:', error);
    }
  };
  
  // Handle incoming signaling messages
  const handleSignalingMessage = async (message: any) => {
    try {
      // Ignore our own messages
      if (message.from === user?.id) return;
      
      switch (message.type) {
        case 'join':
          // Someone joined, initiate or accept connection
          handleParticipantJoin(message);
          break;
        
        case 'offer':
          // Received an offer, create answer
          if (message.to === user?.id || message.to === 'all') {
            await handleOffer(message);
          }
          break;
        
        case 'answer':
          // Received an answer to our offer
          if (message.to === user?.id || message.to === 'all') {
            await handleAnswer(message);
          }
          break;
        
        case 'ice-candidate':
          // Received ICE candidate
          if (message.to === user?.id || message.to === 'all') {
            await handleIceCandidate(message);
          }
          break;
        
        case 'media-state-update':
          // Participant updated their media state
          handleMediaStateUpdate(message);
          break;
        
        case 'leave':
          // Participant left the call
          handleParticipantLeave(message);
          break;
      }
    } catch (error) {
      console.error('Error handling signaling message:', error);
    }
  };
  
  // Handle when a new participant joins
  const handleParticipantJoin = async (message: any) => {
    try {
      if (!connectionRef.current) return;
      
      // Create an offer to send to the new participant
      const offer = await connectionRef.current.createOffer();
      await connectionRef.current.setLocalDescription(offer);
      
      sendSignalingMessage({
        type: 'offer',
        offer: connectionRef.current.localDescription,
        from: user?.id,
        to: message.userId
      });
    } catch (error) {
      console.error('Error handling participant join:', error);
    }
  };
  
  // Handle received offers
  const handleOffer = async (message: any) => {
    try {
      if (!connectionRef.current) return;
      
      await connectionRef.current.setRemoteDescription(new RTCSessionDescription(message.offer));
      const answer = await connectionRef.current.createAnswer();
      await connectionRef.current.setLocalDescription(answer);
      
      sendSignalingMessage({
        type: 'answer',
        answer: connectionRef.current.localDescription,
        from: user?.id,
        to: message.from
      });
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };
  
  // Handle received answers to our offers
  const handleAnswer = async (message: any) => {
    try {
      if (!connectionRef.current) return;
      
      await connectionRef.current.setRemoteDescription(
        new RTCSessionDescription(message.answer)
      );
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };
  
  // Handle received ICE candidates
  const handleIceCandidate = async (message: any) => {
    try {
      if (!connectionRef.current) return;
      
      await connectionRef.current.addIceCandidate(
        new RTCIceCandidate(message.candidate)
      );
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };
  
  // Handle data channel messages
  const handleDataChannelMessage = (message: any) => {
    switch (message.type) {
      case 'chat':
        // Handle chat messages if implemented
        break;
      default:
        console.log('Unknown data channel message type:', message.type);
    }
  };
  
  // Handle media state updates from other participants
  const handleMediaStateUpdate = (message: any) => {
    // Currently used for UI updates when participants change their media state
    console.log('Participant media state update:', message);
    // Additional logic can be added here to update UI
  };
  
  // Handle participants leaving
  const handleParticipantLeave = (message: any) => {
    // Update UI to reflect participant leaving
    console.log('Participant left:', message.userId);
    // Additional cleanup if needed
  };
  
  // Send updates about our media state to other participants
  const sendMediaStateUpdate = (state: { micEnabled: boolean, videoEnabled: boolean }) => {
    sendSignalingMessage({
      type: 'media-state-update',
      from: user?.id,
      micEnabled: state.micEnabled,
      videoEnabled: state.videoEnabled
    });
  };
  
  // Record call start in Supabase
  const recordCallStart = async () => {
    try {
      const { error } = await supabase
        .from('calls')
        .insert({
          room_id: roomId,
          caller_id: user?.id,
          call_type: isVideo ? 'video' : 'audio',
          status: 'in_progress',
          participants: participants.map(p => p.id),
          started_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Error recording call start:', error);
      }
    } catch (error) {
      console.error('Error recording call:', error);
    }
  };
  
  // Record call end in Supabase
  const recordCallEnd = async () => {
    try {
      // Find the active call for this room
      const { data } = await supabase
        .from('calls')
        .select('id')
        .eq('room_id', roomId)
        .eq('status', 'in_progress')
        .order('started_at', { ascending: false })
        .limit(1);
      
      if (data && data.length > 0) {
        const callId = data[0].id;
        
        await supabase
          .from('calls')
          .update({
            status: 'ended',
            ended_at: new Date().toISOString()
          })
          .eq('id', callId);
      }
    } catch (error) {
      console.error('Error recording call end:', error);
    }
  };
  
  // Clean up resources when call ends
  const cleanupCall = async () => {
    // Stop all media tracks
    streamRef.current?.getTracks().forEach(track => {
      track.stop();
    });
    
    // Close peer connection
    if (connectionRef.current) {
      connectionRef.current.close();
      connectionRef.current = null;
    }
    
    // Close data channel
    if (channelRef.current) {
      channelRef.current.close();
      channelRef.current = null;
    }
    
    // Send leave message to other participants
    sendSignalingMessage({
      type: 'leave',
      userId: user?.id
    });
    
    // Record call end in Supabase
    await recordCallEnd();
    
    setCallStatus('disconnected');
  };
  
  // Toggle microphone
  const toggleMicrophone = () => {
    setMicEnabled(!micEnabled);
  };
  
  // Toggle video
  const toggleVideo = () => {
    if (isVideo) {
      setVideoEnabled(!videoEnabled);
    }
  };
  
  // Toggle speaker
  const toggleSpeaker = () => {
    setSpeakerEnabled(!speakerEnabled);
    
    // Apply speaker settings to all remote video elements
    Object.keys(remoteVideoRefs.current).forEach(id => {
      const videoEl = remoteVideoRefs.current[id];
      if (videoEl) {
        videoEl.muted = !speakerEnabled;
      }
    });
  };
  
  // Toggle full screen
  const toggleFullScreen = () => {
    if (!mainContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      mainContainerRef.current.requestFullscreen().catch(err => {
        console.error('Error attempting to enable full-screen mode:', err);
      });
      setIsFullScreen(true);
    } else {
      document.exitFullscreen();
      setIsFullScreen(false);
    }
  };
  
  // Handle call end button click
  const handleEndCall = () => {
    cleanupCall().then(() => {
      onClose();
    });
  };
  
  // Used to assign refs to remote video elements
  const setRemoteVideoRef = (id: string, element: HTMLVideoElement | null) => {
    remoteVideoRefs.current[id] = element;
  };
  
  if (!isActive) return null;
  
  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-4 right-4 w-48 shadow-lg rounded-lg bg-background border z-50 cursor-pointer"
        onClick={() => setIsMinimized(false)}
      >
        <div className="p-2 flex items-center justify-between">
          <span className="text-sm font-medium">
            {isVideo ? 'Video Call' : 'Voice Call'}
          </span>
          <span className="text-xs text-green-500">Active</span>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      ref={mainContainerRef}
      className={`fixed inset-0 bg-black/90 z-50 flex flex-col ${isFullScreen ? 'fullscreen' : ''}`}
    >
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center">
          <span className="text-white font-medium mr-2">
            {callStatus === 'connecting' ? 'Connecting...' : 'Connected'}
          </span>
          {callStatus === 'connected' && (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white"
            onClick={() => setIsMinimized(true)}
          >
            <Minimize2 className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white"
            onClick={toggleFullScreen}
          >
            {isFullScreen ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      
      <div className="flex-grow p-4 flex flex-col items-center justify-center relative">
        {/* Main video area */}
        <div className={`flex ${isVideo ? 'flex-wrap justify-center' : 'flex-col items-center'} gap-4 w-full h-full`}>
          {/* If it's a video call, show videos in a grid */}
          {isVideo ? (
            <>
              {/* Remote participants */}
              {participants.filter(p => p.id !== user?.id).map(participant => (
                <div key={participant.id} className="relative min-w-[240px] max-w-[45%] aspect-video bg-gray-800 rounded-lg overflow-hidden">
                  <video 
                    ref={el => setRemoteVideoRef(participant.id, el)} 
                    autoPlay 
                    playsInline
                    muted={!speakerEnabled}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 flex items-center bg-black/40 px-2 py-1 rounded-full">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback>{participant.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-white">{participant.name}</span>
                  </div>
                </div>
              ))}
              
              {/* Local video (self) */}
              {videoEnabled && (
                <div className="relative min-w-[240px] max-w-[45%] aspect-video bg-gray-800 rounded-lg overflow-hidden">
                  <video 
                    ref={localVideoRef} 
                    autoPlay 
                    playsInline
                    muted={true}
                    className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
                  />
                  <div className="absolute bottom-2 left-2 flex items-center bg-black/40 px-2 py-1 rounded-full">
                    <span className="text-xs text-white">You</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            // For audio calls, just show avatars
            <div className="flex flex-col items-center justify-center">
              <div className="grid grid-cols-3 gap-4">
                {participants.map(participant => (
                  <div key={participant.id} className="flex flex-col items-center">
                    <Avatar className="h-24 w-24 mb-2">
                      <AvatarImage src={participant.avatar} />
                      <AvatarFallback>{participant.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-white">{participant.id === user?.id ? 'You' : participant.name}</span>
                    {/* Hidden video elements for audio processing */}
                    {participant.id !== user?.id && (
                      <video 
                        ref={el => setRemoteVideoRef(participant.id, el)} 
                        autoPlay 
                        playsInline
                        muted={!speakerEnabled}
                        className="hidden"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Call controls */}
      <div className="bg-black/60 p-4 flex justify-center">
        <div className="flex gap-4 items-center">
          <Button
            variant="outline"
            size="icon"
            className={`rounded-full h-12 w-12 ${micEnabled ? 'bg-gray-200' : 'bg-red-500 hover:bg-red-600'}`}
            onClick={toggleMicrophone}
          >
            {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5 text-white" />}
          </Button>
          
          {isVideo && (
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full h-12 w-12 ${videoEnabled ? 'bg-gray-200' : 'bg-red-500 hover:bg-red-600'}`}
              onClick={toggleVideo}
            >
              {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5 text-white" />}
            </Button>
          )}
          
          <Button
            variant="destructive"
            size="icon"
            className="rounded-full h-14 w-14"
            onClick={handleEndCall}
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            className={`rounded-full h-12 w-12 ${speakerEnabled ? 'bg-gray-200' : 'bg-gray-700'}`}
            onClick={toggleSpeaker}
          >
            {speakerEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoChat;
