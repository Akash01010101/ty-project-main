# Environment Setup Guide

## ✅ Changes Made

### 1. **Created `.env` in Root Directory**
The `.env` file is now located at: `c:\Users\Devang Gupta\Desktop\ty-project-main\.env`

Both frontend and backend now share the same environment file.

### 2. **Environment Variables Included**

```env
# Server Configuration
PORT=9000

# Database Configuration
MONGO_URI=mongodb+srv://devang:devang69@cluster0.mcdbahl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# JWT Configuration
JWT_SECRET=devang@secretyeyeyeye
JWT_EXPIRE=7d

# Frontend Configuration (Vite requires VITE_ prefix)
VITE_API_URL=http://localhost:9000
```

### 3. **Updated Backend Configuration**
- Updated `backend/index.js` to load `.env` from root directory using `path.resolve()`
- Fixed: Changed `MONGODB_URI` to `MONGO_URI` (matches what the code expects)

### 4. **Updated Frontend Configuration**
- Updated `skill-marketplace-frontend/vite.config.js` to load `.env` from root directory
- Added `envDir` configuration pointing to parent directory

## 🔒 Security Note

**IMPORTANT:** The `.env` file is already in `.gitignore` to prevent sensitive credentials from being committed to version control.

## 🚀 How to Use

1. **Backend**: Already configured to read from root `.env`
2. **Frontend**: Already configured to read from root `.env`
3. **No additional steps needed** - both will automatically use the shared `.env` file

## 📝 Notes

- Frontend environment variables MUST be prefixed with `VITE_` to be accessible in the React app
- Backend can access all variables directly via `process.env.VARIABLE_NAME`
- Never commit the `.env` file to Git
- For production, use environment-specific files or hosting platform's environment variable settings
