import React from 'react';
import { useModal } from './ModalProvider';
import { LoginModal } from '@widgets/modals/LoginModal';
import { DocumentEditorModal } from '@widgets/modals/DocumentEditorModal';
import { CategoryEditorModal } from '@widgets/modals/CategoryEditorModal';
import { DocumentModal } from '@widgets/modals/DocumentModal';
import { useAdminActions } from '@shared/hooks/useAdminActions';
import { useAuth } from '@app/providers/AuthProvider';
import { Category, Tag, Document, UserRole } from '@shared/types';

const checkAccess = (allowedRoles: UserRole[] | undefined, userRole: UserRole): boolean => {
    if (userRole === 'admin') return true;
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.includes(userRole);
};

interface GlobalModalsProps {
    availableCategories: Category[];
    availableTags: Tag[];
    onRequireLogin: () => void;
}

export const GlobalModals: React.FC<GlobalModalsProps> = ({ 
    availableCategories, 
    availableTags,
    onRequireLogin,
}) => {
    const { modal, closeModal } = useModal();
    const { handleSaveDocument, handleSaveCategory } = useAdminActions();
    const { role: currentUserRole } = useAuth();

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
                    availableCategories={availableCategories}
                    availableTags={availableTags}
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
        case 'view-doc':
            if (!modal.data) return null;
            const doc = modal.data as Document;
            const hasAccess = checkAccess(doc.viewPermissions, currentUserRole);
            
            return (
                <DocumentModal 
                    doc={doc}
                    onClose={closeModal}
                    onRequireLogin={onRequireLogin}
                    hasAccess={hasAccess}
                />
            );
        default:
            return null;
    }
};
