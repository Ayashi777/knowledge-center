import { Language } from './i18n';

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

export interface Category {
  id: string;
  nameKey: string;
  iconName?: IconName;
  viewPermissions?: UserRole[];
}

export type IconName =
  | 'construction'
  | 'electrical'
  | 'safety'
  | 'logistics'
  | 'it'
  | 'hr'
  | 'finance'
  | 'legal'
  | 'pdf'
  | 'doc'
  | 'xls'
  | 'zip'
  | 'image'
  | 'link'
  | 'loading'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'search'
  | 'filter'
  | 'x'
  | 'lock-closed'
  | 'check-circle'
  | 'tag'
  | 'upload'
  | 'download'
  | 'share'
  | 'view-grid'
  | 'view-list'
  | 'plus'
  | 'minus'
  | 'information-circle'
  | 'paper-airplane'
  | 'cog'
  | 'users'
  | 'view-boards';

export interface DocumentContent {
  html: string; // Відформатований текст у HTML (WYSIWYG)
}

export interface Document {
  id: string;
  titleKey?: string;
  title?: string;
  thumbnailUrl?: string;
  updatedAt: any; // Firestore Timestamp or Date
  categoryKey: string;
  tags: string[];
  content: {
    [key in Language]?: DocumentContent;
  };
  viewPermissions?: UserRole[];
  downloadPermissions?: UserRole[];
}

export type SortBy = 'recent' | 'alpha';
export type ViewMode = 'grid' | 'list';
export type DownloadStatus = 'idle' | 'loading' | 'success';
export type UploadStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error';

export interface FileItem {
  name: string;
  url: string;
  extension?: string;
  size?: number;
}
