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
  Clock,
  ChevronRight,
  Star,
  Flame,
  Leaf,
  Info,
  Share2,
  Heart,
  Search,
  Filter,
  Flame as SpicyIcon
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
  menuTheme?: "dark" | "light";
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ?
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
    "25, 111, 3";
};

export default function PublicMenuPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dietaryFilter, setDietaryFilter] = useState<"all" | "veg" | "non-veg">("all");

  const containerRef = useRef(null);
  const { scrollY } = useScroll();

  const themeColor = restaurant?.themeColor || "#196F03";
  const themeRgb = useMemo(() => hexToRgb(themeColor), [themeColor]);
  const isDark = true;

  useEffect(() => {
    if (id) {
      fetchMenu();
    }
  }, [id]);

  const fetchMenu = async () => {
    try {
      let resSnap;
      // If the ID is 6 characters, it's a short menuId
      if (id && (id as string).length === 6) {
        const q = query(collection(db, "restaurants"), where("menuId", "==", id));
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
          resSnap = querySnap.docs[0];
        }
      } else {
        // Fallback to standard UID lookup
        resSnap = await getDoc(doc(db, "restaurants", id as string));
      }

      if (resSnap && resSnap.exists()) {
        const data = resSnap.data() as Restaurant;
        setRestaurant(data);
        const restaurantId = resSnap.id; // Use the actual document ID for other queries

        const catQuery = query(collection(db, "categories"), where("restaurantId", "==", restaurantId));
        const catSnap = await getDocs(catQuery);
        setCategories(catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));

        const itemQuery = query(collection(db, "items"), where("restaurantId", "==", restaurantId));
        const itemSnap = await getDocs(itemQuery);

        const fetchedItems = itemSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        } as MenuItem));

        setItems(fetchedItems);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = activeCategory === "all" || item.categoryId === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDietary = dietaryFilter === "all" || item.dietaryType === dietaryFilter;

      return matchesCategory && matchesSearch && matchesDietary;
    });
  }, [items, activeCategory, searchQuery, dietaryFilter]);

  const featuredItems = useMemo(() => {
    return items.filter(item => item.isPopular);
  }, [items]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-16 w-16 border-t-2 border-r-2 border-[#196F03] rounded-full"
        />
      </div>
    );
  }




  return (
    <div
      className={cn("min-h-screen font-sans selection:bg-[#196F03]/30 pb-32 transition-colors duration-500", isDark ? "bg-[#0A0A0A] text-white" : "bg-gray-50 text-gray-900")}
      style={{ "--brand-primary": themeColor, "--brand-primary-rgb": themeRgb } as any}
      ref={containerRef}
    >
      <div className={cn("max-w-md mx-auto min-h-screen flex flex-col relative transition-colors duration-500", isDark ? "bg-[#0A0A0A]" : "bg-gray-50")}>

        {/* Cinematic Branding Header */}
        <header className="relative w-full overflow-hidden flex flex-col items-center justify-center pt-16 pb-2">
          {/* Co-branding Bar */}
          <div className="absolute top-4 left-6 flex items-center gap-3 z-30">
            <div className={cn("relative h-10 w-10 rounded-full overflow-hidden border", isDark ? "border-white/10 bg-white/5" : "border-gray-200 bg-white shadow-sm")}>
              {restaurant?.logoUrl ? (
                <img src={restaurant.logoUrl} alt="Restaurant" className="w-full h-full object-contain p-1" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-primary/10">
                  <Utensils className="h-5 w-5 text-primary" />
                </div>
              )}
            </div>
            <X className={cn("h-2.5 w-2.5", isDark ? "text-white/20" : "text-gray-400")} />
            <div className="flex items-center">
              <Image src="/logo-white.svg" alt="Menuwo" width={60} height={16} className={cn("object-contain", isDark ? "opacity-30" : "opacity-30 brightness-0")} />
            </div>
          </div>

          {/* Dynamic Background Layer */}
          <div className={cn("absolute inset-0 z-0 transition-colors duration-500", isDark ? "bg-[#0A0A0A]" : "bg-white")}></div>

          <div className={cn("absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent to-transparent z-0", isDark ? "via-white/10" : "via-black/5")}></div>
        </header>

        {/* Search & Filters - Dark Glass */}
        <div className="px-6 relative z-30 space-y-4">
          <div className="relative group">
            <Search className={cn("absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors", isDark ? "text-gray-500 group-focus-within:text-white" : "text-gray-400 group-focus-within:text-gray-900")} />
            <input
              type="text"
              placeholder="Search our selection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full backdrop-blur-3xl border rounded-3xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-[#196F03]/40 transition-all font-medium shadow-xl",
                isDark
                  ? "bg-[#1A1A1A]/90 border-white/5 text-white placeholder:text-gray-600 focus:bg-[#1A1A1A]"
                  : "bg-white/90 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white"
              )}
            />
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={cn(
                "flex-shrink-0 flex items-center gap-2 px-6 py-4 rounded-full border text-[10px] font-semibold uppercase tracking-widest transition-all",
                activeCategory === "all"
                  ? "bg-[#196F03] text-white border-[#196F03] shadow-[0_0_20px_rgba(25,111,3,0.3)]"
                  : isDark
                    ? "bg-white/5 text-gray-400 border-white/5 hover:border-white/10"
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 shadow-sm"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              All Selection
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-2 px-6 py-4 rounded-full border text-[10px] font-semibold uppercase tracking-widest transition-all",
                  activeCategory === cat.id
                    ? "bg-[#196F03] text-white border-[#196F03] shadow-[0_0_20px_rgba(25,111,3,0.3)]"
                    : isDark
                      ? "bg-white/5 text-gray-400 border-white/5 hover:border-white/10"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 shadow-sm"
                )}
              >
                <Utensils className="h-3.5 w-3.5" />
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Top Selling Products - Vertical Cards */}
        {featuredItems.length > 0 && searchQuery === "" && (
          <section className="pt-6 pb-2">
            <div className="px-6 mb-4 flex items-center justify-between">
              <h2 className={cn("text-xl font-semibold uppercase tracking-widest", isDark ? "text-white" : "text-gray-900")}>Top Selling</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 pb-4">
              {featuredItems.map((item) => (
                <motion.div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  whileHover={{ scale: 1.02 }}
                  className="flex-shrink-0 w-64 group cursor-pointer"
                >
                  <div className={cn("relative aspect-[3/4] rounded-[2.5rem] overflow-hidden shadow-xl border mb-3 transition-all duration-500 group-hover:border-[rgba(var(--brand-primary-rgb),0.3)]", isDark ? "bg-[#1A1A1A] border-white/5" : "bg-white border-gray-100", !item.isAvailable && "grayscale-100 opacity-60 contrast-75")}>
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover opacity-80 group-hover:opacity-100 transition-transform duration-700 group-hover:scale-105" />
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-black/10 z-10" />
                    )}
                    <div className={cn("absolute inset-0 bg-gradient-to-t via-transparent to-transparent", isDark ? "from-[#0A0A0A]" : "from-black/80")}></div>
                    
                    <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-2xl text-white line-clamp-1 drop-shadow-md">{item.name}</h3>
                        {!item.isAvailable && (
                          <span className="text-[8px] font-black text-red-500 uppercase tracking-widest px-2 py-0.5 bg-white rounded-lg shadow-lg">Sold Out</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[13px] font-bold text-[#196F03] bg-white px-3 py-1.5 rounded-xl shadow-lg">₹{item.price.replace(/[^0-9.]/g, '')}</span>

                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Menu Content - Bento Grid Dark */}
        <div className="px-6 py-8 space-y-16 min-h-[400px]">
          {filteredItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className={cn("h-24 w-24 rounded-full flex items-center justify-center mb-8 border", isDark ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-200")}>
                <Utensils className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className={cn("text-2xl font-serif mb-3", isDark ? "text-white" : "text-gray-900")}>No matches found</h3>
              <p className="text-gray-500 text-sm max-w-[240px] leading-relaxed">We couldn't find any dishes matching your current selection.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setDietaryFilter("all");
                  setActiveCategory("all");
                }}
                className={cn("mt-10 px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#196F03] rounded-full border transition-all", isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-white border-gray-200 hover:bg-gray-50 shadow-sm")}
              >
                Clear all filters
              </button>
            </motion.div>
          )}

          {/* Categories Sections */}
          {(activeCategory === "all" ? categories : categories.filter(c => c.id === activeCategory)).map((cat, catIdx) => {
            const categoryItems = items.filter(item => item.categoryId === cat.id);
            if (categoryItems.length === 0) return null;

            return (
              <motion.section
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                className="space-y-12"
              >
                <div className={cn("flex items-end justify-between px-2 border-b pb-4", isDark ? "border-white/5" : "border-gray-200")}>
                  <h2 className={cn("text-xl font-semibold uppercase tracking-widest", isDark ? "text-white" : "text-gray-900")}>
                    {cat.name}
                  </h2>
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.4em] mb-1">{categoryItems.length} Selection</span>
                </div>

                <div className="grid grid-cols-1 gap-10">
                  {categoryItems.map((item, idx) => {
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => setSelectedItem(item)}
                        className={cn("group cursor-pointer relative transition-all duration-500", !item.isAvailable && "opacity-70")}
                      >
                        <div className="grid grid-cols-12 gap-6 items-start">
                          <div className={cn("col-span-4 relative aspect-square rounded-[1.5rem] overflow-hidden border group-hover:border-[#196F03]/30 transition-all duration-500", isDark ? "bg-[#1A1A1A] border-white/5" : "bg-gray-100 border-gray-200 shadow-sm")}>
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className={cn("w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110", !item.isAvailable && "grayscale opacity-40")}
                            />
                            {/* Clean image container, status moved to text area */}
                          </div>

                          <div className={cn("col-span-8 space-y-4 pt-2 transition-colors", !item.isAvailable && "grayscale")}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {item.dietaryType === "veg" && (
                                  <div className="h-4.5 w-4.5 border border-green-600 rounded-[4px] flex items-center justify-center p-[2.5px]">
                                    <div className="h-full w-full bg-green-600 rounded-full" />
                                  </div>
                                )}
                                {item.dietaryType === "non-veg" && (
                                  <div className="h-4.5 w-4.5 border border-red-600 rounded-[4px] flex items-center justify-center p-[2.5px]">
                                    <div className="h-full w-full bg-red-600 rounded-full" />
                                  </div>
                                )}
                              </div>
                              <span className="text-[15px] font-semibold text-[#196F03] tracking-tight">₹{item.price.replace(/[^0-9.]/g, '')}</span>
                            </div>
                             <div className="flex items-center gap-3">
                               <h3 className={cn("text-2xl font-serif tracking-tight leading-snug group-hover:text-[#196F03] transition-colors", isDark ? "text-white" : "text-gray-900", !item.isAvailable && "opacity-50")}>{item.name}</h3>
                               {!item.isAvailable && (
                                 <span className="text-[10px] font-black text-red-500 uppercase tracking-widest px-2 py-0.5 bg-red-500/10 rounded-lg">Out of Stock</span>
                               )}
                             </div>
                            {item.isPopular && (
                              <div className="flex items-center text-yellow-500">
                                <span className="text-[10px] font-semibold uppercase tracking-widest">Bestseller</span>
                              </div>
                            )}
                            <p className="text-gray-500 text-[13px] leading-relaxed line-clamp-2 font-medium">{item.description}</p>

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


        {/* Item Details Immersive Modal */}
        <AnimatePresence>
          {selectedItem && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedItem(null)} className={cn("absolute inset-0 backdrop-blur-3xl", isDark ? "bg-black/95" : "bg-black/60")} />
              <motion.div
                layoutId={selectedItem.id}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className={cn("relative w-full max-w-md overflow-hidden shadow-2xl h-full flex flex-col border-t", isDark ? "bg-[#0F0F0F] border-white/10" : "bg-white border-white")}
              >
                <div className="absolute top-6 inset-x-0 flex justify-center z-[110]">
                  <div className={cn("w-12 h-1.5 rounded-full", isDark ? "bg-white/10" : "bg-black/20")} />
                </div>

                <button
                  onClick={() => setSelectedItem(null)}
                  className={cn("absolute top-8 right-8 z-[110] h-12 w-12 backdrop-blur-xl rounded-full flex items-center justify-center border transition-all", isDark ? "bg-white/5 text-white border-white/10 hover:bg-white/10" : "bg-black/5 text-white border-white/20 hover:bg-black/20 shadow-lg")}
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="relative h-[40vh] w-full shrink-0">
                  <img src={selectedItem.imageUrl} alt={selectedItem.name} className="w-full h-full object-cover" />
                  <div className={cn("absolute inset-0 bg-gradient-to-t via-transparent to-transparent", isDark ? "from-[#0F0F0F]" : "from-black/70")}></div>

                </div>

                <div className={cn("px-12 pb-12 -mt-16 relative z-10 rounded-t-[4rem] flex-1 flex flex-col", isDark ? "bg-[#0F0F0F]" : "bg-white")}>
                  <div className="pt-12 space-y-8 flex-1 overflow-y-auto no-scrollbar">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.4em]">
                        {categories.find(c => c.id === selectedItem.categoryId)?.name || "Signature Selection"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <h2 className={cn("text-5xl font-serif tracking-tight leading-tight", isDark ? "text-white" : "text-gray-900")}>{selectedItem.name}</h2>
                      {selectedItem.dietaryType && selectedItem.dietaryType !== "none" && (
                        <div className={cn("shrink-0 h-6 w-6 border-2 rounded-md flex items-center justify-center p-[4px]", selectedItem.dietaryType === 'veg' ? "border-green-600" : "border-red-600")}>
                          <div className={cn("h-full w-full rounded-full", selectedItem.dietaryType === 'veg' ? "bg-green-600" : "bg-red-600")} />
                        </div>
                      )}
                    </div>
                    <p className="text-gray-500 text-lg leading-relaxed font-medium opacity-90">{selectedItem.description}</p>


                  </div>

                  <div className={cn("pt-12 space-y-10 border-t", isDark ? "border-white/5" : "border-gray-100")}>
                    <div className="flex items-baseline justify-between px-2">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.4em]">Total Value</span>
                      <span className={cn("text-5xl font-serif tracking-tight", isDark ? "text-white" : "text-gray-900")}>₹{selectedItem.price.replace(/[^0-9.]/g, '')}</span>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => setSelectedItem(null)}
                        className={cn("w-full h-20 rounded-[2rem] flex items-center justify-center transition-all shrink-0 border font-semibold text-[11px] uppercase tracking-[0.3em]", isDark ? "bg-white/5 text-white hover:bg-white/10 border-white/5" : "bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200")}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="pt-20 pb-20 mt-10 text-center px-6">
          <div className="mb-8">
            <Image src="/logo-white.svg" alt="Menuwo" width={120} height={40} className={cn("mx-auto transition-opacity", isDark ? "opacity-60" : "opacity-40")} />
          </div>
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.5em] mb-6">Designed by Menuwo</p>
          <div className={cn("h-1 w-12 mx-auto rounded-full", isDark ? "bg-white/10" : "bg-gray-200")} />
        </footer>
      </div>
    </div>
  );
}
