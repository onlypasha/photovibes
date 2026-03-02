# Implementation Plan

## Overview

This implementation plan addresses 8 critical and high-priority bugs in the PhotoVibes photobooth application. The plan follows the exploratory bugfix workflow: first write tests to understand each bug (Fault Condition), then write tests to preserve existing behavior (Preservation), then implement fixes with validation.

## Bug Summary

**Critical Bugs:**

1. Race condition in photo capture (isCapturing ref stuck)
2. Timer countdown creating multiple intervals
3. Effect intensity not persisted in photo metadata
4. Canvas distortion effects producing edge artifacts
5. Memory leak from video elements in EffectPanel

**High-Priority Bugs:** 6. localStorage quota exceeded handling 7. Flash auto mode always triggering 8. Generic camera permission error messages

## Testing Phase

### Bug Condition Exploration Tests

- [x] 1. Write bug condition exploration tests for all 8 bugs
  - **Property 1: Fault Condition** - Multi-Bug Exploration Suite
  - **CRITICAL**: These tests MUST FAIL on unfixed code - failures confirm the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior - they will validate the fixes when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate each bug exists
  - **Scoped PBT Approach**: For deterministic bugs, scope properties to concrete failing cases to ensure reproducibility
  - Create test file: `app/components/__tests__/bugfix-exploration.test.tsx`
  - Test 1: Race condition - simulate photo capture with forced flash timing error, assert isCapturing ref stuck at true
  - Test 2: Multiple intervals - simulate rapid countdown toggles, assert multiple intervals running and erratic countdown
  - Test 3: Missing intensity - capture photo with effect intensity set to 75, assert metadata missing intensity property
  - Test 4: Edge artifacts - apply fisheye effect with strong distortion, assert black/transparent artifacts at edges
  - Test 5: Memory leak - switch between 10 effects, assert memory increased >50MB and multiple video elements in DOM
  - Test 6: Quota exceeded - fill localStorage and attempt save, assert QuotaExceededError causes app crash
  - Test 7: Auto flash - set flash to "Auto" with high brightness mock, assert flash triggered despite bright conditions
  - Test 8: Generic error - mock NotAllowedError, assert error message is generic without specific instructions
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: All 8 tests FAIL (this is correct - it proves the bugs exist)
  - Document counterexamples found for each bug to understand root causes
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

### Preservation Property Tests

- [x] 2. Write preservation property tests for non-buggy scenarios
  - **Property 2: Preservation** - Existing Functionality Preservation Suite
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (successful captures, normal operations)
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Property-based testing generates many test cases for stronger guarantees
  - Create test file: `app/components/__tests__/bugfix-preservation.test.tsx`
  - Test suite 1: Photo Capture Flow - immediate capture, countdown capture, flash "On", flash "Off"
  - Test suite 2: Effect Processing - real-time preview, effect name metadata, no-effect captures, non-distortion effects
  - Test suite 3: Gallery Operations - photo display, deletion, download, normal saves with available storage
  - Test suite 4: Camera Initialization - stream init with permission, camera switching (front/back)
  - Test suite 5: Effect Previews - thumbnail display, hover animations
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: All tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, 3.14, 3.15, 3.16_

## Implementation Phase

### Bug 1: Race Condition in Photo Capture

- [x] 3. Fix race condition in photo capture (isCapturing ref stuck)
  - [x] 3.1 Implement the fix in CameraStage.tsx
    - Add finally block to capture function to ensure `isCapturing.current = false` on all code paths
    - Enhance error handlers for flash timing, canvas operations, and storage errors
    - Verify all code paths (success, error, timeout) reset isCapturing
    - _Bug_Condition: isBugCondition(input) where input.type == "CaptureEvent" AND input.hasError AND isCapturing.current == true_
    - _Expected_Behavior: isCapturing.current reset to false in error handlers, capture button remains functional_
    - _Preservation: Immediate capture, countdown capture, flash "On", flash "Off" continue working_
    - _Requirements: 2.1, 3.1, 3.2, 3.3, 3.4_

  - [x] 3.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Race Condition Fixed
    - **IMPORTANT**: Re-run the SAME test from task 1 (Test 1) - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run race condition test from exploration suite
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1_

  - [x] 3.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Photo Capture Flow Preserved
    - **IMPORTANT**: Re-run the SAME tests from task 2 (Test suite 1) - do NOT write new tests
    - Run photo capture flow preservation tests
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)

### Bug 2: Multiple Countdown Intervals

- [x] 4. Fix multiple countdown intervals issue
  - [x] 4.1 Implement the fix in CameraStage.tsx
    - Add `clearInterval(countdownInterval.current)` before creating new interval in countdown toggle handler
    - Add useEffect cleanup function to clear interval on component unmount
    - Clear interval when countdown mode is disabled
    - _Bug_Condition: isBugCondition(input) where input.type == "CountdownToggle" AND countdownInterval.current != null_
    - _Expected_Behavior: Previous interval cleared before new one starts, single countdown sequence, one photo per countdown_
    - _Preservation: Countdown display (3, 2, 1) continues working normally_
    - _Requirements: 2.2, 3.2_

  - [x] 4.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Single Countdown Timer
    - **IMPORTANT**: Re-run the SAME test from task 1 (Test 2) - do NOT write a new test
    - Run multiple intervals test from exploration suite
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.2_

  - [x] 4.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Countdown Flow Preserved
    - **IMPORTANT**: Re-run the SAME tests from task 2 (Test suite 1) - do NOT write new tests
    - Run countdown preservation tests
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)

