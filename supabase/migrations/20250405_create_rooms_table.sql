
-- Create room tables for video/voice chat functionality
CREATE TABLE IF NOT EXISTS public.rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    creator_id TEXT NOT NULL,
    creator_name TEXT NOT NULL,
    creator_avatar TEXT,
    member_count INTEGER DEFAULT 1,
    is_live BOOLEAN DEFAULT true,
    tags TEXT[] DEFAULT '{}',
    channels TEXT[] DEFAULT '{general}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    active_users TEXT[] DEFAULT '{}',
    voice_enabled TEXT[] DEFAULT '{}',
    video_enabled TEXT[] DEFAULT '{}'
);

-- Set up RLS policies for rooms table
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Everyone can read rooms
CREATE POLICY "Everyone can read rooms" 
ON public.rooms
FOR SELECT 
USING (true);

-- Only authenticated users can create rooms
CREATE POLICY "Authenticated users can create rooms" 
ON public.rooms
FOR INSERT 
TO authenticated
USING (true);

-- Only room creators can update their rooms
CREATE POLICY "Room creators can update their rooms" 
ON public.rooms
FOR UPDATE 
USING (auth.uid()::text = creator_id);

-- Only room creators can delete their rooms
CREATE POLICY "Room creators can delete their rooms" 
ON public.rooms
FOR DELETE 
USING (auth.uid()::text = creator_id);
