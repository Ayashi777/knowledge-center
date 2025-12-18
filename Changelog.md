# Changelog

All notable changes to this project will be documented in this file.

## [1.5.0] - 2025-12-18
### Added
- **Full Admin Dashboard**: Transformed Admin Panel from a modal to a dedicated page layout with internal navigation.
- **Category Management**: Admins can now add, edit, and delete resource categories.
- **Document Management Tab**: Centralized list of all documents with quick edit/delete actions.
- **Improved Sidebar for Admin**: Added internal admin navigation with status indicators for pending requests.

### Changed
- Replaced modal-based admin interface with a structured page at `/admin`.
- Enhanced document and category save logic to handle creations and updates consistently.
- Updated `App.tsx` to support the new Admin API and navigation state.

### Fixed
- Navigation guards for admin routes now provide a clear landing state for unauthorized users.
