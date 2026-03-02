# PhotoBooth Critical Bugs Fix Design

## Overview

This design addresses 8 critical and high-priority bugs in the PhotoVibes photobooth application. The bugs span multiple subsystems: photo capture state management (race conditions, timer management), effect processing (metadata persistence, canvas artifacts), resource management (memory leaks), storage handling (quota errors), and user experience (flash auto-detection, error messaging). The fix strategy focuses on proper state cleanup, bounds checking, resource lifecycle management, and graceful error handling while preserving all existing functionality for non-buggy scenarios.

## Glossary

- **Bug_Condition (C)**: The conditions that trigger any of the 8 bugs - race conditions in capture flow, rapid countdown toggles, effect intensity adjustments, distortion effect edge cases, effect switching, storage quota exceeded, auto flash mode, and camera permission errors
- **Property (P)**: The desired behavior for each bug condition - proper state cleanup, single timer management, metadata persistence, bounds-checked rendering, resource cleanup, quota error handling, brightness-based flash, and specific error messages
- **Preservation**: All existing photo capture, effect processing, gallery, storage, and camera initialization behaviors that must remain unchanged
- **isCapturing**: A ref in the photo capture component that prevents duplicate captures; gets stuck when errors occur
- **countdownInterval**: A timer ID that manages countdown display; multiple instances cause erratic behavior
- **effectIntensity**: A numeric value (0-100) that controls effect strength; currently not saved in photo metadata
- **distortionEffects**: Canvas-based effects (fisheye, bulge, pinch) that transform pixel coordinates; can access out-of-bounds pixels
- **EffectPanel**: Component that displays effect previews using video elements; lacks cleanup causing memory leaks
- **localStorage**: Browser storage API with quota limits; quota exceeded errors crash the app
- **flashMode**: Setting with values "On", "Off", "Auto"; Auto mode currently doesn't detect brightness
- **cameraPermission**: MediaStream API permission state; errors don't distinguish between denial and hardware issues

## Bug Details

### Fault Condition

The bugs manifest across multiple subsystems with distinct conditions:

**Bug 1 - Race Condition in Photo Capture:**
The bug occurs when flash timing fails or any error happens during photo capture, leaving `isCapturing` ref stuck at true.

**Bug 2 - Multiple Countdown Intervals:**
The bug occurs when user rapidly toggles countdown mode on/off or changes countdown settings, creating multiple simultaneous interval timers.

**Bug 3 - Effect Intensity Not Persisted:**
The bug occurs when user adjusts the effect intensity slider and captures a photo, but the intensity value is not included in the saved metadata.

**Bug 4 - Canvas Distortion Edge Artifacts:**
The bug occurs when distortion effects (fisheye, bulge, pinch) calculate pixel coordinates that fall outside the canvas bounds, resulting in black or transparent edges.

**Bug 5 - Memory Leak in EffectPanel:**
The bug occurs when user switches between effects, creating new video elements for previews without cleaning up previous ones.

**Bug 6 - localStorage Quota Exceeded:**
The bug occurs when localStorage quota is exceeded during photo save, showing an alert but allowing the app to crash or become unusable.

**Bug 7 - Flash Auto Mode Always Triggers:**
The bug occurs when flash mode is set to "Auto" but the system always triggers flash without detecting ambient brightness.

**Bug 8 - Generic Camera Error Messages:**
The bug occurs when camera permission is denied or camera is unavailable, but the system shows the same generic error for both cases.

**Formal Specification:**

```
FUNCTION isBugCondition(input)
  INPUT: input of type CaptureEvent | CountdownToggle | PhotoSave | EffectRender | EffectSwitch | StorageSave | FlashTrigger | CameraError
  OUTPUT: boolean

  RETURN (
    // Bug 1: Race condition
    (input.type == "CaptureEvent" AND input.hasError AND isCapturing.current == true)

    // Bug 2: Multiple intervals
    OR (input.type == "CountdownToggle" AND countdownInterval.current != null)

    // Bug 3: Missing intensity
    OR (input.type == "PhotoSave" AND input.effectIntensity != null AND input.metadata.intensity == undefined)

    // Bug 4: Edge artifacts
    OR (input.type == "EffectRender" AND input.effect IN ["fisheye", "bulge", "pinch"]
        AND (input.sourceX < 0 OR input.sourceX >= canvas.width OR input.sourceY < 0 OR input.sourceY >= canvas.height))

    // Bug 5: Memory leak
    OR (input.type == "EffectSwitch" AND previousVideoElement.srcObject != null AND NOT previousVideoElement.cleaned)

    // Bug 6: Quota exceeded
    OR (input.type == "StorageSave" AND localStorage.quotaExceeded)

    // Bug 7: Auto flash always triggers
    OR (input.type == "FlashTrigger" AND flashMode == "Auto" AND NOT brightnessDetected)

    // Bug 8: Generic error message
    OR (input.type == "CameraError" AND (error.name == "NotAllowedError" OR error.name == "NotFoundError")
        AND errorMessage == genericMessage)
  )
END FUNCTION
```

