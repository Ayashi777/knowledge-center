import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserRole } from '@shared/types';
import { useCategories } from '@entities/category/model/useCategories';
import { useTags } from '@entities/tag/model/useTags';
import { useDocuments } from '@entities/document/model/useDocuments';

export const useDocumentManagement = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // -- URL State Accessors --
    const searchTerm = searchParams.get('q') || '';
    const selectedCategoryKeys = useMemo(() => searchParams.getAll('category'), [searchParams]);
    const selectedRoles = useMemo(() => searchParams.getAll('role') as UserRole[], [searchParams]);
    const selectedTagIds = useMemo(() => searchParams.getAll('tag'), [searchParams]);
    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    
    // UI-only state
    const [sortBy, setSortBy] = useState<'recent' | 'alpha'>('recent');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    
    const ITEMS_PER_PAGE = 9;

    // -- Multi-select Update Handlers --
    const setSearchTerm = useCallback((q: string) => {
        setSearchParams(prev => {
            if (!q) prev.delete('q');
            else prev.set('q', q);
            prev.set('page', '1');
            return prev;
        }, { replace: true });
    }, [setSearchParams]);

    const handleCategoryToggle = useCallback((categoryKey: string) => {
        setSearchParams(prev => {
            const current = prev.getAll('category');
            prev.delete('category');
            
            const next = current.includes(categoryKey) 
                ? current.filter(k => k !== categoryKey)
                : [...current, categoryKey];
            
            next.forEach(k => prev.append('category', k));
            prev.set('page', '1');
            return prev;
        }, { replace: true });
    }, [setSearchParams]);

    const handleRoleToggle = useCallback((role: UserRole) => {
        setSearchParams(prev => {
            const current = prev.getAll('role');
            prev.delete('role');
            
            const next = current.includes(role) 
                ? current.filter(r => r !== role)
                : [...current, role];
            
            next.forEach(r => prev.append('role', r));
            prev.set('page', '1');
            return prev;
        }, { replace: true });
    }, [setSearchParams]);

    const handleTagToggle = useCallback((tagId: string) => {
        setSearchParams(prev => {
            const current = prev.getAll('tag');
            prev.delete('tag');
            
            const next = current.includes(tagId) 
                ? current.filter(id => id !== tagId)
                : [...current, tagId];
            
            next.forEach(id => prev.append('tag', id));
            prev.set('page', '1');
            return prev;
        }, { replace: true });
    }, [setSearchParams]);

    const setCurrentPage = useCallback((page: number) => {
        setSearchParams(prev => {
            if (page <= 1) prev.delete('page');
            else prev.set('page', page.toString());
            return prev;
        }, { replace: true });
    }, [setSearchParams]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    // -- Data Entities --
    const { categories, isLoading: isCategoriesLoading } = useCategories();
    const { tags, isLoading: isTagsLoading } = useTags();
    
    const { documents, allFetchedDocuments, isLoading: isDocumentsLoading } = useDocuments({
        categories,
        searchTerm,
        selectedCategoryKeys,
        selectedTagIds,
        selectedRoles,
        sortBy
    });

    const isLoading = isCategoriesLoading || isTagsLoading || isDocumentsLoading;

    // -- Pagination Logic --
    const totalPages = Math.ceil(documents.length / ITEMS_PER_PAGE);
    
    useEffect(() => {
        if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage, setCurrentPage]);

    const paginatedDocuments = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return documents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [documents, currentPage]);

    const resetFilters = () => {
        setSearchParams({}, { replace: true });
    };

    return {
        allDocuments: allFetchedDocuments,
        categories,
        allTags: tags,
        isLoading,
        
        searchTerm,
        setSearchTerm,
        selectedCategories: selectedCategoryKeys,
        handleCategoryToggle,
        selectedTags: selectedTagIds,
        handleTagSelect: handleTagToggle,
        selectedRoles,
        handleRoleToggle,
        clearFilters: resetFilters,
        
        sortBy,
        setSortBy,
        viewMode,
        setViewMode,
        
        currentPage,
        setCurrentPage,
        totalPages,
        
        sortedAndFilteredDocs: documents,
        paginatedDocs: paginatedDocuments,
        visibleCategories: categories,
        
        actions: {
            // ... (keep actions)
        }
    };
};
