# Детальний опис React-компонентів

Формат: **Компонент** — призначення, props, state, ключова поведінка.

## App / Layout / Providers

**`src/app/App.tsx` (AppContent)**
- Призначення: головний роутинг і композиція сторінок; підключає глобальні модалки.
- Props: немає (top-level).
- State:
  - `showLandingManually` — чи показувати landing замість автопереходу в `/database` для гостя.
- Використовує:
  - `useDocumentManagement` — дані, фільтри, пагінація.
  - `useAdminActions` — CRUD дії (документи/категорії).
  - `useAuth` — роль/користувач.
  - `useModal` — відкриття модалок.
- Поведінка:
  - На `/` показує `LandingPage` для неавторизованих, або редіректить в `/database`.
  - `/database` рендерить `DashboardView` з усіма контролами.
  - `/admin` доступний тільки адміну.
  - В кінці завжди рендерить `GlobalModals`.

**`src/app/layouts/MainLayout.tsx`**
- Призначення: загальна “рамка” для сторінок — header, footer, mobile tabs.
- Props:
  - `children` — основний контент.
  - `onLoginClick` — колбек відкриття логіну.
- State: немає.
- Поведінка:
  - Навігація між `/`, `/database`, `/services`, `/calculators`.
  - На mobile показує back/button і bottom tab bar.
  - Якщо маршрут `/admin` — прибирає footer і support sidebar.

**`src/app/providers/AuthProvider.tsx`**
- Призначення: контекст авторизації.
- Props: `children`.
- State:
  - `user`, `role`, `isLoading`.
- Поведінка:
  - Підписка на Firebase Auth, отримання ролі із Firestore.

**`src/app/providers/ModalProvider/ModalProvider.tsx`**
- Призначення: глобальний стан модалок.
- Props: `children`.
- State: `modal { type, data, context }`.
- Методи:
  - `openModal(type, data?, context?)`
  - `closeModal()`

**`src/app/providers/ModalProvider/GlobalModals.tsx`**
- Призначення: централізований рендер усіх модалок.
- Props:
  - `availableCategories`, `availableTags` — для editor modal.
  - `onRequireLogin` — callback для показу логіну.
- Поведінка:
  - На основі `modal.type` рендерить Login/Document/Category modals.
  - Внутрішньо перевіряє доступ (view/download) щоб не суперечити rules.

**`src/app/providers/i18n/i18n.tsx`**
- Призначення: контекст локалізації.
- Props: `children`.
- API:
  - `lang`, `setLang`, `t`.

## Shared UI / Primitives

**`Button.tsx`**
- Props:
  - `variant`: `primary | ghost | outline`
  - `size`: `sm | md | lg | icon`
- Поведінка: стилізований button з токенами.

**`Input.tsx`**
- Props: стандартні `input` props.
- Поведінка: forwardRef, стилізований інпут.

**`Card.tsx`**
- Простий контейнер з border/background.

**`Modal.tsx`**
- `ModalOverlay`, `ModalPanel` — базові будівельні блоки для модалок.

**`AdminTable.tsx`**
- Табличні примітиви для адмін-табів.

## Shared UI / Інші компоненти

**`Pagination.tsx`**
- Props:
  - `currentPage`, `totalPages`, `onPageChange`.
- Поведінка:
  - Не показується, якщо `totalPages <= 1`.

**`LanguageSwitcher.tsx`**
- Перемикає мову (uk/en).

**`ThemeSwitcher.tsx`**
- Props: `theme`, `toggleTheme`.
- Перемикає тему (light/dark).

**`UserAccessControl.tsx`**
- Props: `user`, `role`, `onLoginClick`.
- Поведінка:
  - Показує email/роль.
  - Кнопки логін/лог-аут.
  - Для admin — кнопка переходу в `/admin`.

**`StatePanel.tsx`**
- Props: `variant`, `title`, `description?`.
- Використовується для empty/loading/error.

**`Icon.tsx`**
- Props: `name`, `className`, стандартні SVG props.
- Мапа SVG-ікон.

