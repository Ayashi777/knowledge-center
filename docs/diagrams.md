# Діаграми (Mermaid)

> Можна вставляти у Markdown/Notion/GitHub і Mermaid відрендерить граф.

## 1) Загальна архітектура

```mermaid
flowchart LR
  UI[UI Pages/Widgets] --> Hooks[Hooks]
  Hooks --> API[API Clients]
  API --> FS[Firestore]
  API --> ST[Storage]
  API --> AU[Firebase Auth]
  API --> FN[Cloud Functions]
```

## 2) Логін / Отримання ролі

```mermaid
sequenceDiagram
  participant U as User
  participant UI as LoginModal
  participant Auth as Firebase Auth
  participant FS as Firestore
  participant Ctx as AuthProvider

  U->>UI: submit email/password
  UI->>Auth: signInWithEmailAndPassword
  Auth-->>Ctx: onAuthStateChanged(user)
  Ctx->>FS: get users/{uid}
  FS-->>Ctx: role
  Ctx-->>UI: user + role in context
```

## 3) Реєстрація + заявка

```mermaid
sequenceDiagram
  participant U as User
  participant UI as LoginModal (request)
  participant Auth as Firebase Auth
  participant FS as Firestore

  U->>UI: submit registration form
  UI->>Auth: createUserWithEmailAndPassword
  Auth-->>UI: userCredential
  UI->>FS: set users/{uid} role=guest
  UI->>FS: add requests (pending)
  FS-->>UI: ok
```

## 4) Перегляд документа

```mermaid
sequenceDiagram
  participant U as User
  participant UI as DocumentCard
  participant GM as GlobalModals
  participant DM as DocumentModal
  participant ST as Storage

  U->>UI: click document
  UI->>GM: openModal('view-doc', doc)
  GM->>GM: compute hasViewAccess/hasDownloadAccess
  GM-->>DM: render DocumentModal
  DM->>ST: listDocumentFiles(docId)
  ST-->>DM: files (if allowed)
  DM-->>U: preview + download list
```

## 5) Адмін: Approve request

```mermaid
sequenceDiagram
  participant A as Admin
  participant UI as RequestsTab
  participant FS as Firestore

  A->>UI: approve request + select role
  UI->>FS: update requests/{id} status=approved
  UI->>FS: update users/{uid} role
  FS-->>UI: ok
```

## 6) Адмін: Масові зміни документів

```mermaid
flowchart TD
  A[Admin selects docs] --> UI[ContentTab bulk action]
  UI --> API[DocumentsApi.saveMetadata]
  API --> FS[Firestore documents/{id}]
  FS --> UI
```

## 7) Storage доступ

```mermaid
flowchart LR
  User -->|Download| Storage
  Storage -->|check downloadPermissions| Firestore
  Firestore -->|role + permissions| Storage
  Storage -->|allow/deny| User
```

