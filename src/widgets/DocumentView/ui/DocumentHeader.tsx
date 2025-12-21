import React from 'react';
import { useI18n } from '@app/providers/i18n/i18n';
import { Tag } from '@shared/types';
import { Icon } from '@shared/ui/icons';
import { formatRelativeTime } from '@shared/lib/utils/format';

interface DocumentHeaderProps {
    title: string;
    updatedAt: any;
    tagIds: string[];
    tagById: Map<string, Tag>;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({ title, updatedAt, tagIds, tagById }) => {
    const { t, lang } = useI18n();

    return (
        <div className="mb-10">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-gray-900 dark:text-white mb-4 leading-[1.1]">
                {title}
            </h1>
            <div className="flex flex-wrap items-center gap-4">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                    {t('docView.lastUpdated')}: {formatRelativeTime(updatedAt, lang, t)}
                </p>
                <div className="flex flex-wrap gap-2">
                    {(tagIds || []).map((id) => {
                        const tg = tagById.get(id);
                        if (!tg) return null;
                        return (
                            <div
                                key={id}
                                className="flex items-center gap-2 text-[9px] uppercase font-black text-gray-400 border border-gray-200 dark:border-gray-800 px-2.5 py-1 rounded-full"
                            >
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tg.color || '#cccccc' }} aria-hidden="true" />
                                <Icon name="tag" className="w-2.5 h-2.5 opacity-50" />
                                {tg.name}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
