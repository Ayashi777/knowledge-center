import React from 'react';
import { Tag } from '@shared/types';
import { Icon } from '@shared/ui/icons';

interface TagsTabProps {
    allTags: Tag[];
    onAddTag: () => void;
    onEditTag: (tag: Tag) => void;
    onDeleteTag: (id: string) => void;
}

export const TagsTab: React.FC<TagsTabProps> = ({ allTags, onAddTag, onEditTag, onDeleteTag }) => {
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
                    <div
                        key={tag.id}
                        className="group relative p-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-transparent hover:border-blue-200 dark:hover:border-blue-900 text-center transition-all"
                    >
                        <button 
                            onClick={() => onEditTag(tag)}
                            className="w-full h-full"
                        >
                            <div className="w-3 h-3 rounded-full mx-auto mb-3 shadow-sm" style={{ backgroundColor: tag.color || '#cbd5e1' }} />
                            <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{tag.name || tag.id}</p>
                        </button>
                        
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={(e) => { e.stopPropagation(); onEditTag(tag); }}
                                className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                            >
                                <Icon name="pencil" className="w-3 h-3 text-blue-600" />
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteTag(tag.id); }}
                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                            >
                                <Icon name="trash" className="w-3 h-3 text-red-600" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
