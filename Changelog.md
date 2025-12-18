# Changelog

All notable changes to this project will be documented in this file.

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

## [2.4.7] - 2025-12-19
### Added
- **Interactive Password Requirements**: Added a real-time checklist under the password field in the registration form.
- **Visual Feedback**: Requirements (length, numbers, uppercase, lowercase) now turn green with a checkmark as the user types.

### Fixed
- **Password Validation Logic**: Completely rewrote the regex-based validation to correctly handle special characters like `_`, `$`, and others.
- **UI Polishing**: Enhanced the spacing and layout of the password requirement indicators for better readability.

## [2.4.6] - 2025-12-19
### Changed
- **Optimization**: Implemented code splitting (manual chunks) in Vite config. Large libraries are now bundled into a separate `vendor.js` file to improve load times and fix "chunk size" warnings.
- **Build**: Increased chunkSizeWarningLimit to 1000kB for better development experience.

## [2.4.5] - 2025-12-19
### Fixed
- **UI Polishing**: Added `focus:ring-inset` to input fields to prevent focus outlines from being clipped by containers.
- **Registration UX**: Added a password requirement hint ("Minimum 8 characters") under the password field.
- **Form Layout**: Improved spacing and padding within the registration modal for a cleaner look.

## [2.4.4] - 2025-12-19
### Fixed
- **Cache Invalidation**: Bumped package version to `1.2.1` to force cache clearing and ensure users see the latest registration form updates.
- **Registration Form**: Confirmed presence of password confirmation fields and validation logic in the production build.

## [2.4.3] - 2025-12-19
### Added
- **Secure Registration**: Implemented password confirmation field and length validation (min 8 chars) in the registration form.
- **Enhanced Validation**: Added checks to ensure passwords match and required fields are filled before submission.

## [2.4.2] - 2025-12-19
### Fixed
- **Admin Approval Logic**: Fixed an issue where approving a request would not correctly assign the role if the user was not found by UID (added email fallback).
- **Request Metadata**: Added display of "Requested Role" in the Admin Panel so admins can see what the user asked for.
- **Role Assignment**: The approval dropdown now defaults to the user's requested role instead of always defaulting to "Foreman".

## [2.4.1] - 2025-12-19
### Fixed
- **App Crash Protection**: Added robust safety checks in the i18n translation engine to prevent application crashes during hard refreshes (`Ctrl+Shift+R`) or when data is partially loaded.
- **Null Reference Safety**: Improved `resolveKey` logic to handle `undefined` or `null` translation keys gracefully.

## [2.4.0] - 2025-12-19
### Added
- **Full Registration Workflow**: Users can now create accounts directly with Email/Password.
- **Role Request System**: During registration, users must select their desired role (Foreman/Designer) and provide company details.
- **Admin Approval Process**: Administrators can now approve requests and assign roles directly from the Admin Panel.
- **Database Integration**: User profiles are automatically created in Firestore upon registration with `guest` status until approved.

### Changed
- **Auth Flow**: Switched from "Request Only" to "Register & Wait" model. Users get immediate account access but with limited permissions until approved.
- **Admin Interface**: Added role selection dropdowns to the "Requests" tab for streamlined user onboarding.
- **Security**: Enhanced validation in registration forms to require role selection and strong passwords.

## [2.3.0] - 2025-12-18
### Added
- **Bootstrap Admin Logic**: The very first user to sign in now automatically receives the `admin` role if the database is empty.
- **User Directory**: Real-time management of registered users in the Admin Panel.
- **Request Workflow Integration**: Access requests are now stored in Firestore and manageable from the Admin Panel.
- **Improved UI for Admin Routes**: Added localized labels and professional styling for admin navigation.

### Changed
- **Ukrainian-First UI**: Set Ukrainian as the default and only active language. Removed the language switcher for a cleaner experience.
- **Integrated Auth Modal**: Merged the registration request form directly into the Login Modal to avoid unnecessary popups.
- **Access Level Panel**: Added a dedicated section in the Login Modal explaining the benefits of each user role (Foreman, Designer, Admin).
- **Security Update**: Enforced closed registration where new users must be approved or manually assigned roles by an admin.

### Fixed
- **Real-time Sync**: Fixed issues with data not updating immediately across different tabs.
- **Tag Selection**: Resolved a reference error in the Dashboard's tag filtering logic.
- **Firestore Rules Compatibility**: Updated Auth logic to work seamlessly with initial empty database states.