**`DocumentComponents.tsx`**
- `DocumentGridItem`, `DocumentListItem`, `DocumentSkeleton`.
- Props:
  - `doc`, `onClick`, `currentUserRole`, `categories`, `showAdminControls`.
- Поведінка:
  - Рендер карточки документа у grid/list.
  - Враховує доступ і показує “locked” стан.

## Pages

**`LandingPage.tsx`**
- Props: `onLoginClick`, `onRegisterClick`, `onExploreClick`.
- State: `openFaq`.
- Поведінка:
  - Hero + CTA
  - FAQ accordion
  - Тизери Database/Services/Projects

**`ServicesPage.tsx`**
- State: `exampleDrawer`, drag state.
- Поведінка:
  - Секції сервісів з cards.
  - Bottom drawer для прикладів.

**`CalculatorsPage.tsx`**
- State: `activeFilter`.
- Поведінка:
  - Фільтрує список Excel-калькуляторів.
  - Посилання на download з `public/calculators`.

**`AdminPage.tsx`**
- Props: дані документів/категорій/тегів + callbacks.
- Поведінка:
  - Перевіряє роль користувача.
  - Якщо не адмін — показує gate екран.

**`UIPlaygroundPage.tsx`**
- Демонстрація примітивів UI.

## Widgets

**`DashboardView.tsx`**
- Композиція `Sidebar`, `DashboardFilters`, `DocumentList`, `Pagination`.
- Передає всі фільтри/колбеки.

**`DashboardHeader.tsx`**
- Заголовок і опис бази знань.

**`DashboardFilters.tsx`**
- Пошук, sort, view mode.

**`DocumentList.tsx`**
- Рендер grid/list документів.
- Показує skeleton або empty state.

**`Sidebar.tsx`**
- Фільтри категорій, типів, ТМ, ролей, тегів.
- Використовує multi-select.

**`SupportSidebar.tsx`**
- Floating sidebar для support на landing.
- Має автоповедінку при скролі.

## Admin Panel Widgets

**`AdminPanel.tsx`**
- Тримає стани активного табу, користувачів, заявок, notice.
- Підключає всі таби.

**`AdminHeader.tsx`**
- Заголовок і кнопка повернення на сайт.

**`AdminTabs.tsx`**
- Меню табів + badges (requests/health).

**`ContentTab.tsx`**
- Керування категоріями і документами.
- Bulk-операції.
- Saved views через localStorage.

**`TagsTab.tsx`**
- CRUD тегів + пошук.

**`UsersTab.tsx`**
- Список користувачів + фільтр ролей.
- Редагування через `UserEditorModal`.

**`RequestsTab.tsx`**
- Список заявок + approve/deny.
- Вибір ролі при approve.

**`HealthTab.tsx`**
- Аналіз проблем даних.
- Bulk-fix для категорій/permissions/status.

## Modals

**`LoginModal.tsx`**
- View: `login | request | success`.
- State: email/password/validation, request fields.
- Поведінка: login через Firebase; register + request запис.

**`DocumentModal.tsx`**
- Props: `doc`, `hasViewAccess`, `hasDownloadAccess`.
- State: `files`, `isLoadingFiles`.
- Поведінка:
  - Якщо нема access — показує AccessDenied.
  - Інакше preview (thumbnail/pdf) + список файлів.

**`DocumentEditorModal.tsx`**
- Props: `doc`, `availableCategories`, `availableTags`.
- State: title, category, tags, permissions, thumbnail.
- Поведінка:
  - Валідація title і permissions.
  - Upload thumbnail у Storage.

**`CategoryEditorModal.tsx`**
- Props: `category`.
- State: nameKey, iconName, viewPermissions.
- Поведінка: валідація ключа + збереження.

**`TagEditorModal.tsx`**
- Props: `tag`.
- State: name, color.
- Поведінка: валідація HEX.

**`UserEditorModal.tsx`**
- Props: `user`.
- State: name, email, role.
- Поведінка: редагування + email change через callable function.

