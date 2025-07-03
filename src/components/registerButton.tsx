// components/LoginButton.js
"use client"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { createUserDocument } from "@/lib/createUserDocument"
import Link from "next/link";
const provider = new GoogleAuthProvider();

export default function RegisterButton() {
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

  return (
  <Link href="/signup">
  <button  className="px-7 pt-2.5 pb-2.5 rounded-full bg-purple-300 text-center text-white font-bold">Register</button>
  </Link> )
}
