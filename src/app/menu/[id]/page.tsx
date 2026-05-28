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
      <div className="min-h-screen w-full overflow-x-hidden font-sans bg-[#0A0A0A] pb-32">
        <div className="max-w-md mx-auto min-h-screen flex flex-col relative">
          
          {/* Header Skeleton */}
          <header className="relative w-full flex flex-col items-center justify-center pt-24 pb-2">
            <div className="absolute top-6 left-6 z-30">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white/5 animate-pulse border border-white/10" />
            </div>
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/10 z-0" />
          </header>

          {/* Search & Filters Skeleton */}
          <div className="px-6 relative z-30 space-y-5 mt-4">
            <div className="h-14 w-full bg-white/5 rounded-3xl animate-pulse" />
            <div className="flex items-center gap-3 overflow-x-hidden pb-2 pt-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 w-28 flex-shrink-0 bg-white/5 rounded-full animate-pulse" />
              ))}
            </div>
          </div>

          {/* Top Selling Skeleton */}
          <section className="pt-6 pb-2">
            <div className="px-6 mb-5 flex items-center justify-between">
              <div className="h-6 w-32 bg-white/5 rounded-md animate-pulse" />
            </div>
            <div className="flex gap-4 overflow-x-hidden px-6 pb-6 -mx-2">
              {[1, 2].map((i) => (
                <div key={i} className="flex-shrink-0 w-64 aspect-[3/4] rounded-[2rem] bg-white/5 animate-pulse" />
              ))}
            </div>
          </section>

          {/* Categories Skeleton */}
          <div className="px-4 mb-4">
            <div className="h-6 w-40 bg-white/5 rounded-md animate-pulse mb-6 ml-2" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[3/4] rounded-[1.5rem] bg-white/5 animate-pulse" />
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }




  return (
    <div
      className={cn("min-h-screen w-full overflow-x-hidden font-sans selection:bg-[#196F03]/30 pb-32 transition-colors duration-500", isDark ? "bg-[#0A0A0A] text-white" : "bg-gray-50 text-gray-900")}
      style={{ "--brand-primary": themeColor, "--brand-primary-rgb": themeRgb } as any}
      ref={containerRef}
    >
      <div className={cn("max-w-md mx-auto min-h-screen flex flex-col relative transition-colors duration-500", isDark ? "bg-[#0A0A0A]" : "bg-gray-50")}>

        {/* Cinematic Branding Header */}
        <header className="relative w-full overflow-hidden flex flex-col items-center justify-center pt-24 pb-2">
          {/* Branding Bar */}
          <div className="absolute top-6 left-6 flex items-center z-30">
            {restaurant?.logoUrl ? (
              <div className={cn("relative h-16 w-16 sm:h-20 sm:w-20 rounded-full flex items-center justify-center p-2 shadow-xl border overflow-hidden", isDark ? "bg-black border-white/10" : "bg-white border-gray-200")}>
                <Image src={restaurant.logoUrl} alt="Restaurant" fill sizes="80px" priority className="object-contain" />
              </div>
            ) : (
              <div className={cn("h-16 w-16 sm:h-20 sm:w-20 rounded-full flex items-center justify-center p-2 shadow-xl border overflow-hidden", isDark ? "bg-black border-white/10" : "bg-white border-gray-200")}>
                <Utensils className="h-8 w-8 text-primary" />
              </div>
            )}
          </div>

          {/* Dynamic Background Layer */}
          <div className={cn("absolute inset-0 z-0 transition-colors duration-500", isDark ? "bg-[#0A0A0A]" : "bg-white")}></div>

          <div className={cn("absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent to-transparent z-0", isDark ? "via-white/10" : "via-black/5")}></div>
        </header>

        {/* Search & Filters - Premium Glass */}
        <div className="px-6 relative z-30 space-y-5 mt-4">
          <div className="relative group">
            <div className={cn("absolute inset-0 rounded-3xl blur-xl transition-opacity opacity-0 group-focus-within:opacity-100", isDark ? "bg-[#196F03]/20" : "bg-[#196F03]/10")} />
            <Search className={cn("absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors z-10", isDark ? "text-gray-500 group-focus-within:text-white" : "text-gray-400 group-focus-within:text-gray-900")} />
            <input
              type="text"
              placeholder="Search our selection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full relative z-10 backdrop-blur-3xl border rounded-3xl py-4.5 pl-14 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-[#196F03]/40 transition-all font-medium shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
                isDark
                  ? "bg-[#1A1A1A]/90 border-white/5 text-white placeholder:text-gray-600 focus:bg-[#1A1A1A] focus:border-[#196F03]/30"
                  : "bg-white/90 border-gray-100 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#196F03]/30"
              )}
            />
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 pt-1 px-1 -mx-1">
            <button
              onClick={() => setActiveCategory("all")}
              className={cn(
                "flex-shrink-0 flex items-center gap-2.5 px-6 py-3.5 rounded-full border text-[11px] font-bold uppercase tracking-widest transition-all duration-300",
                activeCategory === "all"
                  ? "bg-[#196F03] text-white border-[#196F03] scale-105"
                  : isDark
                    ? "bg-[#1A1A1A] text-gray-400 border-white/5 hover:border-white/10 hover:bg-white/5"
                    : "bg-white text-gray-500 border-gray-100 hover:border-gray-300 shadow-sm hover:shadow-md"
              )}
            >
              <LayoutGrid className={cn("h-4 w-4", activeCategory === "all" ? "text-white" : "text-[#196F03]")} />
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex-shrink-0 flex items-center gap-2.5 px-6 py-3.5 rounded-full border text-[11px] font-bold uppercase tracking-widest transition-all duration-300",
                  activeCategory === cat.id
                    ? "bg-[#196F03] text-white border-[#196F03] scale-105"
                    : isDark
                      ? "bg-[#1A1A1A] text-gray-400 border-white/5 hover:border-white/10 hover:bg-white/5"
                      : "bg-white text-gray-500 border-gray-100 hover:border-gray-300 shadow-sm hover:shadow-md"
                )}
              >
                {activeCategory === cat.id && <Utensils className="h-4 w-4 text-white" />}
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Top Selling Products - Vertical Cards */}
        {featuredItems.length > 0 && searchQuery === "" && (
          <section className="pt-6 pb-2">
            <div className="px-6 mb-5 flex items-center justify-between">
              <h2 className={cn("text-xl font-bold uppercase tracking-widest", isDark ? "text-white" : "text-gray-900")}>Top Selling</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 pb-6 -mx-2 snap-x snap-mandatory">
              {featuredItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  whileHover={{ scale: 1.02 }}
                  className="flex-shrink-0 w-64 group cursor-pointer snap-center pl-2"
                >
                  <div className={cn("relative aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl border transition-all duration-500 hover:shadow-[0_20px_40px_rgba(25,111,3,0.2)]", isDark ? "bg-[#1A1A1A] border-white/10" : "bg-white border-gray-100", !item.isAvailable && "grayscale-100 opacity-60 contrast-75")}>
                    <Image 
                      src={item.imageUrl} 
                      alt={item.name} 
                      fill 
                      sizes="256px"
                      priority={idx < 2}
                      className="object-cover opacity-90 group-hover:opacity-100 transition-transform duration-700 group-hover:scale-105" 
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 z-10"></div>
                    
                    <div className="absolute top-4 left-4 z-20">
                      <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-[9px] font-bold text-white uppercase tracking-widest">Bestseller</span>
                      </div>
                    </div>

                    <div className="absolute bottom-5 left-5 right-5 flex flex-col gap-2 z-20">
                      <div className="flex items-start gap-2 justify-between">
                        <h3 className="font-serif text-2xl text-white leading-tight drop-shadow-md">{item.name}</h3>
                        {!item.isAvailable && (
                          <span className="text-[8px] font-black text-red-500 uppercase tracking-widest px-2 py-1 bg-white rounded-lg shadow-lg shrink-0 mt-1">Sold Out</span>
                        )}
                      </div>
                      <div className="flex items-center mt-1">
                         <span className="text-sm font-black text-[#196F03] bg-white px-3.5 py-1.5 rounded-xl shadow-[0_4px_20px_rgba(25,111,3,0.3)]">₹{item.price.replace(/[^0-9.]/g, '')}</span>
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
                <div className={cn("flex items-end justify-between border-b pb-4", isDark ? "border-white/5" : "border-gray-200")}>
                  <h2 className={cn("text-xl font-semibold uppercase tracking-widest", isDark ? "text-white" : "text-gray-900")}>
                    {cat.name}
                  </h2>
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.4em] mb-1">{categoryItems.length} Selection</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {categoryItems.map((item, idx) => {
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => setSelectedItem(item)}
                        className={cn(
                          "group cursor-pointer relative transition-all duration-500 flex flex-col rounded-[1.5rem] p-2",
                          isDark ? "bg-[#1A1A1A] border border-white/5" : "bg-white shadow-sm border border-gray-100",
                          !item.isAvailable && "opacity-70"
                        )}
                      >
                        {/* Image Container */}
                        <div className={cn(
                          "relative w-full aspect-[4/3] mb-3 rounded-xl overflow-hidden",
                          isDark ? "bg-[#0A0A0A]" : "bg-gray-50"
                        )}>
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                            loading="lazy"
                            className={cn("object-cover transition-transform duration-700 group-hover:scale-105", !item.isAvailable && "grayscale opacity-60")}
                          />
                          
                          {/* Top Left Icon */}
                          <div className={cn("absolute top-2 left-2 h-6 w-6 rounded-lg flex items-center justify-center shadow-sm z-20", isDark ? "bg-black/60 backdrop-blur-md" : "bg-white/90 backdrop-blur-md")}>
                            <Utensils className={cn("h-3 w-3", isDark ? "text-white" : "text-[#196F03]")} />
                          </div>

                          {/* Top Right Dietary Icon */}
                          {item.dietaryType === "veg" && (
                            <div className={cn("absolute top-2 right-2 h-6 w-6 rounded-lg flex items-center justify-center shadow-sm z-20 text-[#196F03]", isDark ? "bg-black/60 backdrop-blur-md" : "bg-white/90 backdrop-blur-md")}>
                              <Leaf className="h-3 w-3 fill-[#196F03]/20" />
                            </div>
                          )}
                          {item.dietaryType === "non-veg" && (
                            <div className={cn("absolute top-2 right-2 h-6 w-6 rounded-lg flex items-center justify-center shadow-sm z-20 text-red-500", isDark ? "bg-black/60 backdrop-blur-md" : "bg-white/90 backdrop-blur-md")}>
                              <Flame className="h-3 w-3 fill-red-500/20" />
                            </div>
                          )}

                          {/* Price Tag */}
                          <div className="absolute bottom-2 right-2 bg-[#196F03] text-white px-2 py-1 rounded-lg font-bold text-[10px] shadow-lg shadow-brand-green/30">
                            ₹{item.price.replace(/[^0-9.]/g, '')}
                          </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 flex flex-col px-1 pb-1">
                          <h3 className={cn("text-xs font-bold tracking-tight leading-snug group-hover:text-[#196F03] transition-colors mb-1", isDark ? "text-white" : "text-gray-900")}>
                            {item.name}
                          </h3>
                          
                          {!item.isAvailable && (
                            <span className="text-[8px] font-black text-red-500 uppercase tracking-widest px-1.5 py-0.5 bg-red-500/10 rounded-md mt-1 w-fit">
                              Sold Out
                            </span>
                          )}
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
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 100 || info.velocity.y > 200) {
                    setSelectedItem(null);
                  }
                }}
                className={cn("relative w-full max-w-md overflow-hidden shadow-2xl h-full flex flex-col border-t", isDark ? "bg-[#0F0F0F] border-white/10" : "bg-white border-white")}
              >
                <div className={cn("px-8 pt-8 pb-8 relative z-10 flex-1 flex flex-col h-full overflow-hidden", isDark ? "bg-[#0F0F0F]" : "bg-white")}>
                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">
                    <div className={cn("relative w-full aspect-[4/3] shrink-0 overflow-hidden mb-6")}>
                      <img src={selectedItem.imageUrl} alt={selectedItem.name} className="w-full h-full object-cover" />
                      <button
                        onClick={() => setSelectedItem(null)}
                        className={cn("absolute top-4 right-4 z-[110] h-10 w-10 backdrop-blur-xl rounded-full flex items-center justify-center border transition-all", isDark ? "bg-white/5 text-white border-white/10 hover:bg-white/10" : "bg-black/20 text-white border-white/20 hover:bg-black/30 shadow-lg")}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.4em]">
                        {categories.find(c => c.id === selectedItem.categoryId)?.name || "Signature Selection"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <h2 className={cn("text-4xl font-serif tracking-tight leading-tight", isDark ? "text-white" : "text-gray-900")}>{selectedItem.name}</h2>
                      {selectedItem.dietaryType && selectedItem.dietaryType !== "none" && (
                        <div className={cn("shrink-0 h-5 w-5 border-2 rounded-md flex items-center justify-center p-[3px]", selectedItem.dietaryType === 'veg' ? "border-green-600" : "border-red-600")}>
                          <div className={cn("h-full w-full rounded-full", selectedItem.dietaryType === 'veg' ? "bg-green-600" : "bg-red-600")} />
                        </div>
                      )}
                    </div>
                    <p className="text-gray-500 text-[15px] leading-relaxed font-medium opacity-90">{selectedItem.description}</p>


                  </div>

                  <div className={cn("pt-6 mt-4 shrink-0 border-t", isDark ? "border-white/5" : "border-gray-100")}>
                    <div className="flex items-baseline justify-between px-2">
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.4em]">Total Value</span>
                      <span className={cn("text-4xl font-serif tracking-tight", isDark ? "text-white" : "text-gray-900")}>₹{selectedItem.price.replace(/[^0-9.]/g, '')}</span>
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
