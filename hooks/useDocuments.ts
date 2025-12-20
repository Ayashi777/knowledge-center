import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Document, Category, Tag, UserRole } from '../types';
import { Language } from '../i18n';

export const useDocuments = (
  currentUserRole: UserRole,
  t: (key: string, params?: any) => string,
  lang: Language
) => {
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
    const unsubDocs = onSnapshot(
      collection(db, 'documents'),
      (snapshot) => {
        const docsData = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Document)
        );
        setDocuments(docsData);
        setIsLoading(false);
      }
    );

    const unsubCats = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        const catsData = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Category)
        );
        setCategories(catsData);
      }
    );
    
    const unsubTags = onSnapshot(
      collection(db, 'tags'),
      (snapshot) => {
        const tagsData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Tag));
        setTags(tagsData);
      }
    );

    return () => {
      unsubDocs();
      unsubCats();
      unsubTags();
    };
  }, []);

  /**
   * ✅ NEW Logic: All categories are visible to everyone in the listing.
   * Permissions will be checked when attempting to VIEW a document.
   */
  const visibleCategories = useMemo(() => {
    return categories;
  }, [categories]);

  const sortedAndFilteredDocs = useMemo(() => {
    // We show all documents that belong to existing categories
    let result = documents.filter((doc) => {
      return categories.some((c) => c.nameKey === doc.categoryKey);
    });

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((doc) =>
        ((doc.titleKey ? t(doc.titleKey) : doc.title) || '')
          .toLowerCase()
          .includes(lowerSearch)
      );
    }

    // Role filter as a UI preference, not an access restriction
    if (selectedRoleFilter) {
      result = result.filter(doc => {
        const cat = categories.find(c => c.nameKey === doc.categoryKey);
        return cat?.viewPermissions?.includes(selectedRoleFilter);
      });
    }

    if (selectedCategory !== null) {
      result = result.filter((doc) => doc.categoryKey === selectedCategory);
    }
    
    if (selectedTags.length > 0) {
      result = result.filter((doc) =>
        selectedTags.every((tagId) => doc.tagIds?.includes(tagId))
      );
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
  }, [
    documents,
    categories,
    searchTerm,
    selectedCategory,
    selectedTags,
    selectedRoleFilter,
    sortBy,
    t
  ]);

  const totalPages = Math.ceil(sortedAndFilteredDocs.length / docsPerPage);

  const paginatedDocs = useMemo(
    () => sortedAndFilteredDocs.slice((currentPage - 1) * docsPerPage, currentPage * docsPerPage),
    [sortedAndFilteredDocs, currentPage, docsPerPage]
  );
  
  const handleTagSelect = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
    setCurrentPage(1);
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSelectedTags([]);
    setSelectedRoleFilter(null);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (currentPage === 0 && totalPages > 0) {
        setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  return {
    documents,
    categories,
    allTags: tags,
    isLoading: isLoading,
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
    visibleCategories,
    sortedAndFilteredDocs,
    clearFilters,
  };
};
