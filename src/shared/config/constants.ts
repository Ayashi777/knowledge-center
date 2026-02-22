import { UserRole } from '@shared/types';

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
