"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import Link from "next/link";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const usersData = snapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
      } catch (err) {
        console.error(err);
        setError("❌ Ошибка загрузки пользователей");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen pt-20 md:pt-32 md:ml-64">
  <h1 className="text-2xl font-bold mb-6 pl-2 md:pl-10">Benutzer</h1>
  {loading && <p>Lade...</p>}
  {error && <p className="text-red-500">{error}</p>}
  <ul className="space-y-4 px-4 grid grid-cols-2 gap-2">
    {users.map((user) => (
      <li
        key={user.uid}
        className="p-4 border rounded-md shadow-sm bg-gradient-to-b from-white to-purple-100"
      >
        <p>
          <strong className="font-bold text-purple-500">Name:</strong> {user.displayName}
        </p>
        <Link
          className="text-blue-800 underline mt-2 inline-block"
          href={`/profile/${user.uid}`}
        >
          Profil
        </Link>
      </li>
    ))}
  </ul>
</div>

  );
}
