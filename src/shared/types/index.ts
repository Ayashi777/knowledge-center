// src/shared/types/index.ts
import { Timestamp } from 'firebase/firestore';

export type Language = 'uk' | 'it' | 'en';

export type UserRole = 
  | 'guest' 
  | 'foreman' 
  | 'designer' 
  | 'architect' 
  | 'admin' 
  | 'employee' 
  | 'worker' 
  | 'dispatcher' 
  | 'hr';

export interface UserProfile {
  uid: string;
  id?: string;
  name?: string;
  displayName?: string;
  email: string;
  company?: string;
  phone?: string;
  role: UserRole;
  requestedRole?: UserRole;
  createdAt?: string | Timestamp;
}

export interface Category {
  id: string;
  nameKey: string;
  iconName?: IconName;
  viewPermissions?: UserRole[];
}

export interface UserRequest {
    uid: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    requestedRole: UserRole;
    status: 'pending' | 'approved' | 'denied';
    date: string | Timestamp;
    id: string;
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export type IconName =
  | 'view-grid' | 'view-list' | 'document-text' | 'download' | 'external-link'
  | 'search' | 'plus' | 'pencil' | 'trash' | 'check' | 'x-mark'
  | 'chevron-left' | 'chevron-right' | 'chevron-down' | 'chevron-up'
  | 'lock-closed' | 'lock-open' | 'user' | 'users' | 'tag' | 'folder'
  | 'clock' | 'loading' | 'construction' | 'cog' | 'eye' | 'eye-off'
  | 'warning' | 'info-circle' | 'electrical' | 'safety' | 'logistics'
  | 'it' | 'hr' | 'finance' | 'legal' | 'view-boards';

export interface DocumentContent {
  html: string;
}

export interface Document {
  id: string;
  titleKey?: string;
  title?: string;
  description?: string; // Це буде короткий опис для карток
  extendedDescription?: string; // 🔥 Нове поле: Розширений опис для сторінки документа
  thumbnailUrl?: string;
  updatedAt: Timestamp; // Strict Firebase Timestamp
  createdAt?: Timestamp;
  categoryKey: string;
  tagIds?: string[];
  content: {
    [key: string]: DocumentContent | undefined;
  };
  viewPermissions?: UserRole[];
  downloadPermissions?: UserRole[];
  internalId?: string;
}

export type SortBy = 'recent' | 'alpha';
export type ViewMode = 'grid' | 'list';
