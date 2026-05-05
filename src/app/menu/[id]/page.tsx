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
        <Loader2 className="h-10 w-10 animate-spin text-accent" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-primary mb-2">Menu Not Found</h1>
        <p className="text-gray-500">This restaurant hasn't set up their menu yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-soft flex flex-col max-w-md mx-auto relative shadow-2xl">
      {/* Header / Banner */}
      <div className="bg-primary text-white p-8 rounded-b-[3rem] shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center text-center">
          {restaurant.logoUrl ? (
            <div className="h-20 w-20 rounded-2xl mb-4 relative overflow-hidden border-4 border-white/20">
              <Image 
                src={restaurant.logoUrl} 
                alt={restaurant.restaurantName} 
                fill 
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-20 w-20 rounded-2xl bg-white/10 flex items-center justify-center mb-4 border-2 border-dashed border-white/20">
              <Utensils className="h-10 w-10 text-white/50" />
            </div>
          )}
          <h1 className="text-2xl font-extrabold tracking-tight">{restaurant.restaurantName}</h1>
          <p className="text-white/60 text-sm mt-1">{restaurant.description || "Welcome to our digital menu!"}</p>
        </div>
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Utensils className="h-32 w-32" />
        </div>
      </div>

      {/* Category Navigation (Sticky) */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-30 py-4 px-4 shadow-sm">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveCategory("all")}
            className={cn(
              "px-5 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap",
              activeCategory === "all" ? "bg-accent text-white shadow-md" : "bg-white text-gray-500 border border-gray-100"
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-5 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap",
                activeCategory === cat.id ? "bg-accent text-white shadow-md" : "bg-white text-gray-500 border border-gray-100"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 px-4 py-6 space-y-6">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={item.id}
              className="bg-white rounded-3xl p-4 shadow-sm border border-gray-50 flex gap-4 hover:shadow-md transition-all group"
            >
              <div className="h-24 w-24 rounded-2xl bg-background-soft overflow-hidden flex-shrink-0 relative">
                {item.imageUrl ? (
                  <Image 
                    src={item.imageUrl} 
                    alt={item.name} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-500" 
                    sizes="96px"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-300">
                    <Utensils className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-primary">{item.name}</h3>
                    <span className="font-bold text-accent">${item.price}</span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">{item.description}</p>
                </div>
                <div className="flex gap-2 mt-2">
                  {item.tags?.map(tag => (
                    <span key={tag} className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-background-soft text-gray-400 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating Action Button (WhatsApp/Contact) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        <a 
          href={`tel:${restaurant.phone || "#"}`}
          className="h-12 w-12 bg-white text-primary rounded-full shadow-2xl border border-gray-100 flex items-center justify-center hover:scale-110 transition-all"
        >
          <Phone className="h-5 w-5" />
        </a>
        <a 
          href={`https://wa.me/${restaurant.whatsapp || "#"}`}
          target="_blank"
          className="h-14 w-14 bg-accent text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all animate-bounce"
        >
          <MessageCircle className="h-7 w-7" />
        </a>
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 text-center border-t border-gray-100">
        <p className="text-xs text-gray-400">Powered by <span className="font-bold text-primary">Menuvo</span></p>
      </footer>
    </div>
  );
}