### Examples

**Bug 1 - Race Condition:**

- User clicks capture button → flash animation starts → network lag causes timeout → error thrown → `isCapturing` stays true → capture button frozen forever
- Expected: `isCapturing` reset to false in error handler, button remains functional

**Bug 2 - Multiple Intervals:**

- User enables countdown → interval starts → user quickly disables and re-enables → second interval starts → both intervals run → countdown shows "3 2 3 1 2 1" → two photos captured
- Expected: Previous interval cleared before new one starts, single countdown sequence

**Bug 3 - Effect Intensity:**

- User selects "Vintage" effect → adjusts intensity slider to 75 → captures photo → photo saved with `{effect: "Vintage"}` but no intensity → user loses customization
- Expected: Photo saved with `{effect: "Vintage", intensity: 75}`

**Bug 4 - Edge Artifacts:**

- User applies fisheye effect → distortion maps edge pixels to coordinates (-5, 120) → canvas reads undefined pixel → black artifact appears at edge
- Expected: Bounds checking clamps coordinates to (0, 120), uses nearest valid pixel

**Bug 5 - Memory Leak:**

- User switches from "Vintage" to "Noir" to "Warm" effects → three video elements created → none cleaned up → memory usage grows from 50MB to 200MB after 20 switches
- Expected: Each effect switch cleans up previous video element, memory stays constant

**Bug 6 - Quota Exceeded:**

- User captures 50th photo → localStorage quota exceeded → alert shown → user clicks OK → app tries to continue → state corrupted → app unusable
- Expected: Quota error caught, user shown options (delete old photos, download, cancel), app remains functional

**Bug 7 - Auto Flash:**

- User sets flash to "Auto" → room is brightly lit → user captures photo → flash triggers anyway → photo overexposed
- Expected: Brightness detected from video stream, flash only triggers if brightness < threshold

**Bug 8 - Generic Errors:**

- User denies camera permission → error shows "Camera error occurred" → user doesn't know how to fix
- Expected: Error shows "Camera permission denied. Please allow camera access in your browser settings."
- Camera hardware unavailable → error shows "Camera not found. Please check your camera connection."

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**

**Photo Capture Flow:**

- Immediate photo capture when clicking capture button with no countdown must continue working
- Countdown display (3, 2, 1) before capture must continue working
- Flash animation when mode is "On" must continue working
- No flash when mode is "Off" must continue working

**Effect Processing:**

- Real-time effect preview on live camera stream must continue working
- Effect name saved in photo metadata must continue working
- Photos without effects must continue working
- Real-time intensity slider updates must continue working

**Gallery and Storage:**

- Photo display in gallery view must continue working
- Photo deletion from gallery must continue working
- Photo download functionality must continue working
- Normal photo saves when storage available must continue working

**Camera Initialization:**

- Camera stream initialization when permission granted must continue working
- Camera switching (front/back) must continue working

**Effect Previews:**

- Effect thumbnail previews must continue working
- Hover animations on effect previews must continue working

**Scope:**
All inputs that do NOT involve the 8 specific bug conditions should be completely unaffected by this fix. This includes:

- Successful photo captures without errors
- Single countdown activation without rapid toggling
- Photos captured without effect intensity adjustments
- Non-distortion effects (filters, color adjustments)
- Effect selections without switching
- Photo saves when storage quota is available
- Flash modes "On" and "Off"
- Successful camera initialization

## Hypothesized Root Cause

Based on the bug descriptions, the most likely issues are:

**Bug 1 - Race Condition:**

1. **Missing Error Handlers**: The photo capture flow likely has try-catch blocks that don't reset `isCapturing.current = false` in the catch or finally block
2. **Async Timing Issues**: Flash animation timing or canvas operations may throw errors that aren't caught, leaving state inconsistent

