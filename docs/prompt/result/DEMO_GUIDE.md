# Demo Screen - Testing Guide

## 🚀 How to Run

```bash
cd /home/anji/data/project/self/android_standby_mode/android-standby-app
npm start
```

Then press `a` to run on Android device/emulator, or scan the QR code with Expo Go app.

## 📱 What You'll See

The demo screen showcases all the responsive components working on your Samsung Galaxy Z Fold 7:

### 1. **Screen Information Card**
- Shows current screen dimensions (width, height)
- Screen size category (XS, SM, MD, LG, XL)
- Orientation (Portrait/Landscape)
- Device type (Tablet, Foldable)

### 2. **Foldable Device Info** (Z Fold 7 specific!)
- Current fold state (FOLDED / UNFOLDED)
- Real-time detection
- This card only appears on foldable devices

### 3. **Responsive Buttons**
- Three sizes: Small, Medium, Large
- Three variants: Primary, Secondary, Outline
- Loading state demo
- Disabled state
- All buttons adapt their padding to screen size

### 4. **Icon Buttons**
- Touch-friendly circular buttons
- Different sizes and colors
- Minimum 48dp touch targets

### 5. **Modal Demo**
- Click "Open Modal" to see responsive modal
- Modal width adapts to screen size:
  - Small phones: 90% width
  - Tablets/Unfolded: Max 600dp width

### 6. **Grid System Preview**
- Shows numbered cells in a grid
- Automatically adjusts columns based on screen size:
  - XS: 2 columns
  - SM: 3 columns
  - MD: 4 columns
  - LG: 5 columns
  - XL: 6 columns

### 7. **Raw Dimensions**
- JSON view of exact screen measurements

## 🧪 Testing on Samsung Galaxy Z Fold 7

### Test Scenarios:

#### **1. Unfolded State** (Wide Screen)
- Open the app with Z Fold 7 fully unfolded
- You should see:
  - ✅ Width: ~880dp (or similar wide dimension)
  - ✅ Screen Size: LG or XL
  - ✅ Foldable Info card showing "UNFOLDED"
  - ✅ Grid with 5-6 columns
  - ✅ Modal at max 600dp width (centered)

#### **2. Folded State** (Narrow Screen)
- Fold the device to use cover screen
- You should see:
  - ✅ Width: ~370dp (or similar narrow dimension)
  - ✅ Screen Size: SM or MD
  - ✅ Foldable Info card showing "FOLDED"
  - ✅ Grid with 2-3 columns
  - ✅ Modal at 90% width

#### **3. Fold/Unfold Transition**
- While app is running, fold/unfold the device
- Watch the screen automatically detect the change
- All components should reflow smoothly
- Numbers should update in real-time

#### **4. Orientation Changes**
- Try rotating in both folded and unfolded states
- Landscape mode should be detected
- Grid and components should adapt

## 📊 Expected Values (Z Fold 7)

| State | Width | Height | Screen Size | Columns |
|-------|-------|--------|-------------|---------|
| Folded (Portrait) | ~370dp | ~900dp | SM/MD | 2-3 |
| Unfolded (Portrait) | ~880dp | ~2200dp | LG | 5 |
| Unfolded (Landscape) | ~2200dp | ~880dp | XL | 6 |

*Note: Exact values may vary based on your specific device configuration*

## 🎨 Visual Testing Checklist

- [ ] All text is readable (not too small/large)
- [ ] Buttons are easy to tap (minimum 48dp)
- [ ] Spacing looks appropriate for screen size
- [ ] No content is cut off or overlapping
- [ ] Modal appears centered and sized correctly
- [ ] Grid cells are evenly spaced
- [ ] Fold state detection works instantly
- [ ] No lag during fold/unfold transitions
- [ ] Colors and contrast are good (dark theme)

## 🐛 What to Look For

### Potential Issues:
1. **Text too small on folded screen** → Check if fonts scale properly
2. **Buttons too cramped** → Verify spacing calculations
3. **Modal too wide on narrow screen** → Check modal width logic
4. **Grid columns wrong** → Verify breakpoint detection
5. **Fold state not detected** → Check width thresholds

### Report Issues:
If you see any problems, note:
- Which state (folded/unfolded)
- Screen dimensions shown
- What looks wrong
- Screenshot if possible

## 💡 Tips

1. **Fold Detection**: The app detects fold state based on screen width. Devices < 400dp wide are considered "folded"
   
2. **Crease Padding**: When unfolded (width > 700dp), extra padding is added on left/right edges to avoid the crease area

3. **Real-time Updates**: All values update automatically when you fold/unfold. No need to restart the app!

4. **Dark Theme**: The demo uses a dark theme optimized for OLED screens

## 🎯 What This Tests

This demo validates:
- ✅ Screen dimension detection
- ✅ Foldable device recognition
- ✅ Fold state tracking
- ✅ Responsive component sizing
- ✅ Grid system calculations
- ✅ Touch target compliance
- ✅ Modal responsiveness
- ✅ Real-time dimension updates

## 📝 Next Steps

After testing the demo:
1. Verify all components look good on your Z Fold 7
2. Test fold/unfold transitions
3. Check both portrait and landscape
4. Report any issues found
5. Ready to build Dashboard and Settings screens!

---

**Built with love for the Samsung Galaxy Z Fold 7** 📱💜

