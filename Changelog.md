# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2025-12-18
### Added
- **Modern Authentication Flow**: Replaced simulated roles with a unified Email/Password system.
- **Access Level Information**: New UI component in login modal explaining user roles and permissions.
- **Enhanced Admin Landing**: Dedicated unauthorized state for `/admin` with clear call-to-action.
- **User Directory Real-time Management**: Admins can now manage all registered users directly from the dashboard.
- **Firestore Full Synchronization**: Categories and Documents are now 100% cloud-based.

### Changed
- Major UI overhaul of Modals and Header.
- Improved UX for unauthorized route access.
- Unified Register/Login into a single professional multi-pane component.

### Fixed
- Navigation loop issues on restricted routes.
- Tag selection reference error.
