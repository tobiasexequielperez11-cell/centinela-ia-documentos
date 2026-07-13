export type CaseStatus =
  | 'new'
  | 'in_review'
  | 'incomplete'
  | 'waiting_client'
  | 'complete'
  | 'archived'
  | string;

export interface CaseRecord {
  id: string;
  organization_id: string;
  title: string;
  client_name: string | null;
  case_type: string | null;
  status: CaseStatus;
  property_id: string | null;
  metadata?: Record<string, string> | null;
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
