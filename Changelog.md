# Changelog

All notable changes to this project will be documented in this file.

## [1.9.0] - 2025-12-18
### Added
- **Full Firestore Integration**: All documents and categories are now managed via Firebase Firestore.
- **Real-time Updates**: Live synchronization of data across all connected clients.
- **Database Initialization Tool**: Added a one-click button for admins to seed the database with initial content.
- **Persistent User Profiles**: User roles are fully integrated with Firestore `users` collection.

### Changed
- Migrated `useDocuments` hook to use Firebase `onSnapshot` for real-time data flow.
- Updated `App.tsx` with async Firestore CRUD operations for documents and categories.

### Fixed
- Fixed data loss on page refresh (data now persists in the cloud).