**Bug 2 - Multiple Intervals:**

1. **Missing Cleanup**: The countdown toggle handler doesn't call `clearInterval(countdownInterval.current)` before creating a new interval
2. **State Race Condition**: Rapid toggles may create intervals before previous ones are cleared due to async state updates

**Bug 3 - Effect Intensity:**

1. **Incomplete Metadata Object**: The photo save function constructs metadata with `{effect: effectName}` but doesn't include the `intensity` property from state
2. **Missing State Access**: The save function may not have access to the current intensity value from the effect controls

**Bug 4 - Edge Artifacts:**

1. **No Bounds Checking**: Distortion effect functions calculate source coordinates but don't validate they're within `[0, width)` and `[0, height)` ranges
2. **Direct Pixel Access**: Code uses `imageData.data[index]` without checking if index is valid, reading undefined values

**Bug 5 - Memory Leak:**

1. **Missing useEffect Cleanup**: EffectPanel creates video elements in useEffect but doesn't return a cleanup function
2. **srcObject Not Cleared**: Video elements have `srcObject` set to MediaStream but stream tracks aren't stopped before component unmounts

**Bug 6 - localStorage Quota:**

1. **No Try-Catch**: localStorage.setItem() calls aren't wrapped in try-catch to handle QuotaExceededError
2. **No Recovery Logic**: Even if error is caught, there's no user-facing recovery flow to handle the situation

**Bug 7 - Auto Flash:**

1. **Stub Implementation**: Flash auto mode is implemented but brightness detection logic is missing or commented out
2. **Always True Condition**: Code may have `if (flashMode === 'Auto' || flashMode === 'On')` instead of proper brightness check

**Bug 8 - Generic Errors:**

1. **Single Error Message**: Camera error handler uses same message for all error types instead of checking `error.name`
2. **No Error Type Discrimination**: Code doesn't distinguish between NotAllowedError (permission), NotFoundError (hardware), NotReadableError (in use), etc.

## Correctness Properties

Property 1: Fault Condition - Photo Capture State Cleanup

_For any_ photo capture operation where an error occurs (flash timing failure, canvas error, network timeout), the fixed capture function SHALL reset `isCapturing` to false in error handlers, ensuring the capture button remains functional and users can retry the capture.

**Validates: Requirements 2.1**

Property 2: Fault Condition - Single Countdown Timer

_For any_ countdown toggle operation where a countdown interval already exists, the fixed countdown handler SHALL clear the existing interval before creating a new one, preventing multiple simultaneous countdowns and ensuring only one photo is captured per countdown sequence.

**Validates: Requirements 2.2**

Property 3: Fault Condition - Effect Intensity Persistence

_For any_ photo save operation where an effect with adjustable intensity is applied, the fixed save function SHALL include the intensity value in the photo metadata alongside the effect name, preserving user customization data.

**Validates: Requirements 2.3**

Property 4: Fault Condition - Distortion Bounds Checking

_For any_ distortion effect rendering where calculated source coordinates fall outside canvas bounds, the fixed effect function SHALL clamp coordinates to valid ranges [0, width) and [0, height), preventing out-of-bounds pixel access and edge artifacts.

**Validates: Requirements 2.4**

Property 5: Fault Condition - Effect Panel Resource Cleanup

_For any_ effect switch operation in EffectPanel, the fixed component SHALL stop MediaStream tracks and clear video element srcObject in useEffect cleanup functions, preventing memory leaks from accumulated video elements.

**Validates: Requirements 2.5**

Property 6: Fault Condition - localStorage Quota Handling

_For any_ photo save operation where localStorage quota is exceeded, the fixed save function SHALL catch the QuotaExceededError, prevent app crash, and provide user options (delete old photos, download photos, or cancel), maintaining app stability.

**Validates: Requirements 2.6**

Property 7: Fault Condition - Flash Auto Brightness Detection

_For any_ photo capture with flash mode set to "Auto", the fixed flash handler SHALL detect ambient brightness from the video stream and only trigger flash when brightness is below a threshold, preventing unnecessary flash in well-lit conditions.

**Validates: Requirements 2.7**

Property 8: Fault Condition - Specific Camera Error Messages

_For any_ camera initialization error, the fixed error handler SHALL check error.name and display specific messages: "Camera permission denied" with instructions for NotAllowedError, and "Camera not found" with hardware troubleshooting for NotFoundError, improving user understanding and resolution.

