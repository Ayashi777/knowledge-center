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
...
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

interface DocumentContent {
  html: string; // Відформатований текст у HTML (WYSIWYG)
}