import { useState, useEffect, useMemo } from 'react';
import { Document, Category, UserRole } from '@shared/types';
import { DocumentsApi } from '@shared/api/firestore/documents.api';
import { normalizeCategoryKey } from '@shared/lib/utils/format';
import { useI18n } from '@app/providers/i18n/i18n';
import { useAuth } from '@app/providers/AuthProvider';

interface UseDocumentsProps {
    categories: Category[];
    searchTerm: string;
    selectedCategoryKeys: string[];
    selectedTagIds: string[];
    selectedRoles: UserRole[];
    sortBy: 'recent' | 'alpha';
}

export const useDocuments = ({
    categories,
    searchTerm,
    selectedCategoryKeys,
    selectedTagIds,
    selectedRoles,
    sortBy
}: UseDocumentsProps) => {
    const { t } = useI18n();
    const { role: currentUserRole } = useAuth();
    
    const [rawDocuments, setRawDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 🔥 Fetch documents. For multi-select, we handle filtering on the client 
    // to avoid complex Firestore index requirements for dynamic 'array-contains-any' combinations.
    useEffect(() => {
        setIsLoading(true);
        
        const unsubscribe = DocumentsApi.subscribeFiltered(
            { 
                sortBy: sortBy,
                limitCount: 500 
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
    }, [sortBy]);

    const categoryMap = useMemo(() => {
        const map = new Map<string, Category>();
        categories.forEach(category => {
            map.set(normalizeCategoryKey(category.nameKey), category);
        });
        return map;
    }, [categories]);

    // 🔥 Multi-select Filtering Logic
    const filteredAndSorted = useMemo(() => {
        let result = rawDocuments.filter(document => {
            const documentCategoryKey = normalizeCategoryKey(document.categoryKey);
            
            // 1. Admin/Category Validation
            const isValidCategory = categories.some(cat => normalizeCategoryKey(cat.nameKey) === documentCategoryKey);
            if (!isValidCategory && currentUserRole !== 'admin') return false;

            // 2. Multi-Category Filter (OR logic)
            if (selectedCategoryKeys.length > 0) {
                const isMatch = selectedCategoryKeys.some(key => 
                    normalizeCategoryKey(key) === documentCategoryKey
                );
                if (!isMatch) return false;
            }

            // 3. Multi-Role Filter (OR logic)
            if (selectedRoles.length > 0) {
                const category = categoryMap.get(documentCategoryKey);
                const isMatch = selectedRoles.some(role => {
                    const hasDocAccess = document.viewPermissions?.includes(role);
                    const hasCategoryAccess = category?.viewPermissions?.includes(role);
                    
                    // If document has its own permissions, they take priority
                    if (document.viewPermissions && document.viewPermissions.length > 0) {
                        return hasDocAccess;
                    }
                    // Otherwise check category
                    return hasCategoryAccess;
                });
                
                if (!isMatch) return false;
            }

            // 4. Tags Filter (AND logic)
            if (selectedTagIds.length > 0) {
                const matchesTags = selectedTagIds.every(tagId => document.tagIds?.includes(tagId));
                if (!matchesTags) return false;
            }

            // 5. Search Refinement
            if (searchTerm) {
                const displayTitle = document.titleKey ? t(document.titleKey) : document.title || '';
                const matchesSearch = displayTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                     document.description?.toLowerCase().includes(searchTerm.toLowerCase());
                if (!matchesSearch) return false;
            }

            return true;
        });

        // 6. Final Client Sorting
        return result.sort((a, b) => {
            if (sortBy === 'recent') {
                return (b.updatedAt?.toMillis?.() || 0) - (a.updatedAt?.toMillis?.() || 0);
            } else {
                const titleA = (a.titleKey ? t(a.titleKey) : a.title || '').toLowerCase();
                const titleB = (b.titleKey ? t(b.titleKey) : b.title || '').toLowerCase();
                return titleA.localeCompare(titleB);
            }
        });
    }, [rawDocuments, categories, searchTerm, selectedTagIds, selectedCategoryKeys, selectedRoles, sortBy, t, categoryMap, currentUserRole]);

    return {
        documents: filteredAndSorted,
        allFetchedDocuments: rawDocuments,
        isLoading
    };
};
