# Section 4.5 Completion Report: Media Controller Widget

**Date:** September 27, 2026
**Status:** ✅ Implemented, ⏳ awaiting device testing
**PR:** itsanji/android-dashboard#2

---

## 🎯 Goal

Show and control what is playing in other apps (Spotify, YouTube Music, ...)
from a dashboard widget.

React Native and Expo have no API for other apps' playback, so this needed
native Android code. Root or Shizuku is **not** required.

---

## 🏗️ Architecture

```
MediaControllerWidget (React)
        │ useNowPlaying()
        ▼
modules/media-session/index.ts        typed JS API (null outside a dev build)
        │ Expo Modules bridge
        ▼
MediaSessionModule.kt                 functions + onStateChange event
        │
NowPlayingController.kt               MediaSessionManager / MediaController
        │ permission via
MediaListenerService.kt               empty NotificationListenerService
```

### How Android exposes it

`MediaSessionManager.getActiveSessions()` returns every app's media session,
but only to apps with an **enabled notification listener**. The module
declares `MediaListenerService` for that purpose; the user turns it on once in
_Settings → Notification access_.

| Need                                       | Android API                                               |
| ------------------------------------------ | --------------------------------------------------------- |
| Which app is playing                       | `getActiveSessions()` + `OnActiveSessionsChangedListener` |
| Title, artist, album, art, duration        | `MediaController.getMetadata()`                           |
| Playing state, position, supported actions | `MediaController.getPlaybackState()`                      |
| Live updates                               | `MediaController.Callback`                                |
| Play / pause / next / previous / seek      | `MediaController.getTransportControls()`                  |

---

## 📁 Files

### Native module (`android-standby-app/modules/media-session/`)

| File                                   | Purpose                                                                                                            |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `expo-module.config.json`              | Registers `expo.modules.mediasession.MediaSessionModule` (autolinked from `./modules`)                             |
| `android/src/main/AndroidManifest.xml` | Declares the notification listener service (merged into the app)                                                   |
| `MediaListenerService.kt`              | Empty service; its enabled state grants session access                                                             |
| `NowPlayingController.kt`              | Picks the session that's playing, reads state, caches album art to `file://`, transport controls, observes changes |
| `MediaSessionModule.kt`                | JS bridge; emits `onStateChange` while observed, re-checks permission on foreground                                |
| `index.ts`                             | TypeScript API and types (`NowPlaying`, `MediaSessionState`)                                                       |

### App

| File                                               | Purpose                                                               |
| -------------------------------------------------- | --------------------------------------------------------------------- |
| `src/hooks/useNowPlaying.ts`                       | Subscribes to updates; extrapolates playback position between updates |
| `src/components/widgets/MediaControllerWidget.tsx` | Widget UI                                                             |
| `src/screens/Dashboard/DashboardScreen.tsx`        | Renders it for `MEDIA_CONTROLLER` widgets                             |

---

## 🔌 JS API

```ts
import MediaSession from '../../modules/media-session';

MediaSession?.hasPermission(): boolean
MediaSession?.openPermissionSettings(): void
MediaSession?.getState(): { hasPermission, nowPlaying }
MediaSession?.play() / pause() / togglePlayPause()
MediaSession?.skipToNext() / skipToPrevious() / seekTo(ms)
MediaSession?.addListener('onStateChange', (state) => { ... })
```

`nowPlaying` contains `packageName`, `appName`, `title`, `artist`, `album`,
`artworkUri`, `durationMs`, `positionMs`, `playbackSpeed`, `isPlaying`,
`isBuffering`, `canSkipNext`, `canSkipPrevious` and `canSeek`.

Native observation starts when the first listener is added and stops when the
last one is removed.

---

## 🎨 Widget Behavior

| Widget size                                   | Layout                                                              |
| --------------------------------------------- | ------------------------------------------------------------------- |
| Height < 150                                  | Single row: art, title/artist, play/pause                           |
| Width < 240 or height < 220, or `compactMode` | Art + info row, controls row                                        |
| Larger                                        | Large art, centered title/artist, progress bar with times, controls |

- Controls are 48dp touch targets; skip buttons are disabled when the app
  doesn't support them.
- States: needs dev build (Expo Go), needs permission (**Allow access**
  button), nothing playing.
- Respects `config.showAlbumArt`, `config.compactMode` and `style.textColor`.
- Buttons take taps; dragging from a button still moves the widget.

---

## 🔧 Build Changes

- Added `expo-dev-client`; `npm run android` = `expo run:android`
- `android/` and `ios/` are generated (gitignored)
- `expo-image-picker` configured without `CAMERA` / `RECORD_AUDIO`

---

## ✅ Verification

- `npm run type-check`, `npm run lint`: pass
- `npx expo export --platform android`: bundles
- `expo-modules-autolinking resolve`: finds the module
- `npx expo prebuild -p android`: succeeds
- Kotlin compiled (warnings as errors) against the Android 15 framework jar
  with stand-ins for the Expo module DSL. This caught one bug
  (nullable `getSystemService`), since fixed.
- ⏳ Not yet built with the Android SDK or run on a device

### Device test checklist

- [ ] `npm run android` builds and installs
- [ ] **Allow access** opens the right settings screen; widget updates on return
- [ ] Title, artist, art and progress show while Spotify / YouTube Music plays
- [ ] Play/pause, next, previous work
- [ ] Switching apps picks up the new player
- [ ] Full, compact and single-row layouts look right when resizing
- [ ] Dragging from a button moves the widget

---

## 📝 Known Limitations

- Album art from apps that only provide a `content://` URI (no bitmap) isn't
  shown; our app usually can't read other apps' content URIs.
- Seeking is exposed in the API but the widget has no seek bar interaction yet.
- Android 13+ "Restricted setting" can block the notification access toggle for
  sideloaded builds (workaround in README / QUICK_START).