**Validates: Requirements 2.8**

Property 9: Preservation - Photo Capture Flow

_For any_ photo capture operation that does NOT encounter errors, the fixed code SHALL produce exactly the same behavior as the original code, preserving immediate capture, countdown sequences, flash "On" mode, and flash "Off" mode functionality.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

Property 10: Preservation - Effect Processing

_For any_ effect application that does NOT involve intensity adjustments or distortion edge cases, the fixed code SHALL produce exactly the same behavior as the original code, preserving real-time preview, effect name metadata, no-effect captures, and intensity slider updates.

**Validates: Requirements 3.5, 3.6, 3.7, 3.8**

Property 11: Preservation - Gallery and Storage

_For any_ gallery or storage operation that does NOT exceed quota, the fixed code SHALL produce exactly the same behavior as the original code, preserving photo display, deletion, download, and normal save operations.

**Validates: Requirements 3.9, 3.10, 3.11, 3.12**

Property 12: Preservation - Camera and Effect Previews

_For any_ camera initialization or effect preview interaction that does NOT involve permission errors, the fixed code SHALL produce exactly the same behavior as the original code, preserving stream initialization, camera switching, thumbnail previews, and hover animations.

**Validates: Requirements 3.13, 3.14, 3.15, 3.16**

## Fix Implementation

### Changes Required

The fixes span multiple files and components. Below are the specific changes needed for each bug:

**Bug 1 - Race Condition in Photo Capture**

**File**: `src/components/PhotoCapture.tsx` (or similar capture component)

**Function**: `handleCapture` or `capturePhoto`

**Specific Changes**:

1. **Add Finally Block**: Wrap capture logic in try-catch-finally, ensure `isCapturing.current = false` in finally block
2. **Error Handler Enhancement**: Add specific error handling for flash timing, canvas operations, and storage errors
3. **State Reset on All Paths**: Verify all code paths (success, error, timeout) reset isCapturing

**Bug 2 - Multiple Countdown Intervals**

**File**: `src/components/PhotoCapture.tsx` or `src/hooks/useCountdown.ts`

**Function**: `toggleCountdown` or `startCountdown`

**Specific Changes**:

1. **Clear Existing Interval**: Add `if (countdownInterval.current) clearInterval(countdownInterval.current)` before creating new interval
2. **Cleanup on Unmount**: Add useEffect cleanup function that clears interval when component unmounts
3. **Cleanup on Mode Change**: Clear interval when countdown mode is disabled

**Bug 3 - Effect Intensity Not Persisted**

**File**: `src/hooks/usePhotoStore.ts` or `src/components/PhotoCapture.tsx`

**Function**: `savePhoto` or `capturePhoto`

**Specific Changes**:

1. **Include Intensity in Metadata**: Modify metadata object construction to include `intensity: currentIntensity` when effect is applied
2. **Access Intensity State**: Ensure function has access to current intensity value from effect controls state
3. **Conditional Inclusion**: Only include intensity if effect supports it (some effects may not have intensity control)

**Bug 4 - Canvas Distortion Edge Artifacts**

**File**: `src/utils/effects.ts` or `src/components/EffectProcessor.tsx`

**Function**: `applyFisheyeEffect`, `applyBulgeEffect`, `applyPinchEffect`

**Specific Changes**:

1. **Add Bounds Checking Function**: Create helper `clamp(value, min, max)` to constrain coordinates
2. **Clamp Source Coordinates**: Before accessing pixel data, clamp sourceX to [0, width-1] and sourceY to [0, height-1]
3. **Validate Index Calculation**: Ensure calculated array index is within imageData.data bounds before access
4. **Edge Handling Strategy**: Consider using nearest-neighbor or edge-repeat strategy for out-of-bounds coordinates

**Bug 5 - Memory Leak in EffectPanel**

**File**: `src/components/EffectPanel.tsx`

**Function**: Component body with useEffect hooks

**Specific Changes**:

1. **Add Cleanup Function**: In useEffect that creates video elements, return cleanup function
2. **Stop MediaStream Tracks**: In cleanup, call `videoElement.srcObject?.getTracks().forEach(track => track.stop())`
3. **Clear srcObject**: Set `videoElement.srcObject = null` in cleanup
4. **Remove Event Listeners**: Clear any event listeners attached to video elements
5. **Cleanup on Effect Change**: Ensure cleanup runs when switching between effects

**Bug 6 - localStorage Quota Exceeded**

