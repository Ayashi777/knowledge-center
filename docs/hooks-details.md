# Детальний опис hooks

## `useTheme` (`src/shared/hooks/useTheme.ts`)

**Призначення:**
- Зберігає та перемикає тему (light/dark), синхронізує клас `dark` на `<html>`.

**State:**
- `theme: 'light' | 'dark'`

**Логіка:**
- Ініціалізація: бере `localStorage.theme`, якщо немає — орієнтується на `prefers-color-scheme`.
- `useEffect`:
  - зберігає `theme` в `localStorage`.
  - додає/прибирає клас `dark`.
- `toggleTheme`: перемикає значення.

**Edge cases:**
- Якщо localStorage недоступний (приватний режим) — можливі помилки (не обробляється).

---

## `useAdminActions` (`src/shared/hooks/useAdminActions.ts`)

**Призначення:**
- Всі адмін-дїї з документами/категоріями (save/update/delete).

**State:**
- `isProcessing: boolean` — глобальний флаг для UI.

**Методи:**
- `handleSaveDocument(documentData)`
  - Вимагає `documentData.id`.
  - Оновлює лише metadata (`DocumentsApi.saveMetadata`), контент не чіпає.
- `handleUpdateContent(docId, language, newContent)`
  - Викликає `DocumentsApi.updateContent`.
- `handleSaveCategory(category)`
  - `CategoriesApi.createOrUpdate`.
- `handleDeleteCategory(categoryId)`
  - Підтвердження `confirm`.
  - `CategoriesApi.delete`.
- `handleDeleteDocument(documentId)`
  - Підтвердження `confirm`.
  - `DocumentsApi.delete` + `StorageApi.deleteAllDocumentFiles`.

**Edge cases:**
- Якщо `documentData.id` відсутній — метод просто логить помилку.
- Помилки в API показують `alert` з перекладом.

---

## `useDocumentManagement` (`src/shared/hooks/useDocumentManagement.ts`)

**Призначення:**
- Центральне управління фільтрами, пагінацією і URL sync.

**Основні залежності:**
- `useSearchParams` (React Router)
- `useCategories`, `useTags`, `useDocuments`

**State/Derived:**
- `searchTerm`, `selectedCategoryKeys`, `selectedDocumentTypes`, `selectedTrademarks`, `selectedRoles`, `selectedTagIds`, `currentPage` — з URL params.
- `sortBy`, `viewMode` — локальний UI state.
- `ITEMS_PER_PAGE` = 9.
- `paginatedDocs`, `sortedAndFilteredDocs`, `totalPages`.

**Handlers:**
- `setSearchTerm`
- `handleCategoryToggle`
- `handleRoleToggle`
- `handleDocumentTypeToggle`
- `handleTrademarkToggle`
- `handleTagToggle`
- `setCurrentPage`
- `clearFilters`

**Edge cases:**
- Якщо `currentPage > totalPages` → автоматично коригує.
- `window.scrollTo` при зміні сторінки.

---

## `useCategories` (`src/entities/category/model/useCategories.ts`)

**Призначення:**
- Підписка на колекцію `categories`.

**State:**
- `categories: Category[]`
- `isLoading: boolean`

**Flow:**
- `CategoriesApi.subscribeAll` → realtime updates.

---

## `useTags` (`src/entities/tag/model/useTags.ts`)

**Призначення:**
- Підписка на колекцію `tags`.

**State:**
- `tags: Tag[]`
- `isLoading: boolean`

---

## `useDocuments` (`src/entities/document/model/useDocuments.ts`)

**Призначення:**
- Завантажує документи з Firestore та застосовує клієнтські фільтри.

**Inputs:**
- `categories`, `searchTerm`, `selectedCategoryKeys`, `selectedDocumentTypes`, `selectedTrademarks`, `selectedTagIds`, `selectedRoles`, `sortBy`.

**State:**
- `rawDocuments`, `isLoading`.

**Flow:**
- `DocumentsApi.subscribeFiltered` (Firestore snapshot).
- Client-side фільтрація:
  1. Валідність категорії (якщо не admin — приховує неправильні).
  2. Категорії (OR).
  3. Тип документа (OR).
  4. Trademark (OR).
  5. Ролі (OR, враховує viewPermissions doc/category).
  6. Теги (AND).
  7. Пошук (title/description).
- Сортування `recent` (updatedAt desc) або `alpha`.

**Edge cases:**
- Документи без валідної категорії приховуються для non-admin.
- Якщо `updatedAt` undefined — fallback 0.

