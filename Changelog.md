# Changelog

All notable changes to this project will be documented in this file.

## [3.1.0] - 2025-12-21
### Added
- **Centralized Tag Management System**: Replaced the error-prone manual text entry for tags with a robust, centralized system.
- **Dedicated Tags Admin Tab**: Introduced a new tab in the admin panel (`#tags`) for managing the global tag database, allowing administrators to create, edit, and delete tags with custom colors.
- **Interactive Tag Picker**: Updated the document editor with a visual tag selector, allowing administrators to toggle tags from the centralized list, eliminating duplicates and typos.
- **Visual Tag Indicators**: Documents now display tags with their associated colors across the dashboard and document views for better categorization and visual scanning.

### Fixed
- **Tag Filtering Logic**: Corrected an issue where filtering by tags on the main dashboard caused a crash (`TypeError: i.has is not a function`) by migrating from `Set` to `Array.includes` for tag ID verification.
- **Type Safety**: Fully integrated the new `Tag` interface across the application, ensuring consistent data handling between Firestore and the UI.

## [3.0.1] - 2025-12-21
### Added
- **Cover Aspect Ratio Hint**: Added an informational hint in the admin panel recommending a 3:4 aspect ratio for document cover images.

### Fixed
- **System File Isolation**: Document cover images are now saved to a separate, hidden `/.system/` folder within the document's storage directory. This prevents them from appearing in the user-facing list of downloadable files.
- **Backward Compatibility for Covers**: The file listing logic is improved to also filter out legacy cover images by name (`thumbnail_*`, `cover_*`), ensuring they do not appear in user-facing file lists.

## [3.0.0] - 2025-12-21
### Added
- **Revamped Admin Document Management**: Completely redesigned the document management interface in the admin panel for enhanced usability and functionality.
- **Grid & List View Modes**: Introduced toggleable "Grid" and "List" views, allowing administrators to choose their preferred layout for browsing documents.
- **Direct Cover Upload**: Administrators can now directly upload cover images for documents from their computer, replacing the previous URL-only method. The grid view prominently displays these covers.
- **Advanced Filtering & Search**: Added a quick search bar and a category filter to instantly find specific documents.
- **URL-Based Navigation**: Implemented hash-based routing (`#documents`, `#users`, etc.) for admin panel tabs, enabling deep linking and preventing the active tab from resetting after data updates.

### Fixed
- **State Persistence**: Resolved a major UX issue where the admin panel would reset to the default tab after an action (like uploading a cover), by making the active tab dependent on the URL hash instead of local component state.

## [2.9.1] - 2025-12-20
### Fixed
- **Image Embedding (React Quill)**: Fixed an issue where images successfully uploaded to Firebase Storage but did not appear in the document body (stuck on “Uploading image…”).
- **Editor Reinitialization**: Stabilized the ReactQuill configuration by memoizing `modules` (`useMemo`), preventing unintended Quill re-creation during state updates (e.g., `isUploadingImage`), which previously broke placeholder replacement.
- **Selection/Range Warnings**: Reduced occurrences of `addRange(): The given range isn't in document` by avoiding unnecessary content resets and relying on Quill’s native `onChange` updates instead of manual HTML state syncing.
- **Placeholder Robustness**: Made the upload placeholder non-editable (`contentEditable=false`) to prevent cursor interaction from corrupting the embed DOM/blot mapping during uploads.

## [2.9.0] - 2025-12-19
### Fixed
- **Content Persistence**: Resolved a critical issue where saving document metadata (title/tags) in the admin panel would accidentally overwrite and delete the document's HTML content.
- **Firestore Synchronization**: Rewrote the content saving logic to use a "Read-Modify-Write" strategy (`getDoc` -> `setDoc`), eliminating `invalid nested entity` errors caused by Firestore dot-notation conflicts.
- **Metadata Isolation**: Decoupled the metadata saving function from the content saving function, ensuring that edits to titles or categories never impact the document body.

### Added
- **Visual Feedback**: Added real-time status indicators ("Saving...", "Saved ✓") to the document editor for better user confidence.
- **Robust Error Handling**: Improved error logging and user alerts during save operations to help diagnose connectivity or permission issues (e.g., AdBlock interference).

## [2.8.0] - 2025-12-19
### Added
- **Visual Content Editor (WYSIWYG)**: Replaced the rigid multi-field document editor with a modern, WordPress-like visual editor powered by `React Quill`.
- **Custom Document Thumbnails**: Administrators can now set custom cover images for documents via URL.
- **Rich Text Support**: Added support for headings, lists, bold/italic text, links, and embedded images directly within the document body.
- **Enhanced Typography**: Implemented custom CSS for document rendering with full dark mode support, ensuring professional-grade readability.
- **Advanced Category Management**: Redesigned the category editor with an icon picker and a streamlined access permissions matrix.

### Changed
- **Content Structure**: Migrated document data storage from multiple fixed sections to a single flexible HTML field for maximum flexibility.
- **Public Access Logic**: Documents in categories marked for "Guest" access are now accessible immediately without mandatory login.
- **Storage Security**: Updated Firebase Storage rules to allow public reading and listing of files for guest-accessible categories while maintaining strict admin-only write permissions.

### Fixed
- **File Loading**: Resolved a bug where document files were not loading correctly for certain user roles.
- **Translation Integrity**: Added missing translation keys for empty states, filter resets, and administrative UI elements.

## [2.7.1] - 2025-12-19
... [rest of changelog]
