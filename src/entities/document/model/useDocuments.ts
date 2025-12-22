import { useState, useEffect, useMemo } from 'react';
import { Document, Category, UserRole } from '@shared/types';
import { DocumentsApi } from '@shared/api/firestore/documents.api';
import { normalizeCategoryKey } from '@shared/lib/utils/format';
import { useI18n } from '@app/providers/i18n/i18n';

interface UseDocumentsProps {
    categories: Category[];
    searchTerm: string;
    selectedCategory: string;
    selectedTags: string[];
    selectedRoleFilter: UserRole | 'all';
    sortBy: 'recent' | 'alpha';
}

export const useDocuments = ({
    categories,
    searchTerm,
    selectedCategory,
    selectedTags,
    selectedRoleFilter,
    sortBy
}: UseDocumentsProps) => {
    const { t } = useI18n();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        // Впроваджуємо ліміт та серверне сортування
        const unsub = DocumentsApi.subscribeFiltered(
            { 
                categoryKey: selectedCategory !== 'all' ? selectedCategory : undefined,
                sortBy: sortBy,
                limitCount: 100 // Завантажуємо перші 100 документів (для нашого масштабу це ідеально)
            },
            (docs) => {
                setDocuments(docs);
                setIsLoading(false);
            },
            (err) => {
                console.error("Firestore error:", err);
                setIsLoading(false);
            }
        );
        return unsub;
    }, [selectedCategory, sortBy]); // Тепер сортування теж може відбуватися на сервері

    const catByKey = useMemo(() => {
        const m = new Map<string, Category>();
        categories.forEach(c => {
            m.set(normalizeCategoryKey(c.nameKey), c);
        });
        return m;
    }, [categories]);

    const filteredDocs = useMemo(() => {
        return documents.filter(doc => {
            const normDocCat = normalizeCategoryKey(doc.categoryKey);
            const categoryExists = categories.some(c => normalizeCategoryKey(c.nameKey) === normDocCat);
            if (!categoryExists) return false;

            const displayTitle = doc.titleKey ? t(doc.titleKey) : doc.title || '';
            const matchesSearch = displayTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
            if (!matchesSearch) return false;

            const matchesCategory = selectedCategory === 'all' || normDocCat === normalizeCategoryKey(selectedCategory);
            if (!matchesCategory) return false;

            const matchesTags = selectedTags.length === 0 || 
                               selectedTags.every(tagId => doc.tagIds?.includes(tagId));
            if (!matchesTags) return false;

            if (selectedRoleFilter !== 'all') {
                const cat = catByKey.get(normDocCat);
                if (!cat?.viewPermissions?.includes(selectedRoleFilter as UserRole)) return false;
            }

            return true;
        });
    }, [documents, categories, searchTerm, selectedCategory, selectedTags, selectedRoleFilter, t, catByKey]);

    // Клієнтське сортування залишаємо як fallback для пошукових результатів
    const sortedDocs = useMemo(() => {
        const result = [...filteredDocs];
        if (searchTerm) { // Тільки якщо є пошук, бо сервер не знає про нього
            result.sort((a, b) => {
                if (sortBy === 'recent') {
                    const dateA = a.updatedAt?.toDate?.() || new Date(a.updatedAt) || 0;
                    const dateB = b.updatedAt?.toDate?.() || new Date(b.updatedAt) || 0;
                    return (dateB as any) - (dateA as any);
                } else {
                    const titleA = a.titleKey ? t(a.titleKey) : a.title || '';
                    const titleB = b.titleKey ? t(b.titleKey) : b.title || '';
                    return titleA.localeCompare(titleB);
                }
            });
        }
        return result;
    }, [filteredDocs, sortBy, t, searchTerm]);

    return {
        documents: sortedDocs,
        allDocuments: documents,
        isLoading
    };
};
