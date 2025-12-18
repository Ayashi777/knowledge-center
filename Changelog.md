# Changelog

All notable changes to this project will be documented in this file.

## [1.4.0] - 2025-12-18
### Added
- **Full Routing Support**: Integrated `react-router-dom` for real URLs.
- **Permanent Links**: Documents now have unique URLs (e.g., `/doc/doc1`).
- **Protected Routes**: Navigation guards for `/admin` and document pages.
- **Deep Linking**: Refreshing the page now keeps the current document or view active.

### Changed
- Refactored `App.tsx` into a router-based architecture.
- Replaced state-based document selection with URL parameters.
- Improved header navigation with `useNavigate`.

### Fixed
- Navigation state persistence across browser history (back/forward buttons now work).
