import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

export const createUserDocument = async (user: any) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  // если пользователь ещё не существует в БД — создаём
  if (!snapshot.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName || "Без имени",
      email: user.email || "Нет почты",
      photoURL: user.photoURL || null,
      role: "user", // по умолчанию
      createdAt: new Date().toISOString()
    });
  }
};
