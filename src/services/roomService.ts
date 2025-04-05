import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: Date;
}

export interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice' | 'video';
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  memberCount: number;
  isLive: boolean;
  tags: string[];
  channels: string[];
  createdAt: Date;
  messages?: Record<string, Message[]>;
  activeUsers?: string[];
  voiceEnabled?: string[];
  videoEnabled?: string[];
}

// Helper to get rooms from storage
const getRoomsFromStorage = (): Room[] => {
  try {
    const roomsJson = localStorage.getItem('podcastRooms');
    if (roomsJson) {
      const rooms = JSON.parse(roomsJson);
      // Convert string dates back to Date objects
      return rooms.map((room: any) => ({
        ...room,
        createdAt: new Date(room.createdAt),
        // Ensure messages and user arrays exist
        messages: room.messages || {},
        activeUsers: room.activeUsers || [],
        voiceEnabled: room.voiceEnabled || [],
        videoEnabled: room.videoEnabled || []
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading rooms from storage:', error);
    return [];
  }
};

// Helper to save rooms to storage
const saveRoomsToStorage = (rooms: Room[]): void => {
  try {
    // Convert Date objects to strings before storing
    const roomsToSave = rooms.map(room => ({
      ...room,
      createdAt: room.createdAt.toISOString()
    }));
    
    localStorage.setItem('podcastRooms', JSON.stringify(roomsToSave));
    console.log('Saved rooms to storage:', roomsToSave);
  } catch (error) {
    console.error('Error saving rooms to storage:', error);
    toast.error('Failed to save room data');
  }
};

// Helper to save a file to Supabase Storage
const uploadFileToSupabase = async (file: File, bucket: string): Promise<string | null> => {
  try {
    // Create a unique filename
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${file.name}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(uniqueFileName, file);
      
    if (error) {
      console.error('Error uploading file to Supabase:', error);
      return null;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(uniqueFileName);
      
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadFileToSupabase:', error);
    return null;
  }
};

const roomService = {
  // Get all rooms
  getRooms: async (): Promise<Room[]> => {
    try {
      // Try to get rooms from Supabase first
      const { data: supabaseRooms, error } = await supabase
        .from('rooms')
        .select('*');
      
      if (error) {
        console.error('Error fetching rooms from Supabase:', error);
        // Fall back to localStorage
        return getRoomsFromStorage();
      }
      
      // If we have rooms from Supabase, use those
      if (supabaseRooms && supabaseRooms.length > 0) {
        return supabaseRooms.map((room: any) => ({
          ...room,
          createdAt: new Date(room.created_at || Date.now()),
          channels: room.channels || ['general'],
          activeUsers: room.active_users || [],
          voiceEnabled: room.voice_enabled || [],
          videoEnabled: room.video_enabled || []
        }));
      }
      
      // Otherwise use localStorage
      return getRoomsFromStorage();
    } catch (error) {
      console.error('Error in getRooms:', error);
      // Fall back to localStorage
      return getRoomsFromStorage();
    }
  },

  // Get room by ID
  getRoomById: async (roomId: string): Promise<Room | null> => {
    try {
      // Try to get room from Supabase first
      const { data: supabaseRoom, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single();
      
      if (error) {
        console.error('Error fetching room from Supabase:', error);
        // Fall back to localStorage
        const rooms = getRoomsFromStorage();
        const room = rooms.find(room => room.id === roomId) || null;
        
        if (room) {
          // Ensure messages property exists
          if (!room.messages) {
            room.messages = {};
          }
          
          // Ensure each channel has a messages array
          room.channels.forEach(channel => {
            if (!room.messages![channel]) {
              room.messages![channel] = [];
            }
          });
        }
        
        return room;
      }
      
      // If we have the room from Supabase, use that
      if (supabaseRoom) {
        const formattedRoom: Room = {
          id: supabaseRoom.id,
          name: supabaseRoom.name,
          description: supabaseRoom.description || '',
          creatorId: supabaseRoom.creator_id,
          creatorName: supabaseRoom.creator_name,
          creatorAvatar: supabaseRoom.creator_avatar,
          memberCount: supabaseRoom.member_count || 1,
          isLive: supabaseRoom.is_live || true,
          tags: supabaseRoom.tags || [],
          channels: supabaseRoom.channels || ['general'],
          createdAt: new Date(supabaseRoom.created_at || Date.now()),
          messages: {},
          activeUsers: supabaseRoom.active_users || [],
          voiceEnabled: supabaseRoom.voice_enabled || [],
          videoEnabled: supabaseRoom.video_enabled || []
        };
        
        // Get messages for each channel
        for (const channel of formattedRoom.channels) {
          const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .eq('room_id', roomId)
            .eq('channel', channel)
            .order('created_at', { ascending: true });
          
          if (messages) {
            formattedRoom.messages[channel] = messages.map((msg: any) => ({
              id: msg.id,
              userId: msg.user_id,
              userName: msg.user_name,
              userAvatar: msg.user_avatar,
              content: msg.content,
              timestamp: new Date(msg.created_at)
            }));
          } else {
            formattedRoom.messages[channel] = [];
          }
        }
        
        return formattedRoom;
      }
      
      // Fall back to localStorage
      const rooms = getRoomsFromStorage();
      const room = rooms.find(room => room.id === roomId) || null;
      
      if (room) {
        // Ensure messages property exists
        if (!room.messages) {
          room.messages = {};
        }
        
        // Ensure each channel has a messages array
        room.channels.forEach(channel => {
          if (!room.messages![channel]) {
            room.messages![channel] = [];
          }
        });
      }
      
      return room;
    } catch (error) {
      console.error('Error in getRoomById:', error);
      // Fall back to localStorage
      const rooms = getRoomsFromStorage();
      const room = rooms.find(room => room.id === roomId) || null;
      
      if (room) {
        // Ensure messages property exists
        if (!room.messages) {
          room.messages = {};
        }
        
        // Ensure each channel has a messages array
        room.channels.forEach(channel => {
          if (!room.messages![channel]) {
            room.messages![channel] = [];
          }
        });
      }
      
      return room;
    }
  },

  // Create a new room
  createRoom: async (roomData: Partial<Room>): Promise<Room> => {
    try {
      const newRoomId = `room_${Date.now()}`;
      
      const newRoom: Room = {
        id: newRoomId,
        name: roomData.name || 'New Room',
        description: roomData.description || '',
        creatorId: roomData.creatorId || 'unknown',
        creatorName: roomData.creatorName || 'Unknown Creator',
        creatorAvatar: roomData.creatorAvatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61',
        memberCount: 1,
        isLive: true,
        tags: roomData.tags || [],
        channels: ['general'],
        createdAt: new Date(),
        messages: { general: [] },
        activeUsers: [roomData.creatorId || 'unknown'],
        voiceEnabled: [],
        videoEnabled: []
      };
      
      // Try to save to Supabase first
      const { data, error } = await supabase
        .from('rooms')
        .insert({
          id: newRoomId,
          name: newRoom.name,
          description: newRoom.description,
          creator_id: newRoom.creatorId,
          creator_name: newRoom.creatorName,
          creator_avatar: newRoom.creatorAvatar,
          member_count: 1,
          is_live: true,
          tags: newRoom.tags,
          channels: newRoom.channels,
          created_at: newRoom.createdAt.toISOString(),
          active_users: [newRoom.creatorId],
          voice_enabled: [],
          video_enabled: []
        })
        .select();
      
      if (error) {
        console.error('Error saving room to Supabase:', error);
        // Fall back to localStorage
        const rooms = getRoomsFromStorage();
        rooms.push(newRoom);
        saveRoomsToStorage(rooms);
      }
      
      return newRoom;
    } catch (error) {
      console.error('Error in createRoom:', error);
      // Fall back to localStorage
      const rooms = getRoomsFromStorage();
      
      const newRoom: Room = {
        id: `room_${Date.now()}`,
        name: roomData.name || 'New Room',
        description: roomData.description || '',
        creatorId: roomData.creatorId || 'unknown',
        creatorName: roomData.creatorName || 'Unknown Creator',
        creatorAvatar: roomData.creatorAvatar || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61',
        memberCount: 1,
        isLive: true,
        tags: roomData.tags || [],
        channels: ['general'],
        createdAt: new Date(),
        messages: { general: [] },
        activeUsers: [roomData.creatorId || 'unknown'],
        voiceEnabled: [],
        videoEnabled: []
      };
      
      rooms.push(newRoom);
      saveRoomsToStorage(rooms);
      
      return newRoom;
    }
  },

  // Send a message to a room channel
  sendMessage: async (roomId: string, channelName: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> => {
    try {
      const newMessageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      const newMessage: Message = {
        id: newMessageId,
        userId: message.userId,
        userName: message.userName,
        userAvatar: message.userAvatar,
        content: message.content,
        timestamp: new Date()
      };
      
      // Try to save to Supabase first
      const { data, error } = await supabase
        .from('messages')
        .insert({
          id: newMessageId,
          room_id: roomId,
          channel: channelName,
          user_id: message.userId,
          user_name: message.userName,
          user_avatar: message.userAvatar,
          content: message.content,
          created_at: newMessage.timestamp.toISOString()
        })
        .select();
      
      if (error) {
        console.error('Error saving message to Supabase:', error);
        // Fall back to localStorage
        const rooms = getRoomsFromStorage();
        const roomIndex = rooms.findIndex(room => room.id === roomId);
        
        if (roomIndex === -1) {
          throw new Error('Room not found');
        }
        
        // Initialize channel if it doesn't exist
        if (!rooms[roomIndex].messages) {
          rooms[roomIndex].messages = {};
        }
        
        if (!rooms[roomIndex].messages[channelName]) {
          rooms[roomIndex].messages[channelName] = [];
        }
        
        // Add message to channel
        rooms[roomIndex].messages[channelName].push(newMessage);
        
        saveRoomsToStorage(rooms);
      }
      
      return newMessage;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      // Fall back to localStorage
      const rooms = getRoomsFromStorage();
      const roomIndex = rooms.findIndex(room => room.id === roomId);
      
      if (roomIndex === -1) {
        throw new Error('Room not found');
      }
      
      // Create a new message object
      const newMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        userId: message.userId,
        userName: message.userName,
        userAvatar: message.userAvatar,
        content: message.content,
        timestamp: new Date()
      };
      
      // Initialize channel if it doesn't exist
      if (!rooms[roomIndex].messages) {
        rooms[roomIndex].messages = {};
      }
      
      if (!rooms[roomIndex].messages[channelName]) {
        rooms[roomIndex].messages[channelName] = [];
      }
      
      // Add message to channel
      rooms[roomIndex].messages[channelName].push(newMessage);
      
      saveRoomsToStorage(rooms);
      console.log(`Message added to room ${roomId}, channel ${channelName}:`, newMessage);
      
      return newMessage;
    }
  },

  // Get messages from a room channel
  getMessages: async (roomId: string, channelName: string): Promise<Message[]> => {
    try {
      // Try to get messages from Supabase first
      const { data: supabaseMessages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .eq('channel', channelName)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching messages from Supabase:', error);
        // Fall back to localStorage
        const rooms = getRoomsFromStorage();
        const room = rooms.find(room => room.id === roomId);
        
        if (!room || !room.messages || !room.messages[channelName]) {
          console.log(`No messages found for room ${roomId}, channel ${channelName}`);
          return [];
        }
        
        // Convert string dates back to Date objects if needed
        const messages = room.messages[channelName].map(msg => ({
          ...msg,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
        }));
        
        return messages;
      }
      
      // If we have messages from Supabase, use those
      if (supabaseMessages) {
        return supabaseMessages.map((msg: any) => ({
          id: msg.id,
          userId: msg.user_id,
          userName: msg.user_name,
          userAvatar: msg.user_avatar,
          content: msg.content,
          timestamp: new Date(msg.created_at)
        }));
      }
      
      // Otherwise return empty array
      return [];
    } catch (error) {
      console.error('Error in getMessages:', error);
      // Fall back to localStorage
      const rooms = getRoomsFromStorage();
      const room = rooms.find(room => room.id === roomId);
      
      if (!room || !room.messages || !room.messages[channelName]) {
        console.log(`No messages found for room ${roomId}, channel ${channelName}`);
        return [];
      }
      
      // Convert string dates back to Date objects if needed
      const messages = room.messages[channelName].map(msg => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
      }));
      
      return messages;
    }
  },

  // Join a room
  joinRoom: async (roomId: string, userId: string): Promise<boolean> => {
    try {
      // Try to update room in Supabase first
      const { data: roomData, error: fetchError } = await supabase
        .from('rooms')
        .select('active_users, member_count')
        .eq('id', roomId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching room from Supabase:', fetchError);
        // Fall back to localStorage
        const rooms = getRoomsFromStorage();
        const roomIndex = rooms.findIndex(room => room.id === roomId);
        
        if (roomIndex === -1) {
          return false;
        }
        
        // Initialize active users if needed
        if (!rooms[roomIndex].activeUsers) {
          rooms[roomIndex].activeUsers = [];
        }
        
        // Add user if not already in the room
        if (!rooms[roomIndex].activeUsers.includes(userId)) {
          rooms[roomIndex].activeUsers.push(userId);
          rooms[roomIndex].memberCount = rooms[roomIndex].activeUsers.length;
        }
        
        saveRoomsToStorage(rooms);
        console.log(`User ${userId} joined room ${roomId}`);
        
        return true;
      }
      
      // Update the room in Supabase
      let activeUsers = roomData.active_users || [];
      let memberCount = roomData.member_count || 0;
      
      if (!activeUsers.includes(userId)) {
        activeUsers.push(userId);
        memberCount += 1;
      }
      
      const { error: updateError } = await supabase
        .from('rooms')
        .update({
          active_users: activeUsers,
          member_count: memberCount
        })
        .eq('id', roomId);
      
      if (updateError) {
        console.error('Error updating room in Supabase:', updateError);
        // Fall back to localStorage
        const rooms = getRoomsFromStorage();
        const roomIndex = rooms.findIndex(room => room.id === roomId);
        
        if (roomIndex === -1) {
          return false;
        }
        
        // Initialize active users if needed
        if (!rooms[roomIndex].activeUsers) {
          rooms[roomIndex].activeUsers = [];
        }
        
        // Add user if not already in the room
        if (!rooms[roomIndex].activeUsers.includes(userId)) {
          rooms[roomIndex].activeUsers.push(userId);
          rooms[roomIndex].memberCount = rooms[roomIndex].activeUsers.length;
        }
        
        saveRoomsToStorage(rooms);
      }
      
      return true;
    } catch (error) {
      console.error('Error in joinRoom:', error);
      // Fall back to localStorage
      const rooms = getRoomsFromStorage();
      const roomIndex = rooms.findIndex(room => room.id === roomId);
      
      if (roomIndex === -1) {
        return false;
      }
      
      // Initialize active users if needed
      if (!rooms[roomIndex].activeUsers) {
        rooms[roomIndex].activeUsers = [];
      }
      
      // Add user if not already in the room
      if (!rooms[roomIndex].activeUsers.includes(userId)) {
        rooms[roomIndex].activeUsers.push(userId);
        rooms[roomIndex].memberCount = rooms[roomIndex].activeUsers.length;
      }
      
      saveRoomsToStorage(rooms);
      console.log(`User ${userId} joined room ${roomId}`);
      
      return true;
    }
  },
  
  // Leave a room
  leaveRoom: async (roomId: string, userId: string): Promise<boolean> => {
    try {
      // Try to update room in Supabase first
      const { data: roomData, error: fetchError } = await supabase
        .from('rooms')
        .select('active_users, member_count, voice_enabled, video_enabled')
        .eq('id', roomId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching room from Supabase:', fetchError);
        // Fall back to localStorage
        const rooms = getRoomsFromStorage();
        const roomIndex = rooms.findIndex(room => room.id === roomId);
        
        if (roomIndex === -1) {
          return false;
        }
        
        // Remove user from active users
        if (rooms[roomIndex].activeUsers) {
          rooms[roomIndex].activeUsers = rooms[roomIndex].activeUsers.filter(id => id !== userId);
          rooms[roomIndex].memberCount = rooms[roomIndex].activeUsers.length;
        }
        
        // Remove user from voice enabled
        if (rooms[roomIndex].voiceEnabled) {
          rooms[roomIndex].voiceEnabled = rooms[roomIndex].voiceEnabled.filter(id => id !== userId);
        }
        
        // Remove user from video enabled
        if (rooms[roomIndex].videoEnabled) {
          rooms[roomIndex].videoEnabled = rooms[roomIndex].videoEnabled.filter(id => id !== userId);
        }
        
        saveRoomsToStorage(rooms);
        console.log(`User ${userId} left room ${roomId}`);
        
        return true;
      }
      
      // Update the room in Supabase
      let activeUsers = roomData.active_users || [];
      let memberCount = roomData.member_count || 0;
      let voiceEnabled = roomData.voice_enabled || [];
      let videoEnabled = roomData.video_enabled || [];
      
      // Remove user from all lists
      activeUsers = activeUsers.filter((id: string) => id !== userId);
      voiceEnabled = voiceEnabled.filter((id: string) => id !== userId);
      videoEnabled = videoEnabled.filter((id: string) => id !== userId);
      
      // Update member count
      memberCount = activeUsers.length;
      
      const { error: updateError } = await supabase
        .from('rooms')
        .update({
          active_users: activeUsers,
          member_count: memberCount,
          voice_enabled: voiceEnabled,
          video_enabled: videoEnabled
        })
        .eq('id', roomId);
      
      if (updateError) {
        console.error('Error updating room in Supabase:', updateError);
        // Fall back to localStorage
        const rooms = getRoomsFromStorage();
        const roomIndex = rooms.findIndex(room => room.id === roomId);
        
        if (roomIndex === -1) {
          return false;
        }
        
        // Remove user from active users
        if (rooms[roomIndex].activeUsers) {
          rooms[roomIndex].activeUsers = rooms[roomIndex].activeUsers.filter(id => id !== userId);
          rooms[roomIndex].memberCount = rooms[roomIndex].activeUsers.length;
        }
        
        // Remove user from voice enabled
        if (rooms[roomIndex].voiceEnabled) {
          rooms[roomIndex].voiceEnabled = rooms[roomIndex].voiceEnabled.filter(id => id !== userId);
        }
        
        // Remove user from video enabled
        if (rooms[roomIndex].videoEnabled) {
          rooms[roomIndex].videoEnabled = rooms[roomIndex].videoEnabled.filter(id => id !== userId);
        }
        
        saveRoomsToStorage(rooms);
      }
      
      return true;
    } catch (error) {
      console.error('Error in leaveRoom:', error);
      // Fall back to localStorage
      const rooms = getRoomsFromStorage();
      const roomIndex = rooms.findIndex(room => room.id === roomId);
      
      if (roomIndex === -1) {
        return false;
      }
      
      // Remove user from active users
      if (rooms[roomIndex].activeUsers) {
        rooms[roomIndex].activeUsers = rooms[roomIndex].activeUsers.filter(id => id !== userId);
        rooms[roomIndex].memberCount = rooms[roomIndex].activeUsers.length;
      }
      
      // Remove user from voice enabled
      if (rooms[roomIndex].voiceEnabled) {
        rooms[roomIndex].voiceEnabled = rooms[roomIndex].voiceEnabled.filter(id => id !== userId);
      }
      
      // Remove user from video enabled
      if (rooms[roomIndex].videoEnabled) {
        rooms[roomIndex].videoEnabled = rooms[roomIndex].videoEnabled.filter(id => id !== userId);
      }
      
      saveRoomsToStorage(rooms);
      console.log(`User ${userId} left room ${roomId}`);
      
      return true;
    }
  },

  // Toggle voice chat for a user
  toggleVoiceChat: async (roomId: string, userId: string, enabled: boolean): Promise<boolean> => {
    try {
      // Try to update room in Supabase first
      const { data: roomData, error: fetchError } = await supabase
        .from('rooms')
        .select('voice_enabled')
        .eq('id', roomId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching room from Supabase:', fetchError);
        // Fall back to localStorage
        const rooms = getRoomsFromStorage();
        const roomIndex = rooms.findIndex(room => room.id === roomId);
        
        if (roomIndex === -1) {
          return false;
        }
        
        // Initialize voice enabled array if needed
        if (!rooms[roomIndex].voiceEnabled) {
          rooms[roomIndex].voiceEnabled = [];
        }
        
        if (enabled) {
          // Add user to voice enabled if not already there
          if (!rooms[roomIndex].voiceEnabled.includes(userId)) {
            rooms[roomIndex].voiceEnabled.push(userId);
          }
        } else {
          // Remove user from voice enabled
          rooms[roomIndex].voiceEnabled = rooms[roomIndex].voiceEnabled.filter(id => id !== userId);
        }
        
        saveRoomsToStorage(rooms);
        console.log(`Voice chat ${enabled ? 'enabled' : 'disabled'} for user ${userId} in room ${roomId}`);
        
        return true;
      }
      
      // Update the room in Supabase
      let voiceEnabled = roomData.voice_enabled || [];
      
      if (enabled) {
        // Add user to voice enabled if not already there
        if (!voiceEnabled.includes(userId)) {
          voiceEnabled.push(userId);
        }
      } else {
        // Remove user from voice enabled
        voiceEnabled = voiceEnabled.filter((id: string) => id !== userId);
      }
      
      const { error: updateError } = await supabase
        .from('rooms')
        .update({
          voice_enabled: voiceEnabled
        })
        .eq('id', roomId);
      
      if (updateError) {
        console.error('Error updating room in Supabase:', updateError);
        // Fall back to localStorage
        const rooms = getRoomsFromStorage();
        const roomIndex = rooms.findIndex(room => room.id === roomId);
        
        if (roomIndex === -1) {
          return false;
        }
        
        // Initialize voice enabled array if needed
        if (!rooms[roomIndex].voiceEnabled) {
          rooms[roomIndex].voiceEnabled = [];
        }
        
        if (enabled) {
          // Add user to voice enabled if not already there
          if (!rooms[roomIndex].voiceEnabled.includes(userId)) {
            rooms[roomIndex].voiceEnabled.push(userId);
          }
        } else {
          // Remove user from voice enabled
          rooms[roomIndex].voiceEnabled = rooms[roomIndex].voiceEnabled.filter(id => id !== userId);
        }
        
        saveRoomsToStorage(rooms);
      }
      
      return true;
    } catch (error) {
      console.error('Error in toggleVoiceChat:', error);
      // Fall back to localStorage
      const rooms = getRoomsFromStorage();
      const roomIndex = rooms.findIndex(room => room.id === roomId);
      
      if (roomIndex === -1) {
        return false;
      }
      
      // Initialize voice enabled array if needed
      if (!rooms[roomIndex].voiceEnabled) {
        rooms[roomIndex].voiceEnabled = [];
      }
      
      if (enabled) {
        // Add user to voice enabled if not already there
        if (!rooms[roomIndex].voiceEnabled.includes(userId)) {
          rooms[roomIndex].voiceEnabled.push(userId);
        }
      } else {
        // Remove user from voice enabled
        rooms[roomIndex].voiceEnabled = rooms[roomIndex].voiceEnabled.filter(id => id !== userId);
      }
      
      saveRoomsToStorage(rooms);
      console.log(`Voice chat ${enabled ? 'enabled' : 'disabled'} for user ${userId} in room ${roomId}`);
      
      return true;
    }
  },

  // Toggle video chat for a user
  toggleVideoChat: async (roomId: string, userId: string, enabled: boolean): Promise<boolean> => {
    try {
      // Try to update room in Supabase first
      const { data: roomData, error: fetchError } = await supabase
        .from('rooms')
        .select('video_enabled')
        .eq('id', roomId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching room from Supabase:', fetchError);
        // Fall back to localStorage
        const rooms = getRoomsFromStorage();
        const roomIndex = rooms.findIndex(room => room.id === roomId);
        
        if (roomIndex === -1) {
          return false;
        }
        
        // Initialize video enabled array if needed
        if (!rooms[roomIndex].videoEnabled) {
          rooms[roomIndex].videoEnabled = [];
        }
        
        if (enabled) {
          // Add user to video enabled if not already there
          if (!rooms[roomIndex].videoEnabled.includes(userId)) {
            rooms[roomIndex].videoEnabled.push(userId);
          }
        } else {
          // Remove user from video enabled
          rooms[roomIndex].videoEnabled = rooms[roomIndex].videoEnabled.filter(id => id !== userId);
        }
        
        saveRoomsToStorage(rooms);
        console.log(`Video chat ${enabled ? 'enabled' : 'disabled'} for user ${userId} in room ${roomId}`);
        
        return true;
      }
      
      // Update the room in Supabase
      let videoEnabled = roomData.video_enabled || [];
      
      if (enabled) {
        // Add user to video enabled if not already there
        if (!videoEnabled.includes(userId)) {
          videoEnabled.push(userId);
        }
      } else {
        // Remove user from video enabled
        videoEnabled = videoEnabled.filter((id: string) => id !== userId);
      }
      
      const { error: updateError } = await supabase
        .from('rooms')
        .update({
          video_enabled: videoEnabled
        })
        .eq('id', roomId);
      
      if (updateError) {
        console.error('Error updating room in Supabase:', updateError);
        // Fall back to localStorage
        const rooms = getRoomsFromStorage();
        const roomIndex = rooms.findIndex(room => room.id === roomId);
        
        if (roomIndex === -1) {
          return false;
        }
        
        // Initialize video enabled array if needed
        if (!rooms[roomIndex].videoEnabled) {
          rooms[roomIndex].videoEnabled = [];
        }
        
        if (enabled) {
          // Add user to video enabled if not already there
          if (!rooms[roomIndex].videoEnabled.includes(userId)) {
            rooms[roomIndex].videoEnabled.push(userId);
          }
        } else {
          // Remove user from video enabled
          rooms[roomIndex].videoEnabled = rooms[roomIndex].videoEnabled.filter(id => id !== userId);
        }
        
        saveRoomsToStorage(rooms);
      }
      
      return true;
    } catch (error) {
      console.error('Error in toggleVideoChat:', error);
      // Fall back to localStorage
      const rooms = getRoomsFromStorage();
      const roomIndex = rooms.findIndex(room => room.id === roomId);
      
      if (roomIndex === -1) {
        return false;
      }
      
      // Initialize video enabled array if needed
      if (!rooms[roomIndex].videoEnabled) {
        rooms[roomIndex].videoEnabled = [];
      }
      
      if (enabled) {
        // Add user to video enabled if not already there
        if (!rooms[roomIndex].videoEnabled.includes(userId)) {
          rooms[roomIndex].videoEnabled.push(userId);
        }
      } else {
        // Remove user from video enabled
        rooms[roomIndex].videoEnabled = rooms[roomIndex].videoEnabled.filter(id => id !== userId);
      }
      
      saveRoomsToStorage(rooms);
      console.log(`Video chat ${enabled ? 'enabled' : 'disabled'} for user ${userId} in room ${roomId}`);
      
      return true;
    }
  },
  
  // Get participants for a room
  getRoomParticipants: async (roomId: string): Promise<any[]> => {
    try {
      // First try to get participants from Supabase
      const { data: room, error } = await supabase
        .from('rooms')
        .select('active_users')
        .eq('id', roomId)
        .single();
      
      if (error) {
        console.error('Error fetching room from Supabase:', error);
        // Fall back to localStorage
        const rooms = getRoomsFromStorage();
        const roomData = rooms.find(r => r.id === roomId);
        
        if (!roomData || !roomData.activeUsers) {
          return [];
        }
        
        // Get basic participant data
        return roomData.activeUsers.map(userId => ({
          id: userId,
          name: userId === roomData.creatorId ? roomData.creatorName : `User ${userId.substring(0, 4)}`,
          avatar: userId === roomData.creatorId ? roomData.creatorAvatar : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61'
        }));
      }
      
      // Get user details for each active user
      if (!room || !room.active_users || !Array.isArray(room.active_users)) {
        return [];
      }
      
      const participants = [];
      
      for (const userId of room.active_users) {
        // Try to get user details from Supabase
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('name, avatar_url')
          .eq('id', userId)
          .single();
          
        if (userError || !userData) {
          // Fallback to generic user data
          participants.push({
            id: userId,
            name: `User ${userId.substring(0, 4)}`,
            avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61'
          });
        } else {
          participants.push({
            id: userId,
            name: userData.name,
            avatar: userData.avatar_url
          });
        }
      }
      
      return participants;
    } catch (error) {
      console.error('Error in getRoomParticipants:', error);
      // Fall back to localStorage
      const rooms = getRoomsFromStorage();
      const roomData = rooms.find(r => r.id === roomId);
      
      if (!roomData || !roomData.activeUsers) {
        return [];
      }
      
      // Get basic participant data
      return roomData.activeUsers.map(userId => ({
        id: userId,
        name: userId === roomData.creatorId ? roomData.creatorName : `User ${userId.substring(0, 4)}`,
        avatar: userId === roomData.creatorId ? roomData.creatorAvatar : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61'
      }));
    }
  }
};

export default roomService;
