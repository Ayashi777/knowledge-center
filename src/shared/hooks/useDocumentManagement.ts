import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { UserRole } from '@shared/types';
import { DocumentsApi } from '@shared/api/firestore/documents.api';
import { useCategories } from '@entities/category/model/useCategories';
import { useTags } from '@entities/tag/model/useTags';
import { useDocuments } from '@entities/document/model/useDocuments';

export const useDocumentManagement = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // -- State Helpers (Reading from URL or Defaults) --
    const getParam = (key: string, defaultValue: string) => searchParams.get(key) || defaultValue;
    
    // UI State synced with URL where applicable
    const [searchTerm, setSearchTerm] = useState(() => getParam('q', ''));
    const [selectedCategory, setSelectedCategory] = useState(() => getParam('category', 'all'));
    const [currentPage, setCurrentPage] = useState(() => parseInt(getParam('page', '1'), 10));
    
    // Other UI State (can be kept local or also synced if needed)
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedRoleFilter, setSelectedRoleFilter] = useState<UserRole | 'all'>('all');
    const [sortBy, setSortBy] = useState<'recent' | 'alpha'>('recent');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    
    const docsPerPage = 9;

    // -- URL Synchronization --
    useEffect(() => {
        const params: Record<string, string> = {};
        if (searchTerm) params.q = searchTerm;
        if (selectedCategory !== 'all') params.category = selectedCategory;
        if (currentPage > 1) params.page = currentPage.toString();
        
        // Update URL without breaking the history stack too much (replace: true optional)
        setSearchParams(params, { replace: true });
    }, [searchTerm, selectedCategory, currentPage, setSearchParams]);

    // Handle back/forward buttons or manual URL edits
    useEffect(() => {
        const q = getParam('q', '');
        const cat = getParam('category', 'all');
        const pg = parseInt(getParam('page', '1'), 10);

        if (q !== searchTerm) setSearchTerm(q);
        if (cat !== selectedCategory) setSelectedCategory(cat);
        if (pg !== currentPage) setCurrentPage(pg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // -- Entities --
    const { categories, isLoading: isCatsLoading } = useCategories();
    const { tags, isLoading: isTagsLoading } = useTags();
    const { documents, allDocuments, isLoading: isDocsLoading } = useDocuments({
        categories,
        searchTerm,
        selectedCategory,
        selectedTags,
        selectedRoleFilter,
        sortBy
    });

    const isLoading = isCatsLoading || isTagsLoading || isDocsLoading;

    // -- Pagination logic --
    const totalPages = Math.ceil(documents.length / docsPerPage);
    
    useEffect(() => {
        if (totalPages > 0 && currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const paginatedDocs = useMemo(() => {
        const start = (currentPage - 1) * docsPerPage;
        return documents.slice(start, start + docsPerPage);
    }, [documents, currentPage]);

    // Reset page on filter change (except when page itself changes)
    useEffect(() => {
        // We only reset if it's a filter change, not a manual page change from URL
        const q = getParam('q', '');
        const cat = getParam('category', 'all');
        if (searchTerm !== q || selectedCategory !== cat) {
            setCurrentPage(1);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchTerm, selectedCategory]);

    const handleTagSelect = (tagId: string) => {
        setSelectedTags(prev => 
            prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
        );
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setSelectedTags([]);
        setSelectedRoleFilter('all');
        setCurrentPage(1);
    };

    return {
        documents: allDocuments,
        categories,
        allTags: tags,
        isLoading,
        
        searchTerm,
        setSearchTerm,
        selectedCategory,
        setSelectedCategory,
        selectedTags,
        handleTagSelect,
        selectedRoleFilter,
        setSelectedRoleFilter,
        clearFilters,
        
        sortBy,
        setSortBy,
        viewMode,
        setViewMode,
        
        currentPage,
        setCurrentPage,
        totalPages,
        
        sortedAndFilteredDocs: documents,
        paginatedDocs,
        visibleCategories: categories,
        
        actions: {
            createDocument: DocumentsApi.create,
            updateDocument: DocumentsApi.updateMetadata,
            updateContent: DocumentsApi.updateContent,
            deleteDocument: DocumentsApi.delete
        }
    };
};
