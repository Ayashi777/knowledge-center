import React, { useMemo } from 'react';
import { Icon } from '@shared/ui/icons';
import { formatRelativeTime } from '@shared/lib/utils/format';
import { Timestamp } from 'firebase/firestore';
import { Tag, UserRole } from '@shared/types';
import { useI18n } from '@app/providers/i18n/i18n';

interface DocumentHeaderProps {
  title: string;
  extendedDescription?: string; // 🔥 Added
  updatedAt: Timestamp;
  tagIds: string[];
  tagById: Map<string, Tag>;
  viewPermissions?: UserRole[];
  currentUserRole?: UserRole;
}

/**
 * 🔥 Blueprint Grid Background Style
 */
const BLUEPRINT_STYLE = `
  .blueprint-bg {
    background-color: #f8fafc;
    background-image: 
      linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
      linear-gradient(rgba(59, 130, 246, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59, 130, 246, 0.02) 1px, transparent 1px);
    background-size: 100px 100px, 100px 100px, 20px 20px, 20px 20px;
    background-position: center center;
  }
  .dark .blueprint-bg {
    background-color: #0f172a;
    background-image: 
      linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
      linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px);
  }
  
  @keyframes role-pulse {
    0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
    100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
  }
  .active-role-badge {
    animation: role-pulse 2s infinite;
    border: 1px solid rgba(255, 255, 255, 0.4);
    background-color: #2563eb !important; /* Brighter blue */
  }
`;

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({ 
  title, 
  extendedDescription,
  updatedAt, 
  tagIds, 
  tagById,
  viewPermissions = [],
  currentUserRole
}) => {
  const { t, lang } = useI18n();

  const displayableRoles: UserRole[] = ['guest', 'foreman', 'engineer', 'architect'];
  const displayRoles = useMemo(() => 
    viewPermissions.filter(role => displayableRoles.includes(role)),
    [viewPermissions]
  );

  return (
    <div className="relative mb-12 rounded-[2rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm animate-fade-in">
      <style>{BLUEPRINT_STYLE}</style>
      
      <div className="absolute inset-0 blueprint-bg opacity-100" />
      
      <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
          <div className="border-t-2 border-r-2 border-blue-500 w-12 h-12" />
      </div>
      <div className="absolute bottom-0 left-0 p-4 opacity-20 pointer-events-none">
          <div className="border-b-2 border-l-2 border-blue-500 w-12 h-12" />
      </div>

      <div className="relative z-10 p-8 md:p-12">
        {/* Role Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {displayRoles.map(role => {
            const isActive = role === currentUserRole;
            return (
              <span 
                key={role} 
                className={`px-3 py-1 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg transition-all duration-300 ${
                  isActive 
                    ? 'active-role-badge scale-110 z-20 shadow-blue-500/40' 
                    : 'bg-blue-600/60 dark:bg-blue-900/40 opacity-70 shadow-blue-500/10'
                }`}
              >
                {t(`roles.${role}`)}
              </span>
            );
          })}
          {viewPermissions.length === 0 && (
            <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-[9px] font-black uppercase tracking-widest rounded-full">
              {t('roles.public')}
            </span>
          )}
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-[0.95] max-w-4xl">
          {title}
        </h1>

        {/* 🔥 Extended Description */}
        {extendedDescription && (
            <div className="max-w-3xl mb-8">
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                    {extendedDescription}
                </p>
            </div>
        )}

        <div className="flex flex-wrap items-center gap-8 text-gray-500 dark:text-gray-400 border-t border-gray-200/50 dark:border-gray-700/50 pt-8">
          <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.15em]">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <Icon name="clock" className="w-4 h-4" />
            </div>
            <div>
                <p className="opacity-50 mb-0.5">{t('docView.lastUpdated')}</p>
                <p className="text-gray-900 dark:text-gray-200">{formatRelativeTime(updatedAt, lang)}</p>
            </div>
          </div>
          
          {tagIds.length > 0 && (
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.15em]">
              <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400">
                  <Icon name="tag" className="w-4 h-4" />
              </div>
              <div>
                  <p className="opacity-50 mb-0.5">Tags</p>
                  <div className="flex flex-wrap gap-2 text-gray-900 dark:text-gray-200">
                    {tagIds.map(id => (
                      <span key={id}>#{tagById.get(id)?.name || id}</span>
                    ))}
                  </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
