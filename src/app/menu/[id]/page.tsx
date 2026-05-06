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
  Search,
  Filter,
  Check,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [dietaryFilter, setDietaryFilter] = useState<"all" | "veg" | "non-veg">("all");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("");

  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const categoryBarRef = useRef<HTMLDivElement>(null);

  const themeColor = restaurant?.themeColor || "#196F03";

  useEffect(() => {
    if (id) {
      fetchMenu();
    }
  }, [id]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveCategory(entry.target.id);
          // Auto-scroll the pill bar
          const pill = document.getElementById(`pill-${entry.target.id}`);
          if (pill && categoryBarRef.current) {
            categoryBarRef.current.scrollTo({
              left: pill.offsetLeft - 24,
              behavior: "smooth"
            });
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    Object.values(sectionRefs.current).forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [categories]);

  const fetchMenu = async () => {
    try {
      const resSnap = await getDoc(doc(db, "restaurants", id as string));
      if (resSnap.exists()) {
        setRestaurant(resSnap.data() as Restaurant);
      }

      const catQuery = query(collection(db, "categories"), where("restaurantId", "==", id));
      const catSnap = await getDocs(catQuery);
      const fetchedCategories = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
      setCategories(fetchedCategories);
      if (fetchedCategories.length > 0) setActiveCategory(fetchedCategories[0].id);

      const itemQuery = query(collection(db, "items"), where("restaurantId", "==", id), where("isAvailable", "==", true));
      const itemSnap = await getDocs(itemQuery);
      
      const fetchedItems = itemSnap.docs.map((doc, idx) => ({ 
        id: doc.id, 
        ...doc.data(),
        isPopular: idx % 6 === 0, // Mock popular for curation
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
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDietary = dietaryFilter === "all" || item.dietaryType === dietaryFilter;
      return matchesSearch && matchesDietary;
    });
  }, [items, searchQuery, dietaryFilter]);

  const scrollToCategory = (catId: string) => {
    const element = sectionRefs.current[catId];
    if (element) {
      const offset = 180; // Account for sticky header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 border-4 border-gray-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-[#196F03] rounded-full animate-spin" />
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

  const featuredItems = items.filter(i => i.isPopular).slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans selection:bg-[#196F03]/10 pb-20">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative">
        
        {/* Sticky Professional Header */}
        <div className="sticky top-0 z-[100] bg-white border-b border-gray-100 px-6 pt-10 pb-4 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative">
                <Image src={restaurant?.logoUrl || "/logo.svg"} alt="Logo" fill className="object-cover" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight leading-none">{restaurant?.restaurantName || "Menu"}</h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                  <Star className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400" /> 4.9 · {restaurant?.description || "Authentic Cuisine"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="h-10 w-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                <Heart className="h-5 w-5" />
              </button>
              <button className="h-10 w-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-[#196F03] transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Search Bar - Critical for discoverability */}
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-focus-within:text-[#196F03] transition-colors" />
            <input 
              type="text" 
              placeholder="Search dishes, ingredients..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl text-xs font-bold focus:bg-white focus:border-[#196F03]/20 focus:ring-4 focus:ring-[#196F03]/5 outline-none transition-all"
            />
          </div>

          {/* Dietary Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button 
              onClick={() => setDietaryFilter("all")}
              className={cn(
                "px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap",
                dietaryFilter === "all" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-400 border-gray-100 hover:border-gray-300"
              )}
            >
              All
            </button>
            <button 
              onClick={() => setDietaryFilter("veg")}
              className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap",
                dietaryFilter === "veg" ? "bg-green-600 text-white border-green-600 shadow-lg shadow-green-600/20" : "bg-white text-gray-400 border-gray-100 hover:border-green-200"
              )}
            >
              <div className="h-2 w-2 bg-green-600 rounded-full border border-white" />
              Veg Only
            </button>
            <button 
              onClick={() => setDietaryFilter("non-veg")}
              className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap",
                dietaryFilter === "non-veg" ? "bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20" : "bg-white text-gray-400 border-gray-100 hover:border-red-200"
              )}
            >
              <div className="h-0 w-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-red-600" />
              Non-Veg
            </button>
          </div>
        </div>

        {/* Dynamic Category Pill Bar - Sticky below search */}
        <div className="sticky top-[244px] z-[90] bg-white/95 backdrop-blur-xl border-b border-gray-50 px-6 py-4 flex items-center gap-3 overflow-x-auto no-scrollbar" ref={categoryBarRef}>
          {categories.map((cat) => (
            <button 
              key={cat.id}
              id={`pill-${cat.id}`}
              onClick={() => scrollToCategory(cat.id)}
              className={cn(
                "flex-shrink-0 px-6 py-2.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest transition-all",
                activeCategory === cat.id 
                  ? "text-white shadow-xl scale-105" 
                  : "text-gray-400 bg-gray-50 hover:bg-gray-100"
              )}
              style={activeCategory === cat.id ? { backgroundColor: themeColor } : {}}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="px-6 py-8 space-y-12">
          
          {/* Today's Specials - Featured Horizontal Scroll */}
          {featuredItems.length > 0 && !searchQuery && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em]">Chef&apos;s Specials</h3>
                <span className="text-[10px] font-bold text-[#196F03]">Daily Pick</span>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-2 px-2">
                {featuredItems.map((item) => (
                  <motion.div 
                    key={item.id} 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedItem(item)}
                    className="flex-shrink-0 w-[160px] space-y-3 cursor-pointer"
                  >
                    <div className="relative h-24 w-full rounded-2xl overflow-hidden shadow-lg">
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      {/* Featured Price Tag: Premium Pill */}
                      <div className="absolute top-2 right-2 bg-[#196F03] px-3 py-1 rounded-full text-[9px] font-black text-white border border-white/30 shadow-lg">{item.price}</div>
                    </div>
                    <div className="px-1">
                      <h4 className="text-[11px] font-bold text-gray-900 line-clamp-1 truncate">{item.name}</h4>
                      <p className="text-[9px] font-bold text-orange-500 uppercase tracking-widest mt-0.5">Top Choice</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Flattened Item Feed */}
          {categories.map((cat) => {
            const categoryItems = filteredItems.filter(item => item.categoryId === cat.id);
            if (categoryItems.length === 0) return null;

            return (
              <section 
                key={cat.id} 
                id={cat.id} 
                ref={(el) => { sectionRefs.current[cat.id] = el }}
                className="scroll-mt-60 space-y-8"
              >
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">{cat.name}</h2>
                  <div className="h-px flex-1 bg-gray-50" />
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{categoryItems.length} items</span>
                </div>

                <div className="space-y-10">
                  {categoryItems.map((item) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      onClick={() => setSelectedItem(item)}
                      className="group flex gap-6 cursor-pointer relative"
                    >
                      {/* Left: 80x80 Item Thumbnail */}
                      <div className="relative h-24 w-24 flex-shrink-0 rounded-[2rem] overflow-hidden shadow-2xl border border-gray-100 group-hover:scale-105 transition-transform duration-500">
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                        {item.isPopular && (
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <Flame className="h-5 w-5 text-white fill-white drop-shadow-xl" />
                          </div>
                        )}
                      </div>

                      {/* Right Column: Info Dense */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center space-y-2">
                        <div className="flex items-center gap-2">
                          {item.dietaryType === "veg" && (
                            <div className="h-3.5 w-3.5 border-2 border-green-600 p-0.5 flex items-center justify-center rounded-[2px] shrink-0">
                              <div className="h-1.5 w-1.5 bg-green-600 rounded-full" />
                            </div>
                          )}
                          {item.dietaryType === "non-veg" && (
                            <div className="h-3.5 w-3.5 border-2 border-red-600 p-0.5 flex items-center justify-center rounded-[2px] shrink-0">
                               <div className="h-0 w-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-red-600" />
                            </div>
                          )}
                          <h3 className="text-base font-black text-gray-900 tracking-tight line-clamp-1 group-hover:text-[#196F03] transition-colors">{item.name}</h3>
                        </div>

                        {/* Description - 2 lines clipping */}
                        <p className="text-[11px] text-gray-400 font-medium leading-relaxed line-clamp-2 pr-4">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between mt-1">
                          {/* List Price Tag: Brand Green Capsule */}
                          <div className="bg-[#196F03]/5 px-3 py-1 rounded-lg border border-[#196F03]/10">
                            <span className="text-[13px] font-black text-[#196F03] tracking-tighter">{item.price}</span>
                          </div>
                          {item.isPopular && (
                            <span className="text-[9px] font-bold text-orange-500 uppercase tracking-[0.2em] bg-orange-50 px-3 py-1 rounded-full">Popular</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            );
          })}

          {filteredItems.length === 0 && (
            <div className="py-20 text-center space-y-6">
              <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                <Search className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight">No results found</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">Try searching for something else</p>
              </div>
              <button 
                onClick={() => { setSearchQuery(""); setDietaryFilter("all"); }}
                className="px-8 py-3 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-20 py-32 px-10 text-center bg-gray-50/80 border-t border-gray-100">
          <div className="mb-12">
            <Image src="/logo.svg" alt="Menuvo" width={120} height={40} className="mx-auto grayscale opacity-40" />
          </div>
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.5em] mb-6">Designed by Menuvo Digital</p>
          <div className="h-1 w-12 bg-gray-200 mx-auto rounded-full" />
        </footer>

        {/* Item Details - Bottom Sheet Pattern */}
        <AnimatePresence>
          {selectedItem && (
            <div className="fixed inset-0 z-[200] flex items-end justify-center overflow-hidden">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setSelectedItem(null)} 
                className="absolute inset-0 bg-black/80 backdrop-blur-md" 
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="relative w-full max-w-md bg-white rounded-t-[4rem] shadow-2xl h-[85vh] flex flex-col overflow-hidden"
              >
                {/* Drag Handle */}
                <div className="h-20 shrink-0 flex items-center justify-center">
                  <div className="w-12 h-1.5 bg-gray-100 rounded-full" />
                </div>

                <button 
                  onClick={() => setSelectedItem(null)} 
                  className="absolute top-6 right-8 h-10 w-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 hover:text-gray-900 transition-all z-20"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                  <div className="relative h-72 w-full px-8">
                    <div className="relative w-full h-full rounded-[3rem] overflow-hidden shadow-2xl">
                      <Image src={selectedItem.imageUrl} alt={selectedItem.name} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute bottom-6 left-8">
                         {selectedItem.isPopular && (
                           <div className="px-4 py-2 bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl flex items-center gap-2 border border-orange-400">
                             <Flame className="h-3 w-3 fill-white" /> Chef&apos;s Pick
                           </div>
                         )}
                      </div>
                    </div>
                  </div>

                  <div className="px-10 pt-10 space-y-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        {selectedItem.dietaryType === "veg" && (
                          <div className="h-5 w-5 border-2 border-green-600 p-1 flex items-center justify-center rounded-md shrink-0">
                            <div className="h-2 w-2 bg-green-600 rounded-full" />
                          </div>
                        )}
                        {selectedItem.dietaryType === "non-veg" && (
                          <div className="h-5 w-5 border-2 border-red-600 p-1 flex items-center justify-center rounded-md shrink-0">
                            <div className="h-0 w-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-red-600" />
                          </div>
                        )}
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">{selectedItem.name}</h2>
                      </div>
                      <p className="text-gray-500 text-base font-medium leading-relaxed opacity-80">{selectedItem.description}</p>
                    </div>

                    <div className="space-y-8">
                      <div className="flex items-end justify-between px-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em] mb-3">Item Price</span>
                          {/* Large Detail Price Tag: Brand Green Bold */}
                          <span className="text-5xl font-black text-[#196F03] tracking-tight leading-none">{selectedItem.price}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 rounded-xl text-[10px] font-black text-gray-400 border border-gray-100">
                           <Clock className="h-3 w-3" /> 15-20 MINS
                        </div>
                      </div>

                      {restaurant?.whatsapp && (
                        <button 
                          onClick={() => handleWhatsAppOrder(selectedItem)}
                          className="w-full h-20 text-white font-black text-xs uppercase tracking-[0.3em] rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(25,111,3,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-4 group"
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
      </div>
    </div>
  );
}
