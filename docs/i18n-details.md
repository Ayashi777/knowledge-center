# i18n: ключі та використання

## 1) Загальні принципи

- i18n конфіг: `src/app/providers/i18n/config.ts`.
- Використовується `react-i18next`.
- Активна мова форситься як `uk`.
- Переклади зберігаються у:
  - `src/app/providers/i18n/locales/uk.json`
  - `src/app/providers/i18n/locales/en.json`

Усі компоненти, які потребують текст, отримують `t()` через `useI18n()`.

## 2) Основні групи ключів (за контекстом UI)

### Header / Navigation
- `header.nav.home`
- `header.nav.database`
- `header.nav.services`
- `header.nav.calculators`
- `header.nav.admin`
- `header.login`, `header.logout`, `header.adminPanel`

Використання: `MainLayout`, `UserAccessControl`.

### Footer
- `footer.copyright`

Використання: `MainLayout`.

### Dashboard
- `dashboard.title`, `dashboard.subtitle`, `dashboard.description`
- `dashboard.searchPlaceholder`
- `dashboard.sortBy`, `dashboard.mostRecent`, `dashboard.alphabetical`
- `dashboard.viewAs`, `dashboard.results`
- `dashboard.noResults`, `dashboard.noResultsDescription`
- `dashboard.clearFilters`

Використання: `DashboardHeader`, `DashboardFilters`, `DocumentList`, `Sidebar`.

### Sidebar
- `sidebar.filters`
- `sidebar.categories`
- `sidebar.documentType`
- `sidebar.trademark`
- `sidebar.forWhom`
- `sidebar.additionalTags`
- `sidebar.helpTitle`, `sidebar.helpDescription`, `sidebar.contactUs`

Використання: `Sidebar`.

### Roles
- `roles.guest`, `roles.admin`, тощо
- `roles.<role>Desc`

Використання: `LoginModal`, `Sidebar`, `UserAccessControl`, `AdminPanel`.

### Document View / Modal
- `docView.preview`
- `docView.info`
- `docView.accessDenied`
- `docView.accessRequiredForRoles`
- `docView.downloadFiles`
- `docView.filesEmpty`

Використання: `DocumentModal`.

### Login / Registration
- `loginModal.welcome`
- `loginModal.subtitle`
- `loginModal.emailLabel`
- `loginModal.passwordLabel`
- `loginModal.processing`
- `loginModal.submitButton`
- `loginModal.noAccount`
- `loginModal.accessLevelsTitle`

- `registrationModal.title`
- `registrationModal.description`
- `registrationModal.fieldRoleType`
- `registrationModal.fieldName`
- `registrationModal.fieldCompany`
- `registrationModal.fieldPhone`
- `registrationModal.fieldEmail`
- `registrationModal.fieldPassword`
- `registrationModal.fieldPasswordConfirm`
- `registrationModal.buttonSubmit`
- `registrationModal.successTitle`
- `registrationModal.successDescription`
- `registrationModal.buttonClose`

Використання: `LoginModal`.

### Admin Panel
- `adminRequests.*` (таблиця заявок)
- `tagEditor.*`, `userEditorModal.*`, `categoryEditorModal.*`
- `editorModal.*`

Використання: `AdminPanel`, `RequestsTab`, `TagEditorModal`, `UserEditorModal`, `CategoryEditorModal`, `DocumentEditorModal`.

### Landing
- `landing.hero.*`
- `landing.for_whom.*`
- `landing.sectors.*`
- `landing.db_teaser.*`
- `landing.teaser.*`
- `landing.projects.*`
- `landing.faq.*`
- `landing.final_cta.*`

Використання: `LandingPage` та її підкомпоненти.

### Services
- `services.title`, `services.subtitle`
- `services.<section>.title/desc`
- `services.form.*`
- `services.support_note`

Використання: `ServicesPage`.

### Calculators
- `calculators.title`, `calculators.subtitle`, `calculators.badge`
- `calculators.groups.*`
- `calculators.items.*`
- `calculators.labels.inputs/result`
- `calculators.quickFilter.*`

Використання: `CalculatorsPage`.

### Common
- `common.add`, `common.save`, `common.cancel`
- `common.loading`, `common.error`, `common.notFound`
- `common.confirmDelete`
- `common.approve`, `common.deny`
- `common.result`, `common.exampleCalculation`, `common.order`

Використання: майже всюди.

## 3) Важливі практики

- Для title/description документів:
  - якщо в документі є `titleKey`, використовується `t(titleKey)`.
  - якщо немає, використовується `doc.title`.
- `getCategoryName` нормалізує ключ і використовує i18n.

## 4) Що можна деталізувати ще

Якщо треба повний перелік всіх ключів із `uk.json`, скажи — додам окремий файл `docs/i18n-keys.md` зі списком.

