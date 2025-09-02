import { Language } from './i18n';

export type UserRole = 'guest' | 'foreman' | 'designer' | 'admin';

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
  // Use titleKey for initial, translatable documents
  titleKey?: string;
  // Use title for user-created/edited documents
  title?: string;
  updatedAt: Date;
  categoryKey: string;
  tags: string[];
  content: {
    [key in Language]?: Partial<DocumentContent>;
  };
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
  | 'information-circle';