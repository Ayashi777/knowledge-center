import { useState, useEffect, useMemo } from 'react';
import { DocumentsApi } from '@shared/api/firestore/documents.api';
import { Document, Category, Tag, Language, UserRole } from '@shared/types';
import { CategoriesApi } from '@shared/api/firestore/categories.api';
import { TagsApi } from '@shared/api/firestore/tags.api';

export const useDocumentManagement = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters & UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedRoleFilter, setSelectedRoleFilter] = useState<UserRole | 'all'>('all');
    const [sortBy, setSortBy] = useState<'recent' | 'alpha'>('recent');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const docsPerPage = 9;

    useEffect(() => {
        setIsLoading(true);
        
        const unsubDocs = DocumentsApi.subscribeAll(
            (docs) => {
                setDocuments(docs);
                setIsLoading(false);
            },
            (err) => {
                console.error("Error fetching documents:", err);
                setError(err.message);
                setIsLoading(false);
            }
        );

        const unsubCats = CategoriesApi.subscribeAll(setCategories);
        const unsubTags = TagsApi.subscribeAll(setTags);

        return () => {
            unsubDocs();
            unsubCats();
            unsubTags();
        };
    }, []);

    const handleTagSelect = (tagId: string) => {
        setSelectedTags(prev => 
            prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
        );
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setSelectedTags([]);
        setSelectedRoleFilter('all');
        setCurrentPage(1);
    };

    const sortedAndFilteredDocs = useMemo(() => {
        let result = documents.filter(doc => {
            const matchesSearch = 
                doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (doc.titleKey && doc.titleKey.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesCategory = selectedCategory === 'all' || doc.categoryKey === selectedCategory;
            
            const matchesTags = selectedTags.length === 0 || 
                               selectedTags.every(tagId => doc.tagIds?.includes(tagId));
            
            const matchesRole = selectedRoleFilter === 'all' || 
                               doc.viewPermissions?.includes(selectedRoleFilter as UserRole);
            
            return matchesSearch && matchesCategory && matchesTags && matchesRole;
        });

        // Sorting
        result.sort((a, b) => {
            if (sortBy === 'recent') {
                const dateA = a.updatedAt?.toDate?.() || new Date(a.updatedAt) || 0;
                const dateB = b.updatedAt?.toDate?.() || new Date(b.updatedAt) || 0;
                return dateB - dateA;
            } else {
                const titleA = a.title || a.titleKey || '';
                const titleB = b.title || b.titleKey || '';
                return titleA.localeCompare(titleB);
            }
        });

        return result;
    }, [documents, searchTerm, selectedCategory, selectedTags, selectedRoleFilter, sortBy]);

    // Pagination
    const totalPages = Math.ceil(sortedAndFilteredDocs.length / docsPerPage);
    const paginatedDocs = useMemo(() => {
        const start = (currentPage - 1) * docsPerPage;
        return sortedAndFilteredDocs.slice(start, start + docsPerPage);
    }, [sortedAndFilteredDocs, currentPage]);

    // Categories that have documents (for filtering)
    const visibleCategories = useMemo(() => {
        const usedKeys = new Set(documents.map(d => d.categoryKey));
        return categories.filter(c => usedKeys.has(c.nameKey));
    }, [categories, documents]);

    return {
        documents,
        categories,
        allTags: tags,
        isLoading,
        error,
        
        // Filter state & actions
        searchTerm,
        setSearchTerm,
        selectedCategory,
        setSelectedCategory,
        selectedTags,
        handleTagSelect,
        selectedRoleFilter,
        setSelectedRoleFilter,
        clearFilters,
        
        // UI State
        sortBy,
        setSortBy,
        viewMode,
        setViewMode,
        
        // Pagination
        currentPage,
        setCurrentPage,
        totalPages,
        
        // Processed data
        sortedAndFilteredDocs,
        paginatedDocs,
        visibleCategories,
        
        actions: {
            createDocument: DocumentsApi.create,
            updateDocument: DocumentsApi.updateMetadata,
            updateContent: DocumentsApi.updateContent,
            deleteDocument: DocumentsApi.delete
        }
    };
};
