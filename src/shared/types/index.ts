// src/shared/types/index.ts
import { Timestamp } from 'firebase/firestore';

export type Language = 'uk' | 'it' | 'en';

export type UserRole = 
  | 'guest' 
  | 'foreman' 
  | 'engineer' // 🔥 Було designer
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

export interface LocalizedText {
  uk: string;
  en: string;
}

export interface ServiceFields {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  sortOrder: number;
  isPublished: boolean;
}

export interface ProductCategory extends ServiceFields {
  id: string;
  title: LocalizedText;
  description?: LocalizedText;
  slug?: string;
}

export interface Product extends ServiceFields {
  id: string;
  categoryId: string; // -> productCategories.id
  title: LocalizedText;
  description?: LocalizedText;
  sku?: string;
}

export interface Brand extends ServiceFields {
  id: string;
  productId: string; // -> products.id
  title: LocalizedText;
  description?: LocalizedText;
  logoUrl?: string;
}

export enum BrandSectionType {
  Benefits = 'benefits',
  Documents = 'documents',
  Catalog = 'catalog',
  SystemCalculation = 'systemCalculation',
  Assortment = 'assortment',
  Objects = 'objects',
  UseCases = 'useCases'
}

export type ContentBlock =
  | {
      type: 'text';
      value: LocalizedText;
    }
  | {
      type: 'image';
      url: string;
      alt?: LocalizedText;
    }
  | {
      type: 'file';
      url: string;
      name: LocalizedText;
      mimeType?: string;
    }
  | {
      type: 'link';
      url: string;
      label: LocalizedText;
    };

export interface BrandSection extends ServiceFields {
  id: string;
  brandId: string; // -> brands.id
  type: BrandSectionType;
  title: LocalizedText;
  description?: LocalizedText;
}

export interface BrandSectionItem extends ServiceFields {
  id: string;
  sectionId: string; // -> brandSections.id
  title: LocalizedText;
  description?: LocalizedText;
  blocks: ContentBlock[];
}

export interface Document {
  id: string;
  titleKey?: string;
  title?: string;
  description?: string;
  extendedDescription?: string;
  thumbnailUrl?: string;
  updatedAt: Timestamp;
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
