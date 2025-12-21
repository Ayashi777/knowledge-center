import { UserRole, Category, Document } from '../types';

export const canViewCategory = (role: UserRole, category: Category): boolean => {
    if (role === 'admin') return true;
    return category.viewPermissions?.includes(role) || false;
};

export const canViewDocument = (role: UserRole, doc: Document, categories: Category[]): boolean => {
    if (role === 'admin') return true;
    const category = categories.find(c => c.nameKey === doc.categoryKey);
    if (!category) return false;
    return canViewCategory(role, category);
};

export const canDownloadDocument = (role: UserRole, doc: Document, categories: Category[]): boolean => {
    // For now same as view, but can be restricted
    return canViewDocument(role, doc, categories);
};

export const isAdmin = (role: UserRole): boolean => role === 'admin';
