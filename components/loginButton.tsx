// components/LoginButton.js
"use client"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../src/firebase/firebaseConfig";
import { createUserDocument } from "@/lib/createUserDocument"

const provider = new GoogleAuthProvider();

export default function LoginButton() {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Signed in as:", result.user.displayName);
      const user = result.user;
      await createUserDocument(user);
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return <button onClick={handleLogin} className="px-7 pt-2.5 pb-2.5 rounded-full bg-gray-500 text-center">Log In</button>;
}
