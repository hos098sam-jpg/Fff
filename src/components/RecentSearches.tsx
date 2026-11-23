import React from 'react';
import { ExtractionHistoryItem } from '../types';
import { History, Trash2, Clock, Play, ArrowUpRight } from 'lucide-react';

interface RecentSearchesProps {
  history: ExtractionHistoryItem[];
  onSelect: (url: string) => void;
  onClear: () => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({ history, onSelect, onClear }) => {
  if (!history || history.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 mt-8">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2 text-sm font-bold text-neutral-300">
          <History className="w-4 h-4 text-red-400" />
          <span>سجل التعويذات السابقة (الفيديوهات الأخيرة)</span>
        </div>
        <button
          type="button"
          id="clear-history-btn"
          onClick={onClear}
          className="text-xs text-neutral-500 hover:text-red-400 flex items-center gap-1 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>مسح السجل</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {history.slice(0, 6).map((item) => (
          <div
            key={item.id + item.timestamp}
            onClick={() => onSelect(item.url)}
            className="group cursor-pointer bg-neutral-900/60 hover:bg-neutral-800/80 border border-neutral-800 hover:border-red-500/40 rounded-xl p-2.5 transition flex gap-3 items-center"
          >
            <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-neutral-950 shrink-0">
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
                className="w-full h-full object-cover group-hover:scale-105 transition"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Play className="w-4 h-4 text-white fill-current" />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-neutral-200 group-hover:text-white truncate" title={item.title}>
                {item.title}
              </h4>
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-1">
                <span>{item.author}</span>
                {item.duration && <span>• {item.duration}</span>}
              </div>
            </div>

            <ArrowUpRight className="w-4 h-4 text-neutral-600 group-hover:text-red-400 shrink-0 transition" />
          </div>
        ))}
      </div>
    </div>
  );
};
