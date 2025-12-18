# Changelog

All notable changes to this project will be documented in this file.

## [1.7.0] - 2025-12-18
### Added
- **Admin File Management System**: Dedicated UI to manage files for each document.
- **Support for More Formats**: Now supports `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`.
- **File CRUD**: Admins can now view, upload, and delete files directly from the `/admin` page.
- **Enhanced Validation**: Client-side file extension checking.
- **Storage UI**: Loading indicators and empty states for file management.

### Changed
- Refactored `AdminPanel.tsx` to support a nested "File Manager" view for documents.
- Improved layout consistency in the Admin dashboard.

### Fixed
- Fixed issue where file types other than PDF/DWG were not correctly handled.