**File**: `src/hooks/usePhotoStore.ts` or `src/utils/storage.ts`

**Function**: `savePhoto` or `setItem` wrapper

**Specific Changes**:

1. **Wrap in Try-Catch**: Wrap `localStorage.setItem()` in try-catch block
2. **Check Error Type**: In catch, check if `error.name === 'QuotaExceededError'`
3. **Show User Dialog**: Display modal/dialog with options: "Delete old photos", "Download all photos", "Cancel"
4. **Implement Recovery Actions**:
   - Delete old photos: Remove oldest photos until space available
   - Download all: Trigger bulk download of all photos
   - Cancel: Abort save operation gracefully
5. **Prevent State Corruption**: Ensure app state remains consistent if save fails

**Bug 7 - Flash Auto Mode Always Triggers**

**File**: `src/components/PhotoCapture.tsx` or `src/hooks/useFlash.ts`

**Function**: `shouldTriggerFlash` or flash decision logic

**Specific Changes**:

1. **Implement Brightness Detection**: Create function to analyze video frame brightness
   - Get current video frame using canvas.drawImage(video, ...)
   - Calculate average brightness from imageData
   - Use threshold (e.g., brightness < 0.3 triggers flash)
2. **Modify Flash Logic**: Change from `if (flashMode === 'Auto')` to `if (flashMode === 'Auto' && detectBrightness() < threshold)`
3. **Cache Brightness**: Consider caching brightness calculation to avoid performance impact
4. **Configurable Threshold**: Make brightness threshold configurable (default 0.3 or 30%)

**Bug 8 - Generic Camera Error Messages**

**File**: `src/hooks/useCamera.ts` or `src/components/CameraInit.tsx`

**Function**: `initializeCamera` error handler

**Specific Changes**:

1. **Check Error Name**: In catch block, check `error.name` property
2. **Specific Messages**:
   - `NotAllowedError`: "Camera permission denied. Please allow camera access in your browser settings."
   - `NotFoundError`: "Camera not found. Please check that your camera is connected and not in use by another application."
   - `NotReadableError`: "Camera is in use by another application. Please close other apps using the camera."
   - `OverconstrainedError`: "Camera doesn't support the requested settings. Try a different camera or resolution."
   - Default: "An unexpected camera error occurred. Please refresh the page and try again."
3. **Add Help Links**: Include links to browser-specific permission instructions
4. **Retry Mechanism**: For hardware errors, offer a "Retry" button

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate each bug on unfixed code, then verify each fix works correctly and preserves existing behavior. Given the multi-bug nature of this fix, we'll organize tests by bug category and use a combination of unit tests, property-based tests, and integration tests.

### Exploratory Fault Condition Checking

**Goal**: Surface counterexamples that demonstrate each bug BEFORE implementing fixes. Confirm or refute the root cause analysis for each bug. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate each bug condition and assert the expected failure. Run these tests on the UNFIXED code to observe failures and understand root causes.

**Test Cases**:

1. **Bug 1 - Race Condition Test**: Simulate photo capture with forced flash timing error (will fail on unfixed code)
   - Mock flash animation to throw error
   - Trigger capture
   - Assert isCapturing ref is stuck at true
   - Assert capture button is disabled

2. **Bug 2 - Multiple Intervals Test**: Simulate rapid countdown toggles (will fail on unfixed code)
   - Enable countdown
   - Wait 500ms
   - Disable and immediately re-enable countdown
   - Assert multiple intervals are running (check interval count)
   - Assert countdown shows erratic numbers

3. **Bug 3 - Missing Intensity Test**: Capture photo with effect intensity set (will fail on unfixed code)
   - Set effect to "Vintage"
   - Set intensity to 75
   - Capture photo
   - Assert saved metadata has effect but no intensity property

4. **Bug 4 - Edge Artifacts Test**: Apply fisheye effect to test image (will fail on unfixed code)
   - Load test image
   - Apply fisheye effect with strong distortion
   - Check edge pixels for black/transparent artifacts
   - Assert artifacts present at coordinates that map out of bounds

5. **Bug 5 - Memory Leak Test**: Switch effects multiple times (will fail on unfixed code)
   - Record initial memory usage
   - Switch between 10 different effects
   - Record final memory usage
   - Assert memory increased significantly (>50MB)
   - Assert multiple video elements exist in DOM

