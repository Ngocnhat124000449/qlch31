# Backend Tools Organization Migration

## Summary

Backend utility scripts have been reorganized from loose root-level files into a structured `src/tools/` module for better maintainability.

## What Changed

### Directory Structure

**Before:**

```
backend/
├── insert-test-banner.js
├── create-banner-upload.js
├── create-banner-with-upload.js
├── upload-banner-simple.js
├── upload-banner-final.js
├── check-admin-email.js
├── check-admin.js
├── set-admin-password.js
├── test-me-api.js
├── export-schema.js
└── ... (loose utility files)
```

**After:**

```
backend/src/tools/
├── admin/
│   └── user-management.js       # All admin user utilities
├── banner/
│   └── upload.js               # Banner upload to Cloudinary
└── README.md                    # Documentation
```

### Migration Map

| Old File                  | New Location                         | New Usage                     |
| ------------------------- | ------------------------------------ | ----------------------------- |
| `insert-test-banner.js`   | `src/tools/banner/upload.js`         | `npm run tool:banner:upload`  |
| `create-banner-upload.js` | `src/tools/banner/upload.js`         | Part of upload.js module      |
| `upload-banner-final.js`  | `src/tools/banner/upload.js`         | `npm run tool:banner:upload`  |
| `check-admin-email.js`    | `src/tools/admin/user-management.js` | `npm run tool:admin:get`      |
| `set-admin-password.js`   | `src/tools/admin/user-management.js` | `npm run tool:admin:password` |

### New npm Scripts

```bash
# Banner Management
npm run tool:banner:upload

# Admin User Management
npm run tool:admin:list              # List all admins
npm run tool:admin:get -- <id|email> # Get admin details
npm run tool:admin:password -- <id> <pass>  # Set password
npm run tool:admin:enable -- <id|email>    # Enable user
npm run tool:admin:disable -- <id|email>   # Disable user
```

## Benefits

✅ **Clear Organization** - Related utilities grouped by functionality
✅ **Reusable Modules** - Functions can be imported and used programmatically
✅ **CLI Interface** - Each tool works as standalone script or module
✅ **Documentation** - `src/tools/README.md` explains usage and structure
✅ **Easy to Extend** - Clear pattern for adding new tools
✅ **Professional Structure** - Follows backend module naming conventions

## Next Steps

1. **Old loose files can be archived/deleted** when you're ready:
   - `insert-test-banner.js`
   - `create-banner-with-upload.js`
   - `create-banner-upload.js`
   - `check-admin-email.js`
   - `upload-banner-simple.js`
   - `upload-banner-final.js`
   - etc.

2. **Add more tools** following the same pattern:
   - Create `src/tools/<feature>/` directory
   - Create `<action>.js` files
   - Export functions with CLI interface
   - Add npm scripts to `package.json`
   - Document in `src/tools/README.md`

3. **Examples of future tools to add:**
   - `src/tools/database/export.js` - Export schema/data
   - `src/tools/coupon/generate.js` - Generate coupon codes
   - `src/tools/order/export.js` - Export orders
   - `src/tools/user/bulk-import.js` - Import users in bulk

## Using Tools Programmatically

Tools are built as modules and can be imported:

```javascript
// In another backend script or service
import { uploadBanner } from "./src/tools/banner/upload.js";

await uploadBanner({
  bannerName: "Promo Banner",
  description: "New promotion",
  position: "HOME_TOP",
  imageUrl: "https://...",
});
```

## Documentation

See `src/tools/README.md` for detailed usage examples and best practices.
