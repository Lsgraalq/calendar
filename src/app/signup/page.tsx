"use client"
import React, { useState, FormEvent } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { updateProfile } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig"; 
import { useRouter } from 'next/navigation';


export default function RegisterSection() {
    const router = useRouter();
    const [confirmPassword, setConfirmPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [
    createUserWithEmailAndPassword,
    user,
    loading,
    error,
  ] = useCreateUserWithEmailAndPassword(auth);

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const userCredential = await createUserWithEmailAndPassword(email, password);
            if (userCredential && userCredential.user) {
            const user = userCredential.user;

            // Устанавливаем имя пользователя
            await updateProfile(user, {
                displayName,
            });

            // Добавляем данные в Firestore
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                displayName,
                createdAt: serverTimestamp(),
            });

            console.log('User created and data saved to Firestore');
            router.push("/");
            }
        } catch (err) {
            console.error('Error creating user:', err);
        }
        };
  return (






    <section className=" bg-gradient-to-b from-white to-purple-300">
      <div className="h-screen flex flex-col items-center pt-30 md:justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a
          href="#"
          className="flex items-center mb-6 text-2xl font-semibold text-purple-600"
        >
         
          Register
        </a>
        <div className="w-full bg-white rounded-lg shadow  md:mt-0 sm:max-w-md xl:p-0   ">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight md:text-2xl  text-purple-600">
              Create an account
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleRegister}>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-purple-600 "
                >
                  Your email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@company.com"
                  autoComplete="username"
                  className=" w-full rounded-xl bg-white focus:border-purple-600"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-purple-600 dark:focus:border-purple-600"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className="w-full rounded-xl bg-white focus:border-purple-600"
                />
              </div>
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block mb-2 text-sm font-medium text-purple-600"
                >
                  Your name
                </label>
                <input
                  type="text"
                  name="confirm-password"
                  id="confirm-password"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  placeholder="Emma"
                  autoComplete="name"
                  className="w-full rounded-xl bg-white focus:border-purple-600"
                />
              </div>
              <div className="flex items-start">
               
              </div>
              <button
                type="submit"
                className="w-full text-white bg-purple-600 hover:bg-purple-500 focus:ring-0 focus:outline-none focus:bg-purple-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-purple-600 dark:hover:bg-purple-500 dark:focus:bg-purple-500"
              >
                Create an account
              </button>
              <p className="text-sm font-light text-gray-500 dark:text-gray-500">
                Already have an account?{' '}
                <a
                  href="/login"
                  className="font-medium text-purple-700 hover:underline dark:text-primary-500"
                >
                  Login here
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
