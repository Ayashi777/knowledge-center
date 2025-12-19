# Changelog

All notable changes to this project will be documented in this file.

## [2.7.0] - 2025-12-19
### Removed
- **Bootstrap Logic**: Removed "Emergency Initialize Database" feature to ensure a clean slate for production.
- **Auto-Admin Promotion**: Disabled the logic that automatically assigned the `admin` role to the first user. All roles must now be assigned manually via Firestore for enhanced security.
- **Demo Data**: Cleared all hardcoded categories and documents from `constants.ts`.

### Changed
- **System Initialization**: The application now relies entirely on dynamic data from Firestore rather than local constants for its initial state.

## [2.6.0] - 2025-12-19
### Added
- **User Email Synchronization**: Implemented full synchronization between Firestore user profiles and Firebase Authentication.
- **Cloud Functions Integration**: Added a background Firebase Cloud Function (`syncuseremail`) in the `europe-west3` region to automatically update a user's login email when changed in the Admin Panel.
- **Admin Email Editing**: Administrators can now update a user's email address directly from the User Editor Modal.
- **Blaze Plan Support**: Initialized and deployed the project's first Cloud Functions to handle administrative tasks securely.

### Changed
- **User Editor Modal**: Enhanced the UI with an email input field and updated synchronization status messaging.
- **Project Structure**: Added a `functions` directory with Node.js 20 environment configuration.

## [2.5.0] - 2025-12-19
### Added
- **User Management**: Introduced a fully functional "Users" tab in the Admin Panel with a detailed table view.
- **Profile Editing**: Administrators can now edit user details (Name, Company, Phone, Role) via a new modal interface directly from the user list.
- **Architect Role**: Added a new `Architect` role with specific permissions, replacing `Admin` in public-facing role selection menus.
- **Admin Visibility**: The `Admin` role is now hidden from registration forms and public role lists to improve security and UX.

### Fixed
- **Admin Panel Restoration**: Fixed a regression where some admin tabs (Roles, Categories, Documents) were not rendering correctly.
- **Translation Keys**: Resolved missing translation keys for dashboard sorting, sidebar filters, and role descriptions (`roles.guest`, `sidebar.*`, `dashboard.*`).
- **Request Metadata**: Access requests now display full contact details (Phone, Email, Company) and the user's requested role for better vetting.
