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
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
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

  const visibleCategories = useMemo(() => {
    if (currentUserRole === 'admin') return categories;
    return categories.filter(
      (cat) => cat.viewPermissions?.includes(currentUserRole)
    );
  }, [categories, currentUserRole]);

  const sortedAndFilteredDocs = useMemo(() => {
    let result = documents.filter((doc) => {
      const category = categories.find((c) => c.nameKey === doc.categoryKey);
      return category && visibleCategories.some((vc) => vc.id === category.id);
    });

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((doc) =>
        ((doc.titleKey ? t(doc.titleKey) : doc.title) || '')
          .toLowerCase()
          .includes(lowerSearch)
      );
    }

    if (selectedCategory !== 'all') {
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
    visibleCategories,
    searchTerm,
    selectedCategory,
    selectedTags,
    sortBy,
    t,
    categories
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
    setSelectedCategory('all');
    setSelectedTags([]);
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
