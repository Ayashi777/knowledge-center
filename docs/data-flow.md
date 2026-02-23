# Data-flow: UI → Hooks → API → Firebase

Цей документ описує, як дані проходять через застосунок: від дії користувача у UI до Firestore/Storage/Functions.

## 1) Загальна архітектура

**UI (pages/widgets/modals)**
→ **Hooks (useDocumentManagement/useDocuments/useAdminActions)**
→ **API клієнти (Firestore/Storage/Auth)**
→ **Firebase (Firestore/Storage/Functions/Auth)**

## 2) Авторизація та роль

### Потік: завантаження профілю
1. `AuthProvider` підписується на `onAuthStateChanged`.
2. При логіні `AuthApi.subscribeToAuthChanges` читає `users/{uid}` у Firestore.
3. Роль визначається з поля `role` (fallback — `guest`).
4. Контекст `AuthContext` дає `user`, `role`, `isLoading`.

### Потік: логін
- UI: `LoginModal` → `AuthApi.login(email, password)`
- API: Firebase Auth `signInWithEmailAndPassword`
- Результат: тригер onAuthStateChanged, роль підтягнеться з Firestore.

### Потік: реєстрація + заявка
- UI: `LoginModal` → `AuthApi.register`
- API:
  - `createUserWithEmailAndPassword`
  - `setDoc(users/{uid})` з роллю `guest`
  - `addDoc(requests)` із заявкою
- Результат: користувач створений, заявка на роль записана.

## 3) Документи: завантаження/фільтрація

### Потік: первинне завантаження
- UI: `DashboardView` → `useDocumentManagement`
- Hook `useDocuments`:
  - `DocumentsApi.subscribeFiltered` (Firestore `onSnapshot`)
  - бере до 500 документів, сортованих (`recent`/`alpha`).

### Потік: фільтрація
- Фільтри в `Sidebar` змінюють query params (`useSearchParams`).
- `useDocumentManagement` синхронізує URL → стан.
- `useDocuments` фільтрує на клієнті:
  - категорії (multi)
  - тип документа
  - TM
  - ролі
  - теги
  - searchTerm

### Потік: пагінація
- `useDocumentManagement` → `paginatedDocs`.
- `Pagination` керує `page` у URL.

## 4) Документ: перегляд

### Потік: open modal
- UI: `DocumentGridItem`/`DocumentListItem` → `openModal('view-doc', doc)`.
- `GlobalModals`:
  - перевіряє `hasViewAccess` та `hasDownloadAccess`.
  - рендерить `DocumentModal`.

### Потік: завантаження файлів
- `DocumentModal` → `StorageApi.listDocumentFiles(docId)`.
- Storage Rules перевіряють `downloadPermissions` або `viewPermissions`.

### Потік: preview
- Якщо є `thumbnailUrl` → показує img.
- Якщо немає, але є pdf-файл → iframe preview.

## 5) Документи: CRUD (адмін)

### Створення/редагування документа
- UI: `DocumentEditorModal` → `handleSaveDocument` (useAdminActions)
- API: `DocumentsApi.saveMetadata` (setDoc merge)
- Важливо: контент документа не стирається (metadata-only update).

### Оновлення контенту
- UI: (зараз в коді тільки метод, текстового редактора немає в UI)
- API: `DocumentsApi.updateContent` (transaction + dot notation)

### Видалення документа
- UI: `AdminPanel`/`Dashboard` → `handleDeleteDocument`
- API:
  - `DocumentsApi.delete` (Firestore)
  - `StorageApi.deleteAllDocumentFiles` (Storage)

## 6) Категорії

### CRUD
- UI: `CategoryEditorModal` → `CategoriesApi.createOrUpdate`
- Видалення: `CategoriesApi.delete`
- Якщо категорія використовується — в `AdminPanel` запускається міграція документів.

## 7) Теги

### CRUD
- UI: `TagEditorModal` → `TagsApi.create/update/delete`
- Якщо тег використовується — в `AdminPanel` пропонується міграція.

## 8) Користувачі

### Зміна профілю/ролі
- UI: `UserEditorModal` → `UsersApi.updateUser`
- Якщо змінюється email:
  - викликається `adminUpdateUserEmail` (Cloud Function)
  - синхронізує email в Auth і Firestore

## 9) Requests (заявки)

### Схвалення/відхилення
- UI: `RequestsTab` → `UsersApi.updateRequestStatus`
- Якщо approve:
  - оновлює request статус
  - оновлює роль користувача в `users/{uid}`

## 10) Storage (файли та зображення)

- `StorageApi.uploadFile` — завантаження файлу документа.
- `StorageApi.uploadImage` — завантаження зображень контенту.
- `StorageApi.uploadThumbnail` — обкладинка документа.

Доступ:
- `canViewDocument` → перегляд preview/зображень
- `canDownloadDocument` → список файлів і скачування

