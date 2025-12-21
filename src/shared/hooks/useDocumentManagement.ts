import { useState, useEffect, useMemo } from 'react';
import { DocumentsApi } from '@shared/api/firestore/documents.api';
import { Document, Category, Tag, Language } from '@shared/types';
import { CategoriesApi } from '@shared/api/firestore/categories.api';
import { TagsApi } from '@shared/api/firestore/tags.api';

export const useDocumentManagement = () => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    useEffect(() => {
        setLoading(true);
        
        // Real-time subscription for documents
        const unsubDocs = DocumentsApi.subscribeAll(
            (docs) => {
                setDocuments(docs);
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching documents:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        // Real-time subscription for categories
        const unsubCats = CategoriesApi.subscribeAll((cats) => {
            setCategories(cats);
        });

        // Real-time subscription for tags
        const unsubTags = TagsApi.subscribeAll((ts) => {
            setTags(ts);
        });

        return () => {
            unsubDocs();
            unsubCats();
            unsubTags();
        };
    }, []);

    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            const matchesSearch = doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
            // Виправлено: використовуємо categoryKey замість categoryId
            const matchesCategory = selectedCategory === 'all' || doc.categoryKey === selectedCategory;
            const matchesTags = selectedTags.length === 0 || 
                             selectedTags.every(tagId => doc.tagIds?.includes(tagId));
            
            return matchesSearch && matchesCategory && matchesTags;
        });
    }, [documents, searchQuery, selectedCategory, selectedTags]);

    const handleCreateDocument = async (data: Partial<Document>) => {
        try {
            await DocumentsApi.create(data);
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const handleUpdateDocument = async (id: string, data: Partial<Document>) => {
        try {
            await DocumentsApi.updateMetadata(id, data);
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const handleUpdateContent = async (id: string, lang: Language, content: any) => {
        try {
            await DocumentsApi.updateContent(id, lang, content);
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const handleDeleteDocument = async (id: string) => {
        try {
            await DocumentsApi.delete(id);
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    return {
        documents: filteredDocuments,
        allDocuments: documents,
        categories,
        tags,
        loading,
        error,
        filters: {
            searchQuery,
            setSearchQuery,
            selectedCategory,
            setSelectedCategory,
            selectedTags,
            setSelectedTags
        },
        actions: {
            createDocument: handleCreateDocument,
            updateDocument: handleUpdateDocument,
            updateContent: handleUpdateContent,
            deleteDocument: handleDeleteDocument
        }
    };
};
