-- Extended schema for calendar coordination
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_all_day BOOLEAN DEFAULT false NOT NULL,
    
    -- Contextual bounds
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Performance Indexes for time-horizon lookups
CREATE INDEX IF NOT EXISTS idx_events_time_range 
ON public.calendar_events (start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_events_group 
ON public.calendar_events (group_id) 
WHERE group_id IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Select Policy: active group members can view events
CREATE POLICY "Members can select calendar events"
ON public.calendar_events
FOR SELECT
USING (
    group_id IS NULL
    OR EXISTS (
        SELECT 1 FROM public.group_members
        WHERE group_members.group_id = calendar_events.group_id
        AND group_members.profile_id = auth.uid()
    )
);

-- Manage Policy: officers and creator can write events
CREATE POLICY "Officers can insert calendar events"
ON public.calendar_events
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.group_members
        WHERE group_members.group_id = calendar_events.group_id
        AND group_members.profile_id = auth.uid()
        AND group_members.role IN ('CREATOR', 'OFFICIAL')
    )
);

CREATE POLICY "Officers can update calendar events"
ON public.calendar_events
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.group_members
        WHERE group_members.group_id = calendar_events.group_id
        AND group_members.profile_id = auth.uid()
        AND group_members.role IN ('CREATOR', 'OFFICIAL')
    )
);

CREATE POLICY "Officers can delete calendar events"
ON public.calendar_events
FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.group_members
        WHERE group_members.group_id = calendar_events.group_id
        AND group_members.profile_id = auth.uid()
        AND group_members.role IN ('CREATOR', 'OFFICIAL')
    )
);
