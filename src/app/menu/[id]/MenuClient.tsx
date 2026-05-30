"use client";

import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import { Utensils, LayoutGrid, Search, Leaf, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const BookViewer = dynamic(() => import("./components/BookViewer"), { ssr: false });
const ItemModal = dynamic(() => import("./components/ItemModal"), { ssr: false });

interface Category {
  id: string;
  name: string;
}

interface Variant {
  id: string;
  name: string;
  price: string;
}

interface AddOn {
  id: string;
  name: string;
  imageUrl?: string;
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
  variants?: Variant[];
  addons?: AddOn[];
}

interface Restaurant {
  id: string;
  restaurantName: string;
  logoUrl?: string;
  bannerUrl?: string;
  description?: string;
  themeColor?: string;
  whatsapp?: string;
  phone?: string;
  menuTheme?: "dark" | "light";
  menuType?: "digital" | "book";
  bookPages?: string[];
}

interface MenuClientProps {
  initialRestaurant: Restaurant;
  initialCategories: Category[];
  initialItems: MenuItem[];
}

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ?
    `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
    "25, 111, 3";
};

export default function MenuClient({ initialRestaurant, initialCategories, initialItems }: MenuClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dietaryFilter, setDietaryFilter] = useState<"all" | "veg" | "non-veg">("all");

  const containerRef = useRef(null);

  const themeColor = initialRestaurant?.themeColor || "#196F03";
  const themeRgb = useMemo(() => hexToRgb(themeColor), [themeColor]);
  const isDark = true; // Hardcoded in original file

  const filteredItems = useMemo(() => {
    return initialItems.filter(item => {
      const matchesCategory = activeCategory === "all" || item.categoryId === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDietary = dietaryFilter === "all" || item.dietaryType === dietaryFilter;

      return matchesCategory && matchesSearch && matchesDietary;
    });
  }, [initialItems, activeCategory, searchQuery, dietaryFilter]);

  const featuredItems = useMemo(() => {
    return initialItems.filter(item => item.isPopular);
  }, [initialItems]);

  if (initialRestaurant?.menuType === "book" && initialRestaurant.bookPages && initialRestaurant.bookPages.length > 0) {
    return <BookViewer restaurant={initialRestaurant} />;
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
            {initialRestaurant?.logoUrl ? (
              <div className={cn("relative h-16 w-16 sm:h-20 sm:w-20 rounded-full flex items-center justify-center p-2 shadow-xl border overflow-hidden", isDark ? "bg-black border-white/10" : "bg-white border-gray-200")}>
                <Image src={initialRestaurant.logoUrl} alt="Restaurant" fill sizes="80px" priority className="object-contain" />
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
            {initialCategories.map((cat) => (
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
                    
                    {item.addons && item.addons.length > 0 && (
                      <div className="absolute top-4 right-4 z-20 flex -space-x-3">
                        {item.addons.slice(0, 3).map((addon, i) => (
                          addon.imageUrl ? (
                            <div key={addon.id} className="relative h-14 w-14 rounded-full border-[3px] border-white/20 overflow-hidden shadow-xl" style={{ zIndex: 10 - i }}>
                              <Image src={addon.imageUrl} alt={addon.name} fill sizes="56px" className="object-cover" />
                            </div>
                          ) : null
                        ))}
                      </div>
                    )}
                    
                    <div className="absolute bottom-5 left-5 right-5 flex flex-col gap-2 z-20">
                      <div className="flex items-start gap-2 justify-between">
                        <h3 className="font-serif text-2xl text-white leading-tight drop-shadow-md">{item.name}</h3>
                        {!item.isAvailable && (
                          <span className="text-[8px] font-black text-red-500 uppercase tracking-widest px-2 py-1 bg-white rounded-lg shadow-lg shrink-0 mt-1">Sold Out</span>
                        )}
                      </div>
                      <div className="flex items-center mt-1">
                         <span className="text-sm font-black text-[#196F03] bg-white px-3.5 py-1.5 rounded-xl flex items-center">
                           ₹{item.price.replace(/[^0-9.]/g, '')}
                         </span>
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
          {(activeCategory === "all" ? initialCategories : initialCategories.filter(c => c.id === activeCategory)).map((cat) => {
            const categoryItems = initialItems.filter(item => item.categoryId === cat.id);
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

                <div className="grid grid-cols-1 gap-6">
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
                          "group cursor-pointer relative transition-all duration-500 flex flex-col rounded-[2rem] overflow-hidden",
                          isDark ? "bg-[#1A1A1A] border border-white/5" : "bg-white shadow-xl border border-gray-100",
                          !item.isAvailable && "opacity-70"
                        )}
                      >
                        {/* Image Container */}
                        <div className={cn(
                          "relative w-full aspect-[4/3] overflow-hidden",
                          isDark ? "bg-[#0A0A0A]" : "bg-gray-50"
                        )}>
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            loading="lazy"
                            className={cn("object-cover transition-transform duration-700 group-hover:scale-105", !item.isAvailable && "grayscale opacity-60")}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                          
                          {/* Top Left Icon */}
                          <div className={cn("absolute top-3 left-3 h-8 w-8 rounded-xl flex items-center justify-center shadow-sm z-20", isDark ? "bg-black/60 backdrop-blur-md" : "bg-white/90 backdrop-blur-md")}>
                            <Utensils className={cn("h-4 w-4", isDark ? "text-white" : "text-[#196F03]")} />
                          </div>

                          {/* Top Right Dietary Icon */}
                          {item.dietaryType === "veg" && (
                            <div className={cn("absolute top-3 right-3 h-8 w-8 rounded-xl flex items-center justify-center shadow-sm z-20 text-[#196F03]", isDark ? "bg-black/60 backdrop-blur-md" : "bg-white/90 backdrop-blur-md")}>
                              <Leaf className="h-4 w-4 fill-[#196F03]/20" />
                            </div>
                          )}
                          {item.dietaryType === "non-veg" && (
                            <div className={cn("absolute top-3 right-3 h-8 w-8 rounded-xl flex items-center justify-center shadow-sm z-20 text-red-500", isDark ? "bg-black/60 backdrop-blur-md" : "bg-white/90 backdrop-blur-md")}>
                              <Flame className="h-4 w-4 fill-red-500/20" />
                            </div>
                          )}

                          {/* Price Tag */}
                          <div className="absolute bottom-4 right-4 bg-[#196F03] text-white px-3 py-1.5 rounded-xl font-black text-sm flex items-center z-20">
                            ₹{item.price.replace(/[^0-9.]/g, '')}
                          </div>

                          {/* Combo Thumbnails */}
                          {item.addons && item.addons.length > 0 && (
                            <div className="absolute bottom-4 left-4 z-20 flex -space-x-3">
                              {item.addons.slice(0, 3).map((addon, i) => (
                                addon.imageUrl ? (
                                  <div key={addon.id} className="relative h-14 w-14 rounded-full border-[3px] border-white overflow-hidden shadow-xl" style={{ zIndex: 10 - i }}>
                                    <Image src={addon.imageUrl} alt={addon.name} fill sizes="56px" className="object-cover" />
                                  </div>
                                ) : null
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 flex flex-col p-5">
                          <h3 className={cn("text-2xl font-serif leading-tight transition-colors drop-shadow-sm", isDark ? "text-white" : "text-gray-900")}>
                            {item.name}
                            {item.addons && item.addons.length > 0 && (
                              <span className={cn("opacity-90 font-medium", isDark ? "text-white" : "text-gray-900")}> + {item.addons.map(a => a.name).join(' + ')}</span>
                            )}
                          </h3>
                          {item.variants && item.variants.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {item.variants.map(v => (
                                <div key={v.id} className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg border", isDark ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}>
                                  <span className="text-[10px] font-bold text-gray-400 uppercase">{v.name}</span>
                                  <span className="text-[10px] font-black text-[#196F03]">₹{v.price}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {!item.isAvailable && (
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest px-2 py-1 bg-red-500/10 rounded-md mt-3 w-fit">
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
            <ItemModal 
              selectedItem={selectedItem} 
              setSelectedItem={setSelectedItem} 
              isDark={isDark} 
              categories={initialCategories} 
            />
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
