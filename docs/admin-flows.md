# Адмін-потоки (детально)

Цей документ описує адміністративні сценарії по кроках: що відбувається в UI, які перевірки і які записи змінюються у Firestore/Storage.

## 1) Вхід до адмін-панелі

1. Користувач переходить на `/admin`.
2. `AdminPage` перевіряє `role` з `AuthProvider`.
3. Якщо роль не `admin` — показує gate екран (CTA на логін).
4. Якщо `admin` — рендерить `AdminPanel`.

## 2) Контент (Categories + Documents)

### 2.1 Категорії: створення/редагування
- UI: `CategoryEditorModal`.
- Валідація:
  - `nameKey` обовʼязковий.
  - тільки латиниця/цифри/._-
- API: `CategoriesApi.createOrUpdate(category)`.

### 2.2 Категорії: видалення з міграцією
- Якщо категорія використовується в документах:
  - адмін обирає replacement category.
  - для кожного документа робиться `DocumentsApi.saveMetadata` з новим `categoryKey`.
- Потім `CategoriesApi.delete`.

### 2.3 Документи: створення/редагування
- UI: `DocumentEditorModal`.
- Валідація:
  - `title` не пустий.
  - `viewPermissions` має хоча б 1 роль.
  - `thumbnailUrl` якщо заданий — має бути http/https.
- API: `DocumentsApi.saveMetadata`.

### 2.4 Документи: bulk-операції
- Таб `ContentTab` дозволяє масові зміни:
  - category
  - tags (add/remove)
  - viewPermissions (add/remove)
  - downloadPermissions (add/remove)
  - status
- API: для кожного документа викликається `DocumentsApi.saveMetadata`.

### 2.5 Документи: видалення
- Викликається `DocumentsApi.delete(docId)`.
- Паралельно `StorageApi.deleteAllDocumentFiles(docId)`.

## 3) Теги

### 3.1 Створення/редагування
- UI: `TagEditorModal`.
- Валідація:
  - name не пустий.
  - color = HEX.
- API: `TagsApi.create` або `TagsApi.update`.

### 3.2 Видалення + міграція
- Якщо тег використовується в документах:
  - адмін вводить replacementId або залишає пустим.
  - всі документи оновлюються: remove старий, add replacement.
- Потім `TagsApi.delete`.

## 4) Користувачі

### 4.1 Перегляд і пошук
- Таб `UsersTab` показує `users` з Firestore.
- Фільтр за роллю та текстовий пошук.

### 4.2 Редагування користувача
- UI: `UserEditorModal`.
- Валідація:
  - name не пустий.
  - email валідний.
- Якщо змінився email:
  - викликається Cloud Function `adminUpdateUserEmail`.
  - вона синхронізує email у Firebase Auth і Firestore.
- Потім `UsersApi.updateUser` (оновлення профілю/ролі).

## 5) Requests (заявки на доступ)

### 5.1 Перегляд
- Таб `RequestsTab` підписаний на колекцію `requests`.
- Фільтри за статусом та пошуком.

### 5.2 Approve
1. Адмін вибирає роль (або бере requestedRole).
2. `UsersApi.updateRequestStatus(requestId, 'approved', role)`.
3. `UsersApi.updateUser(uid, { role })`.

### 5.3 Deny
- `UsersApi.updateRequestStatus(requestId, 'denied')`.

## 6) Health Tab (контроль якості)

### 6.1 Які проблеми шукає
- Документи без категорії
- Без тегів
- Биті теги
- Без viewPermissions
- Без downloadPermissions
- Без статусу
- Архів без опису

### 6.2 Fix
- Для кожної проблеми є bulk-fix:
  - проставити категорію
  - задати статус
  - задати view/download role

### 6.3 API
- Кожен fix — це масове `DocumentsApi.saveMetadata`.

