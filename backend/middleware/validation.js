/**
 * Input Validation Middleware
 * 
 * Provides schema-based input validation following OWASP best practices.
 * All validators check types, lengths, formats, and reject unexpected fields.
 * 
 * @module middleware/validation
 */

const validator = require('validator');
const mongoose = require('mongoose');

// ============================================================================
// Configuration Constants
// ============================================================================

const LIMITS = {
  // String length limits
  NAME_MIN: 2,
  NAME_MAX: 50,
  EMAIL_MAX: 254, // RFC 5321
  PASSWORD_MIN: 6,
  PASSWORD_MAX: 128,
  TITLE_MIN: 3,
  TITLE_MAX: 200,
  DESCRIPTION_MIN: 10,
  DESCRIPTION_MAX: 5000,
  SHORT_TEXT_MAX: 500,
  SKILLS_MAX_COUNT: 20,
  SKILL_MAX_LENGTH: 50,
  URL_MAX: 2048,
  
  // Numeric limits
  PRICE_MIN: 0,
  PRICE_MAX: 1000000,
  RATING_MIN: 1,
  RATING_MAX: 5,
  AMOUNT_MIN: 1,
  AMOUNT_MAX: 1000000,
  
  // Array limits
  MAX_ARRAY_ITEMS: 50,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validates if a value is a valid MongoDB ObjectId
 */
const isValidObjectId = (id) => {
  if (!id) return false;
  return mongoose.Types.ObjectId.isValid(id) && 
         new mongoose.Types.ObjectId(id).toString() === id;
};

/**
 * Creates a validation error response
 */
const validationError = (res, message, field = null) => {
  return res.status(400).json({
    success: false,
    message,
    field,
    error: 'VALIDATION_ERROR'
  });
};

/**
 * Sanitizes a string by trimming and removing dangerous characters
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return validator.trim(validator.escape(str));
};

/**
 * Checks if object has only allowed fields
 */
const hasOnlyAllowedFields = (obj, allowedFields) => {
  const objKeys = Object.keys(obj);
  return objKeys.every(key => allowedFields.includes(key));
};

/**
 * Gets unexpected fields from object
 */
const getUnexpectedFields = (obj, allowedFields) => {
  return Object.keys(obj).filter(key => !allowedFields.includes(key));
};

// ============================================================================
// Validation Schemas
// ============================================================================

/**
 * Validates user registration data
 */
const validateRegister = (req, res, next) => {
  const allowedFields = ['name', 'email', 'password', 'university', 'skills', 'experience', 'education'];
  
  // Check for unexpected fields (excluding file fields which come from multer)
  const bodyFields = Object.keys(req.body);
  const unexpectedFields = bodyFields.filter(f => !allowedFields.includes(f));
  if (unexpectedFields.length > 0) {
    return validationError(res, `Unexpected fields: ${unexpectedFields.join(', ')}`);
  }

  const { name, email, password, university, skills } = req.body;

  // Name validation
  if (!name || typeof name !== 'string') {
    return validationError(res, 'Name is required and must be a string', 'name');
  }
  if (name.length < LIMITS.NAME_MIN || name.length > LIMITS.NAME_MAX) {
    return validationError(res, `Name must be between ${LIMITS.NAME_MIN} and ${LIMITS.NAME_MAX} characters`, 'name');
  }
  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return validationError(res, 'Name can only contain letters, spaces, hyphens, and apostrophes', 'name');
  }

  // Email validation
  if (!email || typeof email !== 'string') {
    return validationError(res, 'Email is required and must be a string', 'email');
  }
  if (email.length > LIMITS.EMAIL_MAX) {
    return validationError(res, `Email must not exceed ${LIMITS.EMAIL_MAX} characters`, 'email');
  }
  if (!validator.isEmail(email)) {
    return validationError(res, 'Please provide a valid email address', 'email');
  }

  // Password validation
  if (!password || typeof password !== 'string') {
    return validationError(res, 'Password is required and must be a string', 'password');
  }
  if (password.length < LIMITS.PASSWORD_MIN || password.length > LIMITS.PASSWORD_MAX) {
    return validationError(res, `Password must be between ${LIMITS.PASSWORD_MIN} and ${LIMITS.PASSWORD_MAX} characters`, 'password');
  }

  // University validation (optional)
  if (university !== undefined) {
    if (typeof university !== 'string') {
      return validationError(res, 'University must be a string', 'university');
    }
    if (university.length > LIMITS.SHORT_TEXT_MAX) {
      return validationError(res, `University must not exceed ${LIMITS.SHORT_TEXT_MAX} characters`, 'university');
    }
  }

  // Skills validation (optional, comma-separated string)
  if (skills !== undefined) {
    if (typeof skills !== 'string') {
      return validationError(res, 'Skills must be a comma-separated string', 'skills');
    }
    const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
    if (skillsArray.length > LIMITS.SKILLS_MAX_COUNT) {
      return validationError(res, `Maximum ${LIMITS.SKILLS_MAX_COUNT} skills allowed`, 'skills');
    }
    for (const skill of skillsArray) {
      if (skill.length > LIMITS.SKILL_MAX_LENGTH) {
        return validationError(res, `Each skill must not exceed ${LIMITS.SKILL_MAX_LENGTH} characters`, 'skills');
      }
    }
  }

  next();
};

