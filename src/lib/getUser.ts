import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "@/firebase/firebaseConfig";
import { db } from "@/firebase/firebaseConfig";
// export async function getUser(uid: string) {
//   const db = getFirestore(app);
//   const docRef = doc(db, "users", uid);
//   const docSnap = await getDoc(docRef);

//   if (docSnap.exists()) {
//     return docSnap.data();
//   } else {
//     throw new Error("User not found");
//   }
// }


export async function getUser(uid: string) {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error("Пользователь не найден");
  }

  return docSnap.data();
}


