import React, { useState } from 'react';
import { 
  SearchResultItem 
} from '../types';
import { 
  Play, 
  Download, 
  Eye, 
  Clock, 
  Sparkles, 
  Filter, 
  Share2, 
  Check, 
  Flame, 
  Film, 
  Radio, 
  Layers, 
  ExternalLink 
} from 'lucide-react';

interface SearchResultsProps {
  query: string;
  results: SearchResultItem[];
  onSelectVideo: (videoId: string, videoUrl: string) => void;
  isLoadingVideo: boolean;
  selectedVideoId?: string;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  results,
  onSelectVideo,
  isLoadingVideo,
  selectedVideoId,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'shorts' | 'long'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (e: React.MouseEvent, item: SearchResultItem) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(item.videoUrl || `https://www.youtube.com/watch?v=${item.id}`);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredResults = results.filter((item) => {
    if (activeFilter === 'shorts') return item.isShort;
    if (activeFilter === 'long') {
      const parts = item.duration.split(':');
      if (parts.length >= 3) return true; // HH:MM:SS
      if (parts.length === 2 && parseInt(parts[0], 10) >= 10) return true;
      return false;
    }
    return true;
  });

  return (
    <section className="w-full max-w-6xl mx-auto px-4 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* Header bar with total results and filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 mb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl md:text-2xl font-black text-white">
              نتائج البحث عن: <span className="text-amber-400 font-extrabold">"{query}"</span>
            </h2>
          </div>
          <p className="text-xs md:text-sm text-neutral-400 mt-1">
            تم العثور على <span className="text-white font-bold">{results.length}</span> نتيجة بحث. اضغط على أي فيديو للاستخراج والتحميل فوراً.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1.5 bg-neutral-900/90 p-1.5 rounded-2xl border border-neutral-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition ${
              activeFilter === 'all'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>الكل ({results.length})</span>
          </button>
          
          <button
            type="button"
            onClick={() => setActiveFilter('shorts')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition ${
              activeFilter === 'shorts'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>شورتس Shorts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFilter('long')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl transition ${
              activeFilter === 'long'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>فيديوهات طويلة (+10 دقائق)</span>
          </button>
        </div>
      </div>

      {/* Grid of YouTube Video Results */}
      {filteredResults.length === 0 ? (
        <div className="text-center py-12 bg-neutral-900/40 rounded-3xl border border-neutral-800/60 p-8">
          <p className="text-neutral-400 text-base">لا توجد نتائج تطابق هذا الفلتر حالياً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResults.map((item) => {
            const isCurrentSelected = selectedVideoId === item.id && isLoadingVideo;

            return (
              <div
                key={item.id}
                id={`search-card-${item.id}`}
                onClick={() => onSelectVideo(item.id, item.videoUrl)}
                className={`group relative flex flex-col bg-neutral-900/80 hover:bg-neutral-900 border rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-red-950/20 hover:-translate-y-1 ${
                  selectedVideoId === item.id 
                    ? 'border-amber-500 ring-2 ring-amber-500/30' 
                    : 'border-neutral-800 hover:border-neutral-700'
                }`}
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video w-full bg-neutral-950 overflow-hidden">
                  <img
                    src={item.thumbnail || `/api/thumbnail?id=${item.id}`}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const proxyUrl = `/api/thumbnail?id=${item.id}`;
                      if (!target.src.includes('/api/thumbnail')) {
                        target.src = proxyUrl;
                      } else {
                        target.src = '/logo.png';
                      }
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    loading="lazy"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-40 transition" />

                  {/* Duration Badge */}
                  {item.duration && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[11px] font-bold text-white border border-white/10 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-300" />
                      <span>{item.duration}</span>
                    </div>
                  )}

                  {/* Shorts Badge if short */}
                  {item.isShort && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-red-600 text-[10px] font-extrabold text-white shadow-md">
                      SHORTS
                    </div>
                  )}

                  {/* Quick Play Hover Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                    <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition">
                      {isCurrentSelected ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5 text-white" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Content Details */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    {/* Title */}
                    <h3 
                      className="font-bold text-sm md:text-base text-neutral-100 group-hover:text-amber-400 line-clamp-2 transition leading-snug mb-2.5"
                      title={item.title}
                    >
                      {item.title}
                    </h3>

                    {/* Channel & Meta */}
                    <div className="flex items-center gap-2 mb-2">
                      {item.author.avatar ? (
                        <img 
                          src={item.author.avatar} 
                          alt={item.author.name}
                          className="w-6 h-6 rounded-full object-cover border border-neutral-700 shrink-0"
                          referrerPolicy="no-referrer"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-300 shrink-0">
                          {item.author.name?.charAt(0) || 'ق'}
                        </div>
                      )}
                      <span className="text-xs text-neutral-300 font-medium truncate">
                        {item.author.name}
                      </span>
                    </div>

                    {/* Stats (Views & Time) */}
                    <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-medium">
                      {item.views && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-neutral-500" />
                          <span>{item.views}</span>
                        </span>
                      )}
                      {item.publishedTime && (
                        <span>• {item.publishedTime}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      id={`extract-card-btn-${item.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectVideo(item.id, item.videoUrl);
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-red-600/20 active:scale-95"
                    >
                      {isCurrentSelected ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>جاري الفك...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>تحميل واستخراج ✨</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      id={`copy-card-link-${item.id}`}
                      onClick={(e) => handleCopyLink(e, item)}
                      className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-xl transition border border-neutral-700/60 shrink-0"
                      title="نسخ رابط الفيديو"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </section>
  );
};
