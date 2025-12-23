import React, { memo } from 'react';
import { Document, Tag } from '@shared/types';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '../icons';
import { formatRelativeTime, getCategoryName } from '../../lib/utils/format';

interface DocumentGridItemProps {
  doc: Document;
  onClick: () => void;
  onRequireLogin: () => void;
  isGuest: boolean;
  tagById?: Map<string, Tag>;
}

export const DocumentGridItem: React.FC<DocumentGridItemProps> = memo(({ 
  doc, 
  onClick, 
  onRequireLogin, 
  isGuest,
  tagById 
}) => {
  const { t, lang } = useI18n();

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.origin + `/doc/${doc.id}`);
    // Optional: show a toast or simple feedback
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    // If we want to force login on download click even if preview is allowed
    if (isGuest) {
      onRequireLogin();
    } else {
      onClick(); // Or specific download logic
    }
  };

  return (
    <div
      onClick={onClick}
      className="group flex flex-col transition-all duration-500 cursor-pointer"
    >
      {/* 🔥 High-End Document Preview (Technical Drawing / Blueprint Style) */}
      <div className="relative aspect-[3/4] rounded-[1rem] overflow-hidden bg-slate-900 mb-5 flex flex-col p-8 border border-white/5 group-hover:border-blue-500/40 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-500 shadow-2xl shadow-black/40">
         
         {/* Technical Grid Background */}
         <div className="absolute inset-0 opacity-[0.04] pointer-events-none" 
              style={{ 
                backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 0)', 
                backgroundSize: '24px 24px' 
              }} />

         {/* Technical Border Marks */}
         <div className="absolute top-0 left-0 p-4 opacity-20"><div className="border-t border-l border-white w-4 h-4" /></div>
         <div className="absolute top-0 right-0 p-4 opacity-20"><div className="border-t border-r border-white w-4 h-4" /></div>
         <div className="absolute bottom-0 left-0 p-4 opacity-20"><div className="border-b border-l border-white w-4 h-4" /></div>
         <div className="absolute bottom-0 right-0 p-4 opacity-20"><div className="border-b border-r border-white w-4 h-4" /></div>

         {/* Header Info */}
         <div className="flex justify-between items-start mb-10 relative z-10">
            <div className="flex flex-col">
                <span className="text-[14px] font-black text-white/90 leading-none mb-1">CE</span>
                <span className="text-[7px] font-bold text-white/30 uppercase tracking-[0.2em]">Standard</span>
            </div>
            <div className="flex items-center gap-2.5 bg-white/5 py-1.5 px-3 rounded-md backdrop-blur-md border border-white/5">
                <div className="w-2 h-2 bg-red-600 rounded-[1px] shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
                <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">ACME CORP</span>
            </div>
         </div>

         {/* Preview Content */}
         <h4 className="text-[16px] font-extrabold text-white leading-[1.3] mb-8 line-clamp-3 relative z-10 group-hover:text-blue-400 transition-colors duration-500">
            {doc.titleKey ? t(doc.titleKey) : doc.title}
         </h4>

         {/* Technical Schematic Skeleton */}
         <div className="space-y-3 opacity-[0.08] relative z-10 flex-grow">
            <div className="h-1 bg-white rounded-full w-full" />
            <div className="h-1 bg-white rounded-full w-[95%]" />
            <div className="h-1 bg-white rounded-full w-full opacity-60" />
            
            {/* Schematic "Table" or "Diagram" area */}
            <div className="mt-10 grid grid-cols-12 gap-2 h-32">
                <div className="col-span-4 border border-white/40 rounded-sm" />
                <div className="col-span-8 flex flex-col gap-2">
                    <div className="h-full border border-white/40 rounded-sm p-2 flex flex-col gap-1.5">
                        <div className="h-1 bg-white w-full opacity-40" />
                        <div className="h-1 bg-white w-2/3 opacity-40" />
                        <div className="h-1 bg-white w-full opacity-40" />
                    </div>
                </div>
            </div>
         </div>

         {/* Modern PDF Badge */}
         <div className="absolute top-0 right-0 p-5 z-20 pointer-events-none translate-x-1 -translate-y-1">
             <div className="bg-gradient-to-br from-red-500 to-red-700 text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-xl border border-red-400/20 transform rotate-6">
                PDF
             </div>
         </div>

         {/* Elegant Lock for Guests */}
         {isGuest && (
            <div className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-xl border border-white/20 shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-500">
                    <Icon name="lock-closed" className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
            </div>
         )}
      </div>

      {/* 🔥 Footer Area (Clean & Modern) */}
      <div className="px-1 group-hover:translate-x-1 transition-transform duration-500">
          <h3 className="font-bold text-[15px] text-gray-900 dark:text-gray-100 leading-snug mb-4 line-clamp-1">
            {doc.titleKey ? t(doc.titleKey) : doc.title}
          </h3>

          <div className="flex items-center gap-6">
             <button 
                onClick={handleDownload}
                className="flex items-center gap-2.5 text-[11px] font-black uppercase tracking-[0.15em] text-gray-400 hover:text-blue-500 transition-all active:scale-95"
             >
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover/btn:bg-blue-600 transition-colors">
                    <Icon name="download" className="w-4 h-4" />
                </div>
                {t('common.download')}
             </button>

             <button 
                onClick={handleShare}
                className="flex items-center gap-2.5 text-[11px] font-black uppercase tracking-[0.15em] text-gray-400 hover:text-blue-500 transition-all active:scale-95"
             >
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover/btn:bg-blue-600 transition-colors">
                    <Icon name="external-link" className="w-4 h-4" />
                </div>
                {t('common.share')}
             </button>
          </div>
      </div>
    </div>
  );
});

export const DocumentListItem: React.FC<{
  doc: Document;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showAdminControls?: boolean;
}> = memo(({ doc, onClick, onEdit, onDelete, showAdminControls }) => {
  const { t, lang } = useI18n();

  return (
    <div 
        onClick={onClick}
        className="group flex items-center gap-6 bg-white dark:bg-slate-900/40 p-6 rounded-[1.5rem] border border-gray-100 dark:border-white/5 hover:shadow-2xl hover:shadow-blue-500/5 hover:border-blue-500/20 transition-all duration-300 cursor-pointer"
    >
      {/* Technical Icon */}
      <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/[0.03] flex items-center justify-center text-blue-500 border border-gray-100 dark:border-white/5 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all duration-300 shadow-sm">
         <Icon name="document-text" className="w-7 h-7" />
      </div>

      <div className="flex-grow min-w-0">
        <h3 className="font-bold text-[17px] text-gray-900 dark:text-gray-100 mb-2 truncate transition-colors">
          {doc.titleKey ? t(doc.titleKey) : doc.title}
        </h3>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-100 dark:border-blue-800/50 shadow-sm">
            {doc.categoryKey ? getCategoryName(doc.categoryKey, t) : '---'}
          </span>
          <div className="flex items-center gap-2 text-gray-400">
             <Icon name="clock" className="w-3.5 h-3.5 opacity-50" />
             <span className="text-[11px] font-bold uppercase tracking-tighter tabular-nums opacity-60">
                {formatRelativeTime(doc.updatedAt, lang)}
             </span>
          </div>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-4">
        {showAdminControls && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
              className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
            >
              <Icon name="pencil" className="w-4.5 h-4.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
            >
              <Icon name="trash" className="w-4.5 h-4.5" />
            </button>
          </div>
        )}
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-gray-300 group-hover:text-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-all duration-300">
             <Icon name="chevron-right" className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
});
