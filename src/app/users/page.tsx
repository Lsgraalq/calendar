// app/users/page.tsx
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import Link from "next/link";
import Navbar from "../../components/Navbar";
type User = {
  uid: string;
  displayName: string;
  email: string;
  role?: string;
};

export default async function UsersPage() {
  const usersSnapshot = await getDocs(collection(db, "users"));

  const users: User[] = usersSnapshot.docs.map((doc) => ({
    uid: doc.id,
    ...doc.data(),
  })) as User[];

  return (
    <>
    
    <div className="pt-32 ml-64">
      <h1 className="text-2xl font-bold mb-6">Пользователи</h1>
      <ul className="space-y-4">
        {users.map((user) => (
          <li key={user.uid} className="p-4 border rounded-md shadow-sm">
            <p><strong>Name</strong> {user.displayName}</p>
            {/* <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Роль:</strong> {user.role ?? "Не указана"}</p> */}
            <Link
              className="text-blue-500 underline mt-2 inline-block"
              href={`/profile/${user.uid}`}
            >
              Profile
            </Link>
          </li>
        ))}
      </ul>
    </div>
    </>
  );
}
