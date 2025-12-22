import { useState, useCallback } from 'react';
import { DocumentsApi } from '../api/firestore/documents.api';
import { CategoriesApi } from '../api/firestore/categories.api';
import { StorageApi } from '../api/storage/storage.api';
import { Document, Category, DocumentContent } from '@shared/types';
import { Language, useI18n } from '@app/providers/i18n/i18n';

/**
 * Hook for administrative operations on documents and categories.
 */
export const useAdminActions = () => {
    const { t } = useI18n();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSaveDocument = useCallback(async (documentData: Partial<Document>) => {
        setIsProcessing(true);
        try {
            if (documentData.id) {
                // Ensure we don't accidentally overwrite content during metadata update
                const { content, ...metadata } = documentData;
                await DocumentsApi.updateMetadata(documentData.id, metadata);
            } else {
                await DocumentsApi.create(documentData);
            }
        } catch (error) {
            console.error('[useAdminActions] Document save failed:', error);
            alert(t('common.error') || 'Save failed');
        } finally {
            setIsProcessing(false);
        }
    }, [t]);

    const handleUpdateContent = useCallback(async (
        docId: string,
        language: Language,
        newContent: DocumentContent
    ) => {
        setIsProcessing(true);
        try {
            await DocumentsApi.updateContent(docId, language, newContent);
        } catch (error) {
            console.error('[useAdminActions] Content update failed:', error);
            alert(t('common.error') || 'Update failed');
            throw error;
        } finally {
            setIsProcessing(false);
        }
    }, [t]);

    const handleSaveCategory = useCallback(async (category: Category) => {
        setIsProcessing(true);
        try {
            await CategoriesApi.createOrUpdate(category);
        } catch (error) {
            console.error('[useAdminActions] Category save failed:', error);
            alert(t('common.error') || 'Category save failed');
        } finally {
            setIsProcessing(false);
        }
    }, [t]);

    const handleDeleteCategory = useCallback(async (categoryId: string) => {
        if (!window.confirm(t('common.confirmDelete') || 'Delete category?')) return;
        
        setIsProcessing(true);
        try {
            await CategoriesApi.delete(categoryId);
        } catch (error) {
            console.error('[useAdminActions] Category delete failed:', error);
        } finally {
            setIsProcessing(false);
        }
    }, [t]);

    const handleDeleteDocument = useCallback(async (documentId: string) => {
        if (!window.confirm(t('dashboard.confirmDelete'))) return;
        
        setIsProcessing(true);
        try {
            await DocumentsApi.delete(documentId);
            await StorageApi.deleteAllDocumentFiles(documentId);
        } catch (error) {
            console.error('[useAdminActions] Document delete failed:', error);
        } finally {
            setIsProcessing(false);
        }
    }, [t]);

    return {
        isProcessing,
        handleSaveDocument,
        handleUpdateContent,
        handleSaveCategory,
        handleDeleteCategory,
        handleDeleteDocument
    };
};
