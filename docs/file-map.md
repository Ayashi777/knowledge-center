# Опис файлів проєкту

Нижче — короткий опис призначення кожного файлу та його функцій, щоб можна було зібрати документацію по проєкту.

**Корінь проєкту**
- `README.md` — загальний опис продукту, фічі, стек, архітектура та інструкції запуску.
- `CONTRIBUTING.md` — правила внесення змін, UI-гайдлайни, базова доступність, обовʼязкові перевірки.
- `DESIGN_SYSTEM.md` — дизайн-система, джерела токенів, правила застосування семантичних класів.
- `Changelog.md` — журнал змін по версіях та релізах.
- `package.json` — залежності клієнта, скрипти Vite/Playwright/Firebase deploy.
- `package-lock.json` — зафіксовані версії залежностей npm.
- `index.html` — HTML-шаблон Vite, підключення `index.tsx`, базові мета-дані.
- `index.tsx` — точка входу React, підключення провайдерів і роутера.
- `tsconfig.json` — налаштування TypeScript та аліасів імпорту.
- `vite.config.ts` — конфіг Vite, порти dev-сервера, aliases, manual chunks.
- `tailwind.config.cjs` — Tailwind-теми, токени, кольори, шрифти, розміри.
- `postcss.config.cjs` — PostCSS плагіни для Tailwind та Autoprefixer.
- `playwright.visual.config.ts` — конфіг візуальних тестів Playwright.
- `firebase.json` — Firebase hosting/functions конфіг, rewrites на SPA.
- `firestore.rules` — правила доступу Firestore для ролей, users/requests/documents.
- `storage.rules` — правила Firebase Storage, доступ до файлів документів/thumbnail.
- `cors.json` — CORS для Firebase Storage у локальній розробці.

**Firebase Functions**
- `functions/package.json` — залежності Cloud Functions, скрипти emulators/deploy.
- `functions/package-lock.json` — lockfile для Cloud Functions.
- `functions/index.js` — Cloud Functions: синхронізація email користувача та адмін-оновлення email.

**Публічні ресурси**
- `public/favicon.svg` — favicon сайту.
- `public/assets/projects/Herosn/Herson.jpg` — зображення для блоку проєктів.
- `public/assets/projects/Herosn/Herson_1.jpg` — зображення для блоку проєктів.
- `public/assets/projects/Herosn/Herson_2.jpg` — зображення для блоку проєктів.
- `public/calculators/СКАТНА покрівля 2023 09.xls` — калькулятор скатної покрівлі.
- `public/calculators/соффит 2025.xlsm` — калькулятор софіту.
- `public/calculators/варіанти системRecyfix Standart 100.xlsx` — калькулятор дренажних систем.
- `public/calculators/Плоска покрівля 2023.xlsx` — калькулятор плоскої покрівлі.
- `public/calculators/САЙДИНГ 2.5.xlsm` — калькулятор сайдингу.
- `public/calculators/ТТР_Суміщеного_покриття_.xlsx` — калькулятор ТТР.
- `public/calculators/PROFIL  двораструбні коліна.xlsm` — калькулятор колін/вузлів.

**Тести та артефакти**
- `tests/visual/app.visual.spec.ts` — Playwright візуальні тести основних сторінок і модалки логіну.
- `tests/visual/app.visual.spec.ts-snapshots/landing-page-desktop-chromium-linux.png` — еталонний скріншот landing page (desktop).
- `tests/visual/app.visual.spec.ts-snapshots/landing-page-mobile-chromium-linux.png` — еталонний скріншот landing page (mobile).
- `tests/visual/app.visual.spec.ts-snapshots/services-page-desktop-chromium-linux.png` — еталонний скріншот services page (desktop).
- `tests/visual/app.visual.spec.ts-snapshots/services-page-mobile-chromium-linux.png` — еталонний скріншот services page (mobile).
- `tests/visual/app.visual.spec.ts-snapshots/database-page-desktop-chromium-linux.png` — еталонний скріншот database page (desktop).
- `tests/visual/app.visual.spec.ts-snapshots/database-page-mobile-chromium-linux.png` — еталонний скріншот database page (mobile).
- `tests/visual/app.visual.spec.ts-snapshots/admin-gate-page-desktop-chromium-linux.png` — еталонний скріншот адмін-гейту (desktop).
- `tests/visual/app.visual.spec.ts-snapshots/admin-gate-page-mobile-chromium-linux.png` — еталонний скріншот адмін-гейту (mobile).
- `tests/visual/app.visual.spec.ts-snapshots/login-modal-desktop-chromium-linux.png` — еталонний скріншот модалки логіну (desktop).
- `tests/visual/app.visual.spec.ts-snapshots/login-modal-mobile-chromium-linux.png` — еталонний скріншот модалки логіну (mobile).

