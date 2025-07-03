import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';


type Equipment = {
  id: string;
  name: string;
  description?: string;
  image: string;
  photoPath: string;
};

export const fetchEquipment = async (): Promise<Equipment[]> => {
  const querySnapshot = await getDocs(collection(db, 'equipment'));
  const equipmentList: Equipment[] = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Equipment, 'id'>)
  }));
  return equipmentList;
};