### Bug 3: Effect Intensity Not Persisted

- [x] 5. Fix effect intensity not persisted in metadata
  - [x] 5.1 Implement the fix in usePhotoStore.ts
    - Modify metadata object construction in savePhoto to include `intensity: currentIntensity` when effect is applied
    - Ensure function has access to current intensity value from effect controls state
    - Conditionally include intensity only if effect supports it
    - _Bug_Condition: isBugCondition(input) where input.type == "PhotoSave" AND input.effectIntensity != null AND input.metadata.intensity == undefined_
    - _Expected_Behavior: Photo metadata includes intensity value alongside effect name, preserving user customization_
    - _Preservation: Effect name metadata, no-effect captures, real-time intensity slider updates continue working_
    - _Requirements: 2.3, 3.6, 3.7, 3.8_

  - [x] 5.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Effect Intensity Persisted
    - **IMPORTANT**: Re-run the SAME test from task 1 (Test 3) - do NOT write a new test
    - Run missing intensity test from exploration suite
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.3_

  - [x] 5.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Effect Processing Preserved
    - **IMPORTANT**: Re-run the SAME tests from task 2 (Test suite 2) - do NOT write new tests
    - Run effect processing preservation tests
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)

### Bug 4: Canvas Distortion Edge Artifacts

- [-] 6. Fix canvas distortion edge artifacts
  - [x] 6.1 Implement the fix in effectProcessors.ts
    - Create helper function `clamp(value, min, max)` to constrain coordinates
    - Add bounds checking in applyFisheyeEffect, applyBulgeEffect, applyPinchEffect
    - Clamp sourceX to [0, width-1] and sourceY to [0, height-1] before accessing pixel data
    - Validate calculated array index is within imageData.data bounds
    - Use nearest-neighbor strategy for out-of-bounds coordinates
    - _Bug_Condition: isBugCondition(input) where input.type == "EffectRender" AND input.effect IN ["fisheye", "bulge", "pinch"] AND coordinates out of bounds_
    - _Expected_Behavior: Coordinates clamped to valid ranges, no out-of-bounds pixel access, no edge artifacts_
    - _Preservation: Non-distortion effects (filters, color adjustments) continue working_
    - _Requirements: 2.4, 3.5_

  - [-] 6.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Distortion Bounds Checked
    - **IMPORTANT**: Re-run the SAME test from task 1 (Test 4) - do NOT write a new test
    - Run edge artifacts test from exploration suite
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.4_

  - [ ] 6.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Effect Processing Preserved
    - **IMPORTANT**: Re-run the SAME tests from task 2 (Test suite 2) - do NOT write new tests
    - Run effect processing preservation tests
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)

### Bug 5: Memory Leak in EffectPanel

- [~] 7. Fix memory leak from video elements in EffectPanel
  - [ ] 7.1 Implement the fix in EffectPanel.tsx
    - Add cleanup function to useEffect that creates video elements
    - In cleanup, stop MediaStream tracks: `videoElement.srcObject?.getTracks().forEach(track => track.stop())`
    - Clear srcObject: `videoElement.srcObject = null`
    - Remove any event listeners attached to video elements
    - Ensure cleanup runs when switching between effects
    - _Bug_Condition: isBugCondition(input) where input.type == "EffectSwitch" AND previousVideoElement.srcObject != null AND NOT previousVideoElement.cleaned_
    - _Expected_Behavior: MediaStream tracks stopped, srcObject cleared, no accumulated video elements, bounded memory usage_
    - _Preservation: Effect thumbnail previews, hover animations continue working_
    - _Requirements: 2.5, 3.15, 3.16_

  - [ ] 7.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Effect Panel Resources Cleaned
    - **IMPORTANT**: Re-run the SAME test from task 1 (Test 5) - do NOT write a new test
    - Run memory leak test from exploration suite
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.5_

  - [ ] 7.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Effect Previews Preserved
    - **IMPORTANT**: Re-run the SAME tests from task 2 (Test suite 5) - do NOT write new tests
    - Run effect preview preservation tests
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)

### Bug 6: localStorage Quota Exceeded

