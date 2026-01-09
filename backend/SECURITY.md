# Security Hardening Documentation

This document describes the security measures implemented in the Skill Marketplace application following OWASP best practices.

## 1. Rate Limiting

Rate limiting is implemented at multiple levels to prevent abuse:

### Global Rate Limiting
- **100 requests per minute per IP** for all endpoints
- Prevents DDoS and brute-force attacks

### Authentication Rate Limiting
- **5 attempts per 15 minutes per IP** for login/register
- Prevents credential stuffing and brute-force attacks

### Endpoint-Specific Limits
| Endpoint Type | Limit | Window | Purpose |
|--------------|-------|--------|---------|
| API (general) | 60/min | 1 min | Normal usage |
| Search | 30/min | 1 min | Prevent scraping |
| Messages | 30/min | 1 min | Prevent spam |
| Uploads | 10/10min | 10 min | Prevent storage abuse |
| Payments | 5/5min | 5 min | Financial protection |
| Sensitive ops | 10/15min | 15 min | Prevent abuse |

### Rate Limit Response
All rate limit responses return HTTP 429 with:
```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "retryAfter": 60,
  "error": "RATE_LIMIT_EXCEEDED"
}
```

## 2. Input Validation

Schema-based validation is applied to all user inputs:

### Validation Rules
- **Type checking**: All fields validated for correct types
- **Length limits**: Minimum and maximum lengths enforced
- **Format validation**: Email, URL, ObjectId formats validated
- **Allowed fields**: Unexpected fields are rejected
- **Numeric ranges**: Prices, ratings, amounts have min/max limits

### Key Limits
| Field | Limits |
|-------|--------|
| Name | 2-50 chars, letters/spaces only |
| Email | Max 254 chars, RFC 5321 format |
| Password | 6-128 chars |
| Title | 3-200 chars |
| Description | 10-5000 chars |
| Skills | Max 20 items, 50 chars each |
| Price/Amount | 0-1,000,000 |
| Rating | 1-5 integer |

### Validation Error Response
```json
{
  "success": false,
  "message": "Description is required and must be a string",
  "field": "description",
  "error": "VALIDATION_ERROR"
}
```

## 3. Input Sanitization

All inputs are sanitized to prevent injection attacks:

### XSS Prevention
- HTML entities are escaped in all string inputs
- Null bytes are removed
- Unicode is normalized (prevents homograph attacks)

### NoSQL Injection Prevention
- MongoDB operators ($gt, $ne, etc.) are stripped from inputs
- Prototype pollution is prevented

### Special Handling
- **Passwords**: Not sanitized (will be hashed)
- **Emails**: Normalized using validator library
- **URLs**: Validated and only HTTP/HTTPS allowed

## 4. API Key Security

### Environment Variables
All API keys are stored in environment variables:
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `JWT_SECRET`
- `MONGO_URI`

### Key Rotation
To rotate keys:
1. Generate new keys in the respective dashboards
2. Update `.env` file with new values
3. Restart the server
4. Revoke old keys

### Client-Side Security
- No API keys are exposed to the frontend
- JWT tokens are the only credentials stored client-side
- Frontend `.env.production` only contains `VITE_API_URL`

## 5. HTTP Security Headers (Helmet)

The following headers are set:
- **Content-Security-Policy**: Restricts resource loading
- **X-Content-Type-Options**: Prevents MIME sniffing
- **X-Frame-Options**: Prevents clickjacking
- **X-XSS-Protection**: Browser XSS filter
- **Strict-Transport-Security**: Forces HTTPS
- **Referrer-Policy**: Controls referrer information

## 6. File Upload Security

### Size Limits
- Profile pictures: 5MB
- Resumes: 10MB
- Message attachments: 25MB

### Type Validation
- Both extension and MIME type are validated
- Dangerous filename characters are rejected
- Hidden files (starting with `.`) are rejected

### Storage Security
- Random filenames are generated
- Original filenames are not preserved in storage
- Files are stored outside web root

## 7. Authentication Security

### Password Handling
- Passwords hashed with bcrypt (12 rounds)
- Passwords never logged or exposed in responses
- Minimum 6 characters enforced

### JWT Security
- Tokens expire after 7 days
- Secret should be at least 256 bits
- Token invalidation on logout (client-side)

## 8. CORS Configuration

Development:
```javascript
origin: '*'  // Allow all (dev only)
```

Production (recommended):
```javascript
origin: ['https://yourdomain.com']
```

## 9. Environment Setup

### Required Environment Variables
```env
# Server
PORT=9000

# Database
MONGO_URI=mongodb+srv://...

# JWT
JWT_SECRET=<generate-strong-secret>
JWT_EXPIRE=7d

# Razorpay
RAZORPAY_KEY_ID=<your-key-id>
RAZORPAY_KEY_SECRET=<your-key-secret>

# CORS
CORS_ORIGIN=https://yourdomain.com
```

### Generate Strong JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 10. Production Checklist

- [ ] Set strong, unique `JWT_SECRET`
- [ ] Configure production `CORS_ORIGIN`
- [ ] Use production Razorpay keys
- [ ] Enable HTTPS
- [ ] Set up database authentication
- [ ] Review rate limit values for your traffic
- [ ] Enable logging and monitoring
- [ ] Set up backup and recovery
- [ ] Perform security audit
