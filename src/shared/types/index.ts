// src/shared/types/index.ts

export type Language = 'uk' | 'it';

export type UserRole = 'guest' | 'foreman' | 'designer' | 'architect' | 'admin';

export interface UserProfile {
  uid: string;
  name?: string;
  email: string;
  company?: string;
  phone?: string;
  role: UserRole;
  requestedRole?: UserRole;
  createdAt?: string;
}

export type UserData = UserProfile; // Compatibility alias

export interface Category {
  id: string;
  nameKey: string;
  iconName?: IconName;
  viewPermissions?: UserRole[];
}

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export type IconName =
  | 'view-grid'
  | 'view-list'
  | 'document-text'
  | 'download'
  | 'external-link'
  | 'search'
  | 'plus'
  | 'pencil'
  | 'trash'
  | 'check'
  | 'x-mark'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'chevron-up'
  | 'lock-closed'
  | 'lock-open'
  | 'user'
  | 'users'
  | 'tag'
  | 'folder'
  | 'clock'
  | 'loading'
  | 'construction'
  | 'cog'
  | 'eye'
  | 'eye-off'
  | 'warning'
  | 'info-circle';

export interface DocumentContent {
  html: string;
}

export interface Document {
  id: string;
  titleKey?: string;
  title?: string;
  thumbnailUrl?: string;
  updatedAt: any;
  categoryKey: string;
  tagIds?: string[];
  content: {
    [key in string]?: DocumentContent;
  };
  viewPermissions?: UserRole[];
  downloadPermissions?: UserRole[];
}

export type SortBy = 'recent' | 'alpha';
export type ViewMode = 'grid' | 'list';
export type DownloadStatus = 'idle' | 'loading' | 'success';
export type UploadStatus = 'idle' | 'loading' | 'success' | 'error';

export interface FileItem {
  name: string;
  url: string;
  extension?: string;
  size?: number;
}
