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
  ArrowRight,
  MessageCircle,
  Clock,
  ChevronRight,
  Star
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
  tags?: string[];
}

interface Restaurant {
  restaurantName: string;
  logoUrl?: string;
  description?: string;
  themeColor?: string;
  whatsapp?: string;
  phone?: string;
}

export default function PublicMenuPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const themeColor = restaurant?.themeColor || "#196F03";

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
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 border-4 border-gray-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-brand-green rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
             <Utensils className="h-8 w-8 text-brand-green animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const handleWhatsAppOrder = (item?: MenuItem) => {
    if (!restaurant?.whatsapp) return;
    const text = item 
      ? `Hello! I would like to order: ${item.name} (${item.price}).`
      : `Hello! I'm viewing your menu and would like to place an order.`;
    window.open(`https://wa.me/${restaurant.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div 
      className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-[#196F03]/10 pb-32"
      style={{ "--brand-primary": themeColor } as any}
    >
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative bg-white shadow-[0_0_100px_rgba(0,0,0,0.02)]">
        
        {/* Immersive Header */}
        <header className="relative h-72 w-full overflow-hidden group">
          <Image 
            src={items[0]?.imageUrl || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070"} 
            alt="Hero" 
            fill 
            className="object-cover scale-110 blur-[2px] transition-transform duration-[2s] group-hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-white"></div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-10 px-8 text-center">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="h-32 w-32 rounded-[2.5rem] p-1.5 bg-white shadow-2xl mb-6 relative overflow-hidden"
            >
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-gray-50 border border-gray-100">
                <Image src={restaurant?.logoUrl || "/logo.svg"} alt="Logo" fill className="object-cover" />
              </div>
            </motion.div>
            <motion.h1 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-black text-gray-900 tracking-tighter"
            >
              {restaurant?.restaurantName || "Menu"}
            </motion.h1>
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4 mt-4"
            >
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full border border-gray-100 shadow-sm">
                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                <span className="text-[10px] font-black text-gray-900">4.8 (500+)</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full border border-gray-100 shadow-sm">
                <Clock className="h-3 w-3 text-[#196F03]" />
                <span className="text-[10px] font-black text-gray-900">Open Now</span>
              </div>
            </motion.div>
          </div>
        </header>

        {/* Menu Grid */}
        <div className="px-6 py-12 space-y-12">
          {/* Categories Sections */}
          {(activeCategory === "all" ? categories : categories.filter(c => c.id === activeCategory)).map((cat, catIdx) => {
            const categoryItems = items.filter(item => item.categoryId === cat.id);
            if (categoryItems.length === 0) return null;

            return (
              <motion.section 
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">{cat.name}</h2>
                  <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{categoryItems.length} Items</span>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {categoryItems.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => setSelectedItem(item)}
                      className="group cursor-pointer"
                    >
                      <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-50 bg-white">
                        <Image 
                          src={item.imageUrl} 
                          alt={item.name} 
                          fill 
                          className="object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                        
                        {/* Price Tag */}
                        <div 
                          className="absolute top-4 right-4 z-10 px-3 py-1.5 backdrop-blur-md rounded-2xl border border-white/10 shadow-lg"
                          style={{ backgroundColor: `${themeColor}CC` }}
                        >
                          <span className="text-[10px] font-black text-white">{item.price}</span>
                        </div>

                        {/* Bottom Info */}
                        <div className="absolute bottom-5 left-5 right-5">
                          <h3 className="text-white text-xs font-black tracking-tight mb-1 line-clamp-1">{item.name}</h3>
                          <div className="flex items-center gap-1">
                            <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">Details</span>
                            <ChevronRight className="h-2 w-2 text-white/50" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            );
          })}
        </div>

        {/* Floating Category Dock */}
        <div className="fixed bottom-10 inset-x-0 flex justify-center px-6 z-[60]">
          <motion.div 
            initial={{ y: 100 }} 
            animate={{ y: 0 }}
            className="bg-white/80 backdrop-blur-2xl p-2 rounded-[3rem] flex items-center gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/40 w-full max-w-sm overflow-x-auto no-scrollbar"
          >
            <button 
              onClick={() => setActiveCategory("all")} 
              className={cn(
                "flex-shrink-0 flex items-center gap-3 px-8 py-4 rounded-[2.5rem] transition-all", 
                activeCategory === "all" ? "text-white shadow-xl scale-105" : "text-gray-400 hover:bg-gray-50"
              )} 
              style={activeCategory === "all" ? { backgroundColor: themeColor } : {}}
            >
              <LayoutGrid className="h-4 w-4" /> 
              <span className="text-[10px] font-black uppercase tracking-widest">All</span>
            </button>
            {categories.map((cat) => (
              <button 
                key={cat.id} 
                onClick={() => setActiveCategory(cat.id)} 
                className={cn(
                  "flex-shrink-0 flex items-center gap-3 px-8 py-4 rounded-[2.5rem] transition-all", 
                  activeCategory === cat.id ? "text-white shadow-xl scale-105" : "text-gray-400 hover:bg-gray-50"
                )} 
                style={activeCategory === cat.id ? { backgroundColor: themeColor } : {}}
              >
                <Utensils className="h-4 w-4" /> 
                <span className="text-[10px] font-black uppercase tracking-widest">{cat.name}</span>
              </button>
            ))}
          </motion.div>
        </div>

        {/* Item Details Immersive Modal */}
        <AnimatePresence>
          {selectedItem && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedItem(null)} className="absolute inset-0 bg-black/70 backdrop-blur-2xl" />
              <motion.div
                layoutId={selectedItem.id}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="relative w-full max-w-md bg-white rounded-t-[4rem] sm:rounded-[4rem] overflow-hidden shadow-2xl h-[95vh] flex flex-col"
              >
                <button 
                  onClick={() => setSelectedItem(null)} 
                  className="absolute top-10 right-10 z-[110] h-14 w-14 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white hover:text-black transition-all"
                >
                  <X className="h-6 w-6" />
                </button>

                <div className="relative h-[50vh] w-full shrink-0">
                  <Image src={selectedItem.imageUrl} alt={selectedItem.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                </div>

                <div className="px-10 pb-12 -mt-20 relative z-10 bg-white rounded-t-[4rem] flex-1 flex flex-col">
                  <div className="pt-10 space-y-6 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="px-5 py-2 bg-[#196F03]/10 text-[#196F03] text-[9px] font-black uppercase tracking-[0.25em] rounded-full">
                        {categories.find(c => c.id === selectedItem.categoryId)?.name || "Signature"}
                      </span>
                      {selectedItem.tags && selectedItem.tags.length > 0 && (
                        <div className="flex gap-2">
                           {selectedItem.tags.map(t => (
                             <span key={t} className="text-[8px] font-black text-gray-300 uppercase tracking-widest">{t}</span>
                           ))}
                        </div>
                      )}
                    </div>

                    <h2 className="text-5xl font-black text-gray-900 tracking-tighter leading-none">{selectedItem.name}</h2>
                    <p className="text-gray-500 text-base font-medium leading-relaxed">{selectedItem.description}</p>
                  </div>

                  <div className="pt-10 space-y-6">
                    <div className="flex items-end justify-between">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-2">Investment</span>
                        <span className="text-5xl font-black text-gray-900 tracking-tighter">{selectedItem.price}</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-500 font-bold text-xs">
                        <CheckCircle2 className="h-4 w-4" /> Freshly Prepared
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <button 
                         onClick={() => setSelectedItem(null)}
                         className="py-6 bg-gray-50 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] rounded-[2rem] hover:bg-gray-100 transition-all"
                       >
                         Back
                       </button>
                       {restaurant?.whatsapp && (
                         <button 
                           onClick={() => handleWhatsAppOrder(selectedItem)}
                           className="py-6 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-[2rem] shadow-2xl transition-all hover:scale-105 flex items-center justify-center gap-3"
                           style={{ backgroundColor: themeColor }}
                         >
                           <MessageCircle className="h-4 w-4" />
                           Order Now
                         </button>
                       )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-20 py-24 px-8 text-center bg-gray-50/50 rounded-t-[4rem]">
          <div className="mb-10 opacity-30">
            <Image src="/logo.svg" alt="Menuvo" width={100} height={40} className="mx-auto grayscale" />
          </div>
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Crafted by Menuvo Digital</p>
        </footer>
      </div>
    </div>
  );
}

function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}
