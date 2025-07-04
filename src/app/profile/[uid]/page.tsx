"use client";

import { useEffect, useState } from "react";
import { getUser } from "@/lib/getUser"; 
import { useParams } from "next/navigation";

type User = {
  displayName: string;
  email: string;
};

export default function ProfilePage() {
  const params = useParams();
  const uid = params?.uid as string;

  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   const fetchUser = async () => {
  try {
    const fetchedUserData = await getUser(uid);

    if (!fetchedUserData) {
      throw new Error("Benutzer nicht gefunden");
    }

    if (!fetchedUserData.displayName || !fetchedUserData.email) {
      throw new Error("Unvollständige Benutzerdaten");
    }

    const user: User = {
      displayName: fetchedUserData.displayName,
      email: fetchedUserData.email
    };

    setUser(user);
  } catch (err) {
    setError("Benutzer nicht gefunden.");
  } finally {
    setLoading(false);
  }
};

    if (uid) {
      fetchUser();
    } else {
      setError("Ungültige UID.");
      setLoading(false);
    }
  }, [uid]);

  if (loading) {
    return (
      <div className="pt-20 px-5 sm:ml-70 md:text-2xl">
        <p>Lädt...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-20 px-5 sm:ml-70 md:text-2xl text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="pt-20 px-5 sm:ml-70 md:text-2xl">
      <h1 className="text-2xl font-bold">Benutzerprofil</h1>
      <p><strong>Name:</strong> {user?.displayName}</p>
      <p><strong>E-Mail:</strong> {user?.email}</p>
    </div>
  );
}
