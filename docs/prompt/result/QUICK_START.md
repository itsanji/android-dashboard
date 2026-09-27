# 🚀 Quick Start

_Last updated: 2026-09-27_

The app includes custom native code (the media controller module), so it runs
as an **Expo development build**. Expo Go can no longer run it.

## Prerequisites

- Node.js 20+
- Android Studio with the Android SDK, and JDK 17+ (`ANDROID_HOME` set)
- A phone with USB debugging enabled (e.g. Galaxy Z Fold 7), or an emulator

## Build and run

```bash
cd android-standby-app
npm install
npm run android          # builds, installs and launches the dev build
# or pick a connected phone explicitly:
npm run android:device
```

The first build takes a few minutes. After that:

| You changed                                                           | What to do                                                                                         |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| JS/TS code (`src/`, `modules/*/index.ts`)                             | Nothing, fast refresh reloads it. If Metro isn't running: `npm start`, then open the installed app |
| Kotlin (`modules/*/android`), `app.json` plugins, native dependencies | `npm run android` again                                                                            |
| Native project out of sync                                            | `npx expo prebuild -p android --clean`, then `npm run android`                                     |

`android/` is generated and not committed.

## 📱 What to try

1. **Add widgets**: tap ⚙️ → _Available Widgets_ → _Add_.
2. **Move and resize**: drag a widget, tap it to select, drag the round
   handle to resize. Tap it again or tap empty space to deselect.
3. **Media widget**: add _Media_, tap **Allow access**, enable
   _Android Standby Mode_, come back, then play something in Spotify /
   YouTube Music.
4. **Fold / rotate**: arrange widgets, fold or rotate, arrange differently,
   then go back. Each screen setup keeps its own layout.
5. **Persistence**: close and reopen the app. Widgets (including deletions)
   and the background stay as you left them.

Calendar, weather, text and clock widgets still show placeholders.

## 🐛 Troubleshooting

**Notification access toggle is greyed out ("Restricted setting")**
Android 13+ restricts this for apps not installed from the Play Store:
_Settings → Apps → Android Standby Mode → ⋮ → Allow restricted settings_.

**Media widget says it needs a development build**
You opened the project in Expo Go. Install the dev build with `npm run android`.

**Metro / cache errors**

```bash
npm start -- --clear
```

**Device not detected**

```bash
adb devices
adb kill-server && adb start-server
```

**Native build fails after pulling changes**

```bash
rm -rf node_modules && npm install
npx expo prebuild -p android --clean
npm run android
```

## ✅ Checks before committing

```bash
npm run type-check
npm run lint
```
