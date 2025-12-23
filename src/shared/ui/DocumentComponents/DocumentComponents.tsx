import React, { memo } from 'react';
import { Document, Tag, Category, UserRole } from '@shared/types';
import { useI18n } from '@app/providers/i18n/i18n';
import { Icon } from '../icons';
import { formatRelativeTime, getCategoryName } from '../../lib/utils/format';
import { BUSINESS_ROLES } from '../../config/constants';
import { canViewDocument } from '../../lib/permissions/permissions';

const ROLE_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  foreman: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500' },
  designer: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  architect: { bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400', dot: 'bg-indigo-500' },
  default: { bg: 'bg-slate-500/10', text: 'text-slate-500', dot: 'bg-slate-500' }
};

interface DocumentGridItemProps {
  doc: Document;
  onClick: () => void;
  onRequireLogin: () => void;
  currentUserRole: UserRole;
  tagById?: Map<string, Tag>;
  categories?: Category[];
}

export const DocumentGridItem: React.FC<DocumentGridItemProps> = memo(({ 
  doc, 
  onClick, 
  onRequireLogin, 
  currentUserRole,
  tagById,
  categories = []
}) => {
  const { t, lang } = useI18n();

  const hasAccess = canViewDocument(currentUserRole, doc, categories);
  const isGuest = currentUserRole === 'guest';
  const displayViewRoles = BUSINESS_ROLES.filter(role => canViewDocument(role, doc, categories));

  return (
    <div
      onClick={onClick}
      className={`group flex flex-col bg-white dark:bg-[#0f172a] rounded-[2rem] border transition-all duration-500 cursor-pointer overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1.5 ${
        !hasAccess ? 'border-slate-200 dark:border-white/5' : 'border-slate-200 dark:border-white/10 hover:border-blue-500/50'
      }`}
    >
      {/* 1. Blueprint Thumbnail Area */}
      <div className="relative aspect-[16/10] bg-[#020617] overflow-hidden shrink-0 border-b border-white/5">
         {/* Blueprint Grid */}
         <div className="absolute inset-0 opacity-[0.15]" 
              style={{ 
                backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)', 
                backgroundSize: '20px 20px' 
              }} 
         />
         
         {/* Technical Drawing Element */}
         <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-2 border-blue-500/20 rounded-xl rotate-45 animate-pulse" />
                <div className="absolute inset-2 border border-blue-400/30 rounded-lg -rotate-12 transition-transform group-hover:rotate-0 duration-700" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Icon name="document-text" className="w-10 h-10 text-blue-500 opacity-80" />
                </div>
            </div>
         </div>

         {/* Top Left: Internal ID Label (Only if exists) */}
         {doc.internalId && (
            <div className="absolute top-5 left-5">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 backdrop-blur-sm">
                    {doc.internalId}
                </span>
            </div>
         )}

         {/* Top Right: Role Badges */}
         <div className="absolute top-5 right-5 flex flex-col gap-1.5 items-end">
            {displayViewRoles.map(role => (
                <div key={role} className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 shadow-lg">
                    <span className={`w-1.5 h-1.5 rounded-full ${ROLE_CONFIG[role]?.dot || ROLE_CONFIG.default.dot}`} />
                    <span className="text-[8px] font-bold text-white uppercase tracking-wider">{t(`roles.${role}`)}</span>
                </div>
            ))}
         </div>

         {/* Locked State Overlay */}
         {!hasAccess && (
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 mb-3">
                    <Icon name="lock-closed" className="w-6 h-6 text-white opacity-80" />
                </div>
                <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">{t('common.locked')}</span>
            </div>
         )}
      </div>

      {/* 2. Information Area */}
      <div className="p-6 flex flex-col flex-grow">
          {/* Metadata Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                    {doc.categoryKey ? getCategoryName(doc.categoryKey, t) : '---'}
                </span>
            </div>
            <div className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                {formatRelativeTime(doc.updatedAt, lang)}
            </div>
          </div>
          
          {/* Title and Description */}
          <div className="flex-grow">
            <h3 className={`text-lg font-black leading-tight mb-2 transition-colors ${
                !hasAccess ? 'text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white group-hover:text-blue-600'
            }`}>
                {doc.titleKey ? t(doc.titleKey) : doc.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {doc.description || t('dashboard.noDescription') || 'Технічний опис документа доступний після перегляду.'}
            </p>
          </div>

          {/* 3. Action Row */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
             <button 
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                className={`flex items-center gap-3 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                    !hasAccess 
                    ? 'bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:scale-[1.02]'
                }`}
             >
                <Icon name={!hasAccess ? 'lock-closed' : 'eye'} className="w-4 h-4" />
                {!hasAccess ? t('common.locked') : t('docView.preview')}
             </button>

             <button 
                onClick={(e) => { e.stopPropagation(); /* logic for share */ }}
                className="p-2.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
             >
                <Icon name="external-link" className="w-4 h-4" />
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
  hasAccess?: boolean;
  categories?: Category[];
}> = memo(({ doc, onClick, onEdit, onDelete, showAdminControls, hasAccess = true, categories = [] }) => {
  const { t, lang } = useI18n();
  const displayViewRoles = BUSINESS_ROLES.filter(role => canViewDocument(role, doc, categories));

  return (
    <div 
        onClick={onClick}
        className={`group flex items-center gap-6 bg-white dark:bg-[#0f172a] p-5 rounded-3xl border transition-all cursor-pointer hover:shadow-xl ${
            !hasAccess ? 'border-slate-100 dark:border-white/5 opacity-80' : 'border-slate-100 dark:border-white/10 hover:border-blue-500/20'
        }`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
          !hasAccess 
            ? 'bg-slate-800 text-slate-500' 
            : 'bg-slate-100 dark:bg-white/5 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
      }`}>
         <Icon name={!hasAccess ? 'lock-closed' : 'document-text'} className="w-7 h-7" />
      </div>

      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2 mb-1">
             {displayViewRoles.map(role => (
                <span key={role} className={`w-2 h-2 rounded-full ${ROLE_CONFIG[role]?.dot || ROLE_CONFIG.default.dot}`} title={t(`roles.${role}`)} />
             ))}
             <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest ml-1">
                {doc.categoryKey ? getCategoryName(doc.categoryKey, t) : '---'}
             </span>
             {doc.internalId && (
                <span className="text-[8px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] ml-2 border border-slate-200 dark:border-white/5 px-1.5 rounded">
                    {doc.internalId}
                </span>
             )}
        </div>
        <h3 className={`font-black text-lg truncate transition-colors ${
            !hasAccess ? 'text-slate-500' : 'text-slate-900 dark:text-white group-hover:text-blue-600'
        }`}>
          {doc.titleKey ? t(doc.titleKey) : doc.title}
        </h3>
        <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">
            {formatRelativeTime(doc.updatedAt, lang)}
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-3">
        {showAdminControls && (
          <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); onEdit?.(); }} className="p-3 text-slate-400 hover:text-blue-600 rounded-xl transition-all">
              <Icon name="pencil" className="w-5 h-5" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="p-3 text-slate-400 hover:text-red-600 rounded-xl transition-all">
              <Icon name="trash" className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all">
            <Icon name="chevron-right" className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
});

export const DocumentSkeleton: React.FC<{ viewMode: 'grid' | 'list' }> = ({ viewMode }) => {
    if (viewMode === 'list') {
        return (
            <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-900/20 p-5 rounded-3xl animate-pulse">
                <div className="w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                <div className="flex-grow space-y-3">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col bg-slate-50 dark:bg-slate-900/20 rounded-[2.5rem] animate-pulse overflow-hidden">
            <div className="aspect-[16/10] bg-slate-200 dark:bg-slate-800" />
            <div className="p-7 space-y-5">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
            </div>
        </div>
    );
};
