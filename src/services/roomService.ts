
import { toast } from 'sonner';

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
    localStorage.setItem('podcastRooms', JSON.stringify(rooms));
  } catch (error) {
    console.error('Error saving rooms to storage:', error);
    toast.error('Failed to save room data');
  }
};

const roomService = {
  // Get all rooms
  getRooms: async (): Promise<Room[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return getRoomsFromStorage();
  },

  // Get room by ID
  getRoomById: async (roomId: string): Promise<Room | null> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const rooms = getRoomsFromStorage();
    return rooms.find(room => room.id === roomId) || null;
  },

  // Create a new room
  createRoom: async (roomData: Partial<Room>): Promise<Room> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
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
  },

  // Send a message to a room channel
  sendMessage: async (roomId: string, channelName: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const rooms = getRoomsFromStorage();
    const roomIndex = rooms.findIndex(room => room.id === roomId);
    
    if (roomIndex === -1) {
      throw new Error('Room not found');
    }
    
    // Create a new message object
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
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
    
    return newMessage;
  },

  // Get messages from a room channel
  getMessages: async (roomId: string, channelName: string): Promise<Message[]> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const rooms = getRoomsFromStorage();
    const room = rooms.find(room => room.id === roomId);
    
    if (!room || !room.messages || !room.messages[channelName]) {
      return [];
    }
    
    return room.messages[channelName];
  },

  // Join a room
  joinRoom: async (roomId: string, userId: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 400));
    
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
    
    return true;
  },

  // Toggle voice chat for a user
  toggleVoiceChat: async (roomId: string, userId: string, enabled: boolean): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
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
    
    return true;
  },

  // Toggle video chat for a user
  toggleVideoChat: async (roomId: string, userId: string, enabled: boolean): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
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
    
    return true;
  }
};

export default roomService;
