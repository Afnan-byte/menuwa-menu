import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import MenuClient from "./MenuClient";

export const revalidate = 60;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let resSnap;
  if (id && id.length === 6) {
    const q = query(collection(db, "restaurants"), where("menuId", "==", id));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      resSnap = querySnap.docs[0];
    }
  } else {
    resSnap = await getDoc(doc(db, "restaurants", id));
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

  const catQuery = query(collection(db, "categories"), where("restaurantId", "==", restaurantId));
  const catSnap = await getDocs(catQuery);
  const categories = catSnap.docs.map((d: any) => ({ id: d.id, ...d.data() }));

  const itemQuery = query(collection(db, "items"), where("restaurantId", "==", restaurantId));
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
