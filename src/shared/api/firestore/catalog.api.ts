import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore';
import { db } from '@shared/api/firebase/firebase';
import {
  Brand,
  BrandSection,
  BrandSectionItem,
  Product,
  ProductCategory,
} from '@shared/types';

export const CatalogCollections = {
  productCategories: 'productCategories',
  products: 'products',
  brands: 'brands',
  brandSections: 'brandSections',
  brandSectionItems: 'brandSectionItems',
} as const;

type ServiceFieldsPayload = {
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  sortOrder: number;
  isPublished: boolean;
};

type NewProductCategory = Omit<ProductCategory, 'id' | 'createdAt' | 'updatedAt'> &
  Partial<Pick<ProductCategory, 'createdAt' | 'updatedAt'>>;

type NewProduct = Omit<Product, 'id' | 'createdAt' | 'updatedAt'> &
  Partial<Pick<Product, 'createdAt' | 'updatedAt'>>;

type NewBrand = Omit<Brand, 'id' | 'createdAt' | 'updatedAt'> &
  Partial<Pick<Brand, 'createdAt' | 'updatedAt'>>;

type NewBrandSection = Omit<BrandSection, 'id' | 'createdAt' | 'updatedAt'> &
  Partial<Pick<BrandSection, 'createdAt' | 'updatedAt'>>;

type NewBrandSectionItem = Omit<BrandSectionItem, 'id' | 'createdAt' | 'updatedAt'> &
  Partial<Pick<BrandSectionItem, 'createdAt' | 'updatedAt'>>;

const withServiceFields = <T extends object>(payload: T & Partial<ServiceFieldsPayload>) => ({
  ...payload,
  sortOrder: payload.sortOrder ?? 0,
  isPublished: payload.isPublished ?? false,
  createdAt: payload.createdAt ?? serverTimestamp(),
  updatedAt: serverTimestamp(),
});

const mapWithId = <T>(id: string, data: DocumentData): T => ({ ...data, id } as T);

export const CatalogApi = {
  async createProductCategory(payload: NewProductCategory): Promise<string> {
    const ref = await addDoc(
      collection(db, CatalogCollections.productCategories),
      withServiceFields(payload),
    );
    return ref.id;
  },

  async listProductCategories(): Promise<ProductCategory[]> {
    const q = query(
      collection(db, CatalogCollections.productCategories),
      orderBy('sortOrder', 'asc'),
      orderBy('createdAt', 'asc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((item) => mapWithId<ProductCategory>(item.id, item.data()));
  },

  async createProduct(payload: NewProduct): Promise<string> {
    const ref = await addDoc(collection(db, CatalogCollections.products), withServiceFields(payload));
    return ref.id;
  },

  async listProductsByCategory(categoryId: string): Promise<Product[]> {
    const q = query(
      collection(db, CatalogCollections.products),
      where('categoryId', '==', categoryId),
      orderBy('sortOrder', 'asc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((item) => mapWithId<Product>(item.id, item.data()));
  },

  async createBrand(payload: NewBrand): Promise<string> {
    const ref = await addDoc(collection(db, CatalogCollections.brands), withServiceFields(payload));
    return ref.id;
  },

  async listBrandsByProduct(productId: string): Promise<Brand[]> {
    const q = query(
      collection(db, CatalogCollections.brands),
      where('productId', '==', productId),
      orderBy('sortOrder', 'asc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((item) => mapWithId<Brand>(item.id, item.data()));
  },

  async createBrandSection(payload: NewBrandSection): Promise<string> {
    const ref = await addDoc(
      collection(db, CatalogCollections.brandSections),
      withServiceFields(payload),
    );
    return ref.id;
  },

  async listBrandSections(brandId: string): Promise<BrandSection[]> {
    const q = query(
      collection(db, CatalogCollections.brandSections),
      where('brandId', '==', brandId),
      orderBy('sortOrder', 'asc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((item) => mapWithId<BrandSection>(item.id, item.data()));
  },

  async createBrandSectionItem(payload: NewBrandSectionItem): Promise<string> {
    const ref = await addDoc(
      collection(db, CatalogCollections.brandSectionItems),
      withServiceFields(payload),
    );
    return ref.id;
  },

  async listSectionItems(sectionId: string): Promise<BrandSectionItem[]> {
    const q = query(
      collection(db, CatalogCollections.brandSectionItems),
      where('sectionId', '==', sectionId),
      orderBy('sortOrder', 'asc'),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((item) => mapWithId<BrandSectionItem>(item.id, item.data()));
  },

  async touchProductCategory(id: string): Promise<void> {
    await updateDoc(doc(db, CatalogCollections.productCategories, id), {
      updatedAt: serverTimestamp(),
    });
  },

  async existsProductCategory(categoryId: string): Promise<boolean> {
    const snapshot = await getDoc(doc(db, CatalogCollections.productCategories, categoryId));
    return snapshot.exists();
  },

  async existsProduct(productId: string): Promise<boolean> {
    const snapshot = await getDoc(doc(db, CatalogCollections.products, productId));
    return snapshot.exists();
  },

  async existsBrand(brandId: string): Promise<boolean> {
    const snapshot = await getDoc(doc(db, CatalogCollections.brands, brandId));
    return snapshot.exists();
  },

  async existsBrandSection(sectionId: string): Promise<boolean> {
    const snapshot = await getDoc(doc(db, CatalogCollections.brandSections, sectionId));
    return snapshot.exists();
  },
};
