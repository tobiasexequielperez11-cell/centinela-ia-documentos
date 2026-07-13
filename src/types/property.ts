export interface PropertyRecord {
  id: string;
  organization_id: string;
  name: string;
  property_type: string | null;
  address: string | null;
  matricula: string | null;
  surface_total_m2: number | null;
  surface_covered_m2: number | null;
  rooms: number | null;
  status: string | null;
  price: number | null;
  currency: string | null;
  owners: string | null;
  gravamenes: string | null;
  notes: string | null;
  archived_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
