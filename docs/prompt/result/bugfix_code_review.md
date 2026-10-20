# Code Review: Bug Fixes and Cleanup

**Date:** September 27, 2026
**Scope:** Full review of the app after Section 4.1/4.2
**Status:** ✅ Merged into `develop` (itsanji/android-dashboard#1)

---

## 🐛 Bugs Fixed

### Saving and loading (`src/context/WidgetContext.tsx`)

| Bug                                               | Cause                                                             | Fix                                                                        |
| ------------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Deleting the last widget came back after restart  | Save effect skipped empty lists (`widgets.length > 0`)            | Always save once loaded                                                    |
| Saved background could be overwritten on startup  | Default background saved on mount, before the stored one was read | `isHydrated` flag: nothing is saved until loading finishes                 |
| New widgets had no `config`                       | `addWidget` built widgets with an `as Widget` cast                | Per-type defaults (`getDefaultConfig`); missing configs backfilled on load |
| Stale `widgets` / `selectedWidgetId` in callbacks | Callbacks closed over state                                       | Functional state updates                                                   |

### Touch handling (`DraggableWidget.tsx`, `WidgetCanvas.tsx`)

| Bug                                                      | Cause                                                                                  | Fix                                                                                                                                                         |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tapping a selected widget never deselected it            | PanResponders are created once and read the first render's `isSelected` / `isDragging` | Handlers read everything from a `latestRef`; selection before the gesture is recorded in `wasSelectedRef`                                                   |
| No way to deselect                                       | Canvas had no touch handler                                                            | Tapping empty canvas clears the selection                                                                                                                   |
| Widget stuck mid-drag after the system takes the gesture | No `onPanResponderTerminate`                                                           | Reset drag/resize state on terminate                                                                                                                        |
| Taps made the widget jump and re-save                    | Offset and scale applied from the first pixel; `bringToFront` always wrote             | Visual drag starts past the 5px tap threshold; `bringToFront` skips widgets already on top                                                                  |
| Resize minimum hard-coded to 100                         | Magic number                                                                           | Uses `WIDGET_CONSTRAINTS`                                                                                                                                   |
| Lint error on `useRef(PanResponder.create(...)).current` | Ref read during render                                                                 | `useMemo`; the remaining react-hooks/refs finding is a false positive (refs are only read in gesture callbacks) and is disabled with an explanatory comment |

### Layout (`src/utils/layout`, `src/utils/responsive`)

| Bug                                            | Cause                                                          | Fix                                                               |
| ---------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------- |
| Widgets could sit partly below the screen edge | Bounds used the window size, not the canvas (safe-area insets) | Canvas reports its measured size via `onLayout` (`setCanvasSize`) |
| Oversized widgets placed wrongly               | `constrainPosition` computed x/y from the unclamped size       | Clamp size first                                                  |
| `Infinity` / `NaN` cell sizes                  | Grid helpers divided by zero rows/columns                      | Clamp to ≥ 1 before dividing                                      |
| `borderRadius` / `padding` of `0` ignored      | `\|\|` instead of `??`                                         | Use `??`                                                          |
| Settings list showed "200x200 •z-index"        | JSX dropped the trailing space                                 | Template string                                                   |

### Tooling

- `npm run lint` crashed: ESLint 9 no longer reads `.eslintrc.js` (which also
  referenced an uninstalled `react-native` env). Migrated to
  `eslint.config.js`; added `@eslint/js` and `globals`.

---

## 🧹 Follow-up Changes

- **Removed unused code**: `useWidgetDrag`, `useWidgetResize`,
  `WidgetWrapper`, `WidgetGrid`, `foldableStorage`, `DemoScreen` (and its
  guide). Nothing referenced them.
- **`expo-av` → `expo-video`**: `expo-av` is deprecated in SDK 54. The video
  background uses `useVideoPlayer` / `VideoView` (muted, looping, cover).
- **Per-screen layouts**: each widget stores a position per layout key
  (`folded|unfolded|normal` + `portrait|landscape`, from the canvas size).
  Switching screens saves the old layout and restores the new one, or scales
  positions proportionally the first time. Replaces permanently clamping
  positions on rotation.
- **Formatting**: Prettier / `lint:fix` across the app; `npm run lint` is clean.

---

## ✅ Verification

- `npm run type-check` and `npm run lint` pass
- `npx expo export --platform android` bundles
- Layout helpers run in Node with phone and Z Fold sizes
- ⏳ Not yet tested on a device
