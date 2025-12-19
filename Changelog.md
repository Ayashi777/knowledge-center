# Changelog

All notable changes to this project will be documented in this file.

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
