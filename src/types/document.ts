export type SensitivityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface DocumentRecord {
  id: string;
  organization_id: string;
  case_id: string | null;
  file_name: string;
  file_path: string;
  file_mime_type: string | null;
  file_size: number | null;
  document_type: string | null;
  sensitivity_level: SensitivityLevel;
  uploaded_by: string | null;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
}