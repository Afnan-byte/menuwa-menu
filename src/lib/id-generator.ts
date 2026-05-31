import { db } from "./firebase-db";
import { collection, query, where, getDocs } from "firebase/firestore";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed similar looking chars (0, O, 1, I, etc)

export const generateShortId = (length = 6) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return result;
};

export const isIdUnique = async (id: string): Promise<boolean> => {
  const q = query(collection(db, "stands"), where("id", "==", id));
  const snap = await getDocs(q);
  
  const q2 = query(collection(db, "restaurants"), where("menuId", "==", id));
  const snap2 = await getDocs(q2);

  return snap.empty && snap2.empty;
};

export const generateUniqueShortId = async (): Promise<string> => {
  let id = generateShortId();
  let unique = await isIdUnique(id);
  
  while (!unique) {
    id = generateShortId();
    unique = await isIdUnique(id);
  }
  
  return id;
};
