import { UserRole, Category, Document } from '@shared/types';
import { normalizeCategoryKey } from '../utils/format';

/**
 * Перевіряє, чи має роль доступ до категорії
 */
export const canViewCategory = (role: UserRole, category: Category): boolean => {
    if (!category) return false;
    if (role === 'admin') return true;
    
    // Якщо дозволи не вказані або порожні — категорія публічна
    if (!category.viewPermissions || category.viewPermissions.length === 0) return true;
    
    return category.viewPermissions.includes(role);
};

/**
 * Перевіряє доступ до документа (враховує і документ, і його категорію)
 */
export const canViewDocument = (role: UserRole, doc: Document, categories: Category[]): boolean => {
    if (!doc || !categories) return false;
    if (role === 'admin') return true;

    // 1. Перевірка на рівні документа (якщо є специфічні дозволи на документ)
    if (doc.viewPermissions && doc.viewPermissions.length > 0) {
        if (!doc.viewPermissions.includes(role)) return false;
    }

    // 2. Перевірка на рівні категорії
    const normalizedDocCatKey = normalizeCategoryKey(doc.categoryKey);
    const category = (categories || []).find(c => normalizeCategoryKey(c.nameKey) === normalizedDocCatKey);
    
    if (category) {
        return canViewCategory(role, category);
    }

    // Якщо категорії не знайдено, але ми не адмін — приховуємо для безпеки
    // (Хоча зазвичай категорія має бути)
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
