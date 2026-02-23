# API модулі: докладно

## 1) Firebase init

**`src/shared/api/firebase/firebase.ts`**
- Ініціалізує Firebase App через `initializeApp`.
- Експортує:
  - `db` (Firestore)
  - `auth` (Auth)
  - `storage` (Storage)
  - `functions` (Cloud Functions, region `europe-west3`)
- Конфіги беруться з `import.meta.env`.

---

## 2) Auth API

**`src/shared/api/firebase/auth.ts`**

Методи:
- `subscribeToAuthChanges(callback)`
  - Підписується на `onAuthStateChanged`.
  - При логіні читає роль з `users/{uid}`.
  - Якщо документ не існує — створює з роллю `guest`.
- `login(email, password)`
  - `signInWithEmailAndPassword`.
- `logout()`
  - `signOut`.
- `register({ email, password, name, company, phone, requestedRole })`
  - `createUserWithEmailAndPassword`.
  - `setDoc(users/{uid})` роль `guest`.
  - `addDoc(requests)` зі статусом `pending`.

Особливості:
- `normalizeRole` і `extractRoleLoose` для захисту від невалідних ролей.

---

## 3) Documents API

**`src/shared/api/firestore/documents.api.ts`**

Методи:
- `subscribeFiltered({ categoryKey?, limitCount?, sortBy? }, onUpdate, onError?)`
  - Формує query Firestore.
  - Повертає `onSnapshot` subscription.
- `getById(id)`
  - `getDoc` по id.
- `saveMetadata(id, metadata)`
  - `setDoc` з `merge: true`.
  - Оновлює `updatedAt`.
  - При створенні — `createdAt`.
- `updateContent(id, lang, content)`
  - `runTransaction` з dot-notation `content.{lang}`.
- `delete(id)`
  - `deleteDoc`.

Особливості:
- `prepareDataForFirestore` видаляє undefined поля.
- `mapToDocument` нормалізує Timestamp.

---

## 4) Categories API

**`src/shared/api/firestore/categories.api.ts`**

Методи:
- `getAll()` — разове читання.
- `subscribeAll(onUpdate)` — realtime.
- `createOrUpdate(category)` — `setDoc` merge.
- `delete(id)` — `deleteDoc`.

---

## 5) Tags API

**`src/shared/api/firestore/tags.api.ts`**

Методи:
- `getAll()`
- `subscribeAll(onUpdate)`
- `create(tag)` → `addDoc`
- `update(id, tag)` → `updateDoc`
- `delete(id)` → `deleteDoc`

---

## 6) Users API

**`src/shared/api/firestore/users.api.ts`**

Методи:
- `getAllUsers()`
- `subscribeUsers(onUpdate)`
- `updateUser(uid, data)`
- `updateUserEmailAsAdmin(uid, email)`
  - викликає Cloud Function `adminUpdateUserEmail`.
- `deleteUser(uid)`

Requests:
- `getAllRequests()`
- `subscribeRequests(onUpdate)`
- `updateRequestStatus(requestId, status, assignedRole?)`

---

## 7) Storage API

**`src/shared/api/storage/storage.api.ts`**

Методи:
- `isFileTypeAllowed(fileName)`
- `listDocumentFiles(docId)`
  - Читає `/documents/{docId}/files`.
  - Фільтрує системні файли.
- `uploadFile(file, docId)`
  - Завантажує файл у `/documents/{docId}/files/`.
- `deleteFile(docId, fileName)`
  - Видаляє із нового або legacy шляху.
- `deleteAllDocumentFiles(docId)`
  - Видаляє `/files`, `/images`, legacy root.
- `uploadImage(file, docId)`
  - Завантажує в `/images`.
- `uploadThumbnail(file, docId)`
  - Завантажує `thumbnail.ext` в root doc.

Особливості:
- `isSystemAsset` фільтрує cover/thumbnail.
- При помилці доступу `listDocumentFiles` повертає `[]`.

