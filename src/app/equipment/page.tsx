"use client";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import Link from "next/link";

type Equipment = {
  id: string;
  name: string;
  type: string;
  description: string;
  imageUrl: string;
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
    <div className="text-black pt-20 px-5 md:pt-30 md:ml-64">
      <h1 className="text-purple-600 font-bold text-2xl md:mb-10 mb-5">Alle Geräte</h1>
      {equipment.length === 0 ? (
        <p className="text-2xl text-purple-500">Keine Geräte hinzugefügt</p>
      ) : (
        <ul className="flex flex-col gap-5 md:grid md:grid-cols-3 md:gap-5">
          {equipment.map((item) => (
            <li key={item.id} className="rounded-4xl bg-gradient-to-b from-purple-100 to-purple-200 pb-5 pt-5">
              <img src={item.imageUrl} alt="Gerätebild" className="w-1/2 mx-auto" />
              <h2 className="text-purple-500 text-2xl font-bold pl-2">{item.name}</h2>
              <p className="pl-2 text-lg pb-2">Typ: {item.type}</p>
              <p className="pl-2 text-lg">{item.description}</p>
              <p className="pl-2 text-lg flex">
                STATUS <div className="bg-green-600 w-5 rounded-full h-5 mt-1 ml-2"></div>
              </p>
            </li>
          ))}
        </ul>
      )}
      <Link href="/equipment/add">
        <h1 className="text-center text-xl pt-2 pb-2 mx-auto bg-purple-600 md:w-100 w-60 rounded-3xl mt-10 mb-10 text-white hover:bg-purple-400 font-bold uppercase">
          Gerät hinzufügen
        </h1>
      </Link>
    </div>
  );
}
