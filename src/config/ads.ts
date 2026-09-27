/**
 * Advertisement Configuration
 * 
 * To connect your Google AdSense or ad network:
 * 1. Set `enabled: true`
 * 2. Set `adClient` to your Publisher ID (e.g., 'ca-pub-1234567890123456')
 * 3. Replace slot IDs with your AdSense / ad network unit slots
 */

export interface AdConfig {
  enabled: boolean;
  adClient: string; // e.g. "ca-pub-XXXXXXXXXXXXXXXX"
  slots: {
    topBanner: string; // Slot ID for top banner below search input
    resultBanner: string; // Slot ID below video download results
    sidebarBanner?: string; // Optional slot
  };
  testMode: boolean; // Shows placeholder outline when no live ads
}

export const ADS_CONFIG: AdConfig = {
  // Set to true once you have your AdSense or ad network approval
  enabled: true,
  
  // Replace with your Google AdSense Client ID (e.g., "ca-pub-1234567890123456")
  adClient: "", 
  
  slots: {
    topBanner: "1234567890",
    resultBanner: "0987654321",
    sidebarBanner: "1122334455"
  },
  
  // Set to false in production once real ads are serving
  testMode: true
};
