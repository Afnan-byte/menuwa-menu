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
  LayoutGrid,
  X,
  ArrowRight,
  MessageCircle,
  Clock,
  ChevronRight,
  Star,
  Flame,
  Leaf,
  Info,
  Share2,
  Heart
} from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
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
  dietaryType?: "veg" | "non-veg" | "none";
  isPopular?: boolean;
}

interface Restaurant {
  restaurantName: string;
  logoUrl?: string;
  bannerUrl?: string;
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
  
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 300], [0, 100]);
  const heroScale = useTransform(scrollY, [0, 300], [1.1, 1]);

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
      
      const fetchedItems = itemSnap.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data()
      } as MenuItem));
      
      setItems(fetchedItems);
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
          <div className="absolute inset-0 border-[6px] border-gray-100 rounded-full" />
          <div className="absolute inset-0 border-[6px] border-t-[#196F03] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
             <Utensils className="h-8 w-8 text-[#196F03] animate-pulse" />
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

  const heroImage = restaurant?.bannerUrl || items[0]?.imageUrl || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070";

  return (
    <div 
      className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-[#196F03]/10 pb-32"
      style={{ "--brand-primary": themeColor } as any}
      ref={containerRef}
    >
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative bg-white shadow-[0_0_150px_rgba(0,0,0,0.03)]">
        
        {/* Cinematic Parallax Hero */}
        <header className="relative h-[450px] w-full overflow-hidden">
          <motion.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0">
            <Image 
              src={heroImage} 
              alt="Hero" 
              fill 
              className="object-cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-white"></div>
          
          <div className="absolute top-10 right-6 flex gap-2">
            <button className="h-10 w-10 bg-white/20 backdrop-blur-xl rounded-full border border-white/20 flex items-center justify-center text-white">
              <Share2 className="h-4 w-4" />
            </button>
            <button className="h-10 w-10 bg-white/20 backdrop-blur-xl rounded-full border border-white/20 flex items-center justify-center text-white">
              <Heart className="h-4 w-4" />
            </button>
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 px-8 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="h-32 w-32 rounded-[3.5rem] p-2 bg-white/30 backdrop-blur-3xl shadow-2xl mb-8 relative group"
            >
              <div className="relative w-full h-full rounded-[3rem] overflow-hidden bg-white border border-white/50">
                <Image src={restaurant?.logoUrl || "/logo.svg"} alt="Logo" fill className="object-cover" />
              </div>
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none"
            >
              {restaurant?.restaurantName || "Menu"}
            </motion.h1>
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-3 mt-6"
            >
              <div className="flex items-center gap-1.5 px-4 py-1.5 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] rounded-full border border-gray-50">
                <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-[11px] font-bold text-gray-900 tracking-tight">4.9 Rare Find</span>
              </div>
              <div className="h-1.5 w-1.5 bg-gray-200 rounded-full" />
              <div className="flex items-center gap-1.5 px-4 py-1.5 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] rounded-full border border-gray-50">
                <Clock className="h-3.5 w-3.5 text-[#196F03]" />
                <span className="text-[11px] font-bold text-gray-900 tracking-tight">Fast Delivery</span>
              </div>
            </motion.div>
          </div>
        </header>

        {/* Menu Content */}
        <div className="px-6 py-16 space-y-20">
          {/* Categories Sections */}
          {(activeCategory === "all" ? categories : categories.filter(c => c.id === activeCategory)).map((cat, catIdx) => {
            const categoryItems = items.filter(item => item.categoryId === cat.id);
            if (categoryItems.length === 0) return null;

            return (
              <motion.section 
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="space-y-8"
              >
                <div className="flex items-baseline justify-between px-2 border-b border-gray-50 pb-4">
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-4">
                    {cat.name}
                  </h2>
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{categoryItems.length} Selection</span>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-10">
                  {categoryItems.map((item, idx) => {
                    const isFeatured = idx === 0 && activeCategory !== "all";
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => setSelectedItem(item)}
                        className={cn(
                          "group cursor-pointer relative",
                          isFeatured ? "col-span-2" : "col-span-1"
                        )}
                      >
                        <div className={cn(
                          "relative rounded-[4rem] overflow-hidden shadow-2xl bg-white border border-gray-100 transition-all duration-500",
                          isFeatured ? "aspect-[16/10]" : "aspect-[4/5]"
                        )}>
                          <Image 
                            src={item.imageUrl} 
                            alt={item.name} 
                            fill 
                            className="object-cover transition-transform duration-1000 group-hover:scale-110" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent"></div>
                          
                          {/* Top Left Icons (Dietary) */}
                          <div className="absolute top-5 left-5 flex flex-col gap-2 z-20">
                            {item.dietaryType === "veg" && (
                              <div className="bg-[#196F03] p-2.5 rounded-2xl shadow-lg border border-white/20">
                                <Leaf className="h-4 w-4 text-white fill-white" />
                              </div>
                            )}
                            {item.dietaryType === "non-veg" && (
                              <div className="bg-red-500 p-2.5 rounded-2xl shadow-lg border border-white/20">
                                <Flame className="h-4 w-4 text-white fill-white" />
                              </div>
                            )}
                          </div>

                          {/* Top Right Price Badge (Purple Circle) */}
                          <div className="absolute top-5 right-5 z-20 h-12 w-12 bg-[#7C5CFC] rounded-full flex items-center justify-center shadow-[0_10px_20px_rgba(124,92,252,0.3)] border border-white/20">
                            <span className="text-[11px] font-extrabold text-white tracking-tighter">
                               {item.price.replace(/[^0-9.]/g, '')}
                            </span>
                          </div>

                          {/* Info Overlay (Bottom) */}
                          <div className="absolute bottom-8 left-8 right-8">
                            <h3 className={cn(
                              "text-white font-extrabold tracking-tight line-clamp-1 mb-1 lowercase",
                              isFeatured ? "text-3xl" : "text-lg"
                            )}>{item.name}</h3>
                            <div className="flex items-center gap-1.5 opacity-80">
                              <span className="text-[9px] font-bold text-white uppercase tracking-widest">Discover More</span>
                              <ArrowRight className="h-2.5 w-2.5 text-white" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
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
            className="bg-white/90 backdrop-blur-3xl p-2 rounded-[3.5rem] flex items-center gap-2 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] border border-white/50 w-full max-w-sm overflow-x-auto no-scrollbar scroll-smooth"
          >
            <button 
              onClick={() => setActiveCategory("all")} 
              className={cn(
                "flex-shrink-0 flex items-center gap-3 px-8 py-4 rounded-[3rem] transition-all", 
                activeCategory === "all" ? "text-white shadow-xl scale-105" : "text-gray-400 hover:bg-gray-50"
              )} 
              style={activeCategory === "all" ? { backgroundColor: themeColor } : {}}
            >
              <LayoutGrid className="h-4 w-4" /> 
              <span className="text-[10px] font-bold uppercase tracking-widest">Catalogue</span>
            </button>
            {categories.map((cat) => (
              <button 
                key={cat.id} 
                onClick={() => setActiveCategory(cat.id)} 
                className={cn(
                  "flex-shrink-0 flex items-center gap-3 px-8 py-4 rounded-[3rem] transition-all", 
                  activeCategory === cat.id ? "text-white shadow-xl scale-105" : "text-gray-400 hover:bg-gray-50"
                )} 
                style={activeCategory === cat.id ? { backgroundColor: themeColor } : {}}
              >
                <Utensils className="h-4 w-4" /> 
                <span className="text-[10px] font-bold uppercase tracking-widest">{cat.name}</span>
              </button>
            ))}
          </motion.div>
        </div>

        {/* Item Details Immersive Modal */}
        <AnimatePresence>
          {selectedItem && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedItem(null)} className="absolute inset-0 bg-black/80 backdrop-blur-3xl" />
              <motion.div
                layoutId={selectedItem.id}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="relative w-full max-w-md bg-white rounded-t-[5rem] sm:rounded-[5rem] overflow-hidden shadow-2xl h-[95vh] flex flex-col"
              >
                <div className="absolute top-8 inset-x-0 flex justify-center z-[110]">
                   <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                </div>
                
                <button 
                  onClick={() => setSelectedItem(null)} 
                  className="absolute top-10 right-10 z-[110] h-14 w-14 bg-white/20 backdrop-blur-2xl rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white hover:text-black transition-all"
                >
                  <X className="h-6 w-6" />
                </button>

                <div className="relative h-[45vh] w-full shrink-0 group">
                  <Image src={selectedItem.imageUrl} alt={selectedItem.name} fill className="object-cover transition-transform duration-[5s] group-hover:scale-125" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                  <div className="absolute bottom-10 left-10 flex gap-3">
                     {selectedItem.dietaryType === "veg" && (
                       <div className="px-5 py-3 bg-[#196F03] text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl shadow-xl flex items-center gap-2 border border-green-400">
                         <Leaf className="h-4 w-4 fill-white" /> Vegetarian
                       </div>
                     )}
                     {selectedItem.dietaryType === "non-veg" && (
                       <div className="px-5 py-3 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl shadow-xl flex items-center gap-2 border border-red-400">
                         <Flame className="h-4 w-4 fill-white" /> Non-Veg
                       </div>
                     )}
                  </div>
                </div>

                <div className="px-12 pb-12 -mt-20 relative z-10 bg-white rounded-t-[5rem] flex-1 flex flex-col">
                  <div className="pt-12 space-y-8 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="px-6 py-2.5 bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-[0.25em] rounded-full border border-gray-100">
                        {categories.find(c => c.id === selectedItem.categoryId)?.name || "Signature"}
                      </span>
                    </div>

                    <h2 className="text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">{selectedItem.name}</h2>
                    <p className="text-gray-500 text-lg font-medium leading-relaxed opacity-80">{selectedItem.description}</p>
                  </div>

                  <div className="pt-10 space-y-8">
                    <div className="flex items-end justify-between px-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em] mb-3">Total Value</span>
                        <span className="text-5xl font-extrabold text-gray-900 tracking-tight leading-none">{selectedItem.price}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-4">
                       <button 
                         onClick={() => setSelectedItem(null)}
                         className="col-span-1 h-20 bg-gray-50 text-gray-300 rounded-[2.5rem] flex items-center justify-center hover:bg-gray-100 transition-all"
                       >
                         <ArrowRight className="h-6 w-6 rotate-180" />
                       </button>
                       {restaurant?.whatsapp && (
                         <button 
                           onClick={() => handleWhatsAppOrder(selectedItem)}
                           className="col-span-4 h-20 text-white font-bold text-xs uppercase tracking-[0.3em] rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-4 group"
                           style={{ backgroundColor: themeColor }}
                         >
                           <MessageCircle className="h-5 w-5 group-hover:animate-bounce" />
                           Order via WhatsApp
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
        <footer className="mt-20 py-32 px-10 text-center bg-gray-50/80 rounded-t-[5rem] border-t border-gray-100">
          <div className="mb-12">
            <Image src="/logo.svg" alt="Menuvo" width={140} height={60} className="mx-auto grayscale opacity-40" />
          </div>
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.5em] mb-6">Designed by Menuvo Digital</p>
          <div className="h-1 w-12 bg-gray-200 mx-auto rounded-full" />
        </footer>
      </div>
    </div>
  );
}
