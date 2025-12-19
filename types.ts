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
  iconName: IconName;
  viewPermissions: UserRole[];
}

export interface DocumentContent {
  intro: string;
  section1Title: string;
  section1Body: string;
  section1List: string;
  section2Title: string;
  section2Body: string;
  importantNote: string;
  section3Title: string;
  section3Body: string;
}

export interface Document {
  id: string;
  titleKey?: string;
  title?: string;
  updatedAt: Date;
  categoryKey: string;
  tags: string[];
  content: {
    [key in Language]?: Partial<DocumentContent>;
  };
  // Нові поля для доступу на рівні документа
  viewPermissions?: UserRole[]; 
  downloadPermissions?: UserRole[];
}

export type SortBy = 'recent' | 'alpha';
export type ViewMode = 'grid' | 'list';
export type DownloadStatus = 'idle' | 'loading' | 'success';
export type UploadStatus = 'idle' | 'loading' | 'success';

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
  | 'dwg'
  | 'lock-closed'
  | 'sun'
  | 'moon'
  | 'loading'
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
