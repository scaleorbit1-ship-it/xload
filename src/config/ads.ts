/**
 * Advertisement Configuration
 * 
 * Google AdSense is connected with your Publisher ID: ca-pub-3479190841548681
 * ads.txt is configured in /public/ads.txt
 */

export interface AdConfig {
  enabled: boolean;
  adClient: string; // Google AdSense Publisher ID (with "ca-")
  slots: {
    topBanner: string; // Slot ID for top banner below search input
    resultBanner: string; // Slot ID below video download results
    sidebarBanner?: string; // Optional slot
  };
  testMode: boolean;
}

export const ADS_CONFIG: AdConfig = {
  enabled: true,
  
  // Google AdSense Client ID
  adClient: "ca-pub-3479190841548681", 
  
  slots: {
    topBanner: "3479190841",
    resultBanner: "3479190842",
    sidebarBanner: "3479190843"
  },
  
  testMode: false
};
