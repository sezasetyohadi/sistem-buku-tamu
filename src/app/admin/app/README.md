# 📱 Sistem Buku Tamu Mobile App

A React Native mobile application that replicates a guest book management system with modern UI design and comprehensive functionality.

## 🚀 Features

### 📝 Guest Registration
- Complete guest registration form with personal details
- File upload support for documents
- Form validation with error handling
- Date/time selection for visit scheduling
- Beautiful form design with step-by-step layout

### 🙏 Service Request System
- Service type selection (consultation, documents, technical support, etc.)
- Priority levels (low, medium, high, urgent)
- File attachment support
- Detailed description field
- Status tracking information

### ⭐ Customer Satisfaction Survey
- Rating system with emoji feedback
- Multiple choice questions about service quality
- Feedback collection for improvements
- Personal information collection
- Comprehensive evaluation system

### 🔐 Admin Dashboard
- Statistics overview (total guests, checked in/out)
- Guest management with real-time data
- Check-in/check-out functionality
- Guest list with filtering and actions

## 🛠 Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **Database**: SQLite (Expo SQLite)
- **Styling**: React Native StyleSheet with Linear Gradients
- **UI Components**: Custom reusable components
- **File Handling**: Expo Document Picker
- **Forms**: Custom form components with validation

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx      # Custom button with gradients
│   ├── Input.tsx       # Form input component
│   └── Card.tsx        # Card container component
├── screens/            # Application screens
│   ├── HomeScreen.tsx         # Landing page
│   ├── RegisterScreen.tsx     # Guest registration
│   ├── ServiceRequestScreen.tsx # Service requests
│   ├── SurveyScreen.tsx       # Customer satisfaction
│   └── AdminScreen.tsx        # Admin dashboard
├── database/           # SQLite database layer
│   └── DatabaseService.ts    # Database operations
├── utils/              # Utility functions
│   └── helpers.ts      # Validation and formatting
└── types/              # TypeScript type definitions
    └── index.ts        # Shared interfaces
```

## 🎨 Design Features

- **Modern gradient backgrounds** (indigo, purple, pink)
- **Emoji integration** for better user experience
- **Card-based layouts** with shadows and hover effects
- **Responsive design** for all screen sizes
- **Smooth animations** and transitions
- **Color-coded sections** for different functionalities
- **Professional typography** with clear hierarchy

## 📊 Database Schema

### Guests Table
- Personal information (name, email, phone, address)
- Education and profession details
- Visit purpose and meeting objectives
- Check-in/check-out timestamps
- File attachments

### Service Requests Table
- Request details and priorities
- Service type categorization
- Status tracking
- File attachments

### Surveys Table
- Personal demographics
- Service quality ratings
- Feedback and suggestions
- Timestamp tracking

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on specific platform:
```bash
# Android
npm run android

# iOS (macOS only)
npm run ios

# Web
npm run web
```

### Development Setup in VS Code

Use the provided tasks in VS Code:
- `Ctrl+Shift+P` → "Tasks: Run Task"
- Select "Start Expo Development Server"
- Then run "Run on Android" or "Run on iOS"

## 🔧 Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device (macOS only)
- `npm run web` - Run on web browser
- `npx tsc --noEmit` - TypeScript type checking

## 📱 Testing

### On Physical Device
1. Install Expo Go app from Google Play Store or App Store
2. Scan the QR code from the terminal
3. The app will load on your device

### On Emulator
1. Start Android Studio emulator or iOS simulator
2. Run `npm run android` or `npm run ios`
3. The app will automatically install and launch

## 🎯 Key Features Implementation

### Form Validation
- Real-time validation with error messages
- Email and phone number format validation
- Required field checking
- TypeScript type safety

### Database Operations
- SQLite integration with Expo
- CRUD operations for all entities
- Transaction support
- Data persistence across app sessions

### Navigation
- Stack navigation between screens
- Custom headers with gradients
- Smooth transitions
- Type-safe navigation parameters

### File Handling
- Document picker integration
- Support for PDF, DOC, DOCX, images
- File size validation
- Secure file storage

## 🔄 Future Enhancements

- Push notifications for status updates
- Cloud database synchronization
- Advanced reporting and analytics
- Multi-language support
- Dark mode theme
- Offline functionality
- User authentication system

## 📝 Development Notes

- All components use TypeScript for type safety
- Custom hooks for database operations
- Responsive design principles
- Accessibility considerations
- Performance optimizations
- Error handling throughout the app

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npx expo start -c`
2. **Android build errors**: Ensure Android SDK is properly configured
3. **iOS simulator not starting**: Check Xcode installation
4. **Database errors**: Check SQLite permissions

### Debug Mode

Enable remote debugging in Expo DevTools to inspect the app state and debug issues.

## 📄 License

This project is part of an internship program and is intended for educational purposes.

---

## 🎉 Ready to Start!

Your mobile guest book application is ready to run! Use the VS Code tasks or npm scripts to launch the development environment.