/**
 * Validates user login data
 */
const validateLogin = (req, res, next) => {
  const allowedFields = ['email', 'password'];
  
  const unexpectedFields = getUnexpectedFields(req.body, allowedFields);
  if (unexpectedFields.length > 0) {
    return validationError(res, `Unexpected fields: ${unexpectedFields.join(', ')}`);
  }

  const { email, password } = req.body;

  // Email validation
  if (!email || typeof email !== 'string') {
    return validationError(res, 'Email is required', 'email');
  }
  if (!validator.isEmail(email)) {
    return validationError(res, 'Please provide a valid email address', 'email');
  }

  // Password validation
  if (!password || typeof password !== 'string') {
    return validationError(res, 'Password is required', 'password');
  }
  if (password.length > LIMITS.PASSWORD_MAX) {
    return validationError(res, 'Invalid credentials', 'password');
  }

  next();
};

/**
 * Validates gig creation/update data
 */
const validateGig = (req, res, next) => {
  const allowedFields = ['title', 'description', 'price', 'duration', 'skills'];
  
  const unexpectedFields = getUnexpectedFields(req.body, allowedFields);
  if (unexpectedFields.length > 0) {
    return validationError(res, `Unexpected fields: ${unexpectedFields.join(', ')}`);
  }

  const { title, description, price, duration, skills } = req.body;

  // Title validation
  if (!title || typeof title !== 'string') {
    return validationError(res, 'Title is required and must be a string', 'title');
  }
  if (title.length < LIMITS.TITLE_MIN || title.length > LIMITS.TITLE_MAX) {
    return validationError(res, `Title must be between ${LIMITS.TITLE_MIN} and ${LIMITS.TITLE_MAX} characters`, 'title');
  }

  // Description validation
  if (!description || typeof description !== 'string') {
    return validationError(res, 'Description is required and must be a string', 'description');
  }
  if (description.length < LIMITS.DESCRIPTION_MIN || description.length > LIMITS.DESCRIPTION_MAX) {
    return validationError(res, `Description must be between ${LIMITS.DESCRIPTION_MIN} and ${LIMITS.DESCRIPTION_MAX} characters`, 'description');
  }

  // Price validation
  if (price === undefined || price === null) {
    return validationError(res, 'Price is required', 'price');
  }
  const priceNum = Number(price);
  if (isNaN(priceNum) || priceNum < LIMITS.PRICE_MIN || priceNum > LIMITS.PRICE_MAX) {
    return validationError(res, `Price must be a number between ${LIMITS.PRICE_MIN} and ${LIMITS.PRICE_MAX}`, 'price');
  }

  // Duration validation
  if (!duration || typeof duration !== 'string') {
    return validationError(res, 'Duration is required and must be a string', 'duration');
  }
  if (duration.length > LIMITS.SHORT_TEXT_MAX) {
    return validationError(res, `Duration must not exceed ${LIMITS.SHORT_TEXT_MAX} characters`, 'duration');
  }

  // Skills validation
  if (!skills || !Array.isArray(skills)) {
    return validationError(res, 'Skills must be an array', 'skills');
  }
  if (skills.length === 0 || skills.length > LIMITS.SKILLS_MAX_COUNT) {
    return validationError(res, `Skills must have between 1 and ${LIMITS.SKILLS_MAX_COUNT} items`, 'skills');
  }
  for (const skill of skills) {
    if (typeof skill !== 'string' || skill.length > LIMITS.SKILL_MAX_LENGTH) {
      return validationError(res, 'Each skill must be a string and not exceed 50 characters', 'skills');
    }
  }

  next();
};

