# Boot Instructions

## iOS
1. Open Xcode and launch an iOS simulator.
2. Ensure deployment target is set to 15.0 in Podfile and project.pbxproj.
3. Run `cd ios && pod install`.
4. In the project root, run `flutter run` to start the app on the simulator.

## Android
1. Start an Android emulator using Android Studio or `flutter emulators --launch <emulator_id>`.
2. In the project root, run `flutter run` to start the app on the emulator.

## Troubleshooting
- If you encounter dependency errors, update your deployment targets and run `pod install` again.
- Ensure all required plugins are compatible with your deployment target.

## Day 3 Functions (Emulator Mock Mode)
- From project root: `cd functions && npm install && npm run build`
- Start emulator with mock mode: `GAINX_PLAN_MODE=mock firebase emulators:start --only functions`
- To switch to live mode later, set `GAINX_PLAN_MODE=live` and implement OpenAI key wiring in Functions.
