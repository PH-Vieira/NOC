import { checkStatuspage } from './statuspage.js';
import type { ServiceItem } from '../../types.js';

const SUPABASE_SUMMARY_URL = 'https://status.supabase.com/api/v2/summary.json';

export async function checkSupabase(): Promise<ServiceItem> {
  return checkStatuspage('supabase', 'Supabase', SUPABASE_SUMMARY_URL);
}