/**
 * Validates order creation data
 */
const validateOrder = (req, res, next) => {
  const allowedFields = ['gigId', 'sellerId', 'price'];
  
  const unexpectedFields = getUnexpectedFields(req.body, allowedFields);
  if (unexpectedFields.length > 0) {
    return validationError(res, `Unexpected fields: ${unexpectedFields.join(', ')}`);
  }

  const { gigId, sellerId, price } = req.body;

  // GigId validation
  if (!gigId || !isValidObjectId(gigId)) {
    return validationError(res, 'Valid gig ID is required', 'gigId');
  }

  // SellerId validation
  if (!sellerId || !isValidObjectId(sellerId)) {
    return validationError(res, 'Valid seller ID is required', 'sellerId');
  }

  // Price validation
  if (price === undefined || price === null) {
    return validationError(res, 'Price is required', 'price');
  }
  const priceNum = Number(price);
  if (isNaN(priceNum) || priceNum < LIMITS.PRICE_MIN || priceNum > LIMITS.PRICE_MAX) {
    return validationError(res, `Price must be a number between ${LIMITS.PRICE_MIN} and ${LIMITS.PRICE_MAX}`, 'price');
  }

  next();
};

/**
 * Validates offer creation data
 */
const validateOffer = (req, res, next) => {
  const allowedFields = ['toUser', 'gig', 'amount', 'description', 'duration'];
  
  const unexpectedFields = getUnexpectedFields(req.body, allowedFields);
  if (unexpectedFields.length > 0) {
    return validationError(res, `Unexpected fields: ${unexpectedFields.join(', ')}`);
  }

  const { toUser, gig, amount, description, duration } = req.body;

  // ToUser validation
  if (!toUser || !isValidObjectId(toUser)) {
    return validationError(res, 'Valid recipient user ID is required', 'toUser');
  }

  // Gig validation (optional)
  if (gig !== undefined && gig !== null && !isValidObjectId(gig)) {
    return validationError(res, 'Invalid gig ID format', 'gig');
  }

  // Amount validation
  if (amount === undefined || amount === null) {
    return validationError(res, 'Amount is required', 'amount');
  }
  const amountNum = Number(amount);
  if (isNaN(amountNum) || amountNum < LIMITS.AMOUNT_MIN || amountNum > LIMITS.AMOUNT_MAX) {
    return validationError(res, `Amount must be a number between ${LIMITS.AMOUNT_MIN} and ${LIMITS.AMOUNT_MAX}`, 'amount');
  }

  // Description validation
  if (!description || typeof description !== 'string') {
    return validationError(res, 'Description is required and must be a string', 'description');
  }
  if (description.length < LIMITS.DESCRIPTION_MIN || description.length > LIMITS.DESCRIPTION_MAX) {
    return validationError(res, `Description must be between ${LIMITS.DESCRIPTION_MIN} and ${LIMITS.DESCRIPTION_MAX} characters`, 'description');
  }

  // Duration validation
  if (!duration || typeof duration !== 'string') {
    return validationError(res, 'Duration is required and must be a string', 'duration');
  }
  if (duration.length > LIMITS.SHORT_TEXT_MAX) {
    return validationError(res, `Duration must not exceed ${LIMITS.SHORT_TEXT_MAX} characters`, 'duration');
  }

  next();
};

/**
 * Validates offer status update
 */
