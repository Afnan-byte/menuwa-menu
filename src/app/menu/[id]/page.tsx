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
  Utensils,
  Star,
  Search,
  Clock,
  Flame,
  ArrowRight,
  ThumbsUp,
  ExternalLink,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

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
  bannerUrl?: string;
  themeColor?: string;
  googleReviewUrl?: string;
}

export default function PublicMenuPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [ratings, setRatings] = useState<Record<string, number>>({});

  const themeColor = restaurant?.themeColor || "#FF9F0D";

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
      setItems(itemSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem)));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRate = (itemId: string, rating: number) => {
    setRatings(prev => ({ ...prev, [itemId]: rating }));
    toast.success(`Rated ${rating} stars! Thanks for your feedback.`);
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = activeCategory === "all" || item.categoryId === activeCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, activeCategory, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center"
        >
          <Utensils className="h-8 w-8 text-gray-200" />
        </motion.div>
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
    <div className="min-h-screen bg-[#FAFBFF] font-sans text-primary selection:bg-gray-100">
      <style jsx global>{`
        :root {
          --brand-color: ${themeColor};
        }
      `}</style>

      <div className="max-w-md mx-auto min-h-screen flex flex-col relative bg-white shadow-[0_0_100px_rgba(0,0,0,0.05)] overflow-hidden">
        
        {/* Immersive Banner Header */}
        <div className="relative h-72 w-full overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-white z-10"></div>
           <Image 
             src={restaurant.logoUrl || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070"} 
             alt="Banner" 
             fill 
             className="object-cover scale-110 blur-[2px]"
           />
           
           <div className="absolute inset-x-0 bottom-0 z-20 p-8 pb-12 flex flex-col items-center text-center">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="h-24 w-24 rounded-[2.5rem] bg-white p-2 shadow-2xl mb-4 relative"
              >
                <div className="relative w-full h-full rounded-[2rem] overflow-hidden">
                  <Image src={restaurant.logoUrl || "/logo.svg"} alt={restaurant.restaurantName} fill className="object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white" style={{ backgroundColor: themeColor }}>
                   <Star className="h-4 w-4 fill-white" />
                </div>
              </motion.div>
              
              <motion.h1 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-4xl font-black tracking-tighter text-primary"
              >
                {restaurant.restaurantName}
              </motion.h1>
              <motion.p 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-gray-500 text-sm font-medium mt-2 max-w-[280px]"
              >
                {restaurant.description || "The finest culinary experience in town."}
              </motion.p>
           </div>

           <div className="absolute top-8 left-8 right-8 z-30 flex justify-between">
              <button className="h-12 w-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all">
                 <ArrowRight className="h-5 w-5 rotate-180" />
              </button>
              <div className="flex gap-3">
                {restaurant.googleReviewUrl && (
                  <a 
                    href={restaurant.googleReviewUrl}
                    target="_blank"
                    className="flex items-center gap-2 px-4 bg-white rounded-2xl text-xs font-black text-primary shadow-lg hover:scale-105 transition-transform"
                  >
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    Review
                  </a>
                )}
                <button className="h-12 w-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all">
                  <Phone className="h-5 w-5" />
                </button>
              </div>
           </div>
        </div>

        {/* Search & Categories Container */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-2xl px-8 py-6 space-y-6 -mt-4 rounded-t-[3rem] shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">
           <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-[var(--brand-color)] transition-colors" />
              <input 
                type="text" 
                placeholder="Search your cravings..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-gray-50 border-transparent rounded-[2rem] text-sm font-bold focus:bg-white focus:ring-4 focus:ring-[var(--brand-color)]/5 transition-all outline-none"
              />
           </div>

           <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setActiveCategory("all")}
                className={cn(
                  "px-6 py-3.5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all",
                  activeCategory === "all" 
                    ? "bg-primary text-white shadow-2xl shadow-primary/20 scale-105" 
                    : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                )}
              >
                Discover All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={activeCategory === cat.id ? { backgroundColor: themeColor } : {}}
                  className={cn(
                    "px-6 py-3.5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all shadow-sm",
                    activeCategory === cat.id 
                      ? "text-white shadow-2xl scale-105" 
                      : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  )}
                >
                  {cat.name}
                </button>
              ))}
           </div>
        </div>

        {/* Content Section */}
        <div className="px-8 mt-8">
           <div className="flex items-center justify-between mb-10">
              <div>
                 <h2 className="text-2xl font-black tracking-tight">Today's Specials</h2>
                 <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Handpicked for you</p>
              </div>
              <Flame className="h-6 w-6 text-red-500 animate-pulse" />
           </div>
           
           <div className="grid grid-cols-2 gap-x-6 gap-y-16 pt-12 pb-32">
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
                  className="bg-white rounded-[3rem] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative group cursor-pointer hover:shadow-[0_30px_70px_rgba(0,0,0,0.1)] transition-all duration-500 border border-gray-50"
                >
                    {/* Floating Badge */}
                    <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full shadow-sm border border-gray-100">
                       <div className="flex items-center gap-1">
                          <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-[9px] font-black">4.9</span>
                       </div>
                    </div>

                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-32 h-32 md:w-36 md:h-36 pointer-events-none drop-shadow-[0_25px_25px_rgba(0,0,0,0.2)]">
                       {item.imageUrl ? (
                         <div className="relative w-full h-full">
                           <motion.div 
                             animate={{ rotate: [0, 5, 0, -5, 0], y: [0, -5, 0] }}
                             transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                             className="relative w-full h-full"
                           >
                              <Image 
                                src={item.imageUrl} 
                                alt={item.name} 
                                fill 
                                className="object-contain group-hover:scale-125 transition-transform duration-700" 
                                sizes="(max-width: 768px) 150px"
                              />
                           </motion.div>
                         </div>
                       ) : (
                         <div className="h-full w-full bg-gray-50 rounded-full flex items-center justify-center border-8 border-white shadow-2xl">
                            <Utensils className="h-10 w-10 text-gray-200" />
                         </div>
                       )}
                    </div>

                    <div className="pt-20 text-center">
                       <h3 className="text-sm font-black text-primary mb-1 line-clamp-1 group-hover:text-[var(--brand-color)] transition-colors">
                          {item.name}
                       </h3>
                       <p className="text-[10px] text-gray-400 font-medium mb-4 line-clamp-2 leading-relaxed px-1">
                          {item.description || "A delicious treat prepared with fresh ingredients."}
                       </p>
                       
                       <div className="flex items-center justify-between gap-2 bg-gray-50/50 p-2 rounded-2xl group-hover:bg-gray-50 transition-colors">
                          <span className="font-black text-lg ml-1" style={{ color: themeColor }}>${item.price}</span>
                          <button 
                            className="h-10 w-10 text-white rounded-xl flex items-center justify-center shadow-lg transition-transform active:scale-90"
                            style={{ backgroundColor: themeColor }}
                          >
                             <Plus className="h-5 w-5" />
                          </button>
                       </div>

                       {/* Interactive Rating System */}
                       <div className="mt-4 flex items-center justify-center gap-1 border-t border-gray-50 pt-4">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleRate(item.id, star)}
                              className="p-0.5 hover:scale-125 transition-transform"
                            >
                              <Star 
                                className={cn(
                                  "h-3 w-3", 
                                  (ratings[item.id] || 0) >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                                )} 
                              />
                            </button>
                          ))}
                       </div>
                    </div>
                </motion.div>
              ))}
            </AnimatePresence>
           </div>
        </div>

        {/* Google Review Call to Action */}
        {restaurant.googleReviewUrl && (
          <div className="px-8 mb-12">
             <a 
               href={restaurant.googleReviewUrl}
               target="_blank"
               className="block w-full bg-primary p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl shadow-primary/20"
             >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10 flex items-center justify-between">
                   <div className="space-y-1">
                      <h4 className="text-white font-black text-xl tracking-tight">Loved the experience?</h4>
                      <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Rate us on Google Maps</p>
                   </div>
                   <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
                      <ExternalLink className="h-6 w-6" />
                   </div>
                </div>
             </a>
          </div>
        )}

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6">
             <div className="h-24 w-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center">
                <Utensils className="h-12 w-12 text-gray-200" />
             </div>
             <div>
                <p className="text-xl font-black text-primary tracking-tight">No results found</p>
                <p className="text-sm font-medium text-gray-400 mt-1">Try a different keyword or category.</p>
             </div>
             <button 
               onClick={() => {setSearchQuery(""); setActiveCategory("all");}}
               className="px-8 py-3 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20"
             >
                Reset Filter
              </button>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-10 py-16 px-8 text-center border-t border-gray-50 bg-gray-50/30">
            <div className="flex items-center justify-center gap-6 mb-8">
               <button className="h-12 w-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-400 hover:text-primary transition-colors">
                  <Phone className="h-5 w-5" />
               </button>
               <button className="h-12 w-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-400 hover:text-primary transition-colors">
                  <MessageCircle className="h-5 w-5" />
               </button>
               <button className="h-12 w-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-400 hover:text-primary transition-colors">
                  <Info className="h-5 w-5" />
               </button>
            </div>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4">Powered by</p>
            <h2 className="text-2xl font-black tracking-tighter text-primary/20 uppercase">Menuvo</h2>
        </footer>
      </div>
    </div>
  );
}
