import React from 'react';
import { Document, ViewMode } from '@shared/types';
import { useI18n } from '@app/providers/i18n/i18n';
import { DocumentGridItem, DocumentListItem } from '../../../../shared/ui/DocumentComponents';

interface DocumentListProps {
    docs: Document[];
    viewMode: ViewMode;
    onSelectDoc: (doc: Document) => void;
    onRequireLogin: () => void;
    isGuest: boolean;
    showAdminControls: boolean;
    onEditDoc: (doc: Document) => void;
    onDeleteDoc: (id: string) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
    docs,
    viewMode,
    onSelectDoc,
    onRequireLogin,
    isGuest,
    showAdminControls,
    onEditDoc,
    onDeleteDoc,
}) => {
    const { t } = useI18n();

    if (docs.length === 0) {
        return (
            <div className="text-center py-10 px-4 bg-gray-100/50 dark:bg-gray-800/30 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">{t('dashboard.noResults')}</p>
                <p className="text-gray-600 dark:text-gray-500 text-sm mt-1">{t('dashboard.noResultsDescription')}</p>
            </div>
        );
    }

    return viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
            {docs.map((doc) => (
                <DocumentGridItem 
                    key={doc.id} 
                    doc={doc} 
                    onClick={() => onSelectDoc(doc)} 
                    onRequireLogin={onRequireLogin} 
                    isGuest={isGuest} 
                />
            ))}
        </div>
    ) : (
        <div className="space-y-3">
            {docs.map((doc) => (
                <DocumentListItem
                    key={doc.id}
                    doc={doc}
                    onClick={() => onSelectDoc(doc)}
                    onEdit={() => onEditDoc(doc)}
                    onDelete={() => onDeleteDoc(doc.id)}
                    showAdminControls={showAdminControls}
                />
            ))}
        </div>
    );
};
