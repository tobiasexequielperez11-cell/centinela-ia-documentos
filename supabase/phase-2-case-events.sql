-- Migration: case_events table
-- Description: Creates the case_events table for timeline tracking

CREATE TABLE IF NOT EXISTS public.case_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  event_date date NOT NULL,
  event_type text NOT NULL,
  title text NOT NULL,
  description text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_case_events_case_id ON public.case_events(case_id);
CREATE INDEX IF NOT EXISTS idx_case_events_organization_id ON public.case_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_case_events_event_date ON public.case_events(event_date);

ALTER TABLE public.case_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view case events in their organization"
  ON public.case_events
  FOR SELECT
  USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE profiles.id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.status = 'active')
  );

CREATE POLICY "Users can insert case events in their organization"
  ON public.case_events
  FOR INSERT
  WITH CHECK (
    organization_id = (SELECT organization_id FROM public.profiles WHERE profiles.id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.status = 'active' AND profiles.role IN ('admin', 'employee', 'auditor'))
  );

CREATE POLICY "Users can update case events in their organization"
  ON public.case_events
  FOR UPDATE
  USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE profiles.id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.status = 'active' AND profiles.role IN ('admin', 'employee', 'auditor'))
  );

CREATE POLICY "Users can delete case events in their organization"
  ON public.case_events
  FOR DELETE
  USING (
    organization_id = (SELECT organization_id FROM public.profiles WHERE profiles.id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.status = 'active' AND profiles.role IN ('admin', 'employee', 'auditor'))
  );
