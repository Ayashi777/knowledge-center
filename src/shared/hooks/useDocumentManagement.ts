import { useState, useEffect, useMemo, useCallback } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@shared/api/firebase/firebase';
import { Document, Category, Tag, UserRole } from '@shared/types';
import { useI18n } from '@app/providers/i18n/i18n';
import { useAuth } from '@app/providers/AuthProvider';

export const useDocumentManagement = () => {
  const { t } = useI18n();
  const { role: currentUserRole } = useAuth();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<UserRole | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'alpha'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [currentPage, setCurrentPage] = useState(1);
  const docsPerPage = 9;

  useEffect(() => {
    setIsLoading(true);
    const unsubDocs = onSnapshot(collection(db, 'documents'), (snapshot) => {
      setDocuments(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Document)));
      setIsLoading(false);
    });
    const unsubCats = onSnapshot(collection(db, 'categories'), (snapshot) => {
      setCategories(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Category)));
    });
    const unsubTags = onSnapshot(collection(db, 'tags'), (snapshot) => {
      setTags(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Tag)));
    });
    return () => { unsubDocs(); unsubCats(); unsubTags(); };
  }, []);

  const sortedAndFilteredDocs = useMemo(() => {
    let result = documents.filter((doc) => categories.some((c) => c.nameKey === doc.categoryKey));
    
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((doc) =>
        ((doc.titleKey ? t(doc.titleKey) : doc.title) || '').toLowerCase().includes(lowerSearch)
      );
    }
    
    if (selectedRoleFilter) {
      result = result.filter(doc => categories.find(c => c.nameKey === doc.categoryKey)?.viewPermissions?.includes(selectedRoleFilter));
    } else if (currentUserRole !== 'admin') {
      // If not admin and no specific filter, only show what user can see based on their role
      result = result.filter(doc => {
         const cat = categories.find(c => c.nameKey === doc.categoryKey);
         return !cat || cat.viewPermissions?.includes(currentUserRole || 'guest');
      });
    }

    if (selectedCategory !== null) {
      result = result.filter((doc) => doc.categoryKey === selectedCategory);
    }
    
    if (selectedTags.length > 0) {
      result = result.filter((doc) => selectedTags.every((tagId) => doc.tagIds?.includes(tagId)));
    }
    
    result.sort((a, b) => {
      if (sortBy === 'alpha') {
        const titleA = (a.titleKey ? t(a.titleKey) : a.title) || '';
        const titleB = (b.titleKey ? t(b.titleKey) : b.title) || '';
        return titleA.localeCompare(titleB);
      }
      return (b.updatedAt?.toMillis() || 0) - (a.updatedAt?.toMillis() || 0);
    });
    return result;
  }, [documents, categories, searchTerm, selectedCategory, selectedTags, selectedRoleFilter, sortBy, t, currentUserRole]);

  const totalPages = Math.ceil(sortedAndFilteredDocs.length / docsPerPage);
  const paginatedDocs = useMemo(() => 
    sortedAndFilteredDocs.slice((currentPage - 1) * docsPerPage, currentPage * docsPerPage), 
  [sortedAndFilteredDocs, currentPage]);

  const handleTagSelect = useCallback((tagId: string) => {
    setSelectedTags((prev) => prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]);
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm(''); 
    setSelectedCategory(null); 
    setSelectedTags([]); 
    setSelectedRoleFilter(null); 
    setCurrentPage(1);
  }, []);

  return {
    documents, 
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
    sortBy, 
    setSortBy,
    viewMode, 
    setViewMode,
    currentPage, 
    setCurrentPage, 
    totalPages,
    paginatedDocs, 
    sortedAndFilteredDocs,
    clearFilters,
    visibleCategories: categories
  };
};
