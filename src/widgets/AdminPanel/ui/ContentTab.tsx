import React from 'react';
import { Category, Document } from '../../../../shared/types';
import { Icon } from '../../../../shared/ui/icons';
import { useI18n } from '../../../../app/providers/i18n/i18n';

interface ContentTabProps {
    categories: Category[];
    documents: Document[];
    onAddCategory: () => void;
    onUpdateCategory: (cat: Category) => void;
    onDeleteCategory: (id: string) => void;
    onAddDocument: () => void;
    onEditDocument: (doc: Document) => void;
    onDeleteDocument: (id: string) => void;
}

export const ContentTab: React.FC<ContentTabProps> = ({
    categories,
    documents,
    onAddCategory,
    onUpdateCategory,
    onDeleteCategory,
    onAddDocument,
    onEditDocument,
    onDeleteDocument,
}) => {
    const { t } = useI18n();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Категорії ({categories.length})</h3>
                    <button onClick={onAddCategory} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                        <Icon name="plus" className="w-4 h-4" />
                    </button>
                </div>
                <div className="space-y-2">
                    {categories.map((cat) => (
                        <div key={cat.id} className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-transparent hover:border-blue-200 dark:hover:border-blue-900 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center text-gray-400 shadow-sm">
                                    <Icon name={(cat.iconName as any) || 'folder'} className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{t(`categories.${cat.nameKey}`)}</p>
                                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">{cat.viewPermissions?.join(', ')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onUpdateCategory(cat)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Icon name="pencil" className="w-4 h-4" /></button>
                                <button onClick={() => onDeleteCategory(cat.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Icon name="trash" className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Документи ({documents.length})</h3>
                    <button onClick={onAddDocument} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                        <Icon name="plus" className="w-4 h-4" />
                    </button>
                </div>
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {documents.map((doc) => (
                        <div key={doc.id} className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-transparent hover:border-blue-200 dark:hover:border-blue-900 transition-all">
                            <div className="min-w-0 flex-grow">
                                <p className="font-bold text-gray-900 dark:text-white truncate pr-4">{doc.titleKey ? t(doc.titleKey) : doc.title}</p>
                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">{doc.categoryKey}</p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <button onClick={() => onEditDocument(doc)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors"><Icon name="pencil" className="w-4 h-4" /></button>
                                <button onClick={() => onDeleteDocument(doc.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Icon name="trash" className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};