**SRC: кореневі файли**
- `src/vite-env.d.ts` — типи для `import.meta.env` з Firebase змінними.

**SRC: App**
- `src/app/App.tsx` — головний роутинг, підключення layout, модалок, адмін-доступу, контролів.
- `src/app/layouts/MainLayout.tsx` — загальний layout із навігацією, header/footer, mobile tabs.
- `src/app/providers/AuthProvider.tsx` — контекст авторизації, підписка на Firebase Auth.
- `src/app/providers/ModalProvider/ModalProvider.tsx` — глобальний modal state, `openModal/closeModal`.
- `src/app/providers/ModalProvider/GlobalModals.tsx` — рендерер модалок за типами і правами.
- `src/app/providers/i18n/config.ts` — ініціалізація i18next, uk/en ресурси.
- `src/app/providers/i18n/i18n.tsx` — контекст i18n, `useI18n`, перемикання мови.
- `src/app/providers/i18n/locales/uk.json` — українські переклади UI.
- `src/app/providers/i18n/locales/en.json` — англійські переклади UI.
- `src/app/styles/tailwind.css` — базові стилі та підключення токенів/тем.
- `src/app/styles/tokens.css` — CSS токени кольорів, шрифтів, розмірів.
- `src/app/styles/themes/default.css` — дефолтна тема з primary/accent.
- `src/app/styles/themes/citrine.css` — альтернативна «citrine» тема.

**SRC: Shared Config**
- `src/shared/config/constants.ts` — набори ролей `BUSINESS_ROLES` і `ALL_ROLES`.
- `src/shared/config/metadata.json` — метадані додатка (name/description).

**SRC: Shared Types**
- `src/shared/types/index.ts` — типи домену: `UserRole`, `Document`, `Category`, `Tag` тощо.

**SRC: Shared API (Firebase/Firestore/Storage)**
- `src/shared/api/firebase/firebase.ts` — ініціалізація Firebase app, `db`, `auth`, `storage`, `functions`.
- `src/shared/api/firebase/auth.ts` — логін/реєстрація, роль користувача, `subscribeToAuthChanges`.
- `src/shared/api/firestore/documents.api.ts` — CRUD документів, підписка, оновлення контенту.
- `src/shared/api/firestore/categories.api.ts` — CRUD категорій і підписка.
- `src/shared/api/firestore/tags.api.ts` — CRUD тегів і підписка.
- `src/shared/api/firestore/users.api.ts` — CRUD користувачів, заявки доступу, callable email update.
- `src/shared/api/storage/storage.api.ts` — робота з файлами/зображеннями документів у Storage.

**SRC: Shared Hooks**
- `src/shared/hooks/useTheme.ts` — збереження теми, toggle, синхронізація з `documentElement`.
- `src/shared/hooks/useAdminActions.ts` — адмін-операції з документами/категоріями.
- `src/shared/hooks/useDocumentManagement.ts` — фільтри, пагінація, URL sync, агрегація документів.

**SRC: Shared Utils & Lib**
- `src/shared/lib/utils/format.ts` — форматування дат, нормалізація ключів категорій.
- `src/shared/lib/utils/cn.ts` — простий helper для класів.
- `src/shared/lib/permissions/permissions.ts` — перевірки доступу до категорій/документів.
- `src/shared/lib/image/compression.ts` — стиснення/ресайз зображень перед upload.

**SRC: Shared UI**
- `src/shared/ui/primitives/Button.tsx` — базова кнопка з варіантами та розмірами.
- `src/shared/ui/primitives/Input.tsx` — стилізований input.
- `src/shared/ui/primitives/Card.tsx` — базова картка/поверхня.
- `src/shared/ui/primitives/Modal.tsx` — модальний оверлей і панель.
- `src/shared/ui/primitives/AdminTable.tsx` — таблиця і підкомпоненти для адмін-таблиць.
- `src/shared/ui/primitives/index.ts` — реекспорт примітивів.
- `src/shared/ui/Pagination.tsx` — навігація по сторінках.
- `src/shared/ui/LanguageSwitcher.tsx` — перемикач мови.
- `src/shared/ui/ThemeSwitcher/ThemeSwitcher.tsx` — кнопка перемикання теми.
- `src/shared/ui/ThemeSwitcher/index.ts` — реекспорт ThemeSwitcher.
- `src/shared/ui/UserAccessControl/UserAccessControl.tsx` — блок користувача/входу/виходу.
- `src/shared/ui/UserAccessControl/index.ts` — реекспорт UserAccessControl.
- `src/shared/ui/states/StatePanel.tsx` — стан-заглушка (loading/empty/error/success).
- `src/shared/ui/states/index.ts` — реекспорт StatePanel.
- `src/shared/ui/icons/Icon.tsx` — мапа SVG-іконок, компонент `Icon`.
- `src/shared/ui/icons/index.ts` — реекспорт Icon.
- `src/shared/ui/DocumentComponents/DocumentComponents.tsx` — рендер карток документів, список, skeleton.
- `src/shared/ui/DocumentComponents/index.ts` — реекспорт DocumentComponents.

