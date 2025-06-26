"use client";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import Link from "next/link";

type Equipment = {
  id: string;
  name: string;
  type: string;
  description?: string;
};

export default function AllEquipment() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  useEffect(() => {
    const fetchEquipment = async () => {
      const snapshot = await getDocs(collection(db, "equipment"));
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Equipment[];
      setEquipment(data);
    };

    fetchEquipment();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6  rounded-xl shadow">
      <h1 className="text-xl font-bold mb-4">Вся техника</h1>
      {equipment.length === 0 ? (
        <p>Нет добавленной техники</p>
      ) : (
        <ul className="space-y-4">
          {equipment.map((item) => (
            <li key={item.id} className="border p-4 rounded">
              <h2 className="text-lg font-semibold">{item.name}</h2>
              <p className="text-sm text-gray-600">Тип: {item.type}</p>
              {item.description && <p className="mt-2">{item.description}</p>}
            </li>
          ))}
        </ul>
      )}
      <Link href="/equipment/add">
      <h1 className="text-3xl">Add equipment</h1>
      </Link>
    </div>
  );
}
