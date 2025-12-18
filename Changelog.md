# Changelog

All notable changes to this project will be documented in this file.

## [1.8.0] - 2025-12-18
### Added
- **Full Firebase Authentication**: Real email/password sign-in and registration.
- **Firestore User Profiles**: User roles are now stored and fetched from Firestore `users` collection.
- **Auth State Observer**: Automatic session recovery on page refresh.
- **Enhanced Login UI**: Multi-view modal for login and registration with validation.
- **Secure Logout**: Clear session and redirect to home.

### Changed
- Replaced simulated role selection with secure Firebase Auth.
- Updated `App.tsx` to handle async auth loading states.
- Cleaned up `localStorage` role persistence in favor of Firebase's native session management.

### Fixed
- UI flickering during initial authentication check.
