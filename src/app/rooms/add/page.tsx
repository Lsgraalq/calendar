"use client";

import { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

export default function AddRoom() {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, "rooms"), {
        name,
        type,
        description,
        createdAt: Timestamp.now(),
      });

      setMessage("✅ Raum erfolgreich hinzugefügt");
      setName("");
      setType("");
      setDescription("");
    } catch (error) {
      console.error("Fehler beim Hinzufügen des Raums:", error);
      setMessage("❌ Fehler beim Hinzufügen des Raums");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 rounded-xl shadow">
      <h1 className="text-xl font-bold mb-4">Raum hinzufügen</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Name des Raums"
          className="w-full border p-2 text-black rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Raumtyp (z.B. Konferenzraum)"
          className="w-full border p-2 text-black rounded"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        />
        <textarea
          placeholder="Raumbeschreibung"
          className="w-full border p-2 text-black rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Hinzufügen
        </button>
        {message && <p className="text-sm mt-2">{message}</p>}
      </form>
    </div>
  );
}
