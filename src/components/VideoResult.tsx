import React, { useState } from 'react';
import { VideoData, VideoFormat } from '../types';
import { 
  Download, 
  Play, 
  Eye, 
  Clock, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  Film, 
  Music, 
  Image as ImageIcon, 
  Monitor, 
  CheckCircle2, 
  Share2, 
  ArrowDownToLine,
  Zap,
  Info
} from 'lucide-react';
import { DownloadModal } from './DownloadModal';

interface VideoResultProps {
  data: VideoData;
  onOpenPreview: () => void;
}

export const VideoResult: React.FC<VideoResultProps> = ({ data, onOpenPreview }) => {
  const [activeTab, setActiveTab] = useState<'combined' | 'audio' | 'highdef' | 'thumbnail'>('combined');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [selectedModalFormat, setSelectedModalFormat] = useState<VideoFormat | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const triggerDownload = (format: VideoFormat) => {
    setSelectedModalFormat(format);
    setIsModalOpen(true);
  };

  return (
    <div id="video-result-container" className="w-full max-w-3xl mx-auto px-4 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Top Info Banner / Metadata Card */}
        <div className="p-5 md:p-6 border-b border-neutral-800/80 bg-neutral-950/40">
          <div className="flex flex-col md:flex-row gap-5 items-start">
            
            {/* Thumbnail Box */}
            <div className="relative group w-full md:w-64 aspect-video rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-md shrink-0">
              <img
                src={data.thumbnail || `/api/thumbnail?id=${data.id}`}
                alt={data.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget;
                  const proxyUrl = `/api/thumbnail?id=${data.id}`;
                  if (!target.src.includes('/api/thumbnail')) {
                    target.src = proxyUrl;
                  } else {
                    target.src = '/logo.png';
                  }
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              
              {/* Duration Badge */}
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-white text-xs font-mono font-medium flex items-center gap-1">
                <Clock className="w-3 h-3 text-red-400" />
                <span>{data.durationFormatted}</span>
              </div>

              {/* Play Preview Overlay Button */}
              <button
                type="button"
                id="preview-video-btn"
                onClick={onOpenPreview}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition duration-200"
                title="تشغيل معاينة الفيديو"
              >
                <div className="p-3 bg-red-600 hover:bg-red-500 text-white rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition">
                  <Play className="w-6 h-6 fill-current pl-0.5" />
                </div>
              </button>
            </div>

            {/* Video Details */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold rounded">
                    مرئي
                  </span>
                  {data.durationSeconds > 0 && (
                    <span className="text-xs text-neutral-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {data.durationFormatted}
                    </span>
                  )}
                  {data.viewsFormatted && (
                    <span className="text-xs text-neutral-400 flex items-center gap-1">
                      <Eye className="w-3 h-3 text-cyan-400" />
                      {data.viewsFormatted} مشاهدة
                    </span>
                  )}
                </div>

                <h2 className="text-lg md:text-xl font-bold text-white leading-snug line-clamp-2" title={data.title}>
                  {data.title}
                </h2>
              </div>

              {/* Channel Info & Actions */}
              <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center justify-between flex-wrap gap-3">
                <a
                  href={data.author.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:opacity-80 transition group"
                >
                  <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-bold ring-1 ring-neutral-700">
                    {data.author.avatar ? (
                      <img src={data.author.avatar} alt={data.author.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      data.author.name.charAt(0)
                    )}
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold text-neutral-200 group-hover:text-red-400 transition">
                      {data.author.name}
                    </div>
                    {data.author.subscribers && (
                      <div className="text-neutral-500 text-[10px]">{data.author.subscribers}</div>
                    )}
                  </div>
                </a>

                {/* Quick actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    id="preview-secondary-btn"
                    onClick={onOpenPreview}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition"
                  >
                    <Play className="w-3.5 h-3.5 text-red-500" />
                    <span>معاينة</span>
                  </button>

                  <button
                    type="button"
                    id="copy-video-link-btn"
                    onClick={() => handleCopy(data.videoUrl, 'original')}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition"
                  >
                    {copiedLink === 'original' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedLink === 'original' ? 'تم النسخ' : 'مشاركة'}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/20 px-4 overflow-x-auto no-scrollbar">
          <button
            type="button"
            id="tab-combined-btn"
            onClick={() => setActiveTab('combined')}
            className={`flex items-center gap-2 py-3 px-4 text-xs md:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'combined'
                ? 'border-red-500 text-red-400 bg-red-500/5'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>فيديو وصوت معاً (MP4 مباشر)</span>
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-red-500/20 text-red-400">
              {data.formats.length}
            </span>
          </button>

          <button
            type="button"
            id="tab-audio-btn"
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-2 py-3 px-4 text-xs md:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'audio'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>صوتيات فقط (MP3 / M4A)</span>
            {data.audioFormats && data.audioFormats.length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] rounded bg-cyan-500/20 text-cyan-400">
                {data.audioFormats.length}
              </span>
            )}
          </button>

          {data.highDefFormats && data.highDefFormats.length > 0 && (
            <button
              type="button"
              id="tab-highdef-btn"
              onClick={() => setActiveTab('highdef')}
              className={`flex items-center gap-2 py-3 px-4 text-xs md:text-sm font-bold border-b-2 transition whitespace-nowrap ${
                activeTab === 'highdef'
                  ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span>جودات فائقة (1080p / 4K)</span>
              <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-500/20 text-amber-400">
                {data.highDefFormats.length}
              </span>
            </button>
          )}

          <button
            type="button"
            id="tab-thumb-btn"
            onClick={() => setActiveTab('thumbnail')}
            className={`flex items-center gap-2 py-3 px-4 text-xs md:text-sm font-bold border-b-2 transition whitespace-nowrap ${
              activeTab === 'thumbnail'
                ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>صورة الغلاف (HD)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 md:p-6">
          
          {/* TAB 1: COMBINED VIDEO + AUDIO (The requested core feature) */}
          {activeTab === 'combined' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-400 px-1 mb-2">
                <span>الجودات الجاهزة للتحميل الفوري (فيديو + صوت بصيغة MP4):</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  متوافقة مع جميع الهواتف والأجهزة
                </span>
              </div>

              {data.formats.length === 0 ? (
                <div className="text-center py-8 text-neutral-400 text-sm">
                  لم يتم العثور على جودات MP4 مدمجة، يرجى فحص تبويب الجودات الفائقة أو الصوتيات.
                </div>
              ) : (
                data.formats.map((format, idx) => {
                  const isBest = idx === 0;
                  const sizeInMb = format.size ? (format.size.includes('MB') ? format.size : `${format.size} MB`) : 'حجم تقريبي';

                  return (
                    <div
                      key={format.itag}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border transition gap-3 ${
                        isBest
                          ? 'bg-neutral-800/80 border-cyan-500/40 shadow-sm shadow-cyan-500/5 ring-1 ring-cyan-500/20'
                          : 'bg-neutral-800/40 border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      {/* Quality & Meta */}
                      <div className="flex items-center gap-3">
                        <div className={`px-2.5 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 ${
                          isBest ? 'bg-cyan-500 text-black font-extrabold' : 'bg-neutral-700 text-neutral-200'
                        }`}>
                          {isBest && <Zap className="w-3 h-3 fill-current" />}
                          <span>{format.quality}</span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">فيديو MP4 عالي الوضوح</span>
                            {isBest && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                أعلى جودة مدمجة
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[11px]">
                              💾 الحجم: {sizeInMb}
                            </span>
                            <span>•</span>
                            <span>{format.fps} إطار/ثانية</span>
                          </div>
                        </div>
                      </div>

                      {/* Download Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          id={`download-format-${format.itag}`}
                          onClick={() => triggerDownload(format)}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00adb5] hover:bg-[#008c95] active:bg-[#00757d] text-white text-xs md:text-sm font-bold rounded-xl shadow-md transition duration-150 active:scale-95 cursor-pointer"
                        >
                          <ArrowDownToLine className="w-4 h-4" />
                          <span>تحميل مباشر ({format.quality} • {sizeInMb})</span>
                        </button>

                        {/* Copy Link Button */}
                        {format.directUrl && (
                          <button
                            type="button"
                            id={`copy-direct-url-${format.itag}`}
                            onClick={() => handleCopy(format.directUrl!, `direct-${format.itag}`)}
                            className="p-2.5 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-xl transition border border-neutral-700/50"
                            title="نسخ الرابط المباشر"
                          >
                            {copiedLink === `direct-${format.itag}` ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: AUDIO ONLY */}
          {activeTab === 'audio' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-400 px-1 mb-2">
                <span>تحميل المسار الصوتي فقط (مناسب للأناشيد، المحاضرات والبودكاست):</span>
                <span className="text-cyan-400 font-semibold">بصيغ MP3 / M4A عالية النقاوة</span>
              </div>

              {(!data.audioFormats || data.audioFormats.length === 0) ? (
                <div className="text-center py-8 text-neutral-400 text-sm">
                  لا توجد مسارات صوتية منفصلة متاحة لهذا المقطع.
                </div>
              ) : (
                data.audioFormats.map((audio) => {
                  const audioSizeMb = audio.size ? (audio.size.includes('MB') ? audio.size : `${audio.size} MB`) : 'حجم تقريبي';

                  return (
                    <div
                      key={audio.itag}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-neutral-800/40 border border-neutral-800 hover:border-neutral-700 transition gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                          <Music className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">
                            ملف صوتي نقاوة {audio.bitrate || '128'} kbps ({audio.ext.toUpperCase()})
                          </div>
                          <div className="text-xs text-neutral-400 mt-0.5 flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 text-[11px]">
                              💾 الحجم: {audioSizeMb}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        id={`download-audio-${audio.itag}`}
                        onClick={() => triggerDownload(audio)}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white text-xs md:text-sm font-bold rounded-xl shadow-md transition duration-150 active:scale-95 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>تحميل الصوت ({audioSizeMb}) 🎵</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: HIGH DEF VIDEO STREAMS */}
          {activeTab === 'highdef' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2 mb-3">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span>
                  ملاحظة: الجودات العالية جداً (1080p, 2K, 4K) تبثها السيرفرات الأصلية كمسار فيديو منفصل بدون صوت. يمكنك تحميلها مباشرة أدناه.
                </span>
              </div>

              {data.highDefFormats?.map((video) => {
                const videoSizeMb = video.size ? (video.size.includes('MB') ? video.size : `${video.size} MB`) : 'حجم تقريبي';

                return (
                  <div
                    key={video.itag}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-neutral-800/40 border border-neutral-800 hover:border-neutral-700 transition gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-extrabold">
                        {video.quality}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">
                          بث فيديو فائق الدقة ({video.container?.toUpperCase()})
                        </div>
                        <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5 flex-wrap">
                          <span className="inline-flex items-center gap-1 font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px]">
                            💾 الحجم: {videoSizeMb}
                          </span>
                          <span>•</span>
                          <span>{video.fps} FPS</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      id={`download-highdef-${video.itag}`}
                      onClick={() => triggerDownload(video)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition active:scale-95 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تحميل ({video.quality} • {videoSizeMb})</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: THUMBNAIL HD */}
          {activeTab === 'thumbnail' && (
            <div className="text-center py-4">
              <div className="max-w-md mx-auto rounded-xl overflow-hidden border border-neutral-800 shadow-lg mb-4">
                <img
                  src={data.thumbnail}
                  alt={data.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto"
                />
              </div>

              <div className="flex items-center justify-center gap-3">
                <a
                  href={data.thumbnail}
                  target="_blank"
                  rel="noopener noreferrer"
                  download="thumbnail.jpg"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs md:text-sm font-bold rounded-xl shadow-md transition active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل صورة الغلاف بأعلى دقة (HD)</span>
                </a>

                <button
                  type="button"
                  id="copy-thumb-url-btn"
                  onClick={() => handleCopy(data.thumbnail, 'thumb')}
                  className="p-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl transition border border-neutral-700"
                  title="نسخ رابط الصورة"
                >
                  {copiedLink === 'thumb' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Card Footer notice */}
        <div className="px-6 py-3.5 bg-neutral-950/60 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>التحميل يبدأ فوراً إلى مجلد التنزيلات (Downloads) بجهازك.</span>
          </div>
          <div className="text-neutral-400">
            سيرفر مخصص لتجاوز الحظر والقيود
          </div>
        </div>

      </div>

      {/* Download Modal Manager */}
      <DownloadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        videoData={data}
        format={selectedModalFormat}
      />
    </div>
  );
};
