
-- Create calls table to track voice/video calls
CREATE TABLE IF NOT EXISTS public.calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id TEXT NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    caller_id TEXT NOT NULL,
    call_type TEXT NOT NULL CHECK (call_type IN ('audio', 'video')),
    status TEXT NOT NULL CHECK (status IN ('in_progress', 'ended', 'missed')),
    participants TEXT[] DEFAULT '{}',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER
);

-- Set up RLS policies for calls table
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

-- Everyone can read calls
CREATE POLICY "Everyone can read calls" 
ON public.calls
FOR SELECT 
USING (true);

-- Only authenticated users can create calls
CREATE POLICY "Authenticated users can create calls" 
ON public.calls
FOR INSERT 
TO authenticated
USING (true);

-- Only callers can update calls
CREATE POLICY "Callers can update calls" 
ON public.calls
FOR UPDATE 
USING (auth.uid()::text = caller_id);

-- Create index on room_id for faster queries
CREATE INDEX IF NOT EXISTS idx_calls_room_id ON public.calls(room_id);

-- Add trigger to calculate call duration on update
CREATE OR REPLACE FUNCTION calculate_call_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
    NEW.duration_seconds := EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_call_duration
BEFORE UPDATE ON public.calls
FOR EACH ROW
EXECUTE FUNCTION calculate_call_duration();
