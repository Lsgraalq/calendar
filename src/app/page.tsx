"use client"
import { useEffect, useState } from "react";
import LoginButton from "../components/loginButton";
import Navbar from "../components/Navbar";
import { auth } from "../firebase/firebaseConfig";
import { onAuthStateChanged } from 'firebase/auth';
import Link from "next/link";
import Calendar from '@/components/Calendar'



export default function Home() {
 
  
  const [user, setUser] = useState(null);
   onAuthStateChanged(auth, (user) => {
  if (user) {
    const displayName = user.displayName;
    const email = user.email;
    const photoURL = user.photoURL;
    const emailVerified = user.emailVerified;
    return (
        <> <h1>{displayName}</h1> </>
    )
  } else {
    // User is signed out
    // ...
  }
});
  
  return (
   <>
   
   <div className="md:ml-64 ml-10 pt-13">
      <Calendar></Calendar>
      <div className="  w-60 px-10 pt-5 pb-5 rounded-full bg-amber-300">
        <Link href="http://localhost:3000/profile/eDjzjM1WmHZtk1Rxr0me6j1lBWN2">
          <h1>
            Yavhe profile
          </h1>
        </Link>
      </div>
   </div>
   </>
  );
}
