import { Category, Document, UserRole } from '@shared/types';

export const CATEGORIES: Category[] = [];

export const RECENT_DOCUMENTS: Document[] = [];

// 🔥 Added 'worker' as a business/external role
export const BUSINESS_ROLES: UserRole[] = ['foreman', 'engineer', 'architect', 'worker'];

export const ALL_ROLES: UserRole[] = [
    'guest', 
    'foreman', 
    'engineer', 
    'architect', 
    'admin', 
    'employee', 
    'worker', 
    'dispatcher', 
    'hr'
];
