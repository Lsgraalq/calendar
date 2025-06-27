// firebase/appCheckInit.ts
import { app } from "./firebaseConfig";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

export function initAppCheck() {
  if (typeof window === "undefined") return;
  if (!("appCheckInitialized" in window)) {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_KEY!),
      isTokenAutoRefreshEnabled: true,
    });
    window.appCheckInitialized = true;
  }
}
