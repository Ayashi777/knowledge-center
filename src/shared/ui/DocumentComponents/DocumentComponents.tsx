import React from 'react';
import { Document } from '../../../types';
import { useI18n } from '../../../i18n';
import { Icon } from '../icons';
import { formatDistance } from '../../lib/utils/format';

export const DocumentGridItem: React.FC<{
  doc: Document;
  onClick: () => void;
  onRequireLogin: () => void;
  isGuest: boolean;
}> = ({ doc, onClick, onRequireLogin, isGuest }) => {
  const { t, lang } = useI18n();

  return (
    <div
      onClick={isGuest ? onRequireLogin : onClick}
      className="group relative flex flex-col bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
         <Icon name="chevron-right" className="w-5 h-5 text-blue-500" />
      </div>

      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
          <Icon name="document-text" className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900 dark:text-white leading-tight mb-1 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {doc.titleKey ? t(doc.titleKey) : doc.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
             {doc.categoryKey ? t(`categories.${doc.categoryKey}`) : '---'}
          </p>
        </div>
      </div>

      <div className="mt-auto space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {doc.tagIds?.slice(0, 3).map((tagId) => (
            <span key={tagId} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-400 rounded text-[10px] font-bold uppercase tracking-wider">
              {tagId}
            </span>
          ))}
          {(doc.tagIds?.length || 0) > 3 && (
            <span className="px-2 py-0.5 text-gray-400 text-[10px] font-bold">
              +{(doc.tagIds?.length || 0) - 3}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-gray-700/30">
          <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 text-[10px] font-medium uppercase tracking-tight">
            <Icon name="clock" className="w-3 h-3" />
            <span>{doc.updatedAt ? formatDistance(doc.updatedAt.toDate(), lang) : '---'}</span>
          </div>
          {isGuest && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-0.5 rounded uppercase">
              <Icon name="lock-closed" className="w-2.5 h-2.5" />
              <span>{t('common.locked')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const DocumentListItem: React.FC<{
  doc: Document;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showAdminControls?: boolean;
}> = ({ doc, onClick, onEdit, onDelete, showAdminControls }) => {
  const { t, lang } = useI18n();

  return (
    <div className="group flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-all">
      <div
        onClick={onClick}
        className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-blue-900/30 transition-colors shrink-0 cursor-pointer"
      >
        <Icon name="document-text" className="w-5 h-5" />
      </div>

      <div className="flex-grow min-w-0 cursor-pointer" onClick={onClick}>
        <h3 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
          {doc.titleKey ? t(doc.titleKey) : doc.title}
        </h3>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            {doc.categoryKey ? t(`categories.${doc.categoryKey}`) : '---'}
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
          <span className="text-[10px] text-gray-400">
             {doc.updatedAt ? formatDistance(doc.updatedAt.toDate(), lang) : '---'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {showAdminControls && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <Icon name="pencil" className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <Icon name="trash" className="w-4 h-4" />
            </button>
          </>
        )}
        <div className="hidden sm:block p-2 text-gray-300">
          <Icon name="chevron-right" className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
