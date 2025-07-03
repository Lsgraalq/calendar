"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/"); // или на /dashboard
    } catch (err: any) {
  console.error(err);
  setError(`❌ ${err?.message || 'Invalid email or password'}`);
    }   finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-gradient-to-b from-white to-purple-300">
  <div className="min-h-screen flex flex-col items-center justify-center px-6 py-8 mx-auto">
    <a href="/" className="flex items-center mb-6 text-2xl font-semibold text-purple-600">
      Passage
    </a>
    <div className="w-full bg-white rounded-lg shadow sm:max-w-md xl:p-0">
      <div className="p-6 space-y-4 sm:p-8">
        <h1 className="text-xl font-bold leading-tight tracking-tight md:text-2xl text-purple-600">
          Sign in to your account
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
           
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-purple-600">
              Your email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@company.com"
              className="w-full rounded-xl bg-white border border-purple-300 focus:border-purple-600 focus:ring-purple-600 p-2.5"
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-purple-600">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-xl bg-white border border-purple-300 focus:border-purple-600 focus:ring-purple-600 p-2.5"
            />
          </div>

         {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white bg-purple-600 hover:bg-purple-500 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <p className="text-sm font-light text-gray-500">
            Don’t have an account yet?{" "}
            <a href="/signup" className="font-medium text-purple-700 hover:underline">
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
  </div>
</section>

  );
}
