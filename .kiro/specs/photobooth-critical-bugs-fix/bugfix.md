# Bugfix Requirements Document

## Introduction

This document addresses critical and high-priority bugs in the PhotoVibes photobooth application that impact core functionality including photo capture, effect processing, memory management, and storage handling. These bugs cause user-facing issues ranging from frozen capture buttons and erratic countdown behavior to memory leaks and data loss. The fixes will ensure reliable photo capture, proper effect persistence, clean resource management, and graceful error handling.

## Bug Analysis

### Current Behavior (Defect)

#### Critical Issues

1.1 WHEN flash timing fails during photo capture THEN the system leaves `isCapturing` ref set to true indefinitely, freezing the capture button

1.2 WHEN user rapidly toggles countdown mode THEN the system creates multiple simultaneous interval timers causing erratic countdown numbers and multiple unwanted photo captures

1.3 WHEN user adjusts effect intensity slider and captures a photo THEN the system saves the photo without the intensity value in metadata, losing customization data

1.4 WHEN distortion effects (fisheye, bulge, pinch) are applied to images THEN the system produces black or transparent artifacts at image edges due to missing bounds checking

1.5 WHEN user switches between effects in EffectPanel THEN the system creates video elements for previews without proper cleanup, causing memory usage to grow continuously

#### High-Priority Issues

1.6 WHEN localStorage quota is exceeded THEN the system shows an alert but allows the app to crash or become unusable

1.7 WHEN flash mode is set to "Auto" THEN the system always triggers the flash without detecting ambient brightness levels

1.8 WHEN camera permission is denied or camera is unavailable THEN the system shows a generic error message that doesn't distinguish between permission denial and hardware unavailability

### Expected Behavior (Correct)

#### Critical Fixes

2.1 WHEN flash timing fails during photo capture THEN the system SHALL reset `isCapturing` to false in error handlers, ensuring the capture button remains functional

2.2 WHEN user rapidly toggles countdown mode THEN the system SHALL clear any existing interval timer before creating a new one, preventing multiple simultaneous countdowns

2.3 WHEN user adjusts effect intensity slider and captures a photo THEN the system SHALL save the intensity value in the photo metadata alongside the effect name

2.4 WHEN distortion effects (fisheye, bulge, pinch) are applied to images THEN the system SHALL perform bounds checking on pixel coordinates to prevent out-of-range access and edge artifacts

2.5 WHEN user switches between effects in EffectPanel THEN the system SHALL properly cleanup video elements and associated resources in useEffect cleanup functions

#### High-Priority Fixes

2.6 WHEN localStorage quota is exceeded THEN the system SHALL catch the quota error, prevent app crash, and provide user options (delete old photos, download photos, or cancel)

2.7 WHEN flash mode is set to "Auto" THEN the system SHALL detect ambient brightness from the video stream and only trigger flash when brightness is below a threshold

2.8 WHEN camera permission is denied THEN the system SHALL show a specific message with instructions to grant permission, and WHEN camera is unavailable THEN the system SHALL show a different message indicating hardware issues

### Unchanged Behavior (Regression Prevention)

#### Photo Capture Flow

3.1 WHEN user clicks capture button with valid camera stream and no countdown THEN the system SHALL CONTINUE TO immediately capture and save the photo with current effect applied

3.2 WHEN user enables countdown timer and clicks capture THEN the system SHALL CONTINUE TO display countdown numbers (3, 2, 1) before capturing the photo

3.3 WHEN flash mode is set to "On" THEN the system SHALL CONTINUE TO trigger the flash animation before every photo capture

3.4 WHEN flash mode is set to "Off" THEN the system SHALL CONTINUE TO capture photos without any flash animation

#### Effect Processing

3.5 WHEN user selects an effect from the effect panel THEN the system SHALL CONTINUE TO apply the effect to the live camera preview in real-time

3.6 WHEN user captures a photo with an effect applied THEN the system SHALL CONTINUE TO save the photo with the effect name in metadata

3.7 WHEN no effect is selected THEN the system SHALL CONTINUE TO capture photos without any effect processing

3.8 WHEN user adjusts effect intensity for effects that support it THEN the system SHALL CONTINUE TO update the live preview in real-time

#### Gallery and Storage

3.9 WHEN photos are successfully saved to localStorage THEN the system SHALL CONTINUE TO display them in the gallery view

3.10 WHEN user deletes a photo from the gallery THEN the system SHALL CONTINUE TO remove it from localStorage and update the UI

3.11 WHEN user downloads a photo THEN the system SHALL CONTINUE TO trigger a browser download with the correct filename and format

3.12 WHEN localStorage has available space THEN the system SHALL CONTINUE TO save new photos without errors

#### Camera Initialization

3.13 WHEN camera permission is granted and camera is available THEN the system SHALL CONTINUE TO initialize the video stream and display the live preview

3.14 WHEN user switches between front and back cameras (on supported devices) THEN the system SHALL CONTINUE TO reinitialize the stream with the selected camera

#### Effect Previews

3.15 WHEN effect panel is displayed THEN the system SHALL CONTINUE TO show thumbnail previews of each available effect

3.16 WHEN user hovers over an effect preview THEN the system SHALL CONTINUE TO show any hover animations or highlights
