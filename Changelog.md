# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2025-12-18
### Added
- New **Admin Panel** for centralized role and permission management.
- **Role Matrix**: Interactive table for admins to manage category visibility per role.
- Custom `favicon.svg` and improved `index.html` metadata.
- **RBAC (Role-Based Access Control)**: Enhanced logic for document and category access.
- `firebase.json` and `.firebaserc` for standard Firebase CLI deployments.
- `Changelog.md` to track project evolution.

### Changed
- **Major Refactoring**: Split `App.tsx` into modular components (`/components`), custom hooks (`/hooks`), and utilities (`/utils`).
- Updated `README.md` with detailed project structure and interaction logic.
- Improved Header UI with compact role display and quick admin access.

### Fixed
- Security: Updated React and React-Dom to version 19.2.3 (CVE-2025-55182 fix).
- Fixed `TypeError` caused by missing `viewPermissions` in categories data.

## [1.1.0] - 2025-12-17
### Added
- Initial Implementation of Knowledge Center UI.
- Light/Dark theme support.
- Multilingual support (UK/EN).
- Document list and grid views.
