# Mermaid-діаграми: адмін-операції

## 1) Створення/редагування документа

```mermaid
sequenceDiagram
  participant A as Admin
  participant UI as DocumentEditorModal
  participant API as DocumentsApi
  participant FS as Firestore

  A->>UI: edit fields + save
  UI->>API: saveMetadata(docId, metadata)
  API->>FS: setDoc merge
  FS-->>API: ok
  API-->>UI: ok
```

## 2) Видалення документа

```mermaid
sequenceDiagram
  participant A as Admin
  participant UI as AdminPanel
  participant API as DocumentsApi
  participant FS as Firestore
  participant ST as StorageApi
  participant STG as Storage

  A->>UI: delete doc
  UI->>API: delete(docId)
  API->>FS: deleteDoc
  FS-->>API: ok
  UI->>ST: deleteAllDocumentFiles(docId)
  ST->>STG: list + delete objects
  STG-->>ST: ok
```

## 3) Створення/редагування категорії

```mermaid
sequenceDiagram
  participant A as Admin
  participant UI as CategoryEditorModal
  participant API as CategoriesApi
  participant FS as Firestore

  A->>UI: edit category + save
  UI->>API: createOrUpdate
  API->>FS: setDoc merge
  FS-->>API: ok
```

## 4) Видалення категорії з міграцією

```mermaid
sequenceDiagram
  participant A as Admin
  participant UI as ContentTab
  participant API as DocumentsApi
  participant FS as Firestore
  participant C as CategoriesApi

  A->>UI: delete category
  UI->>UI: find affected docs
  UI->>A: prompt replacement category
  A-->>UI: replacementKey
  UI->>API: saveMetadata for each doc
  API->>FS: setDoc merge (categoryKey)
  FS-->>API: ok
  UI->>C: delete(categoryId)
  C->>FS: deleteDoc
```

## 5) Створення/редагування тегу

```mermaid
sequenceDiagram
  participant A as Admin
  participant UI as TagEditorModal
  participant API as TagsApi
  participant FS as Firestore

  A->>UI: edit tag + save
  UI->>API: create/update
  API->>FS: addDoc or updateDoc
  FS-->>API: ok
```

## 6) Видалення тегу з міграцією

```mermaid
sequenceDiagram
  participant A as Admin
  participant UI as TagsTab
  participant API as DocumentsApi
  participant FS as Firestore
  participant T as TagsApi

  A->>UI: delete tag
  UI->>UI: find affected docs
  UI->>A: prompt replacement tag
  A-->>UI: replacementId (or empty)
  UI->>API: saveMetadata for each doc
  API->>FS: update tagIds
  UI->>T: delete(tagId)
  T->>FS: deleteDoc
```

## 7) Approve request

```mermaid
sequenceDiagram
  participant A as Admin
  participant UI as RequestsTab
  participant API as UsersApi
  participant FS as Firestore

  A->>UI: approve + select role
  UI->>API: updateRequestStatus(approved)
  API->>FS: updateDoc requests/{id}
  UI->>API: updateUser(role)
  API->>FS: updateDoc users/{uid}
```

## 8) Deny request

```mermaid
sequenceDiagram
  participant A as Admin
  participant UI as RequestsTab
  participant API as UsersApi
  participant FS as Firestore

  A->>UI: deny request
  UI->>API: updateRequestStatus(denied)
  API->>FS: updateDoc requests/{id}
```

## 9) Редагування користувача (з email sync)

```mermaid
sequenceDiagram
  participant A as Admin
  participant UI as UserEditorModal
  participant API as UsersApi
  participant FN as CloudFunction
  participant AUTH as Firebase Auth
  participant FS as Firestore

  A->>UI: update user + save
  UI->>API: updateUserEmailAsAdmin (if email changed)
  API->>FN: adminUpdateUserEmail
  FN->>AUTH: updateUser email
  FN->>FS: merge users/{uid}.email
  UI->>API: updateUser(profile)
  API->>FS: updateDoc users/{uid}
```

## 10) Health Tab Fix

```mermaid
sequenceDiagram
  participant A as Admin
  participant UI as HealthTab
  participant API as DocumentsApi
  participant FS as Firestore

  A->>UI: apply fix (bulk)
  UI->>API: saveMetadata for each doc
  API->>FS: update docs
```