const validateOfferStatus = (req, res, next) => {
  const allowedFields = ['status'];
  
  const unexpectedFields = getUnexpectedFields(req.body, allowedFields);
  if (unexpectedFields.length > 0) {
    return validationError(res, `Unexpected fields: ${unexpectedFields.join(', ')}`);
  }

  const { status } = req.body;
  const validStatuses = ['accepted', 'declined', 'cancelled'];

  if (!status || typeof status !== 'string') {
    return validationError(res, 'Status is required and must be a string', 'status');
  }
  if (!validStatuses.includes(status)) {
    return validationError(res, `Status must be one of: ${validStatuses.join(', ')}`, 'status');
  }

  next();
};

/**
 * Validates message sending data
 */
const validateMessage = (req, res, next) => {
  const allowedFields = ['text'];
  
  // Only validate if there's no file upload
  if (!req.file) {
    const unexpectedFields = getUnexpectedFields(req.body, allowedFields);
    if (unexpectedFields.length > 0) {
      return validationError(res, `Unexpected fields: ${unexpectedFields.join(', ')}`);
    }

    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return validationError(res, 'Text message is required when not uploading a file', 'text');
    }
    if (text.length > LIMITS.DESCRIPTION_MAX) {
      return validationError(res, `Message must not exceed ${LIMITS.DESCRIPTION_MAX} characters`, 'text');
    }
  }

  next();
};

/**
 * Validates conversation creation data
 */
const validateConversation = (req, res, next) => {
  const allowedFields = ['recipientId'];
  
  const unexpectedFields = getUnexpectedFields(req.body, allowedFields);
  if (unexpectedFields.length > 0) {
    return validationError(res, `Unexpected fields: ${unexpectedFields.join(', ')}`);
  }

  const { recipientId } = req.body;

  if (!recipientId || !isValidObjectId(recipientId)) {
    return validationError(res, 'Valid recipient ID is required', 'recipientId');
  }

  next();
};

/**
 * Validates payment order creation
 */
const validatePaymentOrder = (req, res, next) => {
  const allowedFields = ['orderId'];
  
  const unexpectedFields = getUnexpectedFields(req.body, allowedFields);
  if (unexpectedFields.length > 0) {
    return validationError(res, `Unexpected fields: ${unexpectedFields.join(', ')}`);
  }

  const { orderId } = req.body;

  if (!orderId || !isValidObjectId(orderId)) {
    return validationError(res, 'Valid order ID is required', 'orderId');
  }

  next();
};

/**
 * Validates payment verification data
 */
const validatePaymentVerify = (req, res, next) => {
  const allowedFields = ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature'];
  
  const unexpectedFields = getUnexpectedFields(req.body, allowedFields);
  if (unexpectedFields.length > 0) {
    return validationError(res, `Unexpected fields: ${unexpectedFields.join(', ')}`);
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || typeof razorpay_order_id !== 'string') {
    return validationError(res, 'Razorpay order ID is required', 'razorpay_order_id');
  }
  if (!razorpay_payment_id || typeof razorpay_payment_id !== 'string') {
    return validationError(res, 'Razorpay payment ID is required', 'razorpay_payment_id');
  }
  if (!razorpay_signature || typeof razorpay_signature !== 'string') {
    return validationError(res, 'Razorpay signature is required', 'razorpay_signature');
  }

  // Validate signature format (should be hex string of specific length)
  if (!/^[a-f0-9]{64}$/i.test(razorpay_signature)) {
    return validationError(res, 'Invalid signature format', 'razorpay_signature');
  }

  next();
};

/**
 * Validates clear payment/review submission data
 */
