
import type { SiteSettings } from './types';
import siteData from '@/config/site.json';


export async function getSiteSettings(): Promise<SiteSettings> {
    // Data is now sourced from site.json, making this function a simple provider.
    return siteData.settings;
}
