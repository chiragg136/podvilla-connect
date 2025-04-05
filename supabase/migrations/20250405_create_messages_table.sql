
-- Create messages table for room chats
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    channel TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_avatar TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Set up RLS policies for messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Everyone can read messages
CREATE POLICY "Everyone can read messages" 
ON public.messages
FOR SELECT 
USING (true);

-- Only authenticated users can create messages
CREATE POLICY "Authenticated users can create messages" 
ON public.messages
FOR INSERT 
TO authenticated
USING (true);

-- Users can only update their own messages
CREATE POLICY "Users can update their own messages" 
ON public.messages
FOR UPDATE 
USING (auth.uid()::text = user_id);

-- Users can only delete their own messages
CREATE POLICY "Users can delete their own messages" 
ON public.messages
FOR DELETE 
USING (auth.uid()::text = user_id);

-- Create index on room_id and channel for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_room_channel ON public.messages(room_id, channel);
