import { checkStatuspage } from './statuspage.js';
import type { ServiceItem } from '../../types.js';

const GITHUB_SUMMARY_URL = 'https://www.githubstatus.com/api/v2/summary.json';

export async function checkGitHub(): Promise<ServiceItem> {
  return checkStatuspage('github', 'GitHub', GITHUB_SUMMARY_URL);
}
