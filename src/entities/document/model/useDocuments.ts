import { useState, useEffect, useMemo } from 'react';
import { Document, Category, UserRole } from '@shared/types';
import { DocumentsApi } from '@shared/api/firestore/documents.api';
import { normalizeCategoryKey } from '@shared/lib/utils/format';
import { useI18n } from '@app/providers/i18n/i18n';

interface UseDocumentsProps {
    categories: Category[];
    searchTerm: string;
    selectedCategoryKey: string;
    selectedTagIds: string[];
    selectedRoleFilter: UserRole | 'all';
    sortBy: 'recent' | 'alpha';
}

export const useDocuments = ({
    categories,
    searchTerm,
    selectedCategoryKey,
    selectedTagIds,
    selectedRoleFilter,
    sortBy
}: UseDocumentsProps) => {
    const { t } = useI18n();
    const [rawDocuments, setRawDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const unsubscribe = DocumentsApi.subscribeFiltered(
            { 
                categoryKey: selectedCategoryKey !== 'all' ? selectedCategoryKey : undefined,
                sortBy: sortBy,
                limitCount: 150 
            },
            (fetchedDocs) => {
                setRawDocuments(fetchedDocs);
                setIsLoading(false);
            },
            (error) => {
                console.error("[useDocuments] Subscription failed:", error);
                setIsLoading(false);
            }
        );
        return unsubscribe;
    }, [selectedCategoryKey, sortBy]);

    const categoryMap = useMemo(() => {
        const map = new Map<string, Category>();
        categories.forEach(category => {
            map.set(normalizeCategoryKey(category.nameKey), category);
        });
        return map;
    }, [categories]);

    const processedDocuments = useMemo(() => {
        return rawDocuments.filter(document => {
            const documentCategoryKey = normalizeCategoryKey(document.categoryKey);
            
            // 1. Validation: Hide documents with orphaned categories
            const isValidCategory = categories.some(cat => normalizeCategoryKey(cat.nameKey) === documentCategoryKey);
            if (!isValidCategory) return false;

            // 2. Search Filter
            const displayTitle = document.titleKey ? t(document.titleKey) : document.title || '';
            const matchesSearch = displayTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 document.description?.toLowerCase().includes(searchTerm.toLowerCase());
            if (!matchesSearch) return false;

            // 3. Category Filter
            const matchesCategory = selectedCategoryKey === 'all' || documentCategoryKey === normalizeCategoryKey(selectedCategoryKey);
            if (!matchesCategory) return false;

            // 4. Tags Filter
            const matchesTags = selectedTagIds.length === 0 || 
                               selectedTagIds.every(tagId => document.tagIds?.includes(tagId));
            if (!matchesTags) return false;

            // 5. Role Filter
            if (selectedRoleFilter !== 'all') {
                const category = categoryMap.get(documentCategoryKey);
                if (!category?.viewPermissions?.includes(selectedRoleFilter as UserRole)) return false;
            }

            return true;
        });
    }, [rawDocuments, categories, searchTerm, selectedCategoryKey, selectedTagIds, selectedRoleFilter, t, categoryMap]);

    const sortedDocuments = useMemo(() => {
        const result = [...processedDocuments];
        result.sort((a, b) => {
            if (sortBy === 'recent') {
                const timeA = a.updatedAt?.toMillis?.() || 0;
                const timeB = b.updatedAt?.toMillis?.() || 0;
                return timeB - timeA;
            } else {
                const titleA = a.titleKey ? t(a.titleKey) : a.title || '';
                const titleB = b.titleKey ? t(b.titleKey) : b.title || '';
                return titleA.localeCompare(titleB);
            }
        });
        return result;
    }, [processedDocuments, sortBy, t]);

    return {
        documents: sortedDocuments,
        allFetchedDocuments: rawDocuments,
        isLoading
    };
};
