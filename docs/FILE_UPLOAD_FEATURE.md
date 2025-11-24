# Document File Upload Feature

## Overview

Two-phase file upload system:
1. **Upload** - Files go to temp folder, return path to frontend
2. **Save** - Move files to permanent, create DB records

Abandoned temp files are auto-cleaned by scheduler.

---

## Folder Structure

```
uploads/
├── temp/                                    # Auto-cleaned by scheduler
│   ├── {uuid}_{originalname}.pdf
│   └── ...
│
└── permanent/                               # Organized for access control
    └── {agencyId}/
        └── {userType}/
            └── {userId}/
                └── {documentTypeId}/
                    └── v{version}_{timestamp}_{filename}.ext
```

---

## Architecture

```
src/app/modules/documents/
├── document.interface.ts      # Types & DTOs
├── document.validation.ts     # Zod schemas
├── document.controller.ts     # Request handlers
├── document.service.ts        # Business logic
├── document.repository.ts     # Database operations
├── document.route.ts          # Route definitions
├── upload.service.ts          # File upload operations
└── fileManager.service.ts     # File system operations

src/schedulers/
└── tempCleanup.scheduler.ts   # Cleanup old temp files

src/config/
└── index.ts                   # File config (paths, limits)
```

---

## API Endpoints

### Base URL: `/api/v1/documents-management`

---

### 1. Upload File(s) to Temp

**Endpoint:** `POST /upload`

**Content-Type:** `multipart/form-data`

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes* | Single file |
| files | File[] | Yes* | Multiple files |

*Either `file` or `files` required

**Response - Single (200):**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "tempPath": "temp/a1b2c3d4_passport.pdf",
    "filename": "a1b2c3d4_passport.pdf",
    "originalName": "passport.pdf",
    "size": 102400,
    "sizeKB": 100,
    "extension": "pdf"
  }
}
```

**Response - Multiple (200):**
```json
{
  "success": true,
  "message": "Files uploaded successfully",
  "data": [
    {
      "tempPath": "temp/a1b2c3d4_passport.pdf",
      "filename": "a1b2c3d4_passport.pdf",
      "originalName": "passport.pdf",
      "size": 102400,
      "sizeKB": 100,
      "extension": "pdf"
    },
    {
      "tempPath": "temp/e5f6g7h8_certificate.pdf",
      "filename": "e5f6g7h8_certificate.pdf",
      "originalName": "certificate.pdf",
      "size": 204800,
      "sizeKB": 200,
      "extension": "pdf"
    }
  ]
}
```

---

### 2. Create Documents (Final Save)

**Endpoint:** `POST /documents`

**Content-Type:** `application/json`

**Request:**
```json
{
  "agencyId": "agency123",
  "userId": "user456",
  "userType": "STUDENT",
  "createdBy": "user456",
  "documents": [
    {
      "documentTypeId": "docType001",
      "tempPath": "temp/a1b2c3d4_passport.pdf",
      "originalName": "passport.pdf",
      "size": 102400,
      "extension": "pdf"
    },
    {
      "documentTypeId": "docType002",
      "tempPath": "temp/e5f6g7h8_certificate.pdf",
      "originalName": "certificate.pdf",
      "size": 204800,
      "extension": "pdf"
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Documents created successfully",
  "data": [
    {
      "id": "doc-uuid-1",
      "documentTypeId": "docType001",
      "fileUrl": "permanent/agency123/STUDENT/user456/docType001/v1_1700000000_passport.pdf",
      "fileSize": 102400,
      "fileExtension": "pdf",
      "status": "DRAFT",
      "versionNumber": 1
    },
    {
      "id": "doc-uuid-2",
      "documentTypeId": "docType002",
      "fileUrl": "permanent/agency123/STUDENT/user456/docType002/v1_1700000001_certificate.pdf",
      "fileSize": 204800,
      "fileExtension": "pdf",
      "status": "DRAFT",
      "versionNumber": 1
    }
  ]
}
```

**Process:**
1. Validate temp files exist
2. Validate document types exist & belong to agency
3. Check file extensions against allowed types
4. DB Transaction:
   - Create `Document` (status: DRAFT)
   - Create `DocumentVersion` (v1)
   - Update `Document.currentVersionId`
   - Create `DocumentAuditLog` (action: UPLOADED)
   - Create `DocumentStatusTimeline` (status: DRAFT)
5. Move files: temp → permanent
6. Commit transaction
7. Return documents with permanent paths

**Errors:**
| Code | Reason |
|------|--------|
| 400 | Temp file not found / Invalid extension |
| 404 | Document type not found |
| 409 | Document already exists for user/type |
| 500 | Transaction failed (files remain in temp) |

---

## Scheduler - Temp Cleanup

**Location:** `src/schedulers/tempCleanup.scheduler.ts`

**Config:**
```typescript
tempCleanup: {
  enabled: true,
  cronSchedule: '0 * * * *',  // Every hour
  maxAgeHours: 24             // Delete files older than 24h
}
```

**Logic:**
1. Scan `uploads/temp/`
2. Check file modified time
3. Delete files older than `maxAgeHours`
4. Log deleted count

---

## Database Operations (Per Document)

```
1. INSERT Document (status=DRAFT, versionNumber=1)
2. INSERT DocumentVersion (versionNumber=1)
3. UPDATE Document SET currentVersionId = versionId
4. INSERT DocumentAuditLog (action=UPLOADED)
5. INSERT DocumentStatusTimeline (status=DRAFT)
```

All in single transaction - rollback if any fails.

---

## File Validation

1. **Extension check** - Against `DocumentTypeRequirements.allowedExtensions`
2. **Size limit** - Configured in multer (default: 5MB)
3. **Path sanitization** - Prevent directory traversal

---

## Error Handling

| Scenario | Response | Files |
|----------|----------|-------|
| Invalid file type | 400 | Not saved |
| File too large | 413 | Not saved |
| Temp file missing | 400 | N/A |
| DB transaction fails | 500 | Stay in temp |
| File move fails | 500 | Rollback DB, stay in temp |

Temp files cleaned by scheduler if not handled.
