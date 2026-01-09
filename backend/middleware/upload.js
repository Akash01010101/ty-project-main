/**
 * File Upload Middleware
 * 
 * Handles secure file uploads with validation.
 * SECURITY: File type validation, size limits, and secure storage.
 * 
 * @module middleware/upload
 */

const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// =============================================================================
// SECURITY: File upload limits (OWASP recommendation)
// =============================================================================
const FILE_SIZE_LIMITS = {
  profilePicture: 5 * 1024 * 1024,  // 5MB for profile pictures
  resume: 10 * 1024 * 1024,          // 10MB for resumes (PDFs)
  messageFile: 25 * 1024 * 1024,     // 25MB for message attachments
  default: 10 * 1024 * 1024,         // 10MB default
};

// Set up storage for uploaded files
// SECURITY: Generate random filenames to prevent path traversal and enumeration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate a secure random filename while preserving extension
    const ext = path.extname(file.originalname).toLowerCase();
    const randomName = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    cb(null, `${timestamp}-${randomName}${ext}`);
  },
});

// =============================================================================
// SECURITY: Strict file type validation
// Validates both extension and MIME type
// =============================================================================

// Allowed MIME types for each field
const ALLOWED_MIME_TYPES = {
  profilePicture: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  resume: ['application/pdf'],
  messageFile: [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ],
};

// Allowed extensions for each field
const ALLOWED_EXTENSIONS = {
  profilePicture: ['.jpg', '.jpeg', '.png', '.gif'],
  resume: ['.pdf'],
  messageFile: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.txt'],
};

// Combined file filter for various fields
const combinedFilter = (req, file, cb) => {
  const fieldName = file.fieldname;
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;
  
  // Get allowed types for this field, or reject unknown fields
  const allowedMimes = ALLOWED_MIME_TYPES[fieldName];
  const allowedExts = ALLOWED_EXTENSIONS[fieldName];
  
  if (!allowedMimes || !allowedExts) {
    req.fileValidationError = `Unexpected file field: ${fieldName}`;
    return cb(null, false);
  }
  
  // Validate both extension and MIME type for security
  // Attackers can fake extensions but validating both adds defense in depth
  if (!allowedExts.includes(ext)) {
    req.fileValidationError = `Invalid file extension for ${fieldName}. Allowed: ${allowedExts.join(', ')}`;
    return cb(null, false);
  }
  
  if (!allowedMimes.includes(mimeType)) {
    req.fileValidationError = `Invalid file type for ${fieldName}. Allowed types: ${allowedMimes.map(m => m.split('/')[1]).join(', ')}`;
    return cb(null, false);
  }
  
  // Validate filename doesn't contain dangerous characters
  const filename = file.originalname;
  if (/[<>:"/\\|?*\x00-\x1f]/.test(filename)) {
    req.fileValidationError = 'Filename contains invalid characters';
    return cb(null, false);
  }
  
  // Prevent hidden files
  if (filename.startsWith('.')) {
    req.fileValidationError = 'Hidden files are not allowed';
    return cb(null, false);
  }
  
  cb(null, true);
};

// Create the multer instance with size limits and combined filter
const uploadFields = multer({
  storage,
  fileFilter: combinedFilter,
  limits: {
    fileSize: FILE_SIZE_LIMITS.default,
    files: 5, // Maximum number of files per request
    fields: 10, // Maximum number of non-file fields
    fieldNameSize: 100, // Maximum field name length
    fieldSize: 1024 * 1024, // Maximum field value size (1MB)
  },
});

module.exports = { 
  uploadFields,
  FILE_SIZE_LIMITS,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
};
