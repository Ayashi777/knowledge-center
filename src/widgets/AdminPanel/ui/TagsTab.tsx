import React from 'react';
import { Tag } from '@shared/types';
import { Icon } from '../../../../shared/ui/icons';

interface TagsTabProps {
    allTags: Tag[];
    onAddTag: () => void;
    onEditTag: (tag: Tag) => void;
}

export const TagsTab: React.FC<TagsTabProps> = ({ allTags, onAddTag, onEditTag }) => {
    return (
        <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Керування тегами</h3>
                    <p className="text-sm text-gray-500 italic">Створення та редагування міток для документів</p>
                </div>
                <button
                    onClick={onAddTag}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
                >
                    <Icon name="plus" className="w-4 h-4" />
                    Додати тег
                </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {allTags.map((tag) => (
                    <button
                        key={tag.id}
                        onClick={() => onEditTag(tag)}
                        className="group relative p-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-transparent hover:border-blue-200 dark:hover:border-blue-900 text-center transition-all"
                    >
                        <div className="w-3 h-3 rounded-full mx-auto mb-3 shadow-sm" style={{ backgroundColor: tag.color || '#cbd5e1' }} />
                        <p className="font-bold text-gray-900 dark:text-white text-sm truncate">#{tag.id}</p>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Icon name="pencil" className="w-3 h-3 text-gray-400" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
