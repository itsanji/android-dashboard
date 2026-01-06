# Deep Bug Analysis: Widget Drag-and-Drop Issue

**Date:** January 6, 2026  
**Issue:** Widget jumps to wrong position on second drag attempt

---

## 🔍 SYMPTOMS

User reports:
1. Touch widget → drag → release → ✅ Works
2. Touch widget again → slight drag → ❌ Widget jumps to different position then drags

---

## 📊 LOG ANALYSIS

### Key Evidence from Logs (Line 377-379):

```javascript
// Line 377: DRAG RELEASE
"currentPosition": {"x": 272, "y": 320},  // ❌ STALE - from old position
"dragStart": {"x": 272, "y": 320},         // ❌ WRONG - should be (432, 216)
"widgetPosition": {"x": 272, "y": 320}     // ❌ STALE widget prop
"finalPosition": {"x": 65.49, "y": 153.68} // ✅ Calculation is correct

// Line 379: CONTEXT snapping  
"originalPosition": {"x": 432, "y": 216}   // ✅ TRUE position in Context!
```

### Critical Discovery:

The widget's **ACTUAL** position in Context is `(432, 216)`, but:
- `widget.position` shows `(272, 320)` (old value)
- `currentPosition` shows `(272, 320)` (old value)
- Visual rendering uses `currentPosition`

---

## 🎯 ROOT CAUSE

### Problem 1: Stale Widget Prop
The `widget` prop passed to `DraggableWidget` is NOT updating after Context changes!

**Why?**
- Component re-renders but receives stale `widget` object
- React is not detecting the widget object changed
- Likely reference equality issue in parent component

### Problem 2: Mixed Position Sources
The component uses TWO different position sources:

```typescript
// For DISPLAY (lines 175-178):
<View style={{
  left: currentPosition.x,    // ❌ Local state (async, stale)
  top: currentPosition.y,
}}>

// For GESTURE START (lines 50-58):
onPanResponderGrant: () => {
  dragStartRef.current = {
    x: widget.position.x,      // ❌ Stale prop
    y: widget.position.y,
  };
}
```

### Problem 3: Missing 🟣 DRAG START Logs
In the user's logs, there's NO `🟣 DRAG START` log on second drag!

This means either:
- `onPanResponderGrant` is not being called
- OR the component is not re-rendering with updated logs

---

## 🔄 SEQUENCE OF FAILURE

1. **Initial state:** Widget at `(272, 320)`
   - `widget.position`: `(272, 320)` ✅
   - `currentPosition`: `(272, 320)` ✅
   - Visual position: `(272, 320)` ✅

2. **First drag:** User drags to `(432, 216)`
   - Gesture calculates correctly
   - Context updates to `(432, 216)` ✅
   - `widget.position` should update but DOESN'T ❌
   - `currentPosition` should update via useEffect but DOESN'T ❌
   - Visual position still shows `(272, 320)` ❌

3. **Second drag:** User touches where they SEE the widget
   - User sees widget at `(272, 320)` (stale visual)
   - Actual position in Context: `(432, 216)`
   - `dragStartRef` sets to `(272, 320)` (stale widget.position)
   - User drags with offset from wrong starting point
   - Widget appears to "jump"

---

## 🐛 WHY WIDGET PROP IS STALE

Looking at the parent component that renders `DraggableWidget`:

**Hypothesis 1:** Parent not re-rendering
- Parent component doesn't subscribe to Context changes
- Widget array doesn't trigger re-render

**Hypothesis 2:** Reference equality issue
- Widget object reference doesn't change
- React thinks prop hasn't changed
- Component doesn't re-render with new data

**Hypothesis 3:** Prop mapping issue
- Parent maps widgets array incorrectly
- Key prop on list items may be wrong
- Component instance reuses old props

---

## ✅ SOLUTION STRATEGY

### Option 1: Fix Parent Component (RECOMMENDED)
Ensure parent properly subscribes to Context and re-renders when widgets change.

### Option 2: Remove Dependency on Props
Don't trust `widget` prop. Subscribe to Context directly in `DraggableWidget`:

```typescript
const { widgets } = useWidgets();
const widget = widgets.find(w => w.id === widgetId);
```

### Option 3: Eliminate Local State
Don't use `currentPosition` at all. Use only `widget.position` for display, with temporary offset during drag.

---

## 🔧 RECOMMENDED FIX

Combine Option 2 + 3:

1. **Subscribe to Context directly** in `DraggableWidget`
2. **Eliminate `currentPosition` state**
3. **Use drag offset** for visual feedback during gesture
4. **Display position** = `widget.position + dragOffset` (during drag) or `widget.position` (not dragging)

This ensures:
- Single source of truth (Context)
- No stale props
- No async state issues
- Real-time visual feedback during drag
- Correct position after release

---

## 📝 NEXT STEPS

1. Check parent component (WidgetCanvas) to see how it renders DraggableWidget
2. Check if it properly subscribes to widgets array changes
3. Implement the recommended fix
4. Test thoroughly

---

**Status:** Root cause identified, solution designed, ready to implement.

