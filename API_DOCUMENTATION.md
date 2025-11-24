# Document Management Service - API Documentation

**Base URL:** `/api/v1/documents-management`

---

## 1. Document Category APIs

Manage document categories for organizing document types.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/documents-category` | Create a new category |
| GET | `/documents-category/:agencyId` | Get all categories (paginated) |
| GET | `/documents-category/:agencyId/:id` | Get a single category |
| PATCH | `/documents-category/:agencyId/:id` | Update a category |
| DELETE | `/documents-category/:agencyId/:id` | Delete a category (soft delete) |

### 1.1 Create Category

**POST** `/documents-category`

Creates a new document category for an agency.

**Request Body:**
```json
{
  "agencyId": "string (required)",
  "name": "string (required)",
  "description": "string (optional)"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": "uuid",
    "agencyId": "string",
    "name": "string",
    "description": "string",
    "createdAt": "datetime",
    "updatedAt": "datetime"
  }
}
```

---

### 1.2 Get All Categories

**GET** `/documents-category/:agencyId`

Retrieves all categories for an agency with pagination.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| agencyId | string | Yes | Agency identifier |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| search | string | "" | Search by name or description |
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |
| sortBy | string | "createdAt" | Field to sort by |
| sortOrder | string | "desc" | Sort order (asc/desc) |

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Categories fetched successfully",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25
  },
  "data": [
    {
      "id": "uuid",
      "agencyId": "string",
      "name": "string",
      "description": "string",
      "documentTypes": []
    }
  ]
}
```

---

### 1.3 Get Category by ID

**GET** `/documents-category/:agencyId/:id`

Retrieves a single category by ID.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| agencyId | string | Yes | Agency identifier |
| id | string | Yes | Category ID |

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Category fetched successfully",
  "data": {
    "id": "uuid",
    "agencyId": "string",
    "name": "string",
    "description": "string"
  }
}
```

---

### 1.4 Update Category

**PATCH** `/documents-category/:agencyId/:id`

Updates an existing category.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| agencyId | string | Yes | Agency identifier |
| id | string | Yes | Category ID |

**Request Body:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Category updated successfully",
  "data": { ... }
}
```

---

### 1.5 Delete Category

**DELETE** `/documents-category/:agencyId/:id`

Soft deletes a category.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| agencyId | string | Yes | Agency identifier |
| id | string | Yes | Category ID |

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Category deleted successfully",
  "data": { ... }
}
```

---

## 2. Document Type APIs

Manage document type requirements within categories.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/document-type/:agencyId/:categoryId` | Create a document type |
| GET | `/document-type/:agencyId/:categoryId/list` | Get types in a category (paginated) |
| GET | `/document-type/:agencyId/grouped` | Get all types grouped by category |
| GET | `/document-type/:agencyId/:id` | Get a single document type |
| PATCH | `/document-type/:agencyId/:id` | Update a document type |
| DELETE | `/document-type/:agencyId/:id` | Delete a document type |

### 2.1 Create Document Type

**POST** `/document-type/:agencyId/:categoryId`

Creates a new document type requirement.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| agencyId | string | Yes | Agency identifier |
| categoryId | string | Yes | Category ID |

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "isRequired": "boolean (optional, default: false)",
  "allowedExtensions": ["pdf", "jpg", "png"]
}
```

**Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Document type added successfully",
  "data": {
    "id": "uuid",
    "agencyId": "string",
    "categoryId": "string",
    "name": "string",
    "description": "string",
    "isRequired": true,
    "allowedExtensions": ["pdf", "jpg"]
  }
}
```

---

### 2.2 Get Document Types by Category

**GET** `/document-type/:agencyId/:categoryId/list`

Retrieves document types in a category with pagination.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| agencyId | string | Yes | Agency identifier |
| categoryId | string | Yes | Category ID |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |
| sortBy | string | "createdAt" | Field to sort by |
| sortOrder | string | "desc" | Sort order (asc/desc) |

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Document types fetched",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 5
  },
  "data": [ ... ]
}
```

---

### 2.3 Get Document Types Grouped by Category

**GET** `/document-type/:agencyId/grouped`

Retrieves all document types grouped by their categories.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| agencyId | string | Yes | Agency identifier |

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Document types grouped by categories fetched",
  "data": [
    {
      "categoryId": "uuid",
      "categoryName": "Identity Documents",
      "categoryDescription": "...",
      "documentTypes": [
        {
          "id": "uuid",
          "name": "Passport",
          "isRequired": true,
          "allowedExtensions": ["pdf", "jpg"]
        }
      ]
    }
  ]
}
```

---

### 2.4 Get Document Type by ID

**GET** `/document-type/:agencyId/:id`

Retrieves a single document type by ID.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| agencyId | string | Yes | Agency identifier |
| id | string | Yes | Document type ID |

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Document type fetched",
  "data": { ... }
}
```

---

### 2.5 Update Document Type

**PATCH** `/document-type/:agencyId/:id`

Updates an existing document type.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| agencyId | string | Yes | Agency identifier |
| id | string | Yes | Document type ID |

**Request Body:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "isRequired": "boolean (optional)",
  "allowedExtensions": ["pdf"]
}
```

---

### 2.6 Delete Document Type

**DELETE** `/document-type/:agencyId/:id`

Soft deletes a document type.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| agencyId | string | Yes | Agency identifier |
| id | string | Yes | Document type ID |

---

## 3. Document APIs

