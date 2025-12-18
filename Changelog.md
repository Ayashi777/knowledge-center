# Changelog

All notable changes to this project will be documented in this file.

## [2.2.0] - 2025-12-18
### Added
- **Closed Registration System**: Replaced public sign-up with an "Access Request" workflow.
- **Request Management**: New user requests are saved to Firestore `requests` collection for admin review.
- **Localized Auth UI**: Fully translated Login and Request modals into Ukrainian.

### Changed
- Removed "Create Account" functionality from the login screen to enforce security.
- Updated `LoginModal` design with a side-by-side layout (Form + Info Panel).
- Refined "Access Levels" descriptions to better explain role capabilities to new users.

### Fixed
- Addressed UI inconsistencies in modal rendering on mobile devices.
