import { Category, Document, UserRole } from '@shared/types';

export const CATEGORIES: Category[] = [];

export const RECENT_DOCUMENTS: Document[] = [];

export const BUSINESS_ROLES: UserRole[] = ['foreman', 'engineer', 'architect']; // 🔥 designer -> engineer

export const ALL_ROLES: UserRole[] = [
    'guest', 
    'foreman', 
    'engineer', // 🔥 designer -> engineer
    'architect', 
    'admin', 
    'employee', 
    'worker', 
    'dispatcher', 
    'hr'
];
