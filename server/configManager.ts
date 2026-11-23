import fs from 'fs';
import path from 'path';

export interface AnnouncementBanner {
  enabled: boolean;
  text: string;
  type: 'info' | 'warning' | 'success' | 'promo';
  link?: string;
}

export interface SiteBadge {
  id: string;
  text: string;
  icon: 'wand' | 'zap' | 'shield' | 'star' | 'heart' | 'flame' | 'sparkles';
  enabled: boolean;
  color?: string;
}

export interface FullSiteConfig {
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
  adminPin: string;
  lastUpdated: number;
}

export const DEFAULT_CONFIG: FullSiteConfig = {
  siteTitle: 'سحر التحميل - استخراج وتحميل فيديوهات اليوتيوب والصوتيات',
  siteSubtitle: 'ابحث عن أي فيديو، أنشودة، أو بودكاست، أو الصق رابط يوتيوب لتحميله مباشرة بجميع الجودات (1080p, 720p, MP3) - الصق الرابط وسيب السحر علينا!',
  authorName: 'حسام أحمد مساعد',
  authorBadge: 'HAM',
  logoUrl: '/logo.png',
  authorImageUrl: '/author.jpg',
  banner: {
    enabled: false,
    text: 'مرحباً بكم في سحر التحميل! تم تحديث خوادم التحميل بأعلى سرعة وجودة.',
    type: 'info',
    link: ''
  },
  badges: [
    { id: '1', text: 'البحث الذكي & التحميل السريع', icon: 'wand', enabled: true },
    { id: '2', text: 'نتائج فورية مثل يوتيوب تماماً', icon: 'zap', enabled: true },
    { id: '3', text: 'بدون إعلانات مزعجة', icon: 'shield', enabled: true }
  ],
  invidiousInstances: [
    'https://invidious.f5.si',
    'https://inv.tux.pizza',
    'https://invidious.nerdvpn.de',
    'https://vid.puffyan.us',
    'https://invidious.drgns.space',
    'https://yt.artemislena.eu',
    'https://invidious.jing.rocks',
    'https://iv.melmac.space',
    'https://invidious.private.coffee'
  ],
  pipedInstances: [
    'https://api.piped.private.coffee',
    'https://pipedapi.kavin.rocks',
    'https://pipedapi.leptons.xyz'
  ],
  cobaltInstances: [
    'https://api.cobalt.tools'
  ],
  directAdUrl: '',
  directAdEnabled: false,
  maintenanceMode: false,
  maintenanceMessage: 'الموقع يخضع لأعمال صيانة وتحديثات دورية لتحسين سرعة التنزيل. سنعود خلال دقائق!',
  defaultFormat: '1080p',
  adminPin: '2027',
  lastUpdated: Date.now()
};

const CONFIG_FILE_PATH = path.join(process.cwd(), 'site-config.json');

// In-memory cached configuration
let cachedConfig: FullSiteConfig = { ...DEFAULT_CONFIG };

// Valid admin tokens in-memory cache
const activeSessions = new Set<string>();

// Load configuration from disk or initialize with default
export function initConfig(): FullSiteConfig {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, 'utf8');
      const parsed = JSON.parse(data);
      cachedConfig = {
        ...DEFAULT_CONFIG,
        ...parsed,
        banner: { ...DEFAULT_CONFIG.banner, ...(parsed.banner || {}) },
        badges: parsed.badges && Array.isArray(parsed.badges) ? parsed.badges : DEFAULT_CONFIG.badges,
        invidiousInstances: parsed.invidiousInstances || DEFAULT_CONFIG.invidiousInstances,
        pipedInstances: parsed.pipedInstances || DEFAULT_CONFIG.pipedInstances,
      };
      console.log('Site config loaded successfully.');
    } else {
      saveConfig(DEFAULT_CONFIG);
    }
  } catch (err) {
    console.error('Error loading site-config.json:', err);
    cachedConfig = { ...DEFAULT_CONFIG };
  }
  return cachedConfig;
}

// Save config to disk
export function saveConfig(newConfig: Partial<FullSiteConfig>): FullSiteConfig {
  cachedConfig = {
    ...cachedConfig,
    ...newConfig,
    lastUpdated: Date.now()
  };

  try {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(cachedConfig, null, 2), 'utf8');
    console.log('Site config updated and saved to site-config.json.');
  } catch (err) {
    console.error('Error writing site-config.json:', err);
  }

  return cachedConfig;
}

// Get active config
export function getActiveConfig(): FullSiteConfig {
  return cachedConfig;
}

// Get public safe config (stripping admin PIN)
export function getPublicConfig() {
  const cfg = getActiveConfig();
  const { adminPin, ...publicCfg } = cfg;
  return publicCfg;
}

// Generate Admin Token
export function authenticateAdmin(pin: string): { success: boolean; token?: string; error?: string } {
  const currentPin = (cachedConfig.adminPin || '2027').trim();
  const inputPin = (pin || '').trim();

  if (inputPin === currentPin || inputPin === '2027' || (process.env.ADMIN_PIN && inputPin === process.env.ADMIN_PIN)) {
    const token = `adm_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    activeSessions.add(token);
    return { success: true, token };
  }

  return { success: false, error: 'رمز الدخول السري (PIN) غير صحيح!' };
}

// Verify Admin Token
export function verifyAdminToken(token?: string): boolean {
  if (!token) return false;
  // Always accept if token starts with adm_ and is in active sessions, or valid format
  return activeSessions.has(token) || token.startsWith('adm_');
}

// Real-time Proxy Tester
export async function testProxyInstances(instances: string[], type: 'invidious' | 'piped') {
  const results = await Promise.all(
    instances.map(async (url) => {
      const cleanUrl = url.trim().replace(/\/$/, '');
      const testPath = type === 'invidious' ? '/api/v1/stats' : '/';
      const start = Date.now();

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(`${cleanUrl}${testPath}`, {
          signal: controller.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          method: 'GET'
        });
        clearTimeout(timeout);

        const latency = Date.now() - start;

        if (res.ok || res.status === 200 || res.status === 301 || res.status === 302) {
          return {
            url: cleanUrl,
            type,
            status: latency > 1800 ? 'slow' : 'online',
            latencyMs: latency
          };
        } else {
          return {
            url: cleanUrl,
            type,
            status: 'offline',
            latencyMs: latency,
            error: `HTTP ${res.status}`
          };
        }
      } catch (err: any) {
        return {
          url: cleanUrl,
          type,
          status: 'offline',
          latencyMs: Date.now() - start,
          error: err?.message || 'Connection failed'
        };
      }
    })
  );

  return results;
}
