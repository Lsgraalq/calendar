"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/firebaseConfig";
import { getUser } from "@/lib/getUser";
import { updateUser } from "@/lib/updateUser";
import { useRouter } from "next/navigation";
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';

type User = {
  displayName: string;
  email: string;
};

export default function MeinProfilSeite() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const fetchUserData = async (uid: string) => {
  try {
    const fetchedUser = await getUser(uid) as User;
    if (!fetchedUser) throw new Error("Benutzer nicht gefunden");
    setUser(fetchedUser);
    setDisplayName(fetchedUser.displayName);
    setEmail(fetchedUser.email);
  } catch {
    setError("Fehler beim Laden der Benutzerdaten");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        fetchUserData(firebaseUser.uid);
      } else {
        setError("Benutzer nicht angemeldet");
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
          await signOut(auth);
          router.push("/login"); // редирект на главную
      };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUser(auth.currentUser!.uid, { displayName, email });
      setUser({ displayName, email });
      alert("Profil wurde aktualisiert");
    } catch {
      alert("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Lädt...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="pt-20 px-5 sm:ml-70 md:text-2xl max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Profil bearbeiten</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="w-full rounded border p-2"
          />
        </div>
        <div>
          <label className="block mb-2 font-medium">E-Mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded border p-2"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          {saving ? "Speichert..." : "Speichern"}
        </button>
      </form>
      <div className="mt-25">
      <button className=" text-white bg-purple-600 w-60 mx-auto rounded-2xl pt-2 pb-2"onClick={logout}>Log out</button>
      </div>
    </div>
  );
}
