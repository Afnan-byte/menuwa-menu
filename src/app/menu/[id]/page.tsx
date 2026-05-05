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
    <div className="min-h-screen bg-background-soft flex flex-col max-w-md mx-auto relative shadow-2xl overflow-hidden font-sans">
      {/* Header / Banner */}
      <div className="bg-primary text-white p-8 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-green/20 blur-3xl rounded-full translate-x-10 -translate-y-10"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-green/10 blur-3xl rounded-full -translate-x-10 translate-y-10"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center py-4">
          {restaurant.logoUrl ? (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="h-24 w-24 rounded-3xl mb-6 relative overflow-hidden bg-white p-4 shadow-2xl border-4 border-white/10"
            >
              <div className="relative w-full h-full">
                <Image 
                  src={restaurant.logoUrl} 
                  alt={restaurant.restaurantName} 
                  fill 
                  className="object-contain"
                />
              </div>
            </motion.div>
          ) : (
            <div className="h-20 w-20 rounded-3xl bg-white/10 flex items-center justify-center mb-6 border-2 border-dashed border-white/20">
              <Utensils className="h-10 w-10 text-white/50" />
            </div>
          )}
          <h1 className="text-3xl font-black tracking-tight">{restaurant.restaurantName}</h1>
          <p className="text-white/50 text-xs mt-2 max-w-[200px] font-medium leading-relaxed">
            {restaurant.description || "Welcome to our digital menu!"}
          </p>
        </div>
      </div>

      {/* Category Navigation (Sticky) */}
      <div className="sticky top-0 bg-white/70 backdrop-blur-xl z-30 py-4 px-4 shadow-sm border-b border-gray-100">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide no-scrollbar">
          <button
            onClick={() => setActiveCategory("all")}
            className={cn(
              "px-6 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all whitespace-nowrap",
              activeCategory === "all" ? "bg-brand-green text-white shadow-lg shadow-brand-green/20" : "bg-gray-100 text-gray-500"
            )}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-6 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all whitespace-nowrap",
                activeCategory === cat.id ? "bg-brand-green text-white shadow-lg shadow-brand-green/20" : "bg-gray-100 text-gray-500"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 px-4 py-8 space-y-6">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={item.id}
              className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100/50 flex gap-4 hover:shadow-md transition-all group/item"
            >
              <div className="h-28 w-28 rounded-2xl bg-background-soft overflow-hidden flex-shrink-0 relative">
                {item.imageUrl ? (
                  <Image 
                    src={item.imageUrl} 
                    alt={item.name} 
                    fill 
                    className="object-cover group-hover/item:scale-110 transition-transform duration-700" 
                    sizes="112px"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-200">
                    <Utensils className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent"></div>
              </div>
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-black text-primary text-sm tracking-tight">{item.name}</h3>
                    <span className="font-black text-brand-green text-xs">${item.price}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium line-clamp-2 leading-relaxed">{item.description}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-1.5 flex-wrap">
                    {item.tags?.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 bg-gray-50 text-gray-400 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    className="h-8 w-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg hover:bg-brand-green transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating Action Button (WhatsApp/Contact) */}
      <div className="fixed bottom-8 right-8 z-40 flex flex-col gap-4">
        <motion.a 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          href={`tel:${restaurant.phone || "#"}`}
          className="h-12 w-12 bg-white text-primary rounded-full shadow-2xl border border-gray-100 flex items-center justify-center"
        >
          <Phone className="h-5 w-5" />
        </motion.a>
        <motion.a 
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          href={`https://wa.me/${restaurant.whatsapp || "#"}`}
          target="_blank"
          className="h-16 w-16 bg-brand-green text-white rounded-full shadow-2xl flex items-center justify-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 animate-ping opacity-20"></div>
          <MessageCircle className="h-8 w-8 relative z-10" />
        </motion.a>
      </div>

      {/* Footer */}
      <footer className="py-16 px-6 text-center border-t border-gray-100 bg-white">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="h-1 w-1 rounded-full bg-gray-200"></div>
          <div className="h-1 w-12 bg-gray-100 rounded-full"></div>
          <div className="h-1 w-1 rounded-full bg-gray-200"></div>
        </div>
        <p className="text-[10px] font-bold text-gray-300 tracking-widest uppercase">Powered by <span className="text-primary font-black">Menuvo</span></p>
      </footer>
    </div>
  );
}
  );
}
