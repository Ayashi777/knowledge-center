# Firebase Rules: поведінка доступів

## 1) Firestore rules (`firestore.rules`)

### Users collection (`/users/{userId}`)

**Read**
- Admin може читати всіх.
- Звичайний користувач може читати тільки свій документ.

**Create**
- Тільки авторизований користувач створює **свій** `users/{uid}`.
- `role` має бути `guest`.
- Дозволені ключі: `uid`, `email`, `role`, `name`, `displayName`, `company`, `phone`, `requestedRole`, `createdAt`.

**Update**
- Admin: повний доступ.
- Self-update: тільки свої дані і лише певні поля:
  - `name`, `displayName`, `company`, `phone`, `requestedRole`.
  - `role` та `email` змінювати не можна.

**Delete**
- Тільки admin.

---

### Requests collection (`/requests/{requestId}`)

**Read**
- Admin читає всі заявки.
- Автор заявки читає тільки свою заявку.

**Create**
- Тільки авторизований користувач.
- `status` має бути `pending`.
- `requestedRole` має бути валідним.
- Дозволені ключі: `uid`, `name`, `company`, `email`, `phone`, `requestedRole`, `status`, `date`.

**Update**
- Тільки admin.
- Дозволені зміни: `status`, `assignedRole`.
- `status` може бути тільки `approved` або `denied`.
- `assignedRole` якщо є — має бути валідним.

**Delete**
- Тільки admin.

---

### Categories (`/categories/{categoryId}`)

- Read: публічно.
- Write: тільки admin.

---

### Tags (`/tags/{tagId}`)

- Read: публічно.
- Write: тільки admin.

---

### Documents (`/documents/{docId}`)

**Read**
- Admin має доступ завжди.
- Якщо `viewPermissions` відсутні або порожні — доступ публічний.
- Якщо `viewPermissions` задані — потрібна auth + роль має входити в список.

**Create/Update**
- Тільки admin.
- Вимагає `categoryKey`.
- Якщо `viewPermissions` задані — вони повинні бути list і не порожні.

**Delete**
- Тільки admin.

---

## 2) Storage rules (`storage.rules`)

### Основні helper-функції
- `isAuth` — користувач авторизований.
- `isAdmin` — роль в Firestore = `admin`.
- `canViewDocument(docId)`:
  - Admin — true.
  - Якщо `viewPermissions` є і не пусті → потрібна auth + роль у списку.
  - Якщо `viewPermissions` відсутні/порожні → публічний доступ.
- `canDownloadDocument(docId)`:
  - Admin — true.
  - Якщо `downloadPermissions` є і не пусті → потрібна auth + роль у списку.
  - Якщо `downloadPermissions` немає → fallback на `canViewDocument`.

### Paths

**`/documents/{docId}/files/**`**
- Read: тільки якщо `canDownloadDocument`.
- Write: тільки admin.

**`/documents/{docId}/images/**`**
- Read: якщо `canViewDocument`.
- Write: тільки admin.

**`/documents/{docId}/{fileName}` (legacy)**
- Якщо `fileName` = thumbnail/cover → читається як view.
- Інакше → читається як download.

**Default (`/{allPaths=**}`)**
- Read: тільки auth users.
- Write: тільки admin.

---

## 3) Ключові наслідки для UI

1. **UI зобовʼязаний перевіряти доступ** до перегляду та завантаження, інакше користувачі отримають 403.
2. Якщо `viewPermissions` порожні → документ публічний, навіть для guest.
3. Якщо `downloadPermissions` порожні → скачування дозволяється тим же, хто може переглядати.
4. Адмін має доступ до всього.

