# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2025-12-18
### Added
- **Admin Password Protection**: Entering 'admin' role now requires a password (`admin2025`).
- **Access Requests Management**: New "Requests" tab in Admin Panel to approve/deny user requests.
- **Session Persistence**: User role and theme settings are now saved in `localStorage`.
- **Improved Security UX**: Password masking and error handling for admin login.

### Changed
- Updated `Modals.tsx` to support multi-step login process.
- Enhanced `AdminPanel.tsx` with request notifications and action buttons.
- Updated translations for password and login-related labels.

### Fixed
- Issue where theme and role were lost on page refresh.
