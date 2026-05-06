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
  LayoutGrid,
  X,
  ArrowRight
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
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

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
    <div className="min-h-screen bg-[#FAFBFF] font-sans selection:bg-gray-100 pb-32">
      <style jsx global>{`
        :root {
          --brand-primary: ${themeColor};
        }
      `}</style>

      <div className="max-w-md mx-auto min-h-screen flex flex-col relative bg-white shadow-[0_0_100px_rgba(0,0,0,0.05)]">

        {/* Header Section */}
        <header className="relative pt-16 pb-10 px-8 flex flex-col items-center">
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-gray-50 to-transparent -z-10 opacity-60"></div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative h-40 w-40 rounded-[3rem] p-2 bg-white shadow-2xl mb-8 border border-gray-50"
          >
            <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-gray-50">
              <Image src={restaurant?.logoUrl || "/logo.svg"} alt="Logo" fill className="object-cover" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">{restaurant?.restaurantName || "Menuvo"}</h1>
          <p className="text-gray-400 text-[10px] uppercase font-black tracking-[0.3em] mt-3 bg-gray-50 px-4 py-1 rounded-full">Culinary Excellence</p>
        </header>

        {/* 2-Column Grid */}
        <div className="px-6 grid grid-cols-2 gap-x-5 gap-y-12 pt-6 pb-20">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                className="relative group cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <div className="relative w-full h-64 rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-500 border border-gray-50">
                  <Image src={item.imageUrl || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070"} alt={item.name} fill className="object-cover transition-transform duration-1000 group-hover:scale-125" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  <div className="absolute top-4 right-4 z-10 px-3 py-1 backdrop-blur-md rounded-full border border-white/20 shadow-sm transition-transform" style={{ backgroundColor: `${themeColor}cc` }}>
                    <span className="text-[10px] font-black text-white">{item.price}</span>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-white text-sm font-black tracking-tight mb-0.5 line-clamp-1">{item.name}</h3>
                    <p className="text-white/40 text-[8px] font-black uppercase tracking-widest line-clamp-1">View Details</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Item Details Immersive Modal */}
        <AnimatePresence>
          {selectedItem && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedItem(null)} className="absolute inset-0 bg-black/60 backdrop-blur-xl" />
              <motion.div
                layoutId={selectedItem.id}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="relative w-full max-w-md bg-white rounded-t-[4rem] sm:rounded-[4rem] overflow-hidden shadow-2xl h-[90vh] sm:h-auto"
              >
                <button onClick={() => setSelectedItem(null)} className="absolute top-8 right-8 z-50 h-12 w-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
                  <X className="h-6 w-6" />
                </button>
                <div className="relative h-[45vh] w-full">
                  <Image src={selectedItem.imageUrl} alt={selectedItem.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                </div>
                <div className="p-10 -mt-20 relative z-10 bg-white rounded-t-[4rem]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-4 py-1.5 bg-gray-50 text-[10px] font-black uppercase tracking-[0.2em] rounded-full text-gray-400">
                      {categories.find(c => c.id === selectedItem.categoryId)?.name || "Signature"}
                    </span>
                  </div>

                  <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-4">{selectedItem.name}</h2>
                  <p className="text-gray-500 text-sm font-medium leading-relaxed mb-10">{selectedItem.description}</p>

                  <div className="flex items-center justify-between gap-6 pt-4 border-t border-gray-50">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-1">Total Price</span>
                      <span className="text-3xl font-black text-gray-900">{selectedItem.price}</span>
                    </div>
                    <button onClick={() => setSelectedItem(null)} className="flex-1 py-6 text-white font-black text-xs uppercase tracking-widest rounded-3xl shadow-2xl transition-all hover:scale-105 flex items-center justify-center gap-3" style={{ backgroundColor: themeColor }}>
                      Back to Menu <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Floating Dock */}
        <div className="fixed bottom-8 inset-x-0 flex justify-center px-6 z-50">
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="bg-white/70 backdrop-blur-3xl p-2 rounded-[3rem] flex items-center gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 w-full max-w-sm overflow-x-auto no-scrollbar scroll-smooth">
            <button onClick={() => setActiveCategory("all")} className={cn("flex-shrink-0 flex items-center gap-2 px-6 py-4 rounded-[2.5rem] transition-all", activeCategory === "all" ? "text-white shadow-xl scale-105" : "text-gray-400 hover:bg-gray-50")} style={activeCategory === "all" ? { backgroundColor: themeColor } : {}}>
              <LayoutGrid className="h-4 w-4" /> <span className="text-[10px] font-black uppercase tracking-widest">All</span>
            </button>
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={cn("flex-shrink-0 flex items-center gap-2 px-6 py-4 rounded-[2.5rem] transition-all", activeCategory === cat.id ? "text-white shadow-xl scale-105" : "text-gray-400 hover:bg-gray-50")} style={activeCategory === cat.id ? { backgroundColor: themeColor } : {}}>
                <Utensils className="h-4 w-4" /> <span className="text-[10px] font-black uppercase tracking-widest">{cat.name}</span>
              </button>
            ))}
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="mt-10 py-20 px-8 text-center bg-gray-50/50 rounded-t-[4rem]">
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mb-4">Powered by Digital Excellence</p>
        </footer>
      </div>
    </div>
  );
}
