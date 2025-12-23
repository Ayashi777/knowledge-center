import { Category, Document, UserRole } from '@shared/types';

export const CATEGORIES: Category[] = [];

export const RECENT_DOCUMENTS: Document[] = [];

export const BUSINESS_ROLES: UserRole[] = ['foreman', 'designer', 'architect'];

export const ALL_ROLES: UserRole[] = [
    'guest', 
    'foreman', 
    'designer', 
    'architect', 
    'admin', 
    'employee', 
    'worker', 
    'dispatcher', 
    'hr'
];