const validateClearPayment = (req, res, next) => {
  const allowedFields = ['rating', 'comment'];
  
  const unexpectedFields = getUnexpectedFields(req.body, allowedFields);
  if (unexpectedFields.length > 0) {
    return validationError(res, `Unexpected fields: ${unexpectedFields.join(', ')}`);
  }

  const { rating, comment } = req.body;

  // Rating validation
  if (rating === undefined || rating === null) {
    return validationError(res, 'Rating is required', 'rating');
  }
  const ratingNum = Number(rating);
  if (isNaN(ratingNum) || !Number.isInteger(ratingNum) || ratingNum < LIMITS.RATING_MIN || ratingNum > LIMITS.RATING_MAX) {
    return validationError(res, `Rating must be an integer between ${LIMITS.RATING_MIN} and ${LIMITS.RATING_MAX}`, 'rating');
  }

  // Comment validation (optional but if provided, must be valid)
  if (comment !== undefined && comment !== null) {
    if (typeof comment !== 'string') {
      return validationError(res, 'Comment must be a string', 'comment');
    }
    if (comment.length > LIMITS.DESCRIPTION_MAX) {
      return validationError(res, `Comment must not exceed ${LIMITS.DESCRIPTION_MAX} characters`, 'comment');
    }
  }

  next();
};

/**
 * Validates portfolio item creation data
 */
const validatePortfolio = (req, res, next) => {
  const allowedFields = ['title', 'description', 'imageUrl', 'projectUrl', 'skills'];
  
  const unexpectedFields = getUnexpectedFields(req.body, allowedFields);
  if (unexpectedFields.length > 0) {
    return validationError(res, `Unexpected fields: ${unexpectedFields.join(', ')}`);
  }

  const { title, description, imageUrl, projectUrl, skills } = req.body;

  // Title validation
  if (!title || typeof title !== 'string') {
    return validationError(res, 'Title is required and must be a string', 'title');
  }
  if (title.length < LIMITS.TITLE_MIN || title.length > LIMITS.TITLE_MAX) {
    return validationError(res, `Title must be between ${LIMITS.TITLE_MIN} and ${LIMITS.TITLE_MAX} characters`, 'title');
  }

  // Description validation (optional)
  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      return validationError(res, 'Description must be a string', 'description');
    }
    if (description.length > LIMITS.DESCRIPTION_MAX) {
      return validationError(res, `Description must not exceed ${LIMITS.DESCRIPTION_MAX} characters`, 'description');
    }
  }

  // URL validations (optional)
  if (imageUrl !== undefined && imageUrl !== null) {
    if (typeof imageUrl !== 'string' || imageUrl.length > LIMITS.URL_MAX) {
      return validationError(res, 'Invalid image URL', 'imageUrl');
    }
    if (imageUrl && !validator.isURL(imageUrl, { protocols: ['http', 'https'], require_protocol: true })) {
      return validationError(res, 'Image URL must be a valid HTTP/HTTPS URL', 'imageUrl');
    }
  }

  if (projectUrl !== undefined && projectUrl !== null) {
    if (typeof projectUrl !== 'string' || projectUrl.length > LIMITS.URL_MAX) {
      return validationError(res, 'Invalid project URL', 'projectUrl');
    }
    if (projectUrl && !validator.isURL(projectUrl, { protocols: ['http', 'https'], require_protocol: true })) {
      return validationError(res, 'Project URL must be a valid HTTP/HTTPS URL', 'projectUrl');
    }
  }

  // Skills validation (optional)
  if (skills !== undefined && skills !== null) {
    if (!Array.isArray(skills)) {
      return validationError(res, 'Skills must be an array', 'skills');
    }
    if (skills.length > LIMITS.SKILLS_MAX_COUNT) {
      return validationError(res, `Maximum ${LIMITS.SKILLS_MAX_COUNT} skills allowed`, 'skills');
    }
    for (const skill of skills) {
      if (typeof skill !== 'string' || skill.length > LIMITS.SKILL_MAX_LENGTH) {
        return validationError(res, 'Each skill must be a string and not exceed 50 characters', 'skills');
      }
    }
  }

  next();
};

/**
 * Validates transaction creation data
 */
