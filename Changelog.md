# Changelog

All notable changes to this project will be documented in this file.

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
