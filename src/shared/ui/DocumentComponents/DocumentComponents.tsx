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
    alert(t('common.linkCopied') || 'Посилання скопійовано!');
  };

  return (
    <div
      onClick={onClick}
      className="group flex flex-col transition-all duration-300 cursor-pointer"
    >
      {/* 🔥 Document Preview Area (Blueprint Style from Prototype) */}
      <div className="relative aspect-[3/4] rounded-[0.5rem] overflow-hidden bg-[#1e293b] mb-4 flex flex-col p-6 border border-white/5 transition-all group-hover:border-blue-500/30">
         <div className="flex justify-between items-start mb-6">
            <span className="text-[12px] font-black text-white/90 uppercase tracking-tighter">CE</span>
            <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-red-600 rounded-[1px]" />
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">ACME CORP</span>
            </div>
         </div>

         <h4 className="text-[13px] font-bold text-white/90 leading-tight mb-4 line-clamp-3">
            {doc.titleKey ? t(doc.titleKey) : doc.title}
         </h4>

         {/* Skeleton Lines to match prototype */}
         <div className="space-y-2 opacity-[0.05]">
            <div className="h-1 bg-white rounded-full w-full" />
            <div className="h-1 bg-white rounded-full w-full" />
            <div className="h-1 bg-white rounded-full w-full" />
            <div className="h-1 bg-white rounded-full w-[80%]" />
            
            <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="space-y-2">
                    <div className="h-1 bg-white rounded-full w-full" />
                    <div className="h-1 bg-white rounded-full w-full" />
                    <div className="h-1 bg-white rounded-full w-full" />
                </div>
                <div className="space-y-2">
                    <div className="h-1 bg-white rounded-full w-full" />
                    <div className="h-1 bg-white rounded-full w-full" />
                    <div className="h-1 bg-white rounded-full w-full" />
                </div>
            </div>

            <div className="h-1 bg-white rounded-full w-full mt-6" />
            <div className="h-1 bg-white rounded-full w-full" />
            <div className="h-1 bg-white rounded-full w-full" />
         </div>

         {/* Lock Overlay for Guests */}
         {isGuest && (
            <div className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-[1px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Icon name="lock-closed" className="w-6 h-6 text-white" />
            </div>
         )}
      </div>

      {/* 🔥 Content Info & Actions */}
      <div className="px-1">
          <h3 className="font-bold text-[14px] text-gray-900 dark:text-gray-100 leading-snug mb-3 line-clamp-1">
            {doc.titleKey ? t(doc.titleKey) : doc.title}
          </h3>

          <div className="flex items-center gap-5">
             <button 
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                className="flex items-center gap-2 text-[10px] font-bold text-gray-400 hover:text-blue-500 transition-colors"
             >
                <Icon name="download" className="w-3.5 h-3.5" />
                {t('common.download')}
             </button>

             <button 
                onClick={handleShare}
                className="flex items-center gap-2 text-[10px] font-bold text-gray-400 hover:text-blue-500 transition-colors"
             >
                <Icon name="external-link" className="w-3.5 h-3.5" />
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
        className="group flex items-center gap-6 bg-white dark:bg-gray-800/40 p-4 rounded-lg border border-gray-100 dark:border-white/5 hover:border-blue-500/20 transition-all cursor-pointer"
    >
      <div className="flex-grow min-w-0">
        <h3 className="font-bold text-[15px] text-gray-900 dark:text-gray-100 mb-1 truncate group-hover:text-blue-500 transition-colors">
          {doc.titleKey ? t(doc.titleKey) : doc.title}
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
            {doc.categoryKey ? getCategoryName(doc.categoryKey, t) : '---'}
          </span>
          <span className="text-[10px] text-gray-400">
             {formatRelativeTime(doc.updatedAt, lang)}
          </span>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-4">
        {showAdminControls && (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
            >
              <Icon name="pencil" className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
            >
              <Icon name="trash" className="w-4 h-4" />
            </button>
          </div>
        )}
        <Icon name="chevron-right" className="w-5 h-5 text-gray-300" />
      </div>
    </div>
  );
});
