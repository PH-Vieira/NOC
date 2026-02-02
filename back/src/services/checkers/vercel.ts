import { checkStatuspage } from './statuspage.js';
import type { ServiceItem } from '../../types.js';

const VERCEL_SUMMARY_URL = 'https://www.vercel-status.com/api/v2/summary.json';

export async function checkVercel(): Promise<ServiceItem> {
  return checkStatuspage('vercel', 'Vercel', VERCEL_SUMMARY_URL);
}
