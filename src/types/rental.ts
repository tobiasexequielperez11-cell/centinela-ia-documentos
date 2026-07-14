export interface RentalContract {
  id: string;
  organization_id: string;
  property_id: string | null;
  case_id: string | null;
  tenant_name: string | null;
  base_amount: number | null;
  currency: string | null;
  index_type: string | null;
  fixed_pct: number | null;
  adjustment_period_months: number | null;
  start_date: string | null;
  last_adjustment_date: string | null;
  current_amount: number | null;
  status: string | null;
  notes: string | null;
  archived_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
