# Buffr App Scan - Bug Fixes & UX Optimization

This plan addresses critical desync issues and bugs identified during the app-wide scan, focusing on the native-to-web bridge and gamification logic consistency.

## User Review Required

> [!IMPORTANT]
> **XP Formula Sync:** I am updating the Java (native) XP calculation to match the Web (React) calculation exactly. This prevents "level flickering" where the widget shows one level and the app shows another.

## Proposed Changes

### 1. Gamification Consistency (High Priority)

#### [MODIFY] [BuffrActionReceiver.java](file:///C:/Users/ajayu/StudioProjects/Buffr/android/app/src/main/java/com/example/buffr/BuffrActionReceiver.java)
- Update `nextLevelXp` calculation to use the power-law formula: `Math.round(75 * Math.pow(level, 1.45) + 25)`.
- Update the Level-Up loop to match the React logic. This ensures that XP thresholds are identical across the entire system.

### 2. Multi-Widget Support

#### [MODIFY] [BuffrWidgetData.java](file:///C:/Users/ajayu/StudioProjects/Buffr/android/app/src/main/java/com/example/buffr/BuffrWidgetData.java)
- Update `updateAllWidgets` to correctly find and refresh `BuffrQuickStatWidget` in addition to the HUD widget.

### 3. UX & Performance

#### [MODIFY] [BuffrActionReceiver.java](file:///C:/Users/ajayu/StudioProjects/Buffr/android/app/src/main/java/com/example/buffr/BuffrActionReceiver.java)
- Add a check to prevent Toast spam if multiple actions happen rapidly.

#### [MODIFY] [widgetBridge.ts](file:///C:/Users/ajayu/StudioProjects/Buffr/src/utils/widgetBridge.ts)
- Refine the payload to include a `syncTimestamp` to help debug any future desync issues. (Optional but good for stability).

## Verification Plan

### Automated Tests
- N/A (Manual verification on device).

### Manual Verification
1.  **XP Consistency**:
    - Check off a quest on the widget at Level 2.
    - Verify that the XP threshold shown matches the app (should be ~230 XP, not 200 XP).
    - Open the app and verify no "rollback" or "level drop" occurs.
2.  **Multi-Widget**:
    - Add both "Daily HUD" and "Quick Stat" widgets to the home screen.
    - Complete a quest in the app.
    - Verify BOTH widgets refresh immediately.
3.  **UI Blocking**:
    - Tap the widget checkbox while the app is open in the background.
    - Resume the app and verify the "Level Up" modal triggers correctly without glitching.
