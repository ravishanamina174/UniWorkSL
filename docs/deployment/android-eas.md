# Android APK builds with EAS

The Student Expo project is in `apps/mobile`. It targets Android package `lk.uniwork.student`, uses app name `UniWork`, version `1.0.0`, scheme `uniwork`, a UniWork book/check icon, and a branded splash screen. Foreground location is requested only for the task arrival check. There is no background-location permission.

`apps/mobile/eas.json` contains internal APK profiles:

- Preview: `npx eas-cli@latest build --platform android --profile preview`.
- Production: `npx eas-cli@latest build --platform android --profile production` (EAS increments the remote Android build number).

Expo's APK build setting is `android.buildType: "apk"`; see [Expo's APK build guide](https://docs.expo.dev/build-reference/apk/) and [EAS configuration reference](https://docs.expo.dev/eas/json/).

## EAS and Clerk setup

1. Sign into the UniWork Expo organization/account and initialize/link the app to its EAS project. Keep the generated project ID in app configuration if EAS requests one; do not commit access tokens or Android signing files.
2. Create EAS `preview` and `production` environments with `EXPO_PUBLIC_API_BASE_URL` and `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`. Use a reachable test API and Clerk test instance for Preview. Use only the Render HTTPS URL and Clerk production `pk_live_...` key for Production.
3. In the matching Clerk instance, enable Native API and register the Android native application with package/namespace `lk.uniwork.student`. This setting opens Clerk's native request pathway, which bypasses browser CAPTCHA challenges; review the effect and any abuse protections before enabling it. See [Clerk Expo setup](https://clerk.com/docs/expo/getting-started/quickstart) and [production Expo deployment](https://clerk.com/docs/guides/development/deployment/expo).
4. Confirm the native hosted-auth redirect allowlist and the actual Student session's JWT issuer, audience (when present), and `azp`. Add only the observed and approved origin(s) to Render's `CLERK_AUTHORIZED_PARTIES`.
5. Run the Preview APK command and install it on an Android emulator/device. After full test-account workflow verification, run the Production APK command.
6. Upload the verified production APK to a public HTTPS host. Set `NEXT_PUBLIC_ANDROID_APK_URL` in Vercel to that exact URL and redeploy. Verify the download URL and QR code on a phone.

No EAS account/project credentials or Android device were available during this preparation. No EAS build, APK artifact, public download URL, or QR download has been created or tested. Keep the landing page's Coming Soon state until those steps pass.
