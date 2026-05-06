"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from "firebase/firestore";
import Image from "next/image";
import { 
  Utensils,
  Star,
  Search,
  MessageCircle,
  Coffee,
  Pizza,
  IceCream,
  Soup,
  LayoutGrid
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  price: string;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
  tags: string[];
}

interface Restaurant {
  restaurantName: string;
  logoUrl?: string;
  description?: string;
  themeColor?: string;
}

export default function PublicMenuPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const scrollRef = useRef<HTMLDivElement>(null);

  const themeColor = restaurant?.themeColor || "#000000";

  useEffect(() => {
    if (id) {
      fetchMenu();
    }
  }, [id]);

  const fetchMenu = async () => {
    try {
      const resSnap = await getDoc(doc(db, "restaurants", id as string));
      if (resSnap.exists()) {
        setRestaurant(resSnap.data() as Restaurant);
      }

      const catQuery = query(collection(db, "categories"), where("restaurantId", "==", id));
      const catSnap = await getDocs(catQuery);
      setCategories(catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));

      const itemQuery = query(collection(db, "items"), where("restaurantId", "==", id), where("isAvailable", "==", true));
      const itemSnap = await getDocs(itemQuery);
      setItems(itemSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem)));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      return activeCategory === "all" || item.categoryId === activeCategory;
    });
  }, [items, activeCategory]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-12 w-12 border-4 border-gray-100 border-t-brand-orange rounded-full animate-spin"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-primary selection:bg-gray-100 pb-32">
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative">
        
        {/* Header Section */}
        <header className="pt-12 pb-6 px-6 text-center flex flex-col items-center">
           <div className="h-20 w-20 rounded-full border-2 border-gray-100 p-1 mb-4">
              <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-50">
                 <Image src={restaurant?.logoUrl || "/logo.svg"} alt="Logo" fill className="object-cover" />
              </div>
           </div>
           <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Welcome to our {restaurant?.restaurantName || "Restaurant"}
           </h1>
        </header>

        {/* Category Filter Pills */}
        <div className="px-6 py-4 overflow-x-auto no-scrollbar">
           <div className="flex gap-3 whitespace-nowrap min-w-max">
              <button
                onClick={() => setActiveCategory("all")}
                className={cn(
                  "px-6 py-2.5 rounded-full text-xs font-bold transition-all border",
                  activeCategory === "all" 
                    ? "bg-black text-white border-black" 
                    : "bg-white text-gray-400 border-gray-100 hover:bg-gray-50"
                )}
              >
                All Items
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "px-6 py-2.5 rounded-full text-xs font-bold transition-all border",
                    activeCategory === cat.id 
                      ? "bg-black text-white border-black" 
                      : "bg-white text-gray-400 border-gray-100 hover:bg-gray-50"
                  )}
                >
                  {cat.name}
                </button>
              ))}
           </div>
        </div>

        {/* Featured Items Carousel/Grid */}
        <div className="px-6 mt-4 flex flex-col gap-6">
           {filteredItems.map((item, index) => (
             <motion.div 
               key={item.id}
               initial={{ opacity: 0, x: index === 0 ? 0 : 50 }}
               animate={{ opacity: 1, x: 0 }}
               className="relative w-full h-[450px] rounded-[2.5rem] overflow-hidden shadow-2xl group cursor-pointer"
             >
                <Image 
                  src={item.imageUrl || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070"} 
                  alt={item.name} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8">
                   <h3 className="text-white text-lg font-bold mb-1">{item.name}</h3>
                   <div className="flex items-center gap-2">
                      <span className="text-white/60 text-xs font-medium">price:</span>
                      <span className="text-white font-bold">{item.price} {restaurant?.themeColor?.includes('$') ? '' : 'B'}</span>
                   </div>
                </div>
                
                {/* Side peek for next item effect on desktop/mobile */}
                {index === 0 && filteredItems.length > 1 && (
                   <div className="absolute top-10 -right-20 w-32 h-[400px] rounded-[2rem] overflow-hidden blur-[1px] opacity-40">
                      <Image src={filteredItems[1].imageUrl} alt="Next" fill className="object-cover" />
                   </div>
                )}
             </motion.div>
           ))}
        </div>

        {/* Floating Bottom Navigation */}
        <div className="fixed bottom-6 inset-x-0 flex justify-center px-6 z-50">
           <div className="bg-gray-100/80 backdrop-blur-xl p-2 rounded-[2.5rem] flex items-center justify-between gap-1 shadow-xl border border-white/20 w-full max-w-sm">
              <button className="flex-1 flex flex-col items-center justify-center gap-1 py-4 bg-black text-white rounded-[2rem] transition-all">
                 <Utensils className="h-5 w-5" />
                 <span className="text-[10px] font-bold">Main dish</span>
              </button>
              <button className="flex-1 flex flex-col items-center justify-center gap-1 py-4 text-gray-400 hover:bg-white rounded-[2rem] transition-all">
                 <Soup className="h-5 w-5" />
                 <span className="text-[10px] font-bold">Appetizer</span>
              </button>
              <button className="flex-1 flex flex-col items-center justify-center gap-1 py-4 text-gray-400 hover:bg-white rounded-[2rem] transition-all">
                 <IceCream className="h-5 w-5" />
                 <span className="text-[10px] font-bold">Desserts</span>
              </button>
              <button className="flex-1 flex flex-col items-center justify-center gap-1 py-4 text-gray-400 hover:bg-white rounded-[2rem] transition-all">
                 <Coffee className="h-5 w-5" />
                 <span className="text-[10px] font-bold">Drink</span>
              </button>
           </div>
        </div>

      </div>
    </div>
  );
}
