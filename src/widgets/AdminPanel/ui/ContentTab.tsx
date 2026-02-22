import React, { useMemo, useState } from 'react';
import { Category, Document } from '@shared/types';
import { Icon } from '@shared/ui/icons';
import { useI18n } from '@app/providers/i18n/i18n';
import { getCategoryName } from '@shared/lib/utils/format';
import { Button, Card, Input } from '@shared/ui/primitives';
import { StatePanel } from '@shared/ui/states';

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
    const [categorySearch, setCategorySearch] = useState('');
    const [documentSearch, setDocumentSearch] = useState('');

    const filteredCategories = useMemo(() => {
        const q = categorySearch.trim().toLowerCase();
        if (!q) return categories;
        return categories.filter(cat =>
            getCategoryName(cat.nameKey, t).toLowerCase().includes(q) ||
            (cat.nameKey || '').toLowerCase().includes(q)
        );
    }, [categories, categorySearch, t]);

    const filteredDocuments = useMemo(() => {
        const q = documentSearch.trim().toLowerCase();
        if (!q) return documents;
        return documents.filter(doc =>
            (doc.titleKey ? t(doc.titleKey) : doc.title || '').toLowerCase().includes(q) ||
            (doc.internalId || '').toLowerCase().includes(q) ||
            getCategoryName(doc.categoryKey, t).toLowerCase().includes(q)
        );
    }, [documents, documentSearch, t]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-fg">Категорії ({filteredCategories.length}/{categories.length})</h3>
                    <Button onClick={onAddCategory} size="icon" className="h-9 w-9 rounded-lg">
                        <Icon name="plus" className="w-4 h-4" />
                    </Button>
                </div>
                <div className="mb-4">
                    <Input
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        placeholder="Пошук категорій"
                        className="h-10 rounded-xl px-4 text-sm font-semibold"
                    />
                </div>
                {filteredCategories.length === 0 ? (
                    <StatePanel
                        variant="empty"
                        title="Категорії не знайдено"
                        description="Змініть запит або створіть нову категорію."
                        className="py-14"
                    />
                ) : (
                <div className="space-y-2">
                    {filteredCategories.map((cat) => (
                        <Card key={cat.id} className="group flex items-center justify-between rounded-2xl border border-transparent bg-muted/35 p-4 shadow-none transition-all hover:border-primary/40">
                            <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-muted-fg shadow-sm">
                                    <Icon name={(cat.iconName as any) || 'folder'} className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-fg">{getCategoryName(cat.nameKey, t)}</p>
                                    <p className="text-[10px] font-black uppercase tracking-tighter text-muted-fg">{cat.viewPermissions?.join(', ')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button onClick={() => onUpdateCategory(cat)} variant="ghost" size="icon" className="h-8 w-8 text-muted-fg hover:text-primary"><Icon name="pencil" className="w-4 h-4" /></Button>
                                <Button onClick={() => onDeleteCategory(cat.id)} variant="ghost" size="icon" className="h-8 w-8 text-muted-fg hover:text-danger"><Icon name="trash" className="w-4 h-4" /></Button>
                            </div>
                        </Card>
                    ))}
                </div>
                )}
            </section>

            <section>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-fg">Документи ({filteredDocuments.length}/{documents.length})</h3>
                    <Button onClick={onAddDocument} size="icon" className="h-9 w-9 rounded-lg">
                        <Icon name="plus" className="w-4 h-4" />
                    </Button>
                </div>
                <div className="mb-4">
                    <Input
                        value={documentSearch}
                        onChange={(e) => setDocumentSearch(e.target.value)}
                        placeholder="Пошук документів: назва, ID, категорія"
                        className="h-10 rounded-xl px-4 text-sm font-semibold"
                    />
                </div>
                {filteredDocuments.length === 0 ? (
                    <StatePanel
                        variant="empty"
                        title="Документи не знайдено"
                        description="Змініть запит або створіть новий документ."
                        className="py-14"
                    />
                ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredDocuments.map((doc) => (
                        <Card key={doc.id} className="group flex items-center justify-between rounded-2xl border border-transparent bg-muted/35 p-4 shadow-none transition-all hover:border-primary/40">
                            <div className="min-w-0 flex-grow">
                                <p className="truncate pr-4 font-bold text-fg">{doc.titleKey ? t(doc.titleKey) : doc.title}</p>
                                <p className="text-[10px] font-black uppercase tracking-tighter text-muted-fg">{getCategoryName(doc.categoryKey, t)}</p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <Button onClick={() => onEditDocument(doc)} variant="ghost" size="icon" className="h-8 w-8 text-muted-fg hover:text-primary"><Icon name="pencil" className="w-4 h-4" /></Button>
                                <Button onClick={() => onDeleteDocument(doc.id)} variant="ghost" size="icon" className="h-8 w-8 text-muted-fg hover:text-danger"><Icon name="trash" className="w-4 h-4" /></Button>
                            </div>
                        </Card>
                    ))}
                </div>
                )}
            </section>
        </div>
    );
};
