// components/LoginButton.js
"use client"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";

const provider = new GoogleAuthProvider();

export default function LoginButton() {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Signed in as:", result.user.displayName);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return <button onClick={handleLogin}>Войти через Google</button>;
}
