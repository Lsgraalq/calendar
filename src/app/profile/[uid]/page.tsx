import { auth } from "@/firebase/firebaseConfig";
import Navbar from "../../../components/Navbar";
import { getUser } from "@/lib/getUser";


type Props = {
  params: {
    uid: string;
  };
};

export default async function ProfilePage({ params }: Props) {
  const { uid } = await params;
  const user = await getUser(uid);
    console.log("uid from URL:", uid);
    console.log("user from Firestore:", user);

  try {
    const user = await getUser(uid);
    return (
        <>
        
      <div className="pt-20 px-5 sm:ml-70 md:text-2xl">
        <h1 className="text-2xl font-bold">Users profile</h1>
        <p><strong>Name: </strong> {user.displayName}</p>
        <p><strong>Email: </strong> {user.email}</p>
      </div>
      </>
    );
  } catch (error) {
    
    return (
        <>
        
      <div className="pt-20 px-5 sm:ml-70 md:text-2xl text-red-500">
        <p>Пользователь не найден.</p>
      </div>
      </>
    );
  }
}
