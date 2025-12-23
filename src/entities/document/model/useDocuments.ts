import { useState, useEffect, useMemo, useCallback } from 'react';
import { Document, Category, UserRole } from '@shared/types';
import { DocumentsApi } from '@shared/api/firestore/documents.api';
import { normalizeCategoryKey } from '@shared/lib/utils/format';
import { useI18n } from '@app/providers/i18n/i18n';
import { useAuth } from '@app/providers/AuthProvider';

interface UseDocumentsProps {
    categories: Category[];
    searchTerm: string;
    selectedCategoryKey: string | null;
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
    const { role: currentUserRole } = useAuth();
    
    const [rawDocuments, setRawDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 🔥 Server-side filtering + Real-time sync
    useEffect(() => {
        setIsLoading(true);
        
        // We only filter by Category on server side for now to keep real-time complex filters working
        const unsubscribe = DocumentsApi.subscribeFiltered(
            { 
                categoryKey: selectedCategoryKey && selectedCategoryKey !== 'all' ? selectedCategoryKey : undefined,
                sortBy: sortBy,
                limitCount: 200 // Reasonable limit for performance
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

        return () => unsubscribe();
    }, [selectedCategoryKey, sortBy]);

    const categoryMap = useMemo(() => {
        const map = new Map<string, Category>();
        categories.forEach(category => {
            map.set(normalizeCategoryKey(category.nameKey), category);
        });
        return map;
    }, [categories]);

    // 🔥 Client-side Refinement (Search, Tags, Roles)
    // This provides instant feedback without hitting Firestore for every keystroke
    const filteredAndSorted = useMemo(() => {
        let result = rawDocuments.filter(document => {
            const documentCategoryKey = normalizeCategoryKey(document.categoryKey);
            
            // 1. Admin/Category Validation
            const isValidCategory = categories.some(cat => normalizeCategoryKey(cat.nameKey) === documentCategoryKey);
            if (!isValidCategory && currentUserRole !== 'admin') return false;

            // 2. Search Refinement
            if (searchTerm) {
                const displayTitle = document.titleKey ? t(document.titleKey) : document.title || '';
                const matchesSearch = displayTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                     document.description?.toLowerCase().includes(searchTerm.toLowerCase());
                if (!matchesSearch) return false;
            }

            // 3. Tags Refinement
            if (selectedTagIds.length > 0) {
                const matchesTags = selectedTagIds.every(tagId => document.tagIds?.includes(tagId));
                if (!matchesTags) return false;
            }

            // 4. Role Refinement
            if (selectedRoleFilter !== 'all') {
                const category = categoryMap.get(documentCategoryKey);
                // Check if role has access to category OR specifically to this document
                const hasCategoryAccess = category?.viewPermissions?.includes(selectedRoleFilter as UserRole);
                const hasDocAccess = document.viewPermissions?.includes(selectedRoleFilter as UserRole);
                if (!hasCategoryAccess && !hasDocAccess) return false;
            }

            return true;
        });

        // 5. Final Client Sorting (to ensure UI is 100% sync)
        return result.sort((a, b) => {
            if (sortBy === 'recent') {
                return (b.updatedAt?.toMillis?.() || 0) - (a.updatedAt?.toMillis?.() || 0);
            } else {
                const titleA = (a.titleKey ? t(a.titleKey) : a.title || '').toLowerCase();
                const titleB = (b.titleKey ? t(b.titleKey) : b.title || '').toLowerCase();
                return titleA.localeCompare(titleB);
            }
        });
    }, [rawDocuments, categories, searchTerm, selectedTagIds, selectedRoleFilter, sortBy, t, categoryMap, currentUserRole]);

    return {
        documents: filteredAndSorted,
        allFetchedDocuments: rawDocuments,
        isLoading
    };
};
