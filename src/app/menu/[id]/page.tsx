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
  Loader2, 
  Phone, 
  MessageCircle, 
  Info,
  ChevronRight,
  Utensils,
  Star,
  Search,
  LayoutDashboard,
  Users,
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
}

export default function PublicMenuPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    if (id) {
      fetchMenu();
    }
  }, [id]);

  const fetchMenu = async () => {
    try {
      // Fetch restaurant
      const resSnap = await getDoc(doc(db, "restaurants", id as string));
      if (resSnap.exists()) {
        setRestaurant(resSnap.data() as Restaurant);
      }

      // Fetch categories
      const catQuery = query(collection(db, "categories"), where("restaurantId", "==", id));
      const catSnap = await getDocs(catQuery);
      setCategories(catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));

      // Fetch items
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
    if (activeCategory === "all") return items;
    return items.filter(i => i.categoryId === activeCategory);
  }, [items, activeCategory]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-brand-orange" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-black text-primary mb-2">Menu Not Found</h1>
        <p className="text-gray-500">This restaurant hasn't set up their menu yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative bg-white shadow-2xl overflow-hidden pb-24">
        
        {/* Header */}
        <div className="p-8 pt-10 pb-4">
          <h1 className="text-4xl font-black tracking-tight text-primary mb-1">
             {restaurant.restaurantName}
          </h1>
          <p className="text-gray-400 text-sm font-medium">Order your favourite food!</p>
        </div>

        {/* Search Bar */}
        <div className="px-8 mb-6">
           <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-brand-orange transition-colors" />
              <input 
                type="text" 
                placeholder="Search" 
                className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-[2rem] text-sm font-bold focus:ring-4 focus:ring-brand-orange/5 transition-all outline-none"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-xl shadow-sm cursor-pointer">
                <div className="h-4 w-4 text-brand-orange flex flex-col gap-0.5">
                   <div className="h-0.5 w-full bg-brand-orange rounded-full"></div>
                   <div className="h-0.5 w-2/3 bg-brand-orange rounded-full"></div>
                   <div className="h-0.5 w-full bg-brand-orange rounded-full"></div>
                </div>
              </div>
           </div>
        </div>

        {/* Categories Chips */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-8 mb-8">
            <button
              onClick={() => setActiveCategory("all")}
              className={cn(
                "px-8 py-3.5 rounded-2xl font-black text-xs transition-all whitespace-nowrap shadow-sm",
                activeCategory === "all" 
                  ? "bg-brand-orange text-white shadow-xl shadow-brand-orange/30 scale-105" 
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-8 py-3.5 rounded-2xl font-black text-xs transition-all whitespace-nowrap shadow-sm",
                  activeCategory === cat.id 
                    ? "bg-brand-orange text-white shadow-xl shadow-brand-orange/30 scale-105" 
                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                )}
              >
                {cat.name}
              </button>
            ))}
        </div>

        {/* Food Grid */}
        <div className="px-8 grid grid-cols-2 gap-x-6 gap-y-16 pt-8">
           {filteredItems.map((item) => (
             <motion.div
               key={item.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-white rounded-[2rem] p-4 shadow-xl shadow-gray-200/50 relative group cursor-pointer"
             >
                {/* Heart Icon */}
                <div className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm text-gray-300 hover:text-red-500 transition-colors">
                   <div className="h-4 w-4">
                      <svg fill="currentColor" viewBox="0 0 24 24"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.5 3c1.557 0 3.046.727 4 2.015C12.454 3.727 13.943 3 15.5 3c2.786 0 5.25 2.322 5.25 5.25 0 3.924-2.438 7.11-4.74 9.27a25.176 25.176 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>
                   </div>
                </div>

                {/* Overlapping Image */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 md:w-36 md:h-36 pointer-events-none">
                   {item.imageUrl ? (
                     <div className="relative w-full h-full">
                       <Image 
                        src={item.imageUrl} 
                        alt={item.name} 
                        fill 
                        className="object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500" 
                        sizes="(max-width: 768px) 150px"
                      />
                     </div>
                   ) : (
                     <div className="h-full w-full bg-gray-50 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                        <Utensils className="h-8 w-8 text-gray-200" />
                     </div>
                   )}
                </div>

                <div className="pt-20 pb-2 text-center">
                   <h3 className="text-sm font-black text-primary mb-1 line-clamp-1">{item.name}</h3>
                   <div className="flex items-center justify-center gap-1 mb-2">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-[10px] font-black text-gray-400">4.9</span>
                   </div>
                   <p className="text-brand-orange font-black text-sm">${item.price}</p>
                </div>
             </motion.div>
           ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-50">
             <Utensils className="h-16 w-16 mb-4 text-gray-300" />
             <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Nothing here yet</p>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-24 bg-white/80 backdrop-blur-2xl border-t border-gray-100/50 flex items-center justify-around px-8 z-50">
            <button className="p-3 text-brand-orange transition-all hover:scale-110">
               <LayoutDashboard className="h-6 w-6" />
            </button>
            <button className="p-3 text-gray-300 hover:text-brand-orange transition-all hover:scale-110">
               <Users className="h-6 w-6" />
            </button>
            <button className="h-16 w-16 bg-brand-orange text-white rounded-full flex items-center justify-center shadow-xl shadow-brand-orange/30 -translate-y-6 hover:scale-110 transition-all">
               <Plus className="h-8 w-8" />
            </button>
            <button className="p-3 text-gray-300 hover:text-brand-orange transition-all hover:scale-110">
               <MessageCircle className="h-6 w-6" />
            </button>
            <button className="p-3 text-gray-300 hover:text-brand-orange transition-all hover:scale-110">
               <Info className="h-6 w-6" />
            </button>
        </div>
      </div>
    </div>
  );
}
