import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Tablet,
  Laptop,
  UploadCloud,
  Download,
  Trash2,
  RefreshCw,
  Eye,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  HardDrive,
  Wifi,
  Sun,
  ShieldCheck,
  FolderSync,
  Play,
  X,
  FileCheck,
  Sparkles,
  ExternalLink,
  Music
} from 'lucide-react';
import { VaultMediaItem, DevicePresence } from '../types';

interface DeviceVaultPanelProps {
  token: string;
}

export const DeviceVaultPanel: React.FC<DeviceVaultPanelProps> = ({ token }) => {
  // Device identity
  const [deviceName, setDeviceName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('youtube_spell_device_name');
      if (saved) return saved;
      const ua = navigator.userAgent.toLowerCase();
      if (/tablet|ipad/.test(ua) || (navigator.maxTouchPoints > 1 && window.innerWidth >= 768)) {
        return 'تابلت المدرسة';
      } else if (/mobile|android|iphone/.test(ua)) {
        return 'هاتف البيت';
      }
      return 'كمبيوتر شخصي';
    } catch {
      return 'جهازي';
    }
  });

  const [deviceType, setDeviceType] = useState<'phone' | 'tablet' | 'desktop'>(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/tablet|ipad/.test(ua)) return 'tablet';
    if (/mobile|android|iphone/.test(ua)) return 'phone';
    return 'desktop';
  });

  const [activeDevices, setActiveDevices] = useState<DevicePresence[]>([]);
  const [items, setItems] = useState<VaultMediaItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'audio'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Uploading / Broadcasting State
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number; filename: string }>({
    current: 0,
    total: 0,
    filename: ''
  });
  const [broadcastActive, setBroadcastActive] = useState<boolean>(true);
  const [wakeLockActive, setWakeLockActive] = useState<boolean>(false);

  // Preview Lightbox
  const [previewItem, setPreviewItem] = useState<VaultMediaItem | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const wakeLockRef = useRef<any>(null);

  // Save device name
  const handleSaveDeviceName = (name: string) => {
    setDeviceName(name);
    try {
      localStorage.setItem('youtube_spell_device_name', name);
    } catch {}
  };

  // Screen WakeLock to keep home phone awake
  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        const wl = await (navigator as any).wakeLock.request('screen');
        wakeLockRef.current = wl;
        setWakeLockActive(true);
        wl.addEventListener('release', () => {
          setWakeLockActive(false);
        });
      }
    } catch (err) {
      console.log('WakeLock not supported or denied:', err);
    }
  };

  // Release WakeLock
  const releaseWakeLock = () => {
    try {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
        setWakeLockActive(false);
      }
    } catch {}
  };

  // Fetch Vault Items
  const loadVaultItems = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/vault/files', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error('Failed to load vault items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Ping Heartbeat
  const pingPresence = async () => {
    try {
      const res = await fetch('/api/admin/vault/presence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: `dev_${deviceName.replace(/\s+/g, '_')}`,
          deviceName,
          deviceType,
          isBroadcasting: broadcastActive,
          filesCount: items.length
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.activeDevices) {
          setActiveDevices(data.activeDevices);
        }
      }
    } catch {}
  };

  useEffect(() => {
    loadVaultItems();
    pingPresence();

    const timer = setInterval(() => {
      pingPresence();
    }, 15000);

    return () => {
      clearInterval(timer);
      releaseWakeLock();
    };
  }, [token, deviceName, broadcastActive, items.length]);

  // Handle Local Files Selected for Sync (From Home Phone or Tablet)
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsSyncing(true);
    const total = files.length;
    let current = 0;

    for (let i = 0; i < total; i++) {
      const file = files[i];
      current = i + 1;
      setSyncProgress({
        current,
        total,
        filename: file.name
      });

      try {
        const base64Data = await readFileAsBase64(file);
        await fetch('/api/admin/vault/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            fileName: file.name,
            mimeType: file.type,
            fileBase64: base64Data,
            deviceName
          })
        });
      } catch (err) {
        console.error(`Error uploading ${file.name}:`, err);
      }
    }

    setIsSyncing(false);
    setSyncProgress({ current: 0, total: 0, filename: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
    loadVaultItems();
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // Delete Single File
  const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('هل تريد بالتأكيد حذف هذا الملف من الخزينة السحابية؟')) return;

    try {
      const res = await fetch(`/api/admin/vault/files/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }
    } catch (err) {
      alert('فشل حذف الملف');
    }
  };

  // Clear All Files
  const handleClearAll = async () => {
    if (!confirm('هل تريد مسح جميع الصور والفيديوهات الموجودة في الخزينة؟')) return;
    try {
      const res = await fetch('/api/admin/vault/clear', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setItems([]);
      }
    } catch (err) {
      alert('فشل مسح الخزينة');
    }
  };

  // Format File Size
  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Filter Items
  const filteredItems = items.filter((item) => {
    if (filterType === 'image' && item.mediaType !== 'image') return false;
    if (filterType === 'video' && item.mediaType !== 'video') return false;
    if (filterType === 'audio' && item.mediaType !== 'audio') return false;
    if (searchQuery.trim() && !item.fileName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 text-neutral-100 font-sans" dir="rtl">
      {/* Top Banner Guide */}
      <div className="bg-gradient-to-r from-amber-500/10 via-neutral-900 to-red-500/10 border border-amber-500/30 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-neutral-950 font-black shadow-lg shadow-amber-500/20 shrink-0">
              <FolderSync className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>محطة مزامنة واستعراض الأجهزة (Device Bridge)</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  بث مباشر وربط سحابي
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                اربط هاتف البيت مع تابلت المدرسة: أي تنزيل على الموقع أو صور وفيديوهات تحددها على هاتف البيت ستجدها جاهزة للتنزيل والاستعراض في مدرستك فوراً!
              </p>
            </div>
          </div>

          {/* Quick Refresh Button */}
          <button
            type="button"
            onClick={() => { loadVaultItems(); pingPresence(); }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition border border-neutral-700 cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>تحديث المعرض</span>
          </button>
        </div>

        {/* Live Active Connected Devices Bar */}
        <div className="mt-5 pt-4 border-t border-neutral-800/80 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-neutral-400 flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>الأجهزة المتصلة الآن:</span>
          </span>

          {activeDevices.length > 0 ? (
            activeDevices.map((dev) => (
              <div
                key={dev.id}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-800/90 border border-neutral-700 text-xs font-bold text-neutral-200 shadow-sm"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {dev.deviceType === 'phone' ? <Smartphone className="w-3.5 h-3.5 text-amber-400" /> : <Tablet className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{dev.deviceName}</span>
                <span className="text-[10px] text-emerald-400 font-mono">🟢 متصل</span>
              </div>
            ))
          ) : (
            <span className="text-xs text-neutral-500">جاري فحص الأجهزة المتصلة...</span>
          )}
        </div>
      </div>

      {/* Control Actions & Device Mode Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left / Top: Current Device Settings & Home Broadcaster */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>إعدادات هذا الجهاز</span>
            </h3>
            <span className="text-[11px] font-bold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              {deviceName}
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-400 mb-1">اسم هذا الجهاز للتمييز:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={deviceName}
                onChange={(e) => handleSaveDeviceName(e.target.value)}
                placeholder="مثال: هاتف البيت / تابلت المدرسة"
                className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              <button
                type="button"
                onClick={() => handleSaveDeviceName('هاتف البيت (Home Phone)')}
                className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-[10px] text-neutral-300 transition cursor-pointer"
              >
                هاتف البيت 📱
              </button>
              <button
                type="button"
                onClick={() => handleSaveDeviceName('تابلت المدرسة (School Tablet)')}
                className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-[10px] text-neutral-300 transition cursor-pointer"
              >
                تابلت المدرسة 💻
              </button>
            </div>
          </div>

          {/* Screen Wake Lock Option (For Home Phone) */}
          <div className="p-3 bg-neutral-950/80 rounded-2xl border border-neutral-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className={`w-4 h-4 ${wakeLockActive ? 'text-yellow-400 animate-spin-slow' : 'text-neutral-500'}`} />
                <span className="text-xs font-bold text-neutral-200">إبقاء شاشة هاتف البيت يقظة:</span>
              </div>
              <button
                type="button"
                onClick={wakeLockActive ? releaseWakeLock : requestWakeLock}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  wakeLockActive
                    ? 'bg-yellow-500 text-neutral-950 shadow-md shadow-yellow-500/20'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                {wakeLockActive ? 'مفعّل ☀️' : 'تفعيل'}
              </button>
            </div>
            <p className="text-[10px] text-neutral-500 leading-tight">
              عند ترك الهاتف في البيت، اضغط تفعيل ليظل المتصفح نشطاً ولا تنطفئ الشاشة.
            </p>
          </div>

          {/* Upload Button for Home Phone */}
          <div className="pt-2">
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*,video/*,audio/*"
              onChange={handleFilesSelected}
              className="hidden"
            />

            <button
              type="button"
              disabled={isSyncing}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-neutral-950 font-black text-xs shadow-lg shadow-amber-500/20 active:scale-98 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري المزامنة ({syncProgress.current}/{syncProgress.total})...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>📁 اختيار صور وفيديوهات للمزامنة من هذا الجهاز</span>
                </>
              )}
            </button>

            {isSyncing && (
              <div className="mt-2 text-center">
                <span className="text-[10px] text-amber-300 font-mono block truncate">
                  {syncProgress.filename}
                </span>
                <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full transition-all duration-300"
                    style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right / Middle: Storage Stats & Quick Filters */}
        <div className="lg:col-span-2 bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-extrabold text-white">الوسائط المحفوظة في الخزينة ({items.length})</h3>
              </div>

              {items.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="flex items-center gap-1 text-[11px] font-bold text-red-400 hover:text-red-300 px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 rounded-xl border border-red-500/20 transition cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>تفريغ الخزينة</span>
                </button>
              )}
            </div>

            {/* Filter Pills & Search */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center gap-1.5 w-full sm:w-auto flex-wrap">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    filterType === 'all'
                      ? 'bg-amber-500 text-neutral-950'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  الكل ({items.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('image')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    filterType === 'image'
                      ? 'bg-amber-500 text-neutral-950'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>صور ({items.filter(i => i.mediaType === 'image').length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('video')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    filterType === 'video'
                      ? 'bg-amber-500 text-neutral-950'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>فيديوهات ({items.filter(i => i.mediaType === 'video').length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('audio')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    filterType === 'audio'
                      ? 'bg-amber-500 text-neutral-950'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }`}
                >
                  <Music className="w-3.5 h-3.5 text-cyan-400" />
                  <span>صوتيات ({items.filter(i => i.mediaType === 'audio').length})</span>
                </button>
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث باسم الملف..."
                className="w-full sm:flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Quick Instructions for School Usage */}
          <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-[11px] text-amber-200/90 flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>طريقة الاستخدام من المدرسة:</strong> أي تنزيلات أو صور ترفعها من هاتفك في البيت ستجدها فوراً في هذا المعرض على تابلت المدرسة لتقوم بتحميلها بنقرة واحدة!
            </span>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Eye className="w-4 h-4 text-amber-400" />
          <span>استعراض وسائط هاتف البيت والأجهزة ({filteredItems.length})</span>
        </h3>

        {isLoading ? (
          <div className="p-12 text-center bg-neutral-900/60 rounded-3xl border border-neutral-800 space-y-3">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            <p className="text-xs text-neutral-400 font-bold">جاري تحميل واستعراض الملفات...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-neutral-900/40 rounded-3xl border border-neutral-800/80 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-neutral-800 text-neutral-500 flex items-center justify-center mx-auto">
              <HardDrive className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-bold text-neutral-300">لا توجد صور أو فيديوهات محفوظة حالياً</h4>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              عند تحميل أي فيديو أو الضغط على «📁 اختيار صور وفيديوهات للمزامنة»، ستظهر جميع ملفاتك هنا فوراً.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setPreviewItem(item)}
                className="group relative bg-neutral-900 border border-neutral-800 hover:border-amber-400/50 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 flex flex-col cursor-pointer"
              >
                {/* Media Preview Box */}
                <div className="relative aspect-square w-full bg-neutral-950 overflow-hidden flex items-center justify-center">
                  {item.mediaType === 'image' ? (
                    <img
                      src={item.url}
                      alt={item.fileName}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : item.mediaType === 'video' ? (
                    <div className="relative w-full h-full flex items-center justify-center bg-neutral-950">
                      {item.thumbnailUrl ? (
                        <img src={item.thumbnailUrl} alt={item.fileName} className="w-full h-full object-cover opacity-80" />
                      ) : (
                        <video
                          src={item.url}
                          className="w-full h-full object-cover opacity-80"
                          muted
                          preload="metadata"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition">
                        <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white flex items-center gap-1">
                        <Film className="w-3 h-3 text-red-400" /> فيديو
                      </span>
                    </div>
                  ) : item.mediaType === 'audio' ? (
                    <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-cyan-950/40 to-neutral-950 p-3 text-center">
                      {item.thumbnailUrl && (
                        <img src={item.thumbnailUrl} alt={item.fileName} className="absolute inset-0 w-full h-full object-cover opacity-30 blur-xs" />
                      )}
                      <div className="relative z-10 w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-lg mb-1">
                        <Music className="w-6 h-6 animate-pulse" />
                      </div>
                      <span className="relative z-10 text-[10px] font-bold text-cyan-200">صوت MP3</span>
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <FileCheck className="w-8 h-8 text-neutral-500 mx-auto mb-1" />
                      <span className="text-[10px] text-neutral-400 font-mono">{item.mimeType}</span>
                    </div>
                  )}

                  {/* Device Source Badge */}
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-sm border border-neutral-700/60 text-[9px] font-bold text-amber-300 flex items-center gap-1">
                    <Smartphone className="w-2.5 h-2.5" />
                    <span className="truncate max-w-[80px]">{item.deviceName || 'هاتف البيت'}</span>
                  </span>
                </div>

                {/* Info Bar */}
                <div className="p-2.5 flex-1 flex flex-col justify-between space-y-1.5">
                  <div>
                    <h5 className="text-xs font-bold text-neutral-200 truncate" title={item.fileName}>
                      {item.fileName}
                    </h5>
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono mt-0.5">
                      <span>{item.fileSize ? formatSize(item.fileSize) : 'تحميل مباشر'}</span>
                      <span>{new Date(item.uploadedAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 pt-1 border-t border-neutral-800">
                    <a
                      href={`${item.url}${item.url.includes('?') ? '&' : '?'}download=1`}
                      download={item.fileName}
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black flex items-center justify-center gap-1 shadow-sm transition"
                    >
                      <Download className="w-3 h-3" />
                      <span>تحميل</span>
                    </a>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteItem(item.id, e)}
                      title="حذف من الخزينة"
                      className="p-1.5 bg-neutral-800 hover:bg-red-500/20 hover:text-red-400 text-neutral-400 rounded-xl transition cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Preview Modal */}
      {previewItem && (
        <div
          onClick={() => setPreviewItem(null)}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                {previewItem.mediaType === 'video' ? (
                  <Film className="w-5 h-5 text-red-500 shrink-0" />
                ) : previewItem.mediaType === 'audio' ? (
                  <Music className="w-5 h-5 text-cyan-400 shrink-0" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-amber-400 shrink-0" />
                )}
                <div className="truncate">
                  <h4 className="text-sm font-bold text-white truncate">{previewItem.fileName}</h4>
                  <span className="text-[10px] text-neutral-400">
                    من جهاز: {previewItem.deviceName || 'هاتف البيت'} • {previewItem.fileSize ? formatSize(previewItem.fileSize) : 'ملف سحابي'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`${previewItem.url}${previewItem.url.includes('?') ? '&' : '?'}download=1`}
                  download={previewItem.fileName}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تنزيل بجودة كاملة</span>
                </a>

                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Media Content */}
            <div className="flex-1 bg-black flex items-center justify-center p-4 overflow-auto max-h-[70vh]">
              {previewItem.mediaType === 'image' ? (
                <img
                  src={previewItem.url}
                  alt={previewItem.fileName}
                  className="max-h-[65vh] w-auto object-contain rounded-xl shadow-2xl"
                />
              ) : previewItem.mediaType === 'video' ? (
                <video
                  src={previewItem.url}
                  controls
                  autoPlay
                  className="max-h-[65vh] w-full rounded-xl shadow-2xl"
                />
              ) : previewItem.mediaType === 'audio' ? (
                <div className="py-10 px-6 text-center w-full max-w-md bg-neutral-900/80 rounded-3xl border border-neutral-800 shadow-2xl space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-lg">
                    <Music className="w-8 h-8 animate-bounce" />
                  </div>
                  <h4 className="text-sm font-bold text-white truncate">{previewItem.fileName}</h4>
                  <audio
                    src={previewItem.url}
                    controls
                    autoPlay
                    className="w-full rounded-xl shadow-md"
                  />
                </div>
              ) : (
                <div className="p-8 text-center text-neutral-400">
                  <p>لا يمكن معاينة هذا الملف مباشرة، يمكنك تنزيله.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
