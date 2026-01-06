# 🚀 Quick Start - Run the Demo

## Option 1: Run on Your Samsung Galaxy Z Fold 7 (Recommended)

### Step 1: Start the development server
```bash
cd /home/anji/data/project/self/android_standby_mode/android-standby-app
npm start
```

### Step 2: Run on your device

**If device is connected via USB:**
```bash
npm run android
```

**Or scan the QR code** with Expo Go app (install from Play Store if needed)

---

## Option 2: Using Android Studio Emulator

1. Start the emulator from Android Studio
2. Run:
```bash
npm run android
```

---

## 📱 What You'll See

A demo screen showcasing:
- ✅ Real-time screen dimensions
- ✅ **Fold state detection** (FOLDED/UNFOLDED) - perfect for your Z Fold 7!
- ✅ Responsive buttons (3 sizes, 3 variants)
- ✅ Icon buttons
- ✅ Responsive modal
- ✅ Auto-adjusting grid system
- ✅ Device type detection

## 🧪 Testing on Z Fold 7

### Try These:
1. **Start unfolded** - See it detect wide screen (~880dp)
2. **Fold the device** - Watch it instantly switch to narrow mode (~370dp)
3. **Open the modal** - See how it adapts to screen width
4. **Rotate the device** - Test portrait and landscape
5. **Check the grid** - Columns adjust automatically (2-6 columns)

---

## 🎯 Expected Behavior

### Unfolded State:
- Width: ~880dp
- Screen Size: LG
- Fold State: "UNFOLDED"
- Grid: 5 columns
- Modal: Max 600dp width

### Folded State:
- Width: ~370dp
- Screen Size: SM
- Fold State: "FOLDED"
- Grid: 3 columns
- Modal: 90% width

---

## 🐛 Troubleshooting

**Issue:** App won't start
```bash
# Clear cache and restart
npm start -- --clear
```

**Issue:** Device not detected
```bash
# Check device connection
adb devices

# Restart adb if needed
adb kill-server
adb start-server
```

**Issue:** Metro bundler errors
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
npm start
```

---

## 📖 More Details

See `DEMO_GUIDE.md` for detailed testing instructions and what to look for.

---

**Ready to test?** Run `npm start` and enjoy! 🎉

