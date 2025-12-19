# Changelog

All notable changes to this project will be documented in this file.

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