**SRC: Entities**
- `src/entities/category/model/useCategories.ts` — підписка на категорії Firestore.
- `src/entities/tag/model/useTags.ts` — підписка на теги Firestore.
- `src/entities/document/model/useDocuments.ts` — завантаження/фільтрація документів.

**SRC: Pages**
- `src/pages/LandingPage/LandingPage.tsx` — landing, hero, FAQ, CTA, інтро до сервісів/БД.
- `src/pages/LandingPage/ui/ProjectsSection.tsx` — секція прикладів проєктів (bento grid).
- `src/pages/LandingPage/ui/ServicesTeaser.tsx` — тизер сервісів і CTA на `/services`.
- `src/pages/LandingPage/ui/DatabaseTeaser.tsx` — тизер бази знань і CTA на `/database`.
- `src/pages/ServicesPage/ServicesPage.tsx` — сторінка сервісів, секції/картки, drawer прикладів.
- `src/pages/CalculatorsPage/CalculatorsPage.tsx` — каталог калькуляторів з фільтрами.
- `src/pages/AdminPage.tsx` — page-обгортка адмінки з перевіркою ролі.
- `src/pages/UIPlaygroundPage.tsx` — візуальний playground для примітивів.

**SRC: Widgets**
- `src/widgets/DashboardView/DashboardView.tsx` — збірка dashboard: sidebar, фільтри, список, пагінація.
- `src/widgets/DashboardView/ui/DashboardHeader.tsx` — заголовок і опис dashboard.
- `src/widgets/DashboardView/ui/DashboardFilters.tsx` — пошук, сортування, view mode.
- `src/widgets/DashboardView/ui/DocumentList.tsx` — grid/list документів з empty/loading.
- `src/widgets/DashboardView/index.ts` — реекспорт DashboardView.
- `src/widgets/Sidebar/Sidebar.tsx` — фільтри категорій/типів/тегів/ролей.
- `src/widgets/Sidebar/index.ts` — реекспорт Sidebar.
- `src/widgets/SupportSidebar/ui/SupportSidebar.tsx` — sidebar підтримки з автоповедінкою на лендингу.
- `src/widgets/AdminPanel/AdminPanel.tsx` — адмін-панель, таби, дії, стани.
- `src/widgets/AdminPanel/ui/AdminHeader.tsx` — заголовок адмін-панелі.
- `src/widgets/AdminPanel/ui/AdminTabs.tsx` — меню табів і badges для health/requests.
- `src/widgets/AdminPanel/ui/ContentTab.tsx` — керування категоріями й документами, bulk-операції.
- `src/widgets/AdminPanel/ui/TagsTab.tsx` — керування тегами.
- `src/widgets/AdminPanel/ui/UsersTab.tsx` — керування користувачами.
- `src/widgets/AdminPanel/ui/RequestsTab.tsx` — опрацювання заявок доступу.
- `src/widgets/AdminPanel/ui/HealthTab.tsx` — діагностика проблем даних і bulk-fix.
- `src/widgets/AdminPanel/index.ts` — реекспорт AdminPanel.

**SRC: Modals**
- `src/widgets/modals/LoginModal.tsx` — логін/реєстрація/заявка доступу.
- `src/widgets/modals/DocumentModal.tsx` — перегляд документа, preview, завантаження файлів.
- `src/widgets/modals/DocumentEditorModal.tsx` — редагування метаданих документа, permissions, tags.
- `src/widgets/modals/CategoryEditorModal.tsx` — редагування категорій, іконок, permissions.
- `src/widgets/modals/TagEditorModal.tsx` — редагування тегів та кольорів.
- `src/widgets/modals/UserEditorModal.tsx` — редагування профілю користувача й ролі.
