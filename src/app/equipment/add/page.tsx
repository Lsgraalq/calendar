"use client";

import { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db, storage } from "@/firebase/firebaseConfig"; // storage надо импортировать из своей конфигурации
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AddEquipment() {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      setMessage("❌ Пожалуйста, выберите изображение");
      return;
    }
    try {
      // Создаём ссылку на место в storage для файла
      const storageRef = ref(storage, `images/${imageFile.name}`);
      console.log("Will upload to path:", `images/${imageFile.name}`);


      // Загружаем файл
      await uploadBytes(storageRef, imageFile);

      // Получаем публичный URL загруженного файла
      const imageUrl = await getDownloadURL(storageRef);

      // Добавляем документ в Firestore с ссылкой на картинку
      await addDoc(collection(db, "equipment"), {
        name,
        type,
        description,
        imageUrl, // сохраняем ссылку на картинку
        createdAt: Timestamp.now(),
      });

      setMessage("✅ Техника успешно добавлена");
      setName("");
      setType("");
      setDescription("");
      setImageFile(null);
    } catch (error) {
      console.error("Ошибка при добавлении техники:", error);
      setMessage("❌ Ошибка при добавлении техники");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 rounded-xl shadow">
      <h1 className="text-xl font-bold mb-4">Добавить технику</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Название"
          className="w-full border p-2 text-black rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Тип (например, камера)"
          className="w-full border p-2 text-black rounded"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        />
        <textarea
          placeholder="Описание"
          className="w-full border p-2 text-black rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Добавить
        </button>
        {message && <p className="text-sm mt-2">{message}</p>}
      </form>
    </div>
  );
}
