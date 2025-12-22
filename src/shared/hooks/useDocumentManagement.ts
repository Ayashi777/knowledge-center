import { useState, useEffect, useMemo } from 'react';
import { DocumentsApi } from '@shared/api/firestore/documents.api';
import { Document, Category, Tag, UserRole } from '@shared/types';
import { CategoriesApi } from '@shared/api/firestore/categories.api';
import { TagsApi } from '@shared/api/firestore/tags.api';
import { useI18n } from '@app/providers/i18n/i18n';
import { normalizeCategoryKey } from '@shared/lib/utils/format';

export const useDocumentManagement = () => {
    const { t } = useI18n();
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

    // Reset to page 1 when any filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, selectedTags, selectedRoleFilter, sortBy]);

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
    };

    const catByKey = useMemo(() => {
        const m = new Map<string, Category>();
        categories.forEach(c => {
            const normKey = normalizeCategoryKey(c.nameKey);
            m.set(normKey, c);
        });
        return m;
    }, [categories]);

    const sortedAndFilteredDocs = useMemo(() => {
        let result = documents.filter(doc => {
            const displayTitle = doc.titleKey ? t(doc.titleKey) : doc.title || '';
            const matchesSearch = 
                displayTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
                doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const normDocCat = normalizeCategoryKey(doc.categoryKey);
            const normSelectedCat = normalizeCategoryKey(selectedCategory);
            const matchesCategory = selectedCategory === 'all' || normDocCat === normSelectedCat;
            
            const matchesTags = selectedTags.length === 0 || 
                               selectedTags.every(tagId => doc.tagIds?.includes(tagId));
            
            const matchesRole = (d: Document) => {
                if (selectedRoleFilter === 'all') return true;
                const normKey = normalizeCategoryKey(d.categoryKey);
                const cat = catByKey.get(normKey);
                return !!cat?.viewPermissions?.includes(selectedRoleFilter as UserRole);
            };
            
            return matchesSearch && matchesCategory && matchesTags && matchesRole(doc);
        });

        // Sorting
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

        return result;
    }, [documents, searchTerm, selectedCategory, selectedTags, selectedRoleFilter, sortBy, catByKey, t]);

    // Pagination
    const totalPages = Math.ceil(sortedAndFilteredDocs.length / docsPerPage);
    const paginatedDocs = useMemo(() => {
        const start = (currentPage - 1) * docsPerPage;
        return sortedAndFilteredDocs.slice(start, start + docsPerPage);
    }, [sortedAndFilteredDocs, currentPage]);

    // Show all categories in the filter (Main behavior)
    const visibleCategories = categories;

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
