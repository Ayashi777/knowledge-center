# Changelog

All notable changes to this project will be documented in this file.

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
