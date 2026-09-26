# Android Standby Mode

A React Native dashboard application for Android that displays customizable widgets on your home screen.

## Features

- **Dashboard Screen**: Display multiple widgets with customizable layouts
- **Widgets**:
  - 📅 Calendar: Shows upcoming events from your phone's calendar
  - 🌤️ Weather: Displays current weather based on your location
  - 🎵 Media Controller: Control currently playing media
  - ✏️ Custom Text: Add your own text notes
  - 🕐 Clock: Multiple clock styles (digital/analog)
- **Customizable Background**: Set images or videos as your dashboard background
- **Responsive Design**: Works across all screen sizes from small phones to foldable devices
- **Settings**: Easy widget management and customization

## Tech Stack

- **React Native** with TypeScript
- **Expo** for rapid development
- **React Navigation** for screen navigation
- **AsyncStorage** for data persistence
- **Expo Calendar, Media Library, AV** for native integrations

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Physical Android device or emulator

### Installation

1. Clone the repository:

```bash
cd android-standby-app
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

4. Run on Android:

```bash
npm run android
```

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── widgets/      # Widget components
│   ├── common/       # Common components
│   └── ui/           # UI elements
├── screens/          # Screen components
│   ├── Dashboard/    # Dashboard screen
│   └── Settings/     # Settings screen
├── services/         # Business logic services
│   ├── storage/      # Data persistence
│   ├── calendar/     # Calendar integration
│   ├── weather/      # Weather service
│   └── media/        # Media control
├── utils/            # Utility functions
│   ├── responsive/   # Responsive design utilities
│   ├── layout/       # Layout helpers
│   └── permissions/  # Permission management
├── hooks/            # Custom React hooks
├── context/          # React Context providers
├── types/            # TypeScript type definitions
└── constants/        # App constants and theme
```

## Development Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking

## Responsive Design

The app supports multiple screen sizes:

- **XS** (< 360dp): Small phones, folded flip phones
- **SM** (360-599dp): Regular phones
- **MD** (600-839dp): Large phones, small tablets
- **LG** (840-1279dp): Tablets, unfolded foldables
- **XL** (≥ 1280dp): Large tablets

## Permissions

The app requires the following permissions:

- **Calendar**: To read and display calendar events
- **Media Library**: To access photos/videos for backgrounds
- **Location**: To show weather information

## Configuration

Edit `app.json` to configure:

- App name and package identifier
- Permissions
- Splash screen and icons
- Build settings

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
