// lib/userApi.ts (пример файла с функциями)

import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig"; // путь к вашей конфигурации Firebase

type UserData = {
  displayName: string;
  email: string;
};

// Получение пользователя по uid
export async function getUser(uid: string): Promise<UserData | null> {
  try {
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      return null;
    }

    return userDocSnap.data() as UserData;
  } catch (error) {
    console.error("Ошибка получения пользователя:", error);
    throw error;
  }
}

// Обновление данных пользователя
export async function updateUser(uid: string, data: Partial<UserData>): Promise<void> {
  try {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, data);
  } catch (error) {
    console.error("Ошибка обновления пользователя:", error);
    throw error;
  }
}
