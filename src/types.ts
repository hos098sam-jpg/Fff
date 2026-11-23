export interface VideoFormat {
  itag: number;
  quality: string;
  height?: number;
  ext: string;
  container?: string;
  hasVideo: boolean;
  hasAudio: boolean;
  size: string;
  sizeBytes?: number;
  directUrl?: string;
  downloadUrl: string;
  mimeType?: string;
  fps?: number;
  bitrate?: number;
  audioCodec?: string;
  externalEngine?: boolean;
}

export interface VideoAuthor {
  name: string;
  channelUrl: string;
  subscribers?: string;
  avatar?: string;
}

export interface VideoThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface VideoData {
  id: string;
  title: string;
  description: string;
  author: VideoAuthor;
  durationSeconds: number;
  durationFormatted: string;
  views: string | number;
  viewsFormatted: string;
  uploadDate?: string;
  thumbnail: string;
  fallbackThumbnail?: string;
  thumbnails?: VideoThumbnail[];
  embedUrl: string;
  videoUrl: string;
  formats: VideoFormat[];
  highDefFormats?: VideoFormat[];
  audioFormats?: VideoFormat[];
}

export interface SearchResultItem {
  id: string;
  title: string;
  description?: string;
  author: {
    name: string;
    channelUrl?: string;
    avatar?: string;
  };
  duration: string;
  views: string;
  publishedTime: string;
  thumbnail: string;
  videoUrl: string;
  isShort?: boolean;
}

export interface SearchResponse {
  query: string;
  total: number;
  isDirectUrl?: boolean;
  videoId?: string;
  results: SearchResultItem[];
}

export interface ExtractionHistoryItem {
  id: string;
  title: string;
  thumbnail: string;
  author: string;
  duration: string;
  timestamp: number;
  url: string;
}

export interface SiteBadge {
  id: string;
  text: string;
  icon: 'wand' | 'zap' | 'shield' | 'star' | 'heart' | 'flame' | 'sparkles';
  enabled: boolean;
  color?: string;
}

export interface AnnouncementBanner {
  enabled: boolean;
  text: string;
  type: 'info' | 'warning' | 'success' | 'promo';
  link?: string;
}

export interface SiteConfig {
  siteTitle: string;
  siteSubtitle: string;
  authorName: string;
  authorBadge: string;
  logoUrl: string;
  authorImageUrl: string;
  customLogoDataUrl?: string;
  customAuthorDataUrl?: string;
  banner: AnnouncementBanner;
  badges: SiteBadge[];
  invidiousInstances: string[];
  pipedInstances: string[];
  cobaltInstances: string[];
  directAdUrl: string;
  directAdEnabled: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  defaultFormat: string;
  lastUpdated?: number;
}

export interface ProxyTestResult {
  url: string;
  type: 'invidious' | 'piped' | 'cobalt';
  status: 'online' | 'offline' | 'slow';
  latencyMs: number;
  error?: string;
}

export interface VaultMediaItem {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  mediaType: 'image' | 'video' | 'audio' | 'document';
  url: string;
  thumbnailUrl?: string;
  uploadedAt: number;
  deviceName?: string;
  dimensions?: { width: number; height: number };
  duration?: number;
}

export interface DevicePresence {
  id: string;
  deviceName: string;
  deviceType: 'phone' | 'tablet' | 'desktop';
  lastSeen: number;
  isBroadcasting: boolean;
  filesCount: number;
}

export interface VpnServerNode {
  id: string;
  name: string;
  country: string;
  flag: string;
  city: string;
  ping: number;
  type: 'ultra_fast' | 'stealth' | 'school_unblocker' | 'p2p_direct';
  features: string[];
}

export interface VpnSessionState {
  isConnected: boolean;
  activeServer: VpnServerNode;
  connectedAt?: number;
  bytesReceived: number;
  bytesSent: number;
  encryptedDns: boolean;
  bypassSchoolFirewall: boolean;
}


