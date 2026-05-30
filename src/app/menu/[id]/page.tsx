import { app } from "@/lib/firebase";
import { getFirestore, collection, doc, getDoc, getDocs, query, where } from "firebase/firestore/lite";
import MenuClient from "./MenuClient";

const dbLite = getFirestore(app);

export const revalidate = 60;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let resSnap;
  try {
    if (id && id.length === 6) {
      const q = query(collection(dbLite, "restaurants"), where("menuId", "==", id));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        resSnap = querySnap.docs[0];
      }
    } else {
      resSnap = await getDoc(doc(dbLite, "restaurants", id));
    }
  } catch (error: any) {
    console.error("Firestore Lite Error:", error);
  }

  if (!resSnap || !resSnap.exists()) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Menu Not Found</h1>
          <p className="text-gray-500">The menu you are looking for does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const restaurantId = resSnap.id;
  const restaurant = { id: restaurantId, ...resSnap.data() };

  const catQuery = query(collection(dbLite, "categories"), where("restaurantId", "==", restaurantId));
  const catSnap = await getDocs(catQuery);
  const categories = catSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));

  const itemQuery = query(collection(dbLite, "items"), where("restaurantId", "==", restaurantId));
  const itemSnap = await getDocs(itemQuery);
  const items = itemSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));

  return (
    <MenuClient 
      initialRestaurant={restaurant as any} 
      initialCategories={categories as any} 
      initialItems={items as any} 
    />
  );
}
