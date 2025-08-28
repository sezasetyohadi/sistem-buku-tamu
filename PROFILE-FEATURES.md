# Admin Profile Features

## Overview
The admin profile system now supports full profile management including profile picture uploads and real-time updates.

## Features Implemented

### 1. Profile Information Management
- **Edit Full Name**: Admins can update their full name
- **Edit Email**: Admins can update their email address with validation
- **Password Change**: Secure password change with current password verification
- **Real-time Updates**: Changes are immediately reflected in the UI and session

### 2. Profile Picture Upload
- **File Upload**: Support for JPEG, JPG, PNG, and WebP formats
- **Size Validation**: Maximum file size of 5MB
- **Automatic Storage**: Files are stored in `/public/uploads/profiles/`
- **Unique Naming**: Files are named with admin ID and timestamp
- **Image Display**: Profile pictures are shown in both profile page and admin header

### 3. Security Features
- **Session-based Authentication**: All operations require valid admin session
- **Password Hashing**: Passwords are hashed using bcrypt
- **Input Validation**: Comprehensive validation for all inputs
- **File Type Validation**: Only allowed image formats are accepted

## API Endpoints

### GET `/api/admin/profile`
- Retrieves admin profile information
- Returns: id, username, nama_lengkap, email, profile_picture, created_at, is_super_admin

### PUT `/api/admin/profile`
- Updates admin profile information
- Supports: fullName, email, currentPassword, newPassword
- Validates current password before allowing password changes

### POST `/api/admin/profile/upload-picture`
- Uploads profile picture
- Accepts multipart form data with 'profilePicture' field
- Returns the URL of the uploaded image

## Database Changes

### Admin Table
Added `profile_picture` column:
```sql
ALTER TABLE admin 
ADD COLUMN profile_picture VARCHAR(255) DEFAULT NULL 
AFTER email;
```

## File Storage

### Directory Structure
```
public/
  uploads/
    profiles/
      admin_{id}_{timestamp}.{extension}
```

### File Naming Convention
- Format: `admin_{adminId}_{timestamp}.{extension}`
- Example: `admin_1_1703123456789.jpg`

## UI Features

### Profile Page (`/admin/profile`)
- **Profile Card**: Shows current profile information with avatar
- **Edit Mode**: Toggle between view and edit modes
- **File Upload**: Click the + button on profile picture to upload new image
- **Form Validation**: Real-time validation for all inputs
- **Success/Error Messages**: Clear feedback for all operations

### Admin Header
- **Profile Picture**: Shows admin's profile picture or initials
- **Profile Link**: Click to navigate to profile page
- **Real-time Updates**: Profile picture updates immediately after upload

## Usage Instructions

### Updating Profile Information
1. Navigate to `/admin/profile`
2. Click "Edit Profile" button
3. Update name and/or email
4. Optionally change password (requires current password)
5. Click "Simpan Perubahan"

### Uploading Profile Picture
1. Navigate to `/admin/profile`
2. Click the + button on the profile picture
3. Select an image file (JPEG, PNG, or WebP, max 5MB)
4. Click "Unggah Foto" to upload
5. The image will be displayed immediately

## Error Handling

### Common Error Messages
- **"Format file tidak didukung"**: Invalid file type
- **"Ukuran file terlalu besar"**: File exceeds 5MB limit
- **"Password saat ini tidak benar"**: Incorrect current password
- **"Format email tidak valid"**: Invalid email format
- **"Password baru minimal 6 karakter"**: Password too short

### Validation Rules
- **Email**: Must be valid email format
- **Password**: Minimum 6 characters
- **File Type**: JPEG, JPG, PNG, WebP only
- **File Size**: Maximum 5MB
- **Required Fields**: Full name and email are required

## Technical Implementation

### Frontend
- React hooks for state management
- Form validation with real-time feedback
- File upload with progress indication
- Session management with localStorage

### Backend
- Express.js API routes
- MySQL database with prepared statements
- File system storage for images
- bcrypt for password hashing
- Comprehensive error handling

### Security
- Session-based authentication
- Input sanitization and validation
- File type and size validation
- Password hashing with bcrypt
- SQL injection prevention with prepared statements
