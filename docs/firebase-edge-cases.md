# Edge-cases для Security Rules (Firestore + Storage)

Цей документ пояснює прикордонні ситуації (allow/deny) для правил доступу.

## 1) Firestore: users

### Case: користувач намагається змінити свій `role`
- **Очікування:** deny
- **Причина:** self-update дозволяє змінювати лише `name`, `displayName`, `company`, `phone`, `requestedRole`.

### Case: користувач змінює свій `email`
- **Очікування:** deny
- **Причина:** `email` не можна змінювати з клієнта; тільки admin через Cloud Function.

### Case: користувач створює `users/{uid}` з ролью не `guest`
- **Очікування:** deny
- **Причина:** правила вимагають `role == 'guest'` при create.

---

## 2) Firestore: requests

### Case: користувач створює заявку з `status != pending`
- **Очікування:** deny
- **Причина:** create дозволяє тільки `pending`.

### Case: користувач намагається змінити свою заявку (approve/deny)
- **Очікування:** deny
- **Причина:** update дозволений тільки admin.

### Case: admin ставить `assignedRole` не з валідного списку
- **Очікування:** deny
- **Причина:** `assignedRole` перевіряється через `isValidRole`.

---

## 3) Firestore: documents

### Case: документ без `viewPermissions`
- **Очікування:** allow read для всіх
- **Причина:** правила трактують пусті permissions як публічний документ.

### Case: документ з `viewPermissions=['engineer']`, користувач `guest`
- **Очікування:** deny

### Case: документ із `viewPermissions` задані, але порожній список
- **Очікування:** allow read (публічно)

### Case: admin створює документ без `categoryKey`
- **Очікування:** deny
- **Причина:** `categoryKey` обовʼязковий.

---

## 4) Storage: files

### Case: документ public, downloadPermissions відсутні
- **Очікування:** allow download для всіх, хто може view.
- **Причина:** download fallback to view.

### Case: документ з `downloadPermissions=['engineer']`, користувач `architect`
- **Очікування:** deny download

### Case: документ з `viewPermissions=['engineer']`, але `downloadPermissions` відсутні
- **Очікування:** download дозволений тільки engineer (бо view обмежений).

### Case: спроба читати `/documents/{docId}/images` без доступу view
- **Очікування:** deny

---

## 5) Storage: legacy paths

### Case: `/documents/{docId}/thumbnail.jpg`
- **Очікування:** allow, якщо `canViewDocument`.
- **Причина:** thumbnail/cover — view-level доступ.

### Case: `/documents/{docId}/file.pdf` (legacy file)
- **Очікування:** allow тільки якщо `canDownloadDocument`.

---

## 6) Default Storage Rule

### Case: доступ до будь-якого іншого файлу без auth
- **Очікування:** deny
- **Причина:** default read тільки для авторизованих.

