# Document Management Service

A robust document management microservice built with Node.js, Express, TypeScript, and Prisma ORM. This service provides comprehensive APIs for managing document categories, document types, file uploads, and user documents with support for multi-tenancy (agency-based).

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [File Storage](#file-storage)
- [Scheduled Tasks](#scheduled-tasks)
- [Database Schema](#database-schema)

---

## Features

- **Multi-tenant Architecture** - Agency-based data isolation
- **Document Categories** - Organize document types into logical categories
- **Document Type Requirements** - Define required documents with allowed file extensions
- **Two-Phase File Upload** - Upload to temp storage, then finalize to permanent storage
- **Version Tracking** - Automatic version numbering for documents
- **File Validation** - Extension validation against document type requirements
- **Duplicate Prevention** - Prevents duplicate document uploads per user/document type
- **Soft Delete** - All deletions are soft deletes for data recovery
- **Pagination** - Built-in pagination with meta information
- **Automatic Cleanup** - Scheduled task to clean orphaned temp files

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime environment |
| Express.js | Web framework |
| TypeScript | Type-safe JavaScript |
| Prisma | ORM for database operations |
| PostgreSQL | Primary database |
| Multer | File upload handling |
| node-cron | Scheduled tasks |

---

## Project Structure

```
src/
├── app/
│   ├── middlewares/          # Express middlewares
│   ├── modules/              # Feature modules
│   │   ├── document/         # Document CRUD operations
│   │   ├── document-category/# Category management
│   │   ├── document-type/    # Document type requirements
│   │   └── upload/           # File upload handling
│   └── routes/               # Route definitions
├── config/                   # Application configuration
├── errors/                   # Error handling utilities
├── interfaces/               # TypeScript interfaces
├── schedulers/               # Cron job definitions
├── shared/                   # Shared utilities
├── app.ts                    # Express app setup
└── server.ts                 # Server entry point

uploads/
├── temp/                     # Temporary file storage
└── permanent/                # Finalized document storage
```

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables (see below)
4. Run database migrations:
   ```
   npx prisma db push
   ```
5. Start the development server:
   ```
   npm run dev
   ```

The server will start on the configured port (default: 3005).

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3005 |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `FILE_UPLOAD_DIR` | Base upload directory | ./uploads |
| `FILE_TEMP_DIR` | Temporary files directory | ./uploads/temp |
| `FILE_PERMANENT_DIR` | Permanent files directory | ./uploads/permanent |
| `MAX_FILE_SIZE` | Maximum file size in bytes | 5242880 (5MB) |
| `TEMP_CLEANUP_ENABLED` | Enable temp cleanup scheduler | true |
| `TEMP_CLEANUP_CRON` | Cron schedule for cleanup | 0 * * * * (hourly) |
| `TEMP_CLEANUP_MAX_AGE_HOURS` | Max age for temp files | 24 |

---

## API Overview

**Base URL:** `/api/v1/documents-management`

### Document Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/documents-category` | Create a new category |
| GET | `/documents-category/:agencyId` | List all categories (paginated) |
| GET | `/documents-category/:agencyId/:id` | Get category by ID |
| PATCH | `/documents-category/:agencyId/:id` | Update category |
| DELETE | `/documents-category/:agencyId/:id` | Delete category |

### Document Types

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/document-type/:agencyId/:categoryId` | Create document type |
| GET | `/document-type/:agencyId/:categoryId/list` | List types in category |
| GET | `/document-type/:agencyId/grouped` | Get all types grouped by category |
| GET | `/document-type/:agencyId/:id` | Get document type by ID |
| PATCH | `/document-type/:agencyId/:id` | Update document type |
| DELETE | `/document-type/:agencyId/:id` | Delete document type |

### File Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload file(s) to temp storage |
| DELETE | `/upload/temp` | Delete temp files |

### Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/documents` | Create document(s) - finalize upload |
| GET | `/documents/:agencyId/user/:userId` | Get user's documents |
| DELETE | `/documents/:agencyId/user/:userId/:id` | Delete a document |
| GET | `/documents/:agencyId/:id` | Get document by ID |

For detailed API documentation with request/response examples, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

---

## File Storage

### Upload Flow

1. **Upload Phase**: Files are uploaded to temporary storage via `/upload` endpoint
2. **Finalize Phase**: When creating a document via `/documents`, files are moved from temp to permanent storage

### Storage Structure

```
uploads/
├── temp/
│   └── {randomId}_{originalFilename}
└── permanent/
    └── {agencyId}/
        └── {userType}/
            └── {userId}/
                └── {documentTypeId}/
                    └── v{version}_{timestamp}_{filename}
```

### File Naming Convention

Permanent files are named with version and timestamp for uniqueness:
- Format: `v{versionNumber}_{timestamp}_{originalFilename}`
- Example: `v1_1699123456789_passport.pdf`

---

## Scheduled Tasks

### Temp File Cleanup

- **Purpose**: Removes orphaned temporary files that were never finalized
- **Schedule**: Runs hourly (configurable via `TEMP_CLEANUP_CRON`)
- **Behavior**: Deletes temp files older than 24 hours (configurable via `TEMP_CLEANUP_MAX_AGE_HOURS`)

---

## Database Schema

### Main Tables

| Table | Description |
|-------|-------------|
| `DocumentCategory` | Document categories per agency |
| `DocumentTypeRequirements` | Document type definitions with allowed extensions |
| `Document` | User documents with metadata |
| `DocumentVersion` | Version history for documents |
| `DocumentAuditLog` | Audit trail for document actions |

### Key Relationships

- Each **Agency** can have multiple **Categories**
- Each **Category** can have multiple **Document Types**
- Each **User** can have multiple **Documents**
- Each **Document** can have multiple **Versions**
- All actions are logged in **Audit Log**

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## License

ISC
