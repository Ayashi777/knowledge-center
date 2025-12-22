import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserRole } from '@shared/types';
import { DocumentsApi } from '@shared/api/firestore/documents.api';
import { useCategories } from '@entities/category/model/useCategories';
import { useTags } from '@entities/tag/model/useTags';
import { useDocuments } from '@entities/document/model/useDocuments';

export const useDocumentManagement = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // -- URL State Accessors (Single Source of Truth) --
    const searchTerm = searchParams.get('q') || '';
    const selectedCategoryKey = searchParams.get('category') || 'all';
    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    
    // UI-only state (doesn't necessarily need to be in URL)
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
    const [selectedRoleFilter, setSelectedRoleFilter] = useState<UserRole | 'all'>('all');
    const [sortBy, setSortBy] = useState<'recent' | 'alpha'>('recent');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    
    const ITEMS_PER_PAGE = 9;

    // -- Update Handlers (Updating URL instead of local state) --
    const setSearchTerm = useCallback((q: string) => {
        setSearchParams(prev => {
            if (!q) prev.delete('q');
            else prev.set('q', q);
            prev.set('page', '1'); // Reset page on search
            return prev;
        }, { replace: true });
    }, [setSearchParams]);

    const setSelectedCategory = useCallback((category: string) => {
        setSearchParams(prev => {
            if (category === 'all') prev.delete('category');
            else prev.set('category', category);
            prev.set('page', '1'); // Reset page on category change
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

    // Auto-scroll to top when page changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    // -- Data Entities --
    const { categories, isLoading: isCategoriesLoading } = useCategories();
    const { tags, isLoading: isTagsLoading } = useTags();
    const { documents, allFetchedDocuments, isLoading: isDocumentsLoading } = useDocuments({
        categories,
        searchTerm,
        selectedCategoryKey,
        selectedTagIds,
        selectedRoleFilter,
        sortBy
    });

    const isLoading = isCategoriesLoading || isTagsLoading || isDocumentsLoading;

    // -- Pagination Logic --
    const totalPages = Math.ceil(documents.length / ITEMS_PER_PAGE);
    
    // Correction: if current page is beyond total pages (after filter)
    useEffect(() => {
        if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage, setCurrentPage]);

    const paginatedDocuments = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return documents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [documents, currentPage]);

    const handleTagToggle = (tagId: string) => {
        setSelectedTagIds(prevIds => 
            prevIds.includes(tagId) ? prevIds.filter(id => id !== tagId) : [...prevIds, tagId]
        );
    };

    const resetFilters = () => {
        setSearchParams({}, { replace: true });
        setSelectedTagIds([]);
        setSelectedRoleFilter('all');
    };

    return {
        // Data
        allDocuments: allFetchedDocuments,
        categories,
        allTags: tags,
        isLoading,
        
        // Search & Filters
        searchTerm,
        setSearchTerm,
        selectedCategory: selectedCategoryKey,
        setSelectedCategory,
        selectedTags: selectedTagIds,
        handleTagSelect: handleTagToggle,
        selectedRoleFilter,
        setSelectedRoleFilter,
        clearFilters: resetFilters,
        
        // UI State
        sortBy,
        setSortBy,
        viewMode,
        setViewMode,
        
        // Pagination
        currentPage,
        setCurrentPage,
        totalPages,
        
        // Processed Results
        sortedAndFilteredDocs: documents,
        paginatedDocs: paginatedDocuments,
        visibleCategories: categories,
        
        // Actions
        actions: {
            createDocument: DocumentsApi.create,
            updateDocument: DocumentsApi.updateMetadata,
            updateContent: DocumentsApi.updateContent,
            deleteDocument: DocumentsApi.delete
        }
    };
};
