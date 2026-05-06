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
  X,
  Plus,
  ArrowRight,
  Clock,
  ThumbsUp,
  ShieldCheck,
  Heart
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
      {/* Dynamic Brand Colors Integration */}
      <style jsx global>{`
        :root {
          --brand-primary: ${themeColor};
          --brand-light: ${themeColor}15;
          --brand-soft: ${themeColor}08;
        }
      `}</style>

      <div className="max-w-md mx-auto min-h-screen flex flex-col relative bg-white shadow-[0_0_100px_rgba(0,0,0,0.05)]">
        
        {/* Brand Immersive Header */}
        <header className="relative pt-20 pb-12 px-8 flex flex-col items-center overflow-hidden">
           {/* Abstract Brand Shapes */}
           <div className="absolute top-0 right-0 w-64 h-64 blur-3xl opacity-10 rounded-full translate-x-32 -translate-y-32" style={{ backgroundColor: themeColor }}></div>
           <div className="absolute top-0 left-0 w-48 h-48 blur-3xl opacity-5 rounded-full -translate-x-24 -translate-y-24" style={{ backgroundColor: themeColor }}></div>
           
           <motion.div 
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="relative h-28 w-28 rounded-[3rem] p-2 bg-white shadow-2xl mb-6 group cursor-pointer border border-gray-50"
           >
              <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-gray-50">
                 <Image 
                   src={restaurant?.logoUrl || "/logo.svg"} 
                   alt="Logo" 
                   fill 
                   className="object-cover transition-transform duration-700 group-hover:scale-110" 
                 />
              </div>
              <div className="absolute -bottom-2 -right-2 h-10 w-10 text-white rounded-2xl flex items-center justify-center shadow-xl border-4 border-white transition-transform group-hover:rotate-12" style={{ backgroundColor: themeColor }}>
                 <ShieldCheck className="h-5 w-5" />
              </div>
           </motion.div>

           <div className="text-center relative z-10">
              <motion.h1 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-4xl font-black text-gray-900 tracking-tighter"
              >
                 {restaurant?.restaurantName || "Menuvo"}
              </motion.h1>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: 40 }}
                className="h-1.5 mx-auto rounded-full mt-3 mb-4"
                style={{ backgroundColor: themeColor }}
              />
              <motion.p 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-gray-400 text-[10px] uppercase font-black tracking-[0.4em] px-6 py-2 rounded-2xl border border-gray-100 bg-gray-50/50"
              >
                 Established with Passion
              </motion.p>
           </div>
        </header>

        {/* Brand-Injected 2-Column Grid */}
        <div className="px-6 grid grid-cols-2 gap-x-5 gap-y-16 pt-6 pb-20">
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
                  <div className="relative w-full h-72 rounded-[3rem] overflow-hidden shadow-2xl group-hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] transition-all duration-700 border border-gray-50">
                    <Image 
                      src={item.imageUrl || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070"} 
                      alt={item.name} 
                      fill 
                      className="object-cover transition-transform duration-1000 group-hover:scale-125"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                    
                    {/* Brand Themed Price Badge */}
                    <div className="absolute top-5 right-5 z-10 px-4 py-1.5 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl transition-all group-hover:-translate-y-1" style={{ backgroundColor: `${themeColor}cc` }}>
                       <span className="text-[11px] font-black text-white">{item.price}</span>
                    </div>

                    <div className="absolute bottom-6 left-6 right-6">
                       <p className="text-white/40 text-[8px] font-black uppercase tracking-widest mb-1 group-hover:text-white/60 transition-colors">House Special</p>
                       <h3 className="text-white text-sm font-black tracking-tight line-clamp-1 group-hover:translate-x-1 transition-transform">{item.name}</h3>
                    </div>

                    <div 
                      className="absolute bottom-5 right-5 h-9 w-9 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-50 group-hover:scale-100 shadow-lg text-white"
                      style={{ backgroundColor: themeColor }}
                    >
                       <Plus className="h-5 w-5" />
                    </div>
                  </div>
                  
                  {/* Invisible Brand Shadow */}
                  <div className="absolute -inset-2 rounded-[3.5rem] opacity-0 group-hover:opacity-10 blur-3xl transition-all duration-700 -z-10" style={{ backgroundColor: themeColor }}></div>
               </motion.div>
             ))}
           </AnimatePresence>
        </div>

        {/* Item Details Immersive Modal */}
        <AnimatePresence>
          {selectedItem && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setSelectedItem(null)}
                 className="absolute inset-0 bg-black/80 backdrop-blur-3xl"
               />
               <motion.div 
                 layoutId={selectedItem.id}
                 initial={{ y: "100%" }}
                 animate={{ y: 0 }}
                 exit={{ y: "100%" }}
                 transition={{ type: "spring", damping: 25, stiffness: 200 }}
                 className="relative w-full max-w-md bg-white rounded-t-[5rem] sm:rounded-[5rem] overflow-hidden shadow-2xl h-[95vh] sm:h-auto"
               >
                  <button 
                    onClick={() => setSelectedItem(null)}
                    className="absolute top-10 right-10 z-50 h-14 w-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                  >
                     <X className="h-6 w-6" />
                  </button>

                  <div className="relative h-[50vh] w-full">
                     <Image src={selectedItem.imageUrl} alt={selectedItem.name} fill className="object-cover" />
                     <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                  </div>

                  <div className="p-12 -mt-24 relative z-10 bg-white rounded-t-[5rem]">
                     <div className="flex items-center justify-between mb-6">
                        <span className="px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl text-white shadow-lg" style={{ backgroundColor: themeColor }}>
                           {categories.find(c => c.id === selectedItem.categoryId)?.name || "Signature"}
                        </span>
                        <div className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-gray-50 border border-gray-100">
                           <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                           <span className="text-[11px] font-black text-gray-900">4.9 / 5.0</span>
                        </div>
                     </div>

                     <h2 className="text-5xl font-black text-gray-900 tracking-tighter mb-6">{selectedItem.name}</h2>
                     <p className="text-gray-400 text-sm font-medium leading-relaxed mb-10 pr-4">
                        {selectedItem.description || "Indulge in a masterfully curated dish where every ingredient tells a story of quality, tradition, and culinary innovation."}
                     </p>

                     <div className="grid grid-cols-2 gap-6 mb-12">
                        <div className="p-7 rounded-[3rem] border border-gray-100 flex flex-col items-center text-center gap-3" style={{ backgroundColor: `${themeColor}05` }}>
                           <Clock className="h-6 w-6" style={{ color: themeColor }} />
                           <span className="text-xs font-black text-gray-900 uppercase tracking-widest">15 Mins</span>
                        </div>
                        <div className="p-7 rounded-[3rem] border border-gray-100 flex flex-col items-center text-center gap-3" style={{ backgroundColor: `${themeColor}05` }}>
                           <Heart className="h-6 w-6" style={{ color: themeColor }} />
                           <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Pure Love</span>
                        </div>
                     </div>

                     <div className="flex items-center justify-between gap-8">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Premium Price</span>
                           <span className="text-4xl font-black text-gray-900">{selectedItem.price}</span>
                        </div>
                        <button 
                          onClick={() => setSelectedItem(null)}
                          className="flex-1 py-7 text-white font-black text-xs uppercase tracking-widest rounded-3xl shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-4"
                          style={{ backgroundColor: themeColor }}
                        >
                           Go Back
                           <ArrowRight className="h-5 w-5" />
                        </button>
                     </div>
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Brand-Themed Floating Dock */}
        <div className="fixed bottom-10 inset-x-0 flex justify-center px-8 z-50">
           <motion.div 
             initial={{ y: 100 }}
             animate={{ y: 0 }}
             className="bg-white/90 backdrop-blur-3xl p-3 rounded-[3.5rem] flex items-center gap-3 shadow-[0_30px_100px_rgba(0,0,0,0.15)] border border-white w-full max-w-md overflow-x-auto no-scrollbar scroll-smooth"
           >
              <button 
                onClick={() => setActiveCategory("all")}
                className={cn(
                  "flex-shrink-0 flex items-center gap-3 px-8 py-5 rounded-[2.5rem] transition-all",
                  activeCategory === "all" 
                    ? "text-white shadow-2xl scale-105" 
                    : "text-gray-400 hover:bg-gray-50"
                )}
                style={activeCategory === "all" ? { backgroundColor: themeColor } : {}}
              >
                 <LayoutGrid className="h-5 w-5" />
                 <span className="text-[11px] font-black uppercase tracking-widest">Everything</span>
              </button>
              
              {categories.map((cat) => (
                <button 
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex-shrink-0 flex items-center gap-3 px-8 py-5 rounded-[2.5rem] transition-all",
                    activeCategory === cat.id 
                      ? "text-white shadow-2xl scale-105" 
                      : "text-gray-400 hover:bg-gray-50"
                  )}
                  style={activeCategory === cat.id ? { backgroundColor: themeColor } : {}}
                >
                   <Utensils className="h-5 w-5" />
                   <span className="text-[11px] font-black uppercase tracking-widest">{cat.name}</span>
                </button>
              ))}
           </motion.div>
        </div>

        {/* Brand-Centric Footer */}
        <footer className="mt-20 py-32 px-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gray-50/50 -z-10"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 blur-[100px] opacity-10 rounded-full" style={{ backgroundColor: themeColor }}></div>
            
            <div className="relative z-10 space-y-8">
               <div className="h-16 w-16 mx-auto rounded-2xl opacity-20 grayscale hover:grayscale-0 transition-all duration-700" style={{ backgroundColor: themeColor }}></div>
               <div>
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-4">A Premium Dining Experience by</p>
                  <h2 className="text-3xl font-black tracking-tighter text-gray-900 uppercase opacity-10">{restaurant?.restaurantName || "Menuvo"}</h2>
               </div>
               <div className="flex items-center justify-center gap-4 text-gray-300">
                  <div className="h-px w-8 bg-gray-200"></div>
                  <Star className="h-3 w-3 fill-gray-200" />
                  <div className="h-px w-8 bg-gray-200"></div>
               </div>
            </div>
        </footer>

      </div>
    </div>
  );
}
