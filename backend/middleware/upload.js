const multer = require('multer');
const path = require('path');

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Combined file filter for various fields
const combinedFilter = (req, file, cb) => {
  console.log('combinedFilter called for file:', file.fieldname);
  console.log('File details:', file);
  if (file.fieldname === 'profilePicture') {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      req.fileValidationError = 'Only image files (jpg, jpeg, png, gif) are allowed for profile picture!';
      console.log('File validation failed for profilePicture:', req.fileValidationError);
      return cb(null, false);
    }
  } else if (file.fieldname === 'resume') {
    if (!file.originalname.match(/\.(pdf)$/i)) {
      req.fileValidationError = 'Only PDF files are allowed for resume!';
      console.log('File validation failed for resume:', req.fileValidationError);
      return cb(null, false);
    }
  } else if (file.fieldname === 'messageFile') {
    // Allow images, PDFs, Word docs, text files
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|pdf|doc|docx|txt)$/i)) {
      req.fileValidationError = 'Invalid file type for message attachment!';
      console.log('File validation failed for messageFile:', req.fileValidationError);
      return cb(null, false);
    }
  }
  console.log('File validation passed for:', file.fieldname);
  cb(null, true);
};

// Create the multer instance for fields with combined filter
const uploadFields = multer({ storage, fileFilter: combinedFilter });


module.exports = { uploadFields };
