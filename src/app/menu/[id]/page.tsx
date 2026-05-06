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
      const matchesCategory = activeCategory === "all" || item.categoryId === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDietary = dietaryFilter === "all" || item.dietaryType === dietaryFilter;
      
      return matchesCategory && matchesSearch && matchesDietary;
    });
  }, [items, activeCategory, searchQuery, dietaryFilter]);

  const featuredItems = useMemo(() => {
    return items.filter(item => item.isPopular).slice(0, 5);
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

  const handleWhatsAppOrder = (item?: MenuItem) => {
    if (!restaurant?.whatsapp) return;
    const text = item
      ? `Hello! I would like to order: ${item.name} (${item.price}).`
      : `Hello! I'm viewing your menu and would like to place an order.`;
    window.open(`https://wa.me/${restaurant.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };


  return (
    <div
      className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-[#196F03]/30 pb-32"
      style={{ "--brand-primary": themeColor, "--brand-primary-rgb": themeRgb } as any}
      ref={containerRef}
    >
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative bg-[#0A0A0A]">

        {/* Cinematic Branding Header */}
        <header className="relative pt-32 pb-24 w-full overflow-hidden flex flex-col items-center justify-center">
          {/* Dynamic Background Layer */}
          <div className="absolute inset-0 bg-[#0A0A0A]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--brand-primary-rgb),0.15),transparent_70%)]"></div>
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

          {/* Top Actions */}
          <div className="absolute top-10 right-6 flex gap-3 z-30">
            <button className="h-12 w-12 bg-white/10 backdrop-blur-2xl rounded-full border border-white/20 flex items-center justify-center text-white hover:scale-110 transition-all shadow-xl">
              <Share2 className="h-5 w-5" />
            </button>
            <button className="h-12 w-12 bg-white/10 backdrop-blur-2xl rounded-full border border-white/20 flex items-center justify-center text-white hover:scale-110 transition-all shadow-xl">
              <Heart className="h-5 w-5" />
            </button>
          </div>

          {/* Branding Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-20 px-8 text-center z-20">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="relative mb-12"
            >
              <div className="absolute -inset-4 bg-[#196F03]/20 blur-3xl rounded-full animate-pulse"></div>
              <div className="relative h-32 w-32 rounded-full p-1 bg-gradient-to-tr from-[#196F03] via-white/20 to-[#196F03] shadow-2xl">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-white/5 border-2 border-white/10 p-4">
                  <Image src={restaurant?.logoUrl || "/logo.svg"} alt="Logo" fill className="object-contain p-2" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <span className="text-[10px] font-bold text-[#196F03] uppercase tracking-[0.5em] mb-2 block">Premium Dining Experience</span>
              <h1 className="text-6xl font-serif text-white tracking-tight leading-none drop-shadow-2xl">
                {restaurant?.restaurantName || "Menu"}
              </h1>
              <p className="text-gray-400 font-medium text-base max-w-[300px] leading-relaxed mx-auto opacity-70 italic font-serif">
                "{restaurant?.description || "Experience the finest flavors and culinary excellence."}"
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-6 mt-12"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="h-14 w-14 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">4.9 Rare</span>
              </div>
              <div className="h-10 w-[1px] bg-white/10" />
              <div className="flex flex-col items-center gap-2">
                <div className="h-14 w-14 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl">
                  <Clock className="h-5 w-5 text-[#196F03]" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Fast Prep</span>
              </div>
              <div className="h-10 w-[1px] bg-white/10" />
              <div className="flex flex-col items-center gap-2">
                <div className="h-14 w-14 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl">
                  <Info className="h-5 w-5 text-blue-400" />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">Fine Dine</span>
              </div>
            </motion.div>
          </div>
        </header>

        {/* Search & Filters - Dark Glass */}
        <div className="px-8 -mt-10 relative z-30 space-y-8">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-white transition-colors" />
            <input
              type="text"
              placeholder="Search our selection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1A1A1A]/80 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] py-6 pl-16 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#196F03]/50 focus:bg-[#1A1A1A] transition-all font-medium text-white placeholder:text-gray-600 shadow-2xl"
            />
          </div>

          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-4">
            <button
              onClick={() => setActiveCategory("all")}
              className={cn(
                "flex-shrink-0 flex items-center gap-2 px-6 py-4 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all",
                activeCategory === "all"
                  ? "bg-[#196F03] text-white border-[#196F03] shadow-[0_0_20px_rgba(25,111,3,0.3)]"
                  : "bg-white/5 text-gray-400 border-white/5 hover:border-white/10"
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
                  "flex-shrink-0 flex items-center gap-2 px-6 py-4 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all",
                  activeCategory === cat.id
                    ? "bg-[#196F03] text-white border-[#196F03] shadow-[0_0_20px_rgba(25,111,3,0.3)]"
                    : "bg-white/5 text-gray-400 border-white/5 hover:border-white/10"
                )}
              >
                <Utensils className="h-3.5 w-3.5" />
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Section - Dark Mode */}
        {featuredItems.length > 0 && searchQuery === "" && (
          <section className="pt-24 pb-8">
            <div className="px-10 mb-10 flex items-baseline justify-between">
              <h2 className="text-4xl font-serif text-white tracking-tight">Best Sellers</h2>
              <span className="text-[10px] font-bold text-[#196F03] uppercase tracking-[0.4em]">Signature</span>
            </div>
            <div className="flex gap-8 overflow-x-auto no-scrollbar px-10 pb-8">
              {featuredItems.map((item) => (
                <motion.div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  whileHover={{ scale: 1.02 }}
                  className="flex-shrink-0 w-72 group cursor-pointer"
                >
                  <div className="relative aspect-[4/5] rounded-[3.5rem] overflow-hidden bg-[#1A1A1A] shadow-2xl border border-white/5 mb-4 transition-all duration-500 group-hover:border-[#196F03]/30">
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent"></div>
                    <div className="absolute bottom-8 left-8 right-8">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-serif text-2xl text-white line-clamp-1">{item.name}</h3>
                        <span className="text-[12px] font-bold text-[#196F03] bg-white px-3 py-1 rounded-full shadow-lg">₹{item.price.replace(/[^0-9.]/g, '')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.25em] text-gray-400">
                        Explore Selection <ArrowRight className="h-3 w-3 text-[#196F03]" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Menu Content - Bento Grid Dark */}
        <div className="px-10 py-24 space-y-32 min-h-[400px]">
          {filteredItems.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="h-24 w-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10">
                <Utensils className="h-8 w-8 text-gray-700" />
              </div>
              <h3 className="text-2xl font-serif text-white mb-3">No matches found</h3>
              <p className="text-gray-500 text-sm max-w-[240px] leading-relaxed">We couldn't find any dishes matching your current selection.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setDietaryFilter("all");
                  setActiveCategory("all");
                }}
                className="mt-10 px-8 py-4 bg-white/5 text-[10px] font-bold uppercase tracking-[0.25em] text-[#196F03] rounded-full border border-white/10 hover:bg-white/10 transition-all"
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
                <div className="flex items-baseline justify-between px-2 border-b border-white/5 pb-8">
                  <h2 className="text-4xl font-serif text-white tracking-tight flex items-center gap-4">
                    {cat.name}
                  </h2>
                  <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em]">{categoryItems.length} Selection</span>
                </div>

                <div className="grid grid-cols-1 gap-16">
                  {categoryItems.map((item, idx) => {
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => setSelectedItem(item)}
                        className="group cursor-pointer relative"
                      >
                        <div className="grid grid-cols-12 gap-8 items-center">
                          <div className="col-span-5 relative aspect-square rounded-[3rem] overflow-hidden bg-[#1A1A1A] border border-white/5 group-hover:border-[#196F03]/30 transition-all duration-500">
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover opacity-90 group-hover:scale-110 transition-transform duration-1000"
                            />
                            {item.isPopular && (
                              <div className="absolute top-4 left-4 bg-yellow-400 p-2 rounded-xl shadow-lg border border-yellow-300 z-10">
                                <Star className="h-3 w-3 text-white fill-white" />
                              </div>
                            )}
                          </div>
                          
                          <div className="col-span-7 space-y-3">
                            <div className="flex items-center gap-3">
                              {item.dietaryType === "veg" && (
                                <div className="h-4 w-4 border border-green-600 rounded-[3px] flex items-center justify-center p-[2px]">
                                  <div className="h-full w-full bg-green-600 rounded-full" />
                                </div>
                              )}
                              {item.dietaryType === "non-veg" && (
                                <div className="h-4 w-4 border border-red-600 rounded-[3px] flex items-center justify-center p-[2px]">
                                  <div className="h-full w-full bg-red-600 rounded-full" />
                                </div>
                              )}
                              <span className="text-[14px] font-bold text-[#196F03] tracking-tight">₹{item.price.replace(/[^0-9.]/g, '')}</span>
                            </div>
                            <h3 className="text-2xl font-serif text-white tracking-tight leading-tight group-hover:text-[#196F03] transition-colors">{item.name}</h3>
                            <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{item.description}</p>
                            <div className="pt-2 flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.2em] text-gray-600 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                              View Experience <ArrowRight className="h-2 w-2" />
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


        {/* Item Details Immersive Modal - Premium Dark */}
        <AnimatePresence>
          {selectedItem && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedItem(null)} className="absolute inset-0 bg-black/95 backdrop-blur-3xl" />
              <motion.div
                layoutId={selectedItem.id}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="relative w-full max-w-md bg-[#0F0F0F] rounded-t-[4rem] sm:rounded-[4rem] overflow-hidden shadow-2xl h-[95vh] flex flex-col border-t border-white/10"
              >
                <div className="absolute top-6 inset-x-0 flex justify-center z-[110]">
                  <div className="w-12 h-1.5 bg-white/10 rounded-full" />
                </div>

                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-8 right-8 z-[110] h-12 w-12 bg-white/5 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/10 hover:bg-white/10 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="relative h-[40vh] w-full shrink-0">
                  <Image src={selectedItem.imageUrl} alt={selectedItem.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] via-transparent to-transparent"></div>
                  <div className="absolute bottom-8 left-10 flex gap-3">
                    {selectedItem.dietaryType === "veg" && (
                      <div className="px-5 py-2.5 bg-green-600/10 backdrop-blur-xl text-green-500 text-[10px] font-bold uppercase tracking-widest rounded-2xl border border-green-500/20 shadow-lg">
                        Vegetarian
                      </div>
                    )}
                    {selectedItem.dietaryType === "non-veg" && (
                      <div className="px-5 py-2.5 bg-red-600/10 backdrop-blur-xl text-red-500 text-[10px] font-bold uppercase tracking-widest rounded-2xl border border-red-500/20 shadow-lg">
                        Non-Veg
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-12 pb-12 -mt-16 relative z-10 bg-[#0F0F0F] rounded-t-[4rem] flex-1 flex flex-col">
                  <div className="pt-12 space-y-8 flex-1 overflow-y-auto no-scrollbar">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.4em]">
                        {categories.find(c => c.id === selectedItem.categoryId)?.name || "Signature Selection"}
                      </span>
                    </div>

                    <h2 className="text-5xl font-serif text-white tracking-tight leading-tight">{selectedItem.name}</h2>
                    <p className="text-gray-400 text-lg leading-relaxed font-medium opacity-80">{selectedItem.description}</p>
                    
                    <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-2">Nutrients</span>
                        <span className="text-sm font-bold text-white">450 Calories</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mb-2">Delivery Time</span>
                        <span className="text-sm font-bold text-white">Approx. 20m</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-12 space-y-10 border-t border-white/5">
                    <div className="flex items-baseline justify-between px-2">
                      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.4em]">Total Value</span>
                      <span className="text-5xl font-serif text-white tracking-tight">₹{selectedItem.price.replace(/[^0-9.]/g, '')}</span>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => setSelectedItem(null)}
                        className="h-20 w-20 bg-white/5 text-gray-500 rounded-[2rem] flex items-center justify-center hover:bg-white/10 transition-all shrink-0 border border-white/5"
                      >
                        <ArrowRight className="h-6 w-6 rotate-180" />
                      </button>
                      {restaurant?.whatsapp && (
                        <button
                          onClick={() => handleWhatsAppOrder(selectedItem)}
                          className="flex-1 h-20 text-white font-bold text-[11px] uppercase tracking-[0.3em] rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-4 group"
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
        <footer className="mt-20 py-32 px-10 text-center bg-[#0F0F0F] rounded-t-[5rem] border-t border-white/5">
          <div className="mb-12">
            <Image src="/logo.svg" alt="Menuvo" width={140} height={60} className="mx-auto brightness-200 grayscale opacity-20" />
          </div>
          <p className="text-[10px] font-bold text-gray-700 uppercase tracking-[0.5em] mb-6">Designed by Menuvo Digital</p>
          <div className="h-1 w-12 bg-white/5 mx-auto rounded-full" />
        </footer>
      </div>
    </div>
  );
}
