# Backend Tools & Utilities

Organized utilities for backend management, organized by function.

## Directory Structure

```
src/tools/
├── admin/                    # Admin user management
│   └── user-management.js   # Manage admin users
├── banner/                  # Banner management
│   └── upload.js           # Upload banner to Cloudinary
└── README.md
```

## Usage

### Banner Tools

#### Upload Banner to Cloudinary

Upload an image to Cloudinary and save the URL to the database.

```bash
# Using npm script
npm run tool:banner:upload

# Direct usage
node --input-type=module -e "import('./src/tools/banner/upload.js').then(m => m.uploadBanner())"

# With custom options
node --input-type=module -e "
import('./src/tools/banner/upload.js').then(m => m.uploadBanner({
  bannerName: 'My Custom Banner',
  description: 'Custom description',
  position: 'HOME_TOP',
  imageUrl: 'https://example.com/image.jpg',
  link: 'https://example.com/promo'
}))
"
```

**Features:**

- Auto-login with admin credentials
- Download image from URL
- Upload to Cloudinary via backend API
- Save URL to PostgreSQL database
- Cleanup temp files

### Admin Tools

#### List All Admin Users

```bash
npm run tool:admin:list
```

#### Get Admin User Details

```bash
npm run tool:admin:get -- admin@gmail.com
npm run tool:admin:get -- 1
```

#### Set Admin Password

```bash
npm run tool:admin:password -- admin@gmail.com newpassword123
```

#### Enable/Disable Admin User

```bash
npm run tool:admin:enable -- admin@gmail.com
npm run tool:admin:disable -- admin@gmail.com
```

## Environment Variables

Create `.env` file in backend root with:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key
CLOUDINARY_URL=cloudinary://key:secret@clud_name
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=admin123
BACKEND_URL=http://localhost:5001
```

## Adding New Tools

When adding new utilities:

1. Create a new directory under `src/tools/` (e.g., `src/tools/coupon/`)
2. Create tool files (e.g., `generate.js`, `export.js`)
3. Export functions and add CLI interface at bottom of file
4. Add npm scripts to `package.json`
5. Update this README

Example structure:

```javascript
// src/tools/coupon/generate.js
export async function generateCoupons(options = {}) {
  // Implementation
}

if (import.meta.url === `file://${process.argv[1]}`) {
  // CLI interface
}
```

## npm Scripts Reference

```json
{
  "scripts": {
    "tool:banner:upload": "node src/tools/banner/upload.js",
    "tool:admin:list": "node src/tools/admin/user-management.js list",
    "tool:admin:get": "node src/tools/admin/user-management.js get",
    "tool:admin:password": "node src/tools/admin/user-management.js password",
    "tool:admin:enable": "node src/tools/admin/user-management.js enable",
    "tool:admin:disable": "node src/tools/admin/user-management.js disable"
  }
}
```

## Best Practices

- Keep tools focused on one task
- Export functions for programmatic use
- Add CLI interface for command-line use
- Load env vars with `dotenv/config.js`
- Use naming convention: `<feature>/<action>.js`
- Document in README with examples
- Cleanup temporary files
- Return data for reuse in other scripts
