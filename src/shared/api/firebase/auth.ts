import { Category } from './types';
import { UserRole } from './types';
import { CATEGORIES } from './constants';

// Define which categories each role can VIEW
const viewPermissions: Record<UserRole, string[]> = {
    guest: [], 
    foreman: [
        'categories.armoplit',
        'categories.fixit',
    ],
    designer: [
        'categories.armoplit',
        'categories.edilmodulo',
        'categories.freudenberg',
        'categories.typar',
    ],
    architect: [
        'categories.armoplit',
        'categories.edilmodulo',
        'categories.freudenberg',
        'categories.typar',
        'categories.fixit',
    ],
    admin: CATEGORIES.map(c => c.nameKey), 
};

/**
 * Checks if a user with a given role can view a specific category.
 * @param role The role of the user.
 * @param categoryKey The key of the category to check.
 * @returns `true` if the user has permission, `false` otherwise.
 */
export function canViewCategory(role: UserRole, categoryKey: string): boolean {
    return viewPermissions[role]?.includes(categoryKey) ?? false;
}

/**
 * Filters a list of all categories to return only those visible to a given role.
 * @param role The role of the user.
 * @param allCategories An array of all category objects.
 * @returns A filtered array of category objects.
 */
export function getVisibleCategories(role: UserRole, allCategories: Category[]): Category[] {
    if (role === 'admin') {
        return allCategories;
    }
    const allowedCategoryKeys = viewPermissions[role] || [];
    return allCategories.filter(cat => allowedCategoryKeys.includes(cat.nameKey));
}

/**
 * Checks if a user with a given role has administrative privileges.
 * In this system, only 'admin' has these rights.
 * @param role The role of the user.
 * @returns `true` if the user is an admin, `false` otherwise.
 */
export function hasAdminAccess(role: UserRole): boolean {
    return role === 'admin';
}
