-- Create missions table
CREATE TABLE IF NOT EXISTS public.missions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'Em andamento',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create mission_groups table
CREATE TABLE IF NOT EXISTS public.mission_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    image_url TEXT,
    participants_count INTEGER DEFAULT 0,
    guides_count INTEGER DEFAULT 0,
    next_event TEXT,
    status TEXT DEFAULT 'Em andamento',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_groups ENABLE ROW LEVEL SECURITY;

-- Create policies for missions
-- Policy to allow read access to everyone (modify as needed for authenticated users)
CREATE POLICY "Enable read access for all users" ON public.missions
    FOR SELECT USING (true);

-- Policy to allow insert/update/delete for authenticated users only
CREATE POLICY "Enable write access for authenticated users only" ON public.missions
    FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for mission_groups
-- Policy to allow read access to everyone
CREATE POLICY "Enable read access for all users" ON public.mission_groups
    FOR SELECT USING (true);

-- Policy to allow write access for authenticated users only
CREATE POLICY "Enable write access for authenticated users only" ON public.mission_groups
    FOR ALL USING (auth.role() = 'authenticated');
