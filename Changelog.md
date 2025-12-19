# Changelog

All notable changes to this project will be documented in this file.

## [2.7.1] - 2025-12-19
### Fixed
- **Auth Robustness**: Improved user role fetching logic to be more resilient. The system now handles non-standard Firestore field names (e.g., fields with trailing spaces like `"role "`) and ensures case-insensitive role matching.
- **Debugging**: Added detailed console logging for the authentication flow to simplify troubleshooting of role assignment issues.

## [2.7.0] - 2025-12-19
### Removed
- **Bootstrap Logic**: Removed "Emergency Initialize Database" feature to ensure a clean slate for production.
- **Auto-Admin Promotion**: Disabled the logic that automatically assigned the `admin` role to the first user. All roles must now be assigned manually via Firestore for enhanced security.
- **Demo Data**: Cleared all hardcoded categories and documents from `constants.ts`.

... [rest of changelog]
