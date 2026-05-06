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
              className="text-5xl font-serif text-gray-900 tracking-tight leading-tight"
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
                  <h2 className="text-3xl font-serif text-gray-900 tracking-tight flex items-center gap-4">
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
                          "relative rounded-[3rem] overflow-hidden bg-white transition-all duration-700",
                          "shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] group-hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)]",
                          "border border-gray-100 group-hover:border-gray-200 group-hover:-translate-y-2",
                          isFeatured ? "aspect-[16/10]" : "aspect-[4/5]"
                        )}>
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform duration-1000 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>

                          {/* Top Left Icons */}
                          <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
                            {item.dietaryType === "veg" && (
                              <div className="bg-white/80 backdrop-blur-md p-2 rounded-xl shadow-sm border border-white/50">
                                <Leaf className="h-3.5 w-3.5 text-green-600 fill-green-600/10" />
                              </div>
                            )}
                            {item.dietaryType === "non-veg" && (
                              <div className="bg-white/80 backdrop-blur-md p-2 rounded-xl shadow-sm border border-white/50">
                                <Flame className="h-3.5 w-3.5 text-red-500 fill-red-500/10" />
                              </div>
                            )}
                          </div>

                          {/* Price Tag - Minimalist */}
                          <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-white/50">
                            <span className="text-[12px] font-bold text-gray-900 tracking-tight">
                              {item.price}
                            </span>
                          </div>

                          {/* Info Overlay */}
                          <div className="absolute bottom-6 left-6 right-6">
                            <h3 className={cn(
                              "text-white tracking-tight line-clamp-1 mb-1 font-serif",
                              isFeatured ? "text-3xl" : "text-xl"
                            )}>{item.name}</h3>
                            <p className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-medium flex items-center gap-2">
                              View Details <ArrowRight className="h-3 w-3" />
                            </p>
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
            className="bg-black/90 backdrop-blur-2xl p-1.5 rounded-full flex items-center gap-1 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 w-full max-w-sm overflow-x-auto no-scrollbar scroll-smooth"
          >
            <button
              onClick={() => setActiveCategory("all")}
              className={cn(
                "flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-500",
                activeCategory === "all" ? "text-white shadow-lg" : "text-white/40 hover:text-white/60"
              )}
              style={activeCategory === "all" ? { backgroundColor: themeColor } : {}}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">All</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-500",
                  activeCategory === cat.id ? "text-white shadow-lg" : "text-white/40 hover:text-white/60"
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedItem(null)} className="absolute inset-0 bg-black/90 backdrop-blur-3xl" />
              <motion.div
                layoutId={selectedItem.id}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="relative w-full max-w-md bg-white rounded-t-[4rem] sm:rounded-[4rem] overflow-hidden shadow-2xl h-[95vh] flex flex-col"
              >
                <div className="absolute top-6 inset-x-0 flex justify-center z-[110]">
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                </div>

                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-8 right-8 z-[110] h-12 w-12 bg-black/10 backdrop-blur-xl rounded-full flex items-center justify-center text-gray-900 border border-black/5 hover:bg-black hover:text-white transition-all"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="relative h-[45vh] w-full shrink-0">
                  <Image src={selectedItem.imageUrl} alt={selectedItem.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                  <div className="absolute bottom-10 left-10 flex gap-3">
                    {selectedItem.dietaryType === "veg" && (
                      <div className="px-4 py-2 bg-white/80 backdrop-blur-md text-green-600 text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-sm flex items-center gap-2 border border-green-100">
                        <Leaf className="h-4 w-4 fill-green-600/10" /> Vegetarian
                      </div>
                    )}
                    {selectedItem.dietaryType === "non-veg" && (
                      <div className="px-4 py-2 bg-white/80 backdrop-blur-md text-red-500 text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-sm flex items-center gap-2 border border-red-100">
                        <Flame className="h-4 w-4 fill-red-500/10" /> Non-Veg
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-10 pb-10 -mt-20 relative z-10 bg-white rounded-t-[4rem] flex-1 flex flex-col">
                  <div className="pt-10 space-y-6 flex-1 overflow-y-auto no-scrollbar">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em]">
                        {categories.find(c => c.id === selectedItem.categoryId)?.name || "Signature"}
                      </span>
                    </div>

                    <h2 className="text-4xl font-serif text-gray-900 tracking-tight leading-tight">{selectedItem.name}</h2>
                    <p className="text-gray-500 text-lg leading-relaxed font-medium">{selectedItem.description}</p>
                  </div>

                  <div className="pt-8 space-y-6 border-t border-gray-50">
                    <div className="flex items-baseline justify-between px-2">
                      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em]">Price</span>
                      <span className="text-4xl font-serif text-gray-900 tracking-tight">{selectedItem.price}</span>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedItem(null)}
                        className="h-16 w-16 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-gray-100 transition-all shrink-0"
                      >
                        <ArrowRight className="h-5 w-5 rotate-180" />
                      </button>
                      {restaurant?.whatsapp && (
                        <button
                          onClick={() => handleWhatsAppOrder(selectedItem)}
                          className="flex-1 h-16 text-white font-bold text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                          style={{ backgroundColor: themeColor }}
                        >
                          <MessageCircle className="h-4 w-4" />
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
