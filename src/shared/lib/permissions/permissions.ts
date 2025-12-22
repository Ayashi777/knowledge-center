import { UserRole, Category, Document } from '@shared/types';

/**
 * Перевіряє, чи має роль доступ до категорії
 */
export const canViewCategory = (role: UserRole, category: Category): boolean => {
    if (!category) return false;
    if (role === 'admin') return true;
    // Якщо дозволи не вказані — категорія публічна
    if (!category.viewPermissions || category.viewPermissions.length === 0) return true;
    return category.viewPermissions.includes(role);
};

/**
 * Перевіряє доступ до документа (враховує і документ, і його категорію)
 */
export const canViewDocument = (role: UserRole, doc: Document, categories: Category[]): boolean => {
    if (!doc || !categories) return false;
    if (role === 'admin') return true;

    // 1. Перевірка на рівні документа
    if (doc.viewPermissions && doc.viewPermissions.length > 0) {
        if (!doc.viewPermissions.includes(role)) return false;
    }

    // 2. Перевірка на рівні категорії
    const category = (categories || []).find(c => c.nameKey === doc.categoryKey);
    if (category) {
        return canViewCategory(role, category);
    }

    // Якщо категорії немає — за замовчуванням приховуємо (безпечний підхід)
    return false;
};

export const canDownloadDocument = (role: UserRole, doc: Document, categories: Category[]): boolean => {
    if (!doc) return false;
    if (role === 'admin') return true;
    
    // Якщо є специфічні права на завантаження — перевіряємо їх
    if (doc.downloadPermissions && doc.downloadPermissions.length > 0) {
        return doc.downloadPermissions.includes(role);
    }
    
    // Інакше — якщо може бачити, то може і завантажувати (базова логіка)
    return canViewDocument(role, doc, categories);
};

export const isAdmin = (role: UserRole): boolean => role === 'admin';
