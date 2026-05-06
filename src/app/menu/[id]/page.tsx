"use client";

import { useState, useEffect, useMemo } from "react";
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
  LayoutGrid,
  ChevronRight,
  Plus
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

  const themeColor = restaurant?.themeColor || "#14B8A6";

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
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-12 w-12 border-4 border-gray-100 border-t-primary rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFF] font-sans text-primary selection:bg-gray-100 pb-32">
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative bg-white shadow-[0_0_80px_rgba(0,0,0,0.03)]">
        
        {/* Cinematic Header */}
        <header className="relative pt-16 pb-10 px-8 flex flex-col items-center">
           <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-gray-50 to-transparent -z-10 opacity-60"></div>
           
           <motion.div 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="relative h-24 w-24 rounded-[2.5rem] p-1.5 bg-white shadow-2xl mb-6 group cursor-pointer"
           >
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-gray-50">
                 <Image 
                   src={restaurant?.logoUrl || "/logo.svg"} 
                   alt="Logo" 
                   fill 
                   className="object-cover transition-transform duration-700 group-hover:scale-110" 
                 />
              </div>
              <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-black text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                 <Star className="h-3 w-3 fill-white" />
              </div>
           </motion.div>

           <motion.h1 
             initial={{ y: 10, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             className="text-3xl font-black text-gray-900 tracking-tighter"
           >
              {restaurant?.restaurantName || "Menuvo"}
           </motion.h1>
           <motion.p 
             initial={{ y: 10, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.1 }}
             className="text-gray-400 text-[10px] uppercase font-black tracking-[0.3em] mt-3 bg-gray-50 px-4 py-1 rounded-full"
           >
              Culinary Excellence
           </motion.p>
        </header>

        {/* Stunning 2-Column Grid */}
        <div className="px-6 grid grid-cols-2 gap-x-5 gap-y-12 pt-6 pb-20">
           <AnimatePresence mode="popLayout">
             {filteredItems.map((item, index) => (
               <motion.div 
                 key={item.id}
                 layout
                 initial={{ opacity: 0, y: 30, scale: 0.9 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.8 }}
                 transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
                 className="relative group"
               >
                  <div className="relative w-full h-64 rounded-[3rem] overflow-hidden shadow-2xl group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] transition-all duration-500">
                    <Image 
                      src={item.imageUrl || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070"} 
                      alt={item.name} 
                      fill 
                      className="object-cover transition-transform duration-1000 group-hover:scale-125"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
                    
                    {/* Price Badge Overlay */}
                    <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/20 shadow-sm transition-transform group-hover:scale-110">
                       <span className="text-[10px] font-black text-white">{item.price}</span>
                    </div>

                    <div className="absolute bottom-6 left-6 right-6">
                       <h3 className="text-white text-sm font-black tracking-tight mb-0.5 line-clamp-1">{item.name}</h3>
                       <p className="text-white/50 text-[8px] font-black uppercase tracking-widest line-clamp-1">Premium Quality</p>
                    </div>

                    <button 
                      className="absolute bottom-4 right-4 h-10 w-10 bg-white rounded-2xl flex items-center justify-center shadow-lg transition-all scale-0 group-hover:scale-100 hover:rotate-90 active:scale-90"
                      style={{ color: themeColor }}
                    >
                       <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* Subtle Glow Effect on Hover */}
                  <div className="absolute -inset-1 rounded-[3rem] opacity-0 group-hover:opacity-20 blur-2xl transition-opacity -z-10" style={{ backgroundColor: themeColor }}></div>
               </motion.div>
             ))}
           </AnimatePresence>
        </div>

        {/* Premium Floating Dock Categories */}
        <div className="fixed bottom-8 inset-x-0 flex justify-center px-6 z-50">
           <motion.div 
             initial={{ y: 100 }}
             animate={{ y: 0 }}
             className="bg-white/70 backdrop-blur-3xl p-2 rounded-[3rem] flex items-center gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 w-full max-w-sm overflow-x-auto no-scrollbar scroll-smooth"
           >
              <button 
                onClick={() => setActiveCategory("all")}
                className={cn(
                  "flex-shrink-0 flex items-center gap-2 px-6 py-4 rounded-[2.5rem] transition-all",
                  activeCategory === "all" 
                    ? "bg-black text-white shadow-xl scale-105" 
                    : "text-gray-400 hover:bg-gray-50"
                )}
              >
                 <LayoutGrid className="h-4 w-4" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Discover All</span>
              </button>
              
              {categories.map((cat) => (
                <button 
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex-shrink-0 flex items-center gap-2 px-6 py-4 rounded-[2.5rem] transition-all",
                    activeCategory === cat.id 
                      ? "bg-black text-white shadow-xl scale-105" 
                      : "text-gray-400 hover:bg-gray-50"
                  )}
                >
                   <Utensils className="h-4 w-4" />
                   <span className="text-[10px] font-black uppercase tracking-widest">{cat.name}</span>
                </button>
              ))}
           </motion.div>
        </div>

        {/* Footer */}
        <footer className="mt-10 py-20 px-8 text-center bg-gray-50/50 rounded-t-[4rem]">
            <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4">Powered by the Future of Dining</p>
            <h2 className="text-2xl font-black tracking-tighter text-gray-200 uppercase">Menuvo</h2>
        </footer>

      </div>
    </div>
  );
}