const validateTransaction = (req, res, next) => {
  const allowedFields = ['type', 'amount', 'description', 'order'];
  
  const unexpectedFields = getUnexpectedFields(req.body, allowedFields);
  if (unexpectedFields.length > 0) {
    return validationError(res, `Unexpected fields: ${unexpectedFields.join(', ')}`);
  }

  const { type, amount, description, order } = req.body;

  // Type validation
  const validTypes = ['income', 'expense', 'deposit', 'withdrawal'];
  if (!type || typeof type !== 'string') {
    return validationError(res, 'Transaction type is required', 'type');
  }
  if (!validTypes.includes(type)) {
    return validationError(res, `Type must be one of: ${validTypes.join(', ')}`, 'type');
  }

  // Amount validation
  if (amount === undefined || amount === null) {
    return validationError(res, 'Amount is required', 'amount');
  }
  const amountNum = Number(amount);
  if (isNaN(amountNum) || amountNum <= 0 || amountNum > LIMITS.AMOUNT_MAX) {
    return validationError(res, `Amount must be a positive number not exceeding ${LIMITS.AMOUNT_MAX}`, 'amount');
  }

  // Description validation (optional)
  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      return validationError(res, 'Description must be a string', 'description');
    }
    if (description.length > LIMITS.DESCRIPTION_MAX) {
      return validationError(res, `Description must not exceed ${LIMITS.DESCRIPTION_MAX} characters`, 'description');
    }
  }

  // Order validation (optional)
  if (order !== undefined && order !== null && !isValidObjectId(order)) {
    return validationError(res, 'Invalid order ID format', 'order');
  }

  next();
};

/**
 * Validates search query parameters
 */
const validateSearch = (req, res, next) => {
  const { query, q, search } = req.query;
  const searchTerm = query || q || search;

  if (searchTerm !== undefined) {
    if (typeof searchTerm !== 'string') {
      return validationError(res, 'Search query must be a string', 'query');
    }
    if (searchTerm.length > LIMITS.SHORT_TEXT_MAX) {
      return validationError(res, `Search query must not exceed ${LIMITS.SHORT_TEXT_MAX} characters`, 'query');
    }
  }

  next();
};

/**
 * Validates MongoDB ObjectId in URL params
 */
const validateObjectIdParam = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !isValidObjectId(id)) {
      return validationError(res, `Invalid ${paramName} format`, paramName);
    }
    next();
  };
};

/**
 * Validates profile update data
 */
const validateProfileUpdate = (req, res, next) => {
  const allowedFields = ['name', 'university', 'skills', 'experience', 'education'];
  
  // Check for unexpected fields (excluding file fields)
  const bodyFields = Object.keys(req.body);
  const unexpectedFields = bodyFields.filter(f => !allowedFields.includes(f));
  if (unexpectedFields.length > 0) {
    return validationError(res, `Unexpected fields: ${unexpectedFields.join(', ')}`);
  }

  const { name, university, skills } = req.body;

  // Name validation (optional for update)
  if (name !== undefined) {
    if (typeof name !== 'string') {
      return validationError(res, 'Name must be a string', 'name');
    }
    if (name.length < LIMITS.NAME_MIN || name.length > LIMITS.NAME_MAX) {
      return validationError(res, `Name must be between ${LIMITS.NAME_MIN} and ${LIMITS.NAME_MAX} characters`, 'name');
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      return validationError(res, 'Name can only contain letters, spaces, hyphens, and apostrophes', 'name');
    }
  }

  // University validation (optional)
  if (university !== undefined) {
    if (typeof university !== 'string') {
      return validationError(res, 'University must be a string', 'university');
    }
    if (university.length > LIMITS.SHORT_TEXT_MAX) {
      return validationError(res, `University must not exceed ${LIMITS.SHORT_TEXT_MAX} characters`, 'university');
    }
  }

  // Skills validation (optional)
  if (skills !== undefined) {
    if (typeof skills !== 'string') {
      return validationError(res, 'Skills must be a comma-separated string', 'skills');
    }
    const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
    if (skillsArray.length > LIMITS.SKILLS_MAX_COUNT) {
      return validationError(res, `Maximum ${LIMITS.SKILLS_MAX_COUNT} skills allowed`, 'skills');
    }
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateGig,
  validateOrder,
  validateOffer,
  validateOfferStatus,
  validateMessage,
  validateConversation,
  validatePaymentOrder,
  validatePaymentVerify,
  validateClearPayment,
  validatePortfolio,
  validateTransaction,
  validateSearch,
  validateObjectIdParam,
  validateProfileUpdate,
  isValidObjectId,
  sanitizeString,
  LIMITS,
};
