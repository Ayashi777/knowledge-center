import { useState } from 'react';
import { DocumentsApi } from '../api/firestore/documents.api';
import { CategoriesApi } from '../api/firestore/categories.api';
import { Document, Category, DocumentContent } from '@shared/types';
import { Language, useI18n } from '@app/providers/i18n/i18n';

export const useAdminActions = () => {
    const { t } = useI18n();
    const [editingDoc, setEditingDoc] = useState<Partial<Document> | null>(null);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const handleSaveDocument = async (docToSave: Partial<Document>) => {
        try {
            if (docToSave.id) {
                await DocumentsApi.updateMetadata(docToSave.id, docToSave);
            } else {
                await DocumentsApi.create(docToSave);
            }
            setEditingDoc(null);
        } catch (e) {
            console.error('Metadata save failed:', e);
            alert('Помилка збереження метаданих.');
        }
    };

    const handleUpdateContent = async (
        docId: string,
        langToUpdate: Language,
        newContent: DocumentContent
    ) => {
        try {
            await DocumentsApi.updateContent(docId, langToUpdate, newContent);
        } catch (error: any) {
            console.error('CRITICAL: Update failed', error);
            alert('Помилка збереження контенту.');
            throw error;
        }
    };

    const handleSaveCategory = async (catToSave: Category) => {
        try {
            await CategoriesApi.createOrUpdate(catToSave);
            setEditingCategory(null);
        } catch (e) {
            console.error('Category save failed:', e);
            alert('Помилка збереження категорії.');
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (window.confirm('Видалити категорію?')) {
            try {
                await CategoriesApi.delete(id);
            } catch (e) {
                console.error('Category delete failed:', e);
            }
        }
    };

    const handleDeleteDocument = async (id: string) => {
        if (window.confirm(t('dashboard.confirmDelete'))) {
            try {
                await DocumentsApi.delete(id);
            } catch (e) {
                console.error('Document delete failed:', e);
            }
        }
    };

    return {
        editingDoc,
        setEditingDoc,
        editingCategory,
        setEditingCategory,
        handleSaveDocument,
        handleUpdateContent,
        handleSaveCategory,
        handleDeleteCategory,
        handleDeleteDocument
    };
};
