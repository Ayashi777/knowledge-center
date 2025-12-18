# Changelog

All notable changes to this project will be documented in this file.

## [1.4.1] - 2025-12-18
### Fixed
- Improved `/admin` route access: instead of redirecting to home, it now prompts for admin login.
- Fixed UI issue where admin components would unmount prematurely during role transitions.

### Changed
- Refined `AdminRoute` guard with a dedicated landing state.
