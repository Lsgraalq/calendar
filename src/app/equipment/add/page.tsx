"use client";

import { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db, storage } from "@/firebase/firebaseConfig"; // storage muss aus deiner Konfiguration importiert werden
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
      setMessage("❌ Bitte wählen Sie ein Bild aus");
      return;
    }
    try {
      // Erstelle einen Speicherpfad für die Datei
      const storageRef = ref(storage, `images/${imageFile.name}`);
      console.log("Wird hochgeladen zu Pfad:", `images/${imageFile.name}`);

      // Lade die Datei hoch
      await uploadBytes(storageRef, imageFile);

      // Hole die öffentliche URL der hochgeladenen Datei
      const imageUrl = await getDownloadURL(storageRef);

      // Füge ein Dokument in Firestore mit dem Bildlink hinzu
      await addDoc(collection(db, "equipment"), {
        name,
        type,
        description,
        imageUrl, // Bildlink speichern
        createdAt: Timestamp.now(),
      });

      setMessage("✅ Gerät erfolgreich hinzugefügt");
      setName("");
      setType("");
      setDescription("");
      setImageFile(null);
    } catch (error) {
      console.error("Fehler beim Hinzufügen des Geräts:", error);
      setMessage("❌ Fehler beim Hinzufügen des Geräts");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 rounded-xl shadow">
      <h1 className="text-xl font-bold mb-4">Gerät hinzufügen</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Name"
          className="w-full border p-2 text-black rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Typ (z.B. Kamera)"
          className="w-full border p-2 text-black rounded"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        />
        <textarea
          placeholder="Beschreibung"
          className="w-full border p-2 text-black rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input type="file" accept="image/*" onChange={handleFileChange} />
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
