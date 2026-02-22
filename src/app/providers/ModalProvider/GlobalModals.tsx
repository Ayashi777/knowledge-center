import React from 'react';
import { useModal } from './ModalProvider';
import { LoginModal } from '@widgets/modals/LoginModal';
import { DocumentEditorModal } from '@widgets/modals/DocumentEditorModal';
import { CategoryEditorModal } from '@widgets/modals/CategoryEditorModal';
import { DocumentModal } from '@widgets/modals/DocumentModal';
import { useAdminActions } from '@shared/hooks/useAdminActions';
import { useAuth } from '@app/providers/AuthProvider';
import { Category, Tag, Document, UserRole } from '@shared/types';

const canViewFromFirestoreRules = (doc: Document, userRole: UserRole, isAuthenticated: boolean): boolean => {
    if (userRole === 'admin') return true;

    if (doc.viewPermissions && doc.viewPermissions.length > 0) {
        return isAuthenticated && doc.viewPermissions.includes(userRole);
    }

    return true;
};

const canDownloadFromStorageRules = (doc: Document, userRole: UserRole, isAuthenticated: boolean): boolean => {
    if (userRole === 'admin') return true;

    // downloadPermissions has priority if configured
    if (doc.downloadPermissions && doc.downloadPermissions.length > 0) {
        return isAuthenticated && doc.downloadPermissions.includes(userRole);
    }

    // Fallback to viewPermissions (mirrors storage.rules logic)
    if (doc.viewPermissions && doc.viewPermissions.length > 0) {
        return isAuthenticated && doc.viewPermissions.includes(userRole);
    }

    // Public documents without explicit permissions
    return true;
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
    const { role: currentUserRole, user } = useAuth();

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
            const hasViewAccess = canViewFromFirestoreRules(doc, currentUserRole, !!user);
            const hasDownloadAccess = canDownloadFromStorageRules(doc, currentUserRole, !!user);
            
            return (
                <DocumentModal 
                    doc={doc}
                    onClose={closeModal}
                    onRequireLogin={onRequireLogin}
                    hasViewAccess={hasViewAccess}
                    hasDownloadAccess={hasDownloadAccess}
                />
            );
        default:
            return null;
    }
};
