import React from 'react';
import { Document, ViewMode, UserRole, Category } from '@shared/types';
import { useI18n } from '@app/providers/i18n/i18n';
import { DocumentGridItem, DocumentListItem, DocumentSkeleton } from '@shared/ui/DocumentComponents';
import { Icon } from '@shared/ui/icons';
import { canViewDocument } from '@shared/lib/permissions/permissions';

interface DocumentListProps {
    docs: Document[];
    viewMode: ViewMode;
    onSelectDoc: (doc: Document) => void;
    currentUserRole: UserRole;
    showAdminControls: boolean;
    onEditDoc: (doc: Document) => void;
    onDeleteDoc: (id: string) => void;
    categories?: Category[];
    isLoading?: boolean;
}

export const DocumentList: React.FC<DocumentListProps> = ({
    docs,
    viewMode,
    onSelectDoc,
    currentUserRole,
    showAdminControls,
    onEditDoc,
    onDeleteDoc,
    categories = [],
    isLoading = false
}) => {
    const { t } = useI18n();

    if (isLoading) {
        return (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8" : "space-y-6"}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <DocumentSkeleton key={i} viewMode={viewMode} />
                ))}
            </div>
        );
    }

    if (docs.length === 0) {
        return (
            <div className="animate-fade-in rounded-[2.5rem] border border-dashed border-border bg-muted/25 px-6 py-24 text-center">
                <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-surface text-primary shadow-soft">
                    <Icon name="search" className="w-10 h-10" />
                </div>
                <h3 className="mb-3 text-2xl font-black tracking-tight text-fg">{t('dashboard.noResults')}</h3>
                <p className="mx-auto max-w-md leading-relaxed text-muted-fg">{t('dashboard.noResultsDescription')}</p>
            </div>
        );
    }

    return viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {docs.map((doc) => (
                <DocumentGridItem 
                    key={doc.id} 
                    doc={doc} 
                    onClick={() => onSelectDoc(doc)} 
                    currentUserRole={currentUserRole}
                    categories={categories}
                />
            ))}
        </div>
    ) : (
        <div className="space-y-6">
            {docs.map((doc) => (
                <DocumentListItem
                    key={doc.id}
                    doc={doc}
                    onClick={() => onSelectDoc(doc)}
                    onEdit={() => onEditDoc(doc)}
                    onDelete={() => onDeleteDoc(doc.id)}
                    showAdminControls={showAdminControls}
                    hasAccess={canViewDocument(currentUserRole, doc, categories)}
                    categories={categories}
                />
            ))}
        </div>
    );
};
