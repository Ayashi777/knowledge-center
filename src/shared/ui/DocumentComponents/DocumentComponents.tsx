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
    if (navigator.share) {
        navigator.share({
            title: doc.title || t(doc.titleKey || ''),
            url: window.location.origin + `/doc/${doc.id}`
        }).catch(() => {});
    } else {
        navigator.clipboard.writeText(window.location.origin + `/doc/${doc.id}`);
        alert(t('common.linkCopied') || 'Посилання скопійовано!');
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGuest) {
      onRequireLogin();
    } else {
      onClick(); 
    }
  };

  return (
    <div
      onClick={onClick}
      className="group flex flex-col bg-white dark:bg-slate-900/40 rounded-[1.5rem] border border-slate-200 dark:border-white/5 hover:border-blue-500/40 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.15)] transition-all duration-500 cursor-pointer overflow-hidden shadow-sm"
    >
      {/* Visual Preview Section */}
      <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-950 overflow-hidden">
         {/* Technical Drawing Background */}
         <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08]" 
              style={{ 
                backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 0)', 
                backgroundSize: '20px 20px',
                color: 'inherit'
              }} />
         
         <div className="absolute inset-6 border border-dashed border-slate-300 dark:border-white/10 rounded-lg flex flex-col p-4">
            <div className="flex justify-between opacity-40 mb-4">
                <div className="w-8 h-2 bg-current rounded-full" />
                <div className="w-4 h-4 border border-current rounded-sm" />
            </div>
            <div className="space-y-2 opacity-20">
                <div className="h-1 bg-current rounded-full w-full" />
                <div className="h-1 bg-current rounded-full w-[90%]" />
                <div className="h-1 bg-current rounded-full w-full" />
            </div>
            <div className="mt-auto flex justify-end opacity-40">
                <div className="w-12 h-4 border border-current rounded-sm" />
            </div>
         </div>

         {/* PDF Badge */}
         <div className="absolute top-4 right-4 z-10">
             <div className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg transform rotate-3">PDF</div>
         </div>

         {/* Guest Lock */}
         {isGuest && (
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                <div className="bg-white/90 dark:bg-slate-800/90 p-3 rounded-2xl shadow-xl border border-white/20 scale-90 group-hover:scale-100 transition-transform duration-500">
                    <Icon name="lock-closed" className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
            </div>
         )}
      </div>

      {/* Info Section */}
      <div className="p-5 flex flex-col flex-grow">
          <div className="mb-4">
            <span className="inline-block px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[9px] font-black uppercase tracking-widest rounded-md border border-blue-100 dark:border-blue-800/50 mb-2">
                {doc.categoryKey ? getCategoryName(doc.categoryKey, t) : '---'}
            </span>
            <h3 className="font-bold text-[15px] text-slate-900 dark:text-white leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                {doc.titleKey ? t(doc.titleKey) : doc.title}
            </h3>
          </div>

          <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 dark:border-white/5 pt-4">
             <button 
                onClick={handleDownload}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
             >
                <Icon name="download" className="w-3.5 h-3.5" />
                {t('common.download')}
             </button>

             <button 
                onClick={handleShare}
                className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title={t('common.share')}
             >
                <Icon name="external-link" className="w-3.5 h-3.5" />
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
        className="group flex items-center gap-4 bg-white dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-white/5 hover:border-blue-500/20 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-white/5 flex items-center justify-center text-blue-500 border border-slate-100 dark:border-white/5 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
         <Icon name="document-text" className="w-5 h-5" />
      </div>

      <div className="flex-grow min-w-0">
        <h3 className="font-bold text-[15px] text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
          {doc.titleKey ? t(doc.titleKey) : doc.title}
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
            {doc.categoryKey ? getCategoryName(doc.categoryKey, t) : '---'}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
             {formatRelativeTime(doc.updatedAt, lang)}
          </span>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        {showAdminControls && (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
              className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
            >
              <Icon name="pencil" className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              className="p-2 text-slate-400 hover:text-red-600 transition-colors"
            >
              <Icon name="trash" className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="p-2 text-slate-300 group-hover:text-blue-500 transition-colors">
            <Icon name="chevron-right" className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
});

export const DocumentSkeleton: React.FC<{ viewMode: 'grid' | 'list' }> = ({ viewMode }) => {
    if (viewMode === 'list') {
        return (
            <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/20 p-4 rounded-xl border border-transparent animate-pulse">
                <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="flex-grow space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-slate-50 dark:bg-slate-900/20 rounded-[1.5rem] p-0 border border-transparent animate-pulse overflow-hidden">
            <div className="aspect-[4/3] bg-slate-200 dark:bg-slate-800" />
            <div className="p-5 space-y-4">
                <div className="space-y-2">
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                </div>
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-full" />
            </div>
        </div>
    );
};
