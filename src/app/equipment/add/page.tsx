"use client";
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
export default function AddEquipment() {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "equipment"), {
        name,
        type,
        description,
        createdAt: new Date().toISOString(),
      });
      setMessage("✅ Техника добавлена");
      setName("");
      setType("");
      setDescription("");
    } catch (error) {
      console.error("Ошибка при добавлении техники:", error);
      setMessage("❌ Ошибка при добавлении");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6  rounded-xl shadow">
      <h1 className="text-xl font-bold mb-4">Добавить технику</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Название"
          className="w-full border p-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Тип (например, камера)"
          className="w-full border p-2 rounded"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        />
        <textarea
          placeholder="Описание"
          className="w-full border p-2 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Добавить
        </button>
        {message && <p className="text-sm mt-2">{message}</p>}
      </form>
    </div>
  );
}
