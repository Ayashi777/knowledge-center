import { useState, useMemo, useEffect } from 'react';
import { Document, Category, UserRole, SortBy, ViewMode } from '../types';
import { Language } from '../i18n';
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

export const useDocuments = (currentUserRole: UserRole, t: (key: string) => string, lang: Language) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
    const [sortBy, setSortBy] = useState<SortBy>('recent');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [currentPage, setCurrentPage] = useState(1);

    // --- Real-time Sync with Firestore ---
    useEffect(() => {
        setIsLoading(true);
        
        // Listen to Categories
        const unsubscribeCats = onSnapshot(collection(db, "categories"), (snapshot) => {
            const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[];
            setCategories(cats);
        });

        // Listen to Documents
        const unsubscribeDocs = onSnapshot(collection(db, "documents"), (snapshot) => {
            const docs = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Convert Firestore Timestamp to JS Date
                    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
                };
            }) as Document[];
            setDocuments(docs);
            setIsLoading(false);
        });

        return () => {
            unsubscribeCats();
            unsubscribeDocs();
        };
    }, []);

    const visibleCategories = useMemo(() => {
        return categories.filter(cat => cat.viewPermissions?.includes(currentUserRole));
    }, [categories, currentUserRole]);

    const visibleCategoryKeys = useMemo(() => new Set(visibleCategories.map(c => c.nameKey)), [visibleCategories]);

    const visibleDocuments = useMemo(() => {
        if (currentUserRole === 'guest') return documents;
        return documents.filter(doc => visibleCategoryKeys.has(doc.categoryKey));
    }, [documents, visibleCategoryKeys, currentUserRole]);

    const allTags = useMemo(() => {
        const docsToList = currentUserRole === 'guest' ? documents : visibleDocuments;
        const tags = new Set<string>();
        docsToList.forEach(doc => {
            doc.tags?.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
    }, [visibleDocuments, documents, currentUserRole]);

    const sortedAndFilteredDocs = useMemo(() => {
        let docs = [...visibleDocuments];

        if (selectedCategory) {
            docs = docs.filter(doc => doc.categoryKey === selectedCategory);
        }

        if (selectedTags.size > 0) {
            docs = docs.filter(doc => doc.tags?.some(tag => selectedTags.has(tag)));
        }

        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            docs = docs.filter(doc => {
                const title = doc.titleKey ? t(doc.titleKey) : doc.title || '';
                return title.toLowerCase().includes(lowerSearchTerm) ||
                    t(doc.categoryKey).toLowerCase().includes(lowerSearchTerm) ||
                    doc.tags?.some(tag => tag.toLowerCase().includes(lowerSearchTerm));
            });
        }

        if (sortBy === 'alpha') {
            docs.sort((a, b) => {
                const titleA = a.titleKey ? t(a.titleKey) : a.title || '';
                const titleB = b.titleKey ? t(b.titleKey) : b.title || '';
                return titleA.localeCompare(titleB, lang);
            });
        } else {
            docs.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        }

        return docs;
    }, [searchTerm, visibleDocuments, selectedCategory, selectedTags, t, sortBy, lang]);

    const ITEMS_PER_PAGE = viewMode === 'grid' ? 9 : 10;
    const totalPages = Math.ceil(sortedAndFilteredDocs.length / ITEMS_PER_PAGE);

    const paginatedDocs = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedAndFilteredDocs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, sortedAndFilteredDocs, ITEMS_PER_PAGE]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory, selectedTags, sortBy, viewMode]);

    const clearFilters = () => {
        setSelectedCategory(null);
        setSelectedTags(new Set());
        setSearchTerm('');
    };

    const handleTagSelect = (tagName: string) => {
        setSelectedTags(prev => {
            const newTags = new Set(prev);
            if (newTags.has(tagName)) newTags.delete(tagName);
            else newTags.add(tagName);
            return newTags;
        });
    };

    return {
        documents, setDocuments,
        categories, setCategories,
        isLoading,
        searchTerm, setSearchTerm,
        selectedCategory, setSelectedCategory,
        selectedTags, handleTagSelect,
        sortBy, setSortBy,
        viewMode, setViewMode,
        currentPage, setCurrentPage,
        totalPages, paginatedDocs,
        visibleCategories, allTags,
        sortedAndFilteredDocs,
        clearFilters
    };
};
