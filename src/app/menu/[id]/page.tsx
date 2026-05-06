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
  Heart,
  Navigation
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
        isPopular: idx % 4 === 0, 
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
      const offset = 220; 
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
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-gray-100 border-t-[#196F03] rounded-full" 
          />
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

  const featuredItems = items.filter(i => i.isPopular).slice(0, 6);
  const heroImage = restaurant?.bannerUrl || items[0]?.imageUrl || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070";

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans selection:bg-[#196F03]/10">
      <div className="max-w-md mx-auto bg-white min-h-screen relative shadow-[0_0_100px_rgba(0,0,0,0.05)]">
        
        {/* Immersive Gourmet Hero */}
        <div className="relative h-[480px] w-full overflow-hidden">
           <motion.div 
             initial={{ scale: 1.2 }}
             animate={{ scale: 1 }}
             transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
             className="absolute inset-0"
           >
             <Image src={heroImage} alt="Hero" fill className="object-cover" priority />
           </motion.div>
           <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-white" />
           
           <div className="absolute top-10 right-6 flex gap-3">
             <button className="h-11 w-11 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
               <Share2 className="h-4 w-4" />
             </button>
             <button className="h-11 w-11 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-all">
               <Heart className="h-4 w-4" />
             </button>
           </div>

           <div className="absolute inset-0 flex flex-col items-center justify-end pb-14 px-8 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-28 w-28 rounded-[3rem] p-1.5 bg-white/30 backdrop-blur-2xl shadow-2xl mb-8 border border-white/50"
              >
                <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden bg-white">
                  <Image src={restaurant?.logoUrl || "/logo.svg"} alt="Logo" fill className="object-cover" />
                </div>
              </motion.div>
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-none italic font-serif">
                {restaurant?.restaurantName || "Menuvo"}
              </h1>
              <div className="flex items-center gap-4 mt-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-gray-100">
                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-[10px] font-black text-gray-900 tracking-widest uppercase">4.9 Masterpiece</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-[#196F03] rounded-full shadow-lg shadow-[#196F03]/20">
                  <Navigation className="h-3 w-3 text-white fill-white" />
                  <span className="text-[10px] font-black text-white tracking-widest uppercase">Visit Us</span>
                </div>
              </div>
           </div>
        </div>

        {/* Professional Search & Filters Area */}
        <div className="sticky top-0 z-[110] bg-white/95 backdrop-blur-2xl border-b border-gray-100 px-6 py-6 space-y-6 shadow-sm">
           <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-focus-within:text-[#196F03] transition-colors" />
              <input 
                type="text" 
                placeholder="Craving something specific?" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4.5 bg-gray-50/50 border border-transparent rounded-[1.5rem] text-xs font-bold focus:bg-white focus:border-[#196F03]/20 focus:ring-4 focus:ring-[#196F03]/5 outline-none transition-all"
              />
           </div>

           <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
              <button onClick={() => setDietaryFilter("all")} className={cn("px-6 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all", dietaryFilter === "all" ? "bg-gray-900 text-white shadow-lg" : "bg-gray-50 text-gray-400")}>All</button>
              <button onClick={() => setDietaryFilter("veg")} className={cn("flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border", dietaryFilter === "veg" ? "bg-green-50 border-green-200 text-green-700" : "bg-white border-gray-100 text-gray-400")}>
                <div className="h-2 w-2 bg-green-500 rounded-full" /> Veg
              </button>
              <button onClick={() => setDietaryFilter("non-veg")} className={cn("flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border", dietaryFilter === "non-veg" ? "bg-red-50 border-red-200 text-red-700" : "bg-white border-gray-100 text-gray-400")}>
                <div className="h-0 w-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-red-500" /> Non-Veg
              </button>
           </div>
        </div>

        {/* Sticky Category Glass Bar */}
        <div className="sticky top-[164px] z-[100] bg-white/90 backdrop-blur-xl border-b border-gray-50/50 px-6 py-4 flex items-center gap-3 overflow-x-auto no-scrollbar" ref={categoryBarRef}>
          {categories.map((cat) => (
            <button 
              key={cat.id}
              id={`pill-${cat.id}`}
              onClick={() => scrollToCategory(cat.id)}
              className={cn(
                "flex-shrink-0 px-8 py-3 rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.15em] transition-all relative overflow-hidden",
                activeCategory === cat.id ? "text-white shadow-2xl scale-105" : "text-gray-400 hover:text-gray-900"
              )}
              style={activeCategory === cat.id ? { backgroundColor: themeColor } : {}}
            >
              {cat.name}
              {activeCategory === cat.id && <motion.div layoutId="pill-glow" className="absolute inset-0 bg-white/20" />}
            </button>
          ))}
        </div>

        <div className="px-6 py-12 space-y-20">
          
          {/* Curated Specials - Beautiful Card Row */}
          {featuredItems.length > 0 && !searchQuery && (
            <section className="space-y-8">
              <div className="flex items-center justify-between px-2">
                <div>
                  <h3 className="text-xs font-black text-[#196F03] uppercase tracking-[0.3em]">Must-Try</h3>
                  <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mt-1">Today&apos;s Specials</h2>
                </div>
                <div className="h-10 w-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>
              <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6 px-2 -mx-4">
                {featuredItems.map((item) => (
                  <motion.div 
                    key={item.id} 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedItem(item)}
                    className="flex-shrink-0 w-72 space-y-4 cursor-pointer group"
                  >
                    <div className="relative h-48 w-full rounded-[3.5rem] overflow-hidden shadow-2xl">
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-6 right-6 bg-[#196F03] px-5 py-2 rounded-full text-xs font-black text-white shadow-xl border border-white/20">
                        {item.price}
                      </div>
                      <div className="absolute bottom-6 left-8">
                        <h4 className="text-xl font-bold text-white tracking-tight leading-none mb-2">{item.name}</h4>
                        <div className="flex items-center gap-2 opacity-80">
                           <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                           <span className="text-[10px] font-bold text-white uppercase tracking-widest">Highly Rated</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Elegant Item Feed */}
          {categories.map((cat) => {
            const categoryItems = filteredItems.filter(item => item.categoryId === cat.id);
            if (categoryItems.length === 0) return null;

            return (
              <section 
                key={cat.id} 
                id={cat.id} 
                ref={(el) => { sectionRefs.current[cat.id] = el }}
                className="scroll-mt-64 space-y-12"
              >
                <div className="flex items-center gap-6 px-2">
                  <h2 className="text-3xl font-extrabold text-gray-900 tracking-tighter italic font-serif lowercase">{cat.name}</h2>
                  <div className="h-[2px] flex-1 bg-gradient-to-r from-gray-100 to-transparent" />
                </div>

                <div className="space-y-12">
                  {categoryItems.map((item, idx) => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => setSelectedItem(item)}
                      className="group flex items-start gap-8 cursor-pointer relative"
                    >
                      {/* Left: Beautiful Circle Thumbnail with Shadow */}
                      <div className="relative h-28 w-28 flex-shrink-0">
                         <div className="absolute inset-0 bg-gray-100 rounded-full blur-2xl opacity-50 translate-y-4 scale-90" />
                         <div className="relative h-full w-full rounded-full overflow-hidden border-4 border-white shadow-xl group-hover:scale-105 transition-all duration-500">
                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                         </div>
                         {item.isPopular && (
                           <div className="absolute -top-2 -right-2 h-10 w-10 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white z-10">
                              <Flame className="h-4 w-4 fill-white" />
                           </div>
                         )}
                      </div>

                      {/* Right: Sophisticated Info */}
                      <div className="flex-1 pt-2 space-y-2.5">
                        <div className="flex items-center gap-3">
                          {item.dietaryType === "veg" && (
                            <div className="h-4 w-4 border-2 border-green-600 p-[3px] flex items-center justify-center rounded-[4px] shrink-0">
                              <div className="h-2 w-2 bg-green-600 rounded-full shadow-sm shadow-green-600/50" />
                            </div>
                          )}
                          {item.dietaryType === "non-veg" && (
                            <div className="h-4 w-4 border-2 border-red-600 p-[3px] flex items-center justify-center rounded-[4px] shrink-0">
                               <div className="h-0 w-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6.5px] border-b-red-600" />
                            </div>
                          )}
                          <h3 className="text-lg font-extrabold text-gray-900 tracking-tight group-hover:text-[#196F03] transition-colors leading-none">{item.name}</h3>
                        </div>

                        <p className="text-[12px] text-gray-400 font-medium leading-relaxed line-clamp-2 italic pr-6 opacity-80">
                          {item.description}
                        </p>

                        <div className="pt-2">
                           <div className="inline-flex items-center gap-3 bg-gray-50 hover:bg-[#196F03]/5 px-5 py-2.5 rounded-[1.25rem] border border-gray-100 group-hover:border-[#196F03]/20 transition-all">
                              <span className="text-[13px] font-black text-[#196F03] tracking-tighter">{item.price}</span>
                              <div className="h-3 w-px bg-gray-200" />
                              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Order</span>
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="mt-20 py-40 px-12 text-center bg-[#FDFCFB] border-t border-gray-100/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#196F03]/10 to-transparent" />
          <div className="mb-14">
            <Image src="/logo.svg" alt="Menuvo" width={140} height={50} className="mx-auto grayscale opacity-40 hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.6em] mb-8 leading-relaxed">Artisan Crafted by Menuvo Digital</p>
          <div className="flex justify-center gap-8 mb-16">
             <div className="h-10 w-10 rounded-2xl bg-white shadow-sm border border-gray-50 flex items-center justify-center text-gray-300 hover:text-black transition-colors"><Star className="h-4 w-4" /></div>
             <div className="h-10 w-10 rounded-2xl bg-white shadow-sm border border-gray-50 flex items-center justify-center text-gray-300 hover:text-black transition-colors"><Utensils className="h-4 w-4" /></div>
             <div className="h-10 w-10 rounded-2xl bg-white shadow-sm border border-gray-50 flex items-center justify-center text-gray-300 hover:text-black transition-colors"><Navigation className="h-4 w-4" /></div>
          </div>
          <div className="h-1.5 w-16 bg-gray-100 mx-auto rounded-full" />
        </footer>

        {/* Premium Bottom Sheet Details */}
        <AnimatePresence>
          {selectedItem && (
            <div className="fixed inset-0 z-[200] flex items-end justify-center overflow-hidden">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedItem(null)} className="absolute inset-0 bg-black/60 backdrop-blur-xl" />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="relative w-full max-w-md bg-white rounded-t-[5rem] shadow-2xl h-[90vh] flex flex-col overflow-hidden"
              >
                <div className="absolute top-8 inset-x-0 flex justify-center z-[210]">
                   <div className="w-14 h-1.5 bg-gray-100 rounded-full" />
                </div>
                
                <button 
                  onClick={() => setSelectedItem(null)} 
                  className="absolute top-10 right-10 z-[210] h-12 w-12 bg-gray-50/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-black transition-all"
                >
                  <X className="h-6 w-6" />
                </button>

                <div className="flex-1 overflow-y-auto no-scrollbar pb-16">
                  <div className="relative h-[45vh] w-full px-8 pt-20">
                    <div className="relative w-full h-full rounded-[4rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] border-8 border-white">
                      <Image src={selectedItem.imageUrl} alt={selectedItem.name} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    </div>
                  </div>

                  <div className="px-12 pt-14 space-y-12">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        {selectedItem.dietaryType === "veg" && <div className="h-5 w-5 border-2 border-green-600 p-1 flex items-center justify-center rounded-md"><div className="h-2 w-2 bg-green-600 rounded-full" /></div>}
                        {selectedItem.dietaryType === "non-veg" && <div className="h-5 w-5 border-2 border-red-600 p-1 flex items-center justify-center rounded-md"><div className="h-0 w-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-red-600" /></div>}
                        <span className="text-[10px] font-black text-[#196F03] uppercase tracking-[0.4em]">{categories.find(c => c.id === selectedItem.categoryId)?.name || "Signature"}</span>
                      </div>
                      <h2 className="text-5xl font-extrabold text-gray-900 tracking-tight leading-tight italic font-serif">{selectedItem.name}</h2>
                      <p className="text-gray-400 text-lg font-medium leading-relaxed italic pr-4">{selectedItem.description}</p>
                    </div>

                    <div className="space-y-10">
                      <div className="flex items-end justify-between px-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em] mb-4">Investment</span>
                          <span className="text-6xl font-extrabold text-[#196F03] tracking-tighter leading-none">{selectedItem.price}</span>
                        </div>
                        <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-2xl text-[10px] font-black text-gray-400 border border-gray-100 shadow-sm">
                           <Clock className="h-4 w-4" /> 15 MINS
                        </div>
                      </div>

                      {restaurant?.whatsapp && (
                        <button 
                          onClick={() => handleWhatsAppOrder(selectedItem)}
                          className="w-full h-24 text-white font-black text-[11px] uppercase tracking-[0.4em] rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(25,111,3,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-5 group"
                          style={{ backgroundColor: themeColor }}
                        >
                          <MessageCircle className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                          Reserve via WhatsApp
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