- [~] 8. Fix localStorage quota exceeded handling
  - [ ] 8.1 Implement the fix in usePhotoStore.ts
    - Wrap `localStorage.setItem()` in try-catch block
    - Check if `error.name === 'QuotaExceededError'` in catch
    - Display modal/dialog with options: "Delete old photos", "Download all photos", "Cancel"
    - Implement recovery actions:
      - Delete old photos: Remove oldest photos until space available
      - Download all: Trigger bulk download of all photos
      - Cancel: Abort save operation gracefully
    - Ensure app state remains consistent if save fails
    - _Bug_Condition: isBugCondition(input) where input.type == "StorageSave" AND localStorage.quotaExceeded_
    - _Expected_Behavior: QuotaExceededError caught, app remains functional, user shown recovery options, state not corrupted_
    - _Preservation: Normal photo saves when storage available continue working_
    - _Requirements: 2.6, 3.12_

  - [ ] 8.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Quota Exceeded Handled
    - **IMPORTANT**: Re-run the SAME test from task 1 (Test 6) - do NOT write a new test
    - Run quota exceeded test from exploration suite
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.6_

  - [ ] 8.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Storage Operations Preserved
    - **IMPORTANT**: Re-run the SAME tests from task 2 (Test suite 3) - do NOT write new tests
    - Run gallery and storage preservation tests
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)

### Bug 7: Flash Auto Mode Always Triggers

- [~] 9. Fix flash auto mode always triggering
  - [ ] 9.1 Implement the fix in CameraStage.tsx
    - Create function to analyze video frame brightness:
      - Get current video frame using canvas.drawImage(video, ...)
      - Calculate average brightness from imageData
      - Use threshold (e.g., brightness < 0.3 triggers flash)
    - Modify flash logic from `if (flashMode === 'Auto')` to `if (flashMode === 'Auto' && detectBrightness() < threshold)`
    - Consider caching brightness calculation to avoid performance impact
    - Make brightness threshold configurable (default 0.3 or 30%)
    - _Bug_Condition: isBugCondition(input) where input.type == "FlashTrigger" AND flashMode == "Auto" AND NOT brightnessDetected_
    - _Expected_Behavior: Brightness detected from video stream, flash only triggers when brightness < threshold_
    - _Preservation: Flash "On" and "Off" modes continue working_
    - _Requirements: 2.7, 3.3, 3.4_

  - [ ] 9.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Flash Auto Brightness Detection
    - **IMPORTANT**: Re-run the SAME test from task 1 (Test 7) - do NOT write a new test
    - Run auto flash test from exploration suite
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.7_

  - [ ] 9.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Flash Modes Preserved
    - **IMPORTANT**: Re-run the SAME tests from task 2 (Test suite 1) - do NOT write new tests
    - Run flash mode preservation tests
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)

### Bug 8: Generic Camera Error Messages

- [~] 10. Fix generic camera permission error messages
  - [ ] 10.1 Implement the fix in CameraStage.tsx
    - In camera initialization error handler, check `error.name` property
    - Implement specific messages:
      - `NotAllowedError`: "Camera permission denied. Please allow camera access in your browser settings."
      - `NotFoundError`: "Camera not found. Please check that your camera is connected and not in use by another application."
      - `NotReadableError`: "Camera is in use by another application. Please close other apps using the camera."
      - `OverconstrainedError`: "Camera doesn't support the requested settings. Try a different camera or resolution."
      - Default: "An unexpected camera error occurred. Please refresh the page and try again."
    - Add links to browser-specific permission instructions
    - Offer a "Retry" button for hardware errors
    - _Bug_Condition: isBugCondition(input) where input.type == "CameraError" AND error.name IN ["NotAllowedError", "NotFoundError"] AND errorMessage == genericMessage_
    - _Expected_Behavior: Error messages specific to error.name with actionable instructions_
    - _Preservation: Camera stream initialization when permission granted, camera switching continue working_
    - _Requirements: 2.8, 3.13, 3.14_

  - [ ] 10.2 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Specific Camera Error Messages
    - **IMPORTANT**: Re-run the SAME test from task 1 (Test 8) - do NOT write a new test
    - Run generic error test from exploration suite
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.8_

  - [ ] 10.3 Verify preservation tests still pass
    - **Property 2: Preservation** - Camera Initialization Preserved
    - **IMPORTANT**: Re-run the SAME tests from task 2 (Test suite 4) - do NOT write new tests
    - Run camera initialization preservation tests
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)

## Final Validation

- [~] 11. Checkpoint - Ensure all tests pass
  - Run complete test suite (exploration + preservation tests)
  - Verify all 8 bug condition tests now pass (bugs are fixed)
  - Verify all preservation tests still pass (no regressions)
  - Run integration tests for multi-bug scenarios
  - Test full capture flow with errors at each stage
  - Test effect switching and capture with memory monitoring
  - Test storage quota recovery flow
  - Test camera initialization with various error scenarios
  - Ensure app remains stable under stress conditions (rapid toggles, multiple effect switches, storage full)
  - Ask the user if questions arise or if manual testing is needed

## Notes

- All exploration tests (task 1) should FAIL on unfixed code - this confirms bugs exist
- All preservation tests (task 2) should PASS on unfixed code - this confirms baseline behavior
- After each bug fix, the corresponding exploration test should PASS
- After each bug fix, all preservation tests should still PASS
- The same tests are reused for validation - no new tests should be written in verification sub-tasks
- Property-based testing is used for stronger guarantees across the input domain
- Integration tests verify all fixes work together without conflicts