6. **Bug 6 - Quota Exceeded Test**: Fill localStorage and attempt save (will fail on unfixed code)
   - Fill localStorage to near quota
   - Attempt to save large photo
   - Assert QuotaExceededError thrown
   - Assert app crashes or becomes unusable

7. **Bug 7 - Auto Flash Test**: Capture with auto flash in bright conditions (will fail on unfixed code)
   - Set flash mode to "Auto"
   - Mock video stream with high brightness
   - Trigger capture
   - Assert flash triggered despite bright conditions

8. **Bug 8 - Generic Error Test**: Deny camera permission (will fail on unfixed code)
   - Mock getUserMedia to throw NotAllowedError
   - Initialize camera
   - Assert error message is generic
   - Assert message doesn't distinguish permission vs hardware issue

**Expected Counterexamples**:

- Bug 1: isCapturing ref stuck, button frozen
- Bug 2: Multiple intervals running, erratic countdown
- Bug 3: Metadata missing intensity property
- Bug 4: Black/transparent edge artifacts in distorted images
- Bug 5: Memory usage grows, multiple video elements
- Bug 6: App crash or unusable state after quota error
- Bug 7: Flash always triggers in auto mode
- Bug 8: Same generic error for all camera issues

### Fix Checking

**Goal**: Verify that for all inputs where each bug condition holds, the fixed functions produce the expected behavior.

**Pseudocode:**

