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
  Utensils
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
  phone?: string;
  whatsapp?: string;
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
        <Loader2 className="h-10 w-10 animate-spin text-brand-green" />
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
  return (
    <div className="min-h-screen bg-background-soft font-sans pb-20">
      {/* Container for the entire page to allow centered layout on desktop */}
      <div className="max-w-screen-2xl mx-auto min-h-screen flex flex-col bg-white lg:bg-background-soft shadow-2xl lg:shadow-none relative overflow-hidden">
        
        {/* Header / Banner - Re-styled for better desktop presence */}
        <div className="bg-primary text-white p-8 md:p-16 rounded-b-[2.5rem] md:rounded-b-[4rem] shadow-xl relative overflow-hidden">
          {/* Decorative Background Patterns */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-green/10 blur-[100px] rounded-full translate-x-1/4 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-green/5 blur-[100px] rounded-full -translate-x-1/4 translate-y-1/4"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center py-6">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="group cursor-pointer"
            >
              {restaurant.logoUrl ? (
                <div className="h-28 w-28 md:h-36 md:w-36 rounded-[2.5rem] mb-8 relative overflow-hidden bg-white p-5 shadow-2xl border-8 border-white/5 group-hover:scale-105 transition-transform">
                  <div className="relative w-full h-full">
                    <Image 
                      src={restaurant.logoUrl} 
                      alt={restaurant.restaurantName} 
                      fill 
                      className="object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="h-24 w-24 md:h-32 md:w-32 rounded-[2.5rem] bg-white/10 flex items-center justify-center mb-8 border-4 border-dashed border-white/20 group-hover:bg-white/15 transition-all">
                  <Utensils className="h-12 w-12 text-white/50" />
                </div>
              )}
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight mb-4">
              {restaurant.restaurantName}
            </h1>
            <p className="text-white/40 text-sm md:text-base max-w-xl font-medium leading-relaxed px-6">
              {restaurant.description || "Indulge in a curated selection of our finest dishes, prepared with passion and served with a modern digital touch."}
            </p>
            
            <div className="mt-10 flex gap-4">
              <div className="px-5 py-2 bg-white/5 rounded-full border border-white/10 text-[10px] md:text-xs font-black uppercase tracking-widest">
                Digital Menu v2.0
              </div>
              <div className="px-5 py-2 bg-brand-green/20 text-brand-green rounded-full border border-brand-green/20 text-[10px] md:text-xs font-black uppercase tracking-widest">
                Available Now
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Category Navigation */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-2xl z-30 py-6 px-4 md:px-10 shadow-sm border-b border-gray-100 flex justify-center">
          <div className="flex gap-3 overflow-x-auto no-scrollbar max-w-full lg:justify-center">
            <button
              onClick={() => setActiveCategory("all")}
              className={cn(
                "px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all whitespace-nowrap",
                activeCategory === "all" 
                  ? "bg-brand-green text-white shadow-xl shadow-brand-green/20 scale-105" 
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              )}
            >
              All Delicacies
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-8 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all whitespace-nowrap",
                  activeCategory === cat.id 
                    ? "bg-brand-green text-white shadow-xl shadow-brand-green/20 scale-105" 
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid - Optimized for Laptop/Desktop */}
        <div className="flex-1 px-6 md:px-10 py-12 md:py-20 lg:max-w-7xl lg:mx-auto w-full">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px flex-1 bg-gray-100"></div>
            <h2 className="text-xs font-black text-gray-300 uppercase tracking-[0.4em]">Our Selection</h2>
            <div className="h-px flex-1 bg-gray-100"></div>
          </div>

          <AnimatePresence mode="popLayout">
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10"
            >
              {filteredItems.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={item.id}
                  className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100/50 flex flex-col md:flex-row gap-6 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 group/item"
                >
                  <div className="h-40 w-full md:h-32 md:w-32 rounded-3xl bg-background-soft overflow-hidden flex-shrink-0 relative">
                    {item.imageUrl ? (
                      <Image 
                        src={item.imageUrl} 
                        alt={item.name} 
                        fill 
                        className="object-cover group-hover/item:scale-110 transition-transform duration-700" 
                        sizes="(max-width: 768px) 100vw, 128px"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-200">
                        <Utensils className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent"></div>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-black text-primary text-lg md:text-base tracking-tight group-hover/item:text-brand-green transition-colors leading-tight">
                          {item.name}
                        </h3>
                        <span className="font-black text-brand-green text-sm bg-brand-green/5 px-3 py-1 rounded-lg">
                          ${item.price}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 font-medium line-clamp-3 leading-relaxed mb-4">
                        {item.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2 flex-wrap">
                        {item.tags?.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[8px] font-black uppercase tracking-wider px-3 py-1 bg-gray-50 text-gray-400 rounded-lg">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <motion.button 
                        whileTap={{ scale: 0.9 }}
                        className="h-10 w-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/10 hover:bg-brand-green transition-all group/btn"
                      >
                        <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredItems.length === 0 && (
            <div className="py-32 text-center">
              <p className="text-gray-300 font-black text-lg tracking-tight uppercase italic opacity-50">Nothing found in this section</p>
            </div>
          )}
        </div>

        {/* Laptop View Footer */}
        <footer className="py-24 px-10 text-center border-t border-gray-100 bg-white lg:bg-background-soft">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-1 w-1 rounded-full bg-gray-200"></div>
            <div className="h-1 w-20 bg-gray-100 rounded-full"></div>
            <div className="h-1 w-1 rounded-full bg-gray-200"></div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs font-black text-primary tracking-[0.2em] uppercase">Powered by Menuvo</p>
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Premium Digital Dining Experience</p>
          </div>
        </footer>

        {/* Floating Action Buttons */}
        <div className="fixed bottom-10 right-10 z-40 flex flex-col gap-5">
          <motion.a 
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.9 }}
            href={`tel:${restaurant.phone || "#"}`}
            className="h-14 w-14 bg-white text-primary rounded-[1.5rem] shadow-2xl border border-gray-100 flex items-center justify-center group"
          >
            <Phone className="h-6 w-6 group-hover:rotate-12 transition-transform" />
          </motion.a>
          <motion.a 
            whileHover={{ scale: 1.1, y: -5, rotate: 3 }}
            whileTap={{ scale: 0.9 }}
            href={`https://wa.me/${restaurant.whatsapp || "#"}`}
            target="_blank"
            className="h-20 w-20 bg-brand-green text-white rounded-[2rem] shadow-2xl shadow-brand-green/30 flex items-center justify-center relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 animate-ping opacity-20 group-hover:animate-none"></div>
            <MessageCircle className="h-10 w-10 relative z-10" />
          </motion.a>
        </div>
      </div>
    </div>
  );
}