Manage user documents.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/documents` | Create documents (finalize upload) |
| GET | `/documents/:agencyId/user/:userId` | Get user's documents |
| PATCH | `/documents/:agencyId/user/:userId/:id` | Update/replace a document |
| DELETE | `/documents/:agencyId/user/:userId/:id` | Delete a document |
| GET | `/documents/:agencyId/:id` | Get a single document |

### 3.1 Create Documents

**POST** `/documents`

Finalizes file upload by moving files from temp to permanent storage and creating database records.

**Request Body:**
```json
{
  "agencyId": "string (required)",
  "userId": "string (required)",
  "userType": "STUDENT | COUNSELOR | ADMIN | OTHER (required)",
  "createdBy": "string (required)",
  "documents": [
    {
      "documentTypeId": "uuid (required)",
      "tempPath": "temp/filename.pdf (required)",
      "originalName": "my-document.pdf (required)",
      "size": 102400,
      "extension": "pdf"
    }
  ]
}
```

**Response:**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Documents created successfully",
  "data": [
    {
      "id": "uuid",
      "documentTypeId": "uuid",
      "fileUrl": "permanent/agency/STUDENT/user/docType/v1_timestamp_file.pdf",
      "fileSize": 102400,
      "fileExtension": "pdf",
      "status": "DRAFT",
      "versionNumber": 1,
      "createdAt": "datetime"
    }
  ]
}
```

---

### 3.2 Get User Documents

**GET** `/documents/:agencyId/user/:userId`

Retrieves all documents for a specific user.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| agencyId | string | Yes | Agency identifier |
| userId | string | Yes | User identifier |

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Documents fetched successfully",
  "data": [ ... ]
}
```

---

### 3.3 Update Document

**PATCH** `/documents/:agencyId/user/:userId/:id`

Replaces an existing document with a new version. Creates a new version record and updates the document with the new file.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| agencyId | string | Yes | Agency identifier |
| userId | string | Yes | User identifier (ownership verification) |
| id | string | Yes | Document ID |

**Request Body:**
```json
{
  "tempPath": "temp/abc123_newfile.pdf (required)",
  "originalName": "updated-document.pdf (required)",
  "size": 204800,
  "extension": "pdf",
  "updatedBy": "user-id (required)"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Document updated successfully",
  "data": {
    "id": "uuid",
    "documentTypeId": "uuid",
    "fileUrl": "permanent/agency/STUDENT/user/docType/v2_timestamp_file.pdf",
    "fileSize": 204800,
    "fileExtension": "pdf",
    "status": "DRAFT",
    "versionNumber": 2,
    "updatedAt": "datetime"
  }
}
```

**Notes:**
- File extension must match one of the allowed extensions for the document type
- A new version is created, preserving the previous version history
- The previous file is preserved for version history
- An audit log entry is created for the update

---

### 3.4 Delete Document

**DELETE** `/documents/:agencyId/user/:userId/:id`

Soft deletes a document (sets `deletedAt` timestamp) and removes the file from storage. Verifies the document belongs to the specified user. Audit logs and history are preserved.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| agencyId | string | Yes | Agency identifier |
| userId | string | Yes | User identifier (ownership verification) |
| id | string | Yes | Document ID |

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Document deleted successfully",
  "data": {
    "deleted": true
  }
}
```

---

### 3.5 Get Document by ID

**GET** `/documents/:agencyId/:id`

Retrieves a single document by ID.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| agencyId | string | Yes | Agency identifier |
| id | string | Yes | Document ID |

---

## 4. File Upload APIs

Handle file uploads to temporary storage.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload files to temp storage |
| DELETE | `/upload/temp` | Delete temp files |

### 4.1 Upload Files

**POST** `/upload`

Uploads single or multiple files to temporary storage.

**Content-Type:** `multipart/form-data`

**Form Data:**
| Field | Type | Description |
|-------|------|-------------|
| files | File[] | One or more files to upload |

**Response (Single File):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "tempPath": "temp/abc123_filename.pdf",
    "filename": "abc123_filename.pdf",
    "originalName": "my-document.pdf",
    "size": 102400,
    "sizeKB": 100,
    "extension": "pdf"
  }
}
```

**Response (Multiple Files):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Files uploaded successfully",
  "data": [
    { "tempPath": "...", "filename": "...", ... },
    { "tempPath": "...", "filename": "...", ... }
  ]
}
```

**Virus Scanning:**
Files are automatically scanned for malware using ClamAV before being stored. If a file is detected as infected:

```json
{
  "statusCode": 400,
  "success": false,
  "message": "File(s) rejected due to security scan",
  "data": {
    "rejectedFiles": ["infected-file.pdf"],
    "reason": "Potential malware detected or scan failed"
  }
}
```

If some files pass and others fail:
```json
{
  "statusCode": 200,
  "success": true,
  "message": "2 file(s) uploaded, 1 rejected",
  "data": {
    "uploaded": [...],
    "rejected": ["infected-file.pdf"]
  }
}
```

---

### 4.2 Delete Temp Files

**DELETE** `/upload/temp`

Deletes files from temporary storage.

**Request Body:**
```json
{
  "tempPaths": [
    "temp/abc123_filename.pdf",
    "temp/def456_another.jpg"
  ]
}
```

**Response:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "2 file(s) deleted successfully",
  "data": {
    "deletedCount": 2,
    "failedCount": 0
  }
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "statusCode": 400,
  "success": false,
  "message": "Error description",
  "errorMessages": [
    {
      "path": "fieldName",
      "message": "Detailed error message"
    }
  ]
}
```

**Common Status Codes:**
| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 500 | Server Error |

---

## File Storage Structure

```
uploads/
├── temp/                    # Temporary uploaded files
│   └── {random}_{filename}
└── permanent/               # Finalized documents
    └── {agencyId}/
        └── {userType}/
            └── {userId}/
                └── {documentTypeId}/
                    └── v{version}_{timestamp}_{filename}
```

---

## Scheduled Tasks

- **Temp Cleanup:** Runs hourly to delete temp files older than 24 hours