```
// Bug 1 - Race Condition
FOR ALL captureEvent WHERE captureEvent.hasError DO
  result := handleCapture_fixed(captureEvent)
  ASSERT isCapturing.current == false
  ASSERT captureButton.disabled == false
END FOR

// Bug 2 - Multiple Intervals
FOR ALL countdownToggle WHERE existingInterval != null DO
  result := toggleCountdown_fixed(countdownToggle)
  ASSERT countdownInterval.current != existingInterval
  ASSERT only one interval is running
END FOR

// Bug 3 - Effect Intensity
FOR ALL photoSave WHERE effectIntensity != null DO
  result := savePhoto_fixed(photoSave)
  ASSERT result.metadata.intensity == effectIntensity
END FOR

// Bug 4 - Edge Artifacts
FOR ALL effectRender WHERE coordinates out of bounds DO
  result := applyDistortion_fixed(effectRender)
  ASSERT no black/transparent artifacts at edges
  ASSERT all pixels have valid color values
END FOR

// Bug 5 - Memory Leak
FOR ALL effectSwitch DO
  initialMemory := getMemoryUsage()
  result := switchEffect_fixed(effectSwitch)
  finalMemory := getMemoryUsage()
  ASSERT finalMemory - initialMemory < threshold
  ASSERT previous video elements cleaned up
END FOR

// Bug 6 - Quota Exceeded
FOR ALL storageSave WHERE quota exceeded DO
  result := savePhoto_fixed(storageSave)
  ASSERT app remains functional
  ASSERT user shown recovery options
  ASSERT state not corrupted
END FOR

// Bug 7 - Auto Flash
FOR ALL flashTrigger WHERE flashMode == "Auto" DO
  brightness := detectBrightness()
  result := shouldTriggerFlash_fixed(flashTrigger)
  ASSERT result == (brightness < threshold)
END FOR

// Bug 8 - Camera Errors
FOR ALL cameraError WHERE error.name IN ["NotAllowedError", "NotFoundError"] DO
  result := handleCameraError_fixed(cameraError)
  ASSERT result.message is specific to error.name
  ASSERT result.message includes actionable instructions
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where bug conditions do NOT hold, the fixed functions produce the same results as the original functions.

**Pseudocode:**

```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalFunction(input) = fixedFunction(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:

- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs
- With 8 bugs and 16 preservation requirements, manual testing would be prohibitively expensive

**Test Plan**: Observe behavior on UNFIXED code first for non-buggy scenarios, then write property-based tests capturing that behavior.

**Test Cases**:

1. **Successful Capture Preservation**: Observe that normal captures work on unfixed code, then verify they continue working
   - Test immediate capture without countdown
   - Test capture with countdown
   - Test capture with flash "On"
   - Test capture with flash "Off"

2. **Effect Processing Preservation**: Observe that non-distortion effects work on unfixed code, then verify they continue working
   - Test real-time preview updates
   - Test effect name in metadata
   - Test captures without effects
   - Test non-distortion effects (color filters, brightness, contrast)

3. **Gallery Operations Preservation**: Observe that gallery operations work on unfixed code, then verify they continue working
   - Test photo display in gallery
   - Test photo deletion
   - Test photo download
   - Test normal saves when storage available

4. **Camera Initialization Preservation**: Observe that successful camera init works on unfixed code, then verify it continues working
   - Test stream initialization with permission granted
   - Test camera switching (front/back)

5. **Effect Preview Preservation**: Observe that effect previews work on unfixed code, then verify they continue working
   - Test thumbnail display
   - Test hover animations

### Unit Tests

**Bug 1 - Race Condition:**

- Test isCapturing reset in catch block
- Test isCapturing reset in finally block
- Test capture button re-enabled after error
- Test multiple error scenarios (flash timeout, canvas error, storage error)

**Bug 2 - Multiple Intervals:**

- Test clearInterval called before new interval
- Test only one interval running after toggle
- Test interval cleared on unmount
- Test interval cleared when countdown disabled

**Bug 3 - Effect Intensity:**

- Test intensity included in metadata when effect applied
- Test intensity not included when no effect
- Test intensity updates when slider changed
- Test different intensity values (0, 50, 100)

**Bug 4 - Edge Artifacts:**

- Test coordinate clamping for negative values
- Test coordinate clamping for values >= width/height
- Test edge pixels have valid colors
- Test different distortion strengths

**Bug 5 - Memory Leak:**

- Test video element cleanup on effect switch
- Test MediaStream tracks stopped
- Test srcObject cleared
- Test event listeners removed

**Bug 6 - Quota Exceeded:**

- Test QuotaExceededError caught
- Test user dialog shown
- Test delete old photos option
- Test download all option
- Test cancel option
- Test app remains functional after error

**Bug 7 - Auto Flash:**

- Test brightness detection function
- Test flash triggered when brightness < threshold
- Test flash not triggered when brightness >= threshold
- Test different brightness levels

**Bug 8 - Camera Errors:**

- Test NotAllowedError shows permission message
- Test NotFoundError shows hardware message
- Test NotReadableError shows in-use message
- Test OverconstrainedError shows settings message
- Test unknown errors show generic message with retry

### Property-Based Tests

**Capture State Management:**

- Generate random capture scenarios with varying error types and timing
- Verify isCapturing always reset to false after capture attempt
- Verify capture button always functional after any error

**Countdown Timer Management:**

- Generate random sequences of countdown toggles with varying timing
- Verify only one interval ever running
- Verify countdown always produces correct sequence (3, 2, 1)
- Verify exactly one photo captured per countdown

**Effect Metadata Persistence:**

- Generate random combinations of effects and intensity values
- Verify metadata always includes intensity when effect applied
- Verify metadata structure consistent across all saves

**Distortion Bounds Safety:**

- Generate random distortion parameters (strength, center point)
- Verify no out-of-bounds pixel access for any parameters
- Verify no black/transparent artifacts for any distortion strength
- Verify output image dimensions match input

**Resource Cleanup:**

- Generate random sequences of effect switches
- Verify memory usage stays bounded regardless of switch count
- Verify no video elements accumulate in DOM

**Storage Quota Handling:**

- Generate random photo save scenarios with varying storage states
- Verify app never crashes regardless of quota state
- Verify user always has recovery options when quota exceeded

**Flash Brightness Detection:**

- Generate random brightness levels from video frames
- Verify flash decision always based on brightness threshold
- Verify flash modes "On" and "Off" unaffected by brightness

**Camera Error Handling:**

- Generate random camera error types
- Verify error messages always specific and actionable
- Verify app provides appropriate recovery options for each error type

### Integration Tests

**Full Capture Flow with Errors:**

- Test complete photo capture flow with simulated errors at each stage
- Verify app recovers gracefully from any error
- Verify user can retry capture after any error

**Effect Switching and Capture:**

- Test switching between multiple effects and capturing photos
- Verify no memory leaks after extended use
- Verify all effect metadata persisted correctly

**Storage Quota Recovery Flow:**

- Test filling storage and triggering quota error
- Test user selecting each recovery option
- Verify app remains functional throughout recovery

**Camera Initialization with Various Errors:**

- Test camera init with different error scenarios
- Verify appropriate error messages shown
- Verify user can retry or take corrective action

**Multi-Bug Scenario:**

- Test scenario that could trigger multiple bugs (e.g., rapid countdown toggles while storage full with distortion effect applied)
- Verify all fixes work together without conflicts
- Verify app remains stable under stress conditions
