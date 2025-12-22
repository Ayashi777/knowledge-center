import React from 'react';
import { useModal } from './ModalProvider';
import { LoginModal } from '@widgets/modals/LoginModal';
import { DocumentEditorModal } from '@widgets/modals/DocumentEditorModal';
import { CategoryEditorModal } from '@widgets/modals/CategoryEditorModal';
import { useAdminActions } from '@shared/hooks/useAdminActions';
import { useDocumentManagement } from '@shared/hooks/useDocumentManagement';

export const GlobalModals: React.FC = () => {
    const { modal, closeModal } = useModal();
    const { handleSaveDocument, handleSaveCategory } = useAdminActions();
    const { categories, allTags } = useDocumentManagement();

    if (!modal.type) return null;

    switch (modal.type) {
        case 'login':
            return (
                <LoginModal 
                    onClose={closeModal} 
                    context={modal.context || 'login'} 
                    initialView={modal.data || 'login'} 
                />
            );
        case 'edit-doc':
            return (
                <DocumentEditorModal
                    doc={modal.data}
                    onSave={async (d) => { await handleSaveDocument(d); closeModal(); }}
                    onClose={closeModal}
                    availableCategories={categories}
                    availableTags={allTags}
                />
            );
        case 'edit-category':
            return (
                <CategoryEditorModal
                    category={modal.data}
                    onSave={async (c) => { await handleSaveCategory(c); closeModal(); }}
                    onClose={closeModal}
                />
            );
        default:
            return null;
    }
};
