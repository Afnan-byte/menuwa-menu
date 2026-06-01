"use client";

import { useState, useEffect, useMemo, useDeferredValue } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import {
  Utensils,
  LayoutGrid,
  X,
  Leaf,
  Flame,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "25, 111, 3";
};

// ─── Skeleton shown immediately while data loads ───────────────────────────
function MenuSkeleton() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden font-sans bg-[#0A0A0A] pb-32">
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative">
        <header className="relative w-full flex flex-col items-center justify-center pt-24 pb-2">
          <div className="absolute top-6 left-6 z-30">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white/5 animate-pulse border border-white/10" />
          </div>
        </header>
        <div className="px-6 relative z-30 space-y-5 mt-4">
          <div className="h-14 w-full bg-white/5 rounded-3xl animate-pulse" />
          <div className="flex items-center gap-3 overflow-x-hidden pb-2 pt-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 w-28 flex-shrink-0 bg-white/5 rounded-full animate-pulse" />
            ))}
          </div>
        </div>
        <section className="pt-6 pb-2">
          <div className="px-6 mb-5">
            <div className="h-6 w-32 bg-white/5 rounded-md animate-pulse" />
          </div>
          <div className="flex gap-4 overflow-x-hidden px-6 pb-6">
            {[1, 2].map((i) => (
              <div key={i} className="flex-shrink-0 w-64 aspect-[3/4] rounded-[2rem] bg-white/5 animate-pulse" />
            ))}
          </div>
        </section>
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

// ─── Book viewer ────────────────────────────────────────────────────────────
function BookViewer({ pages }: { pages: string[] }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);

  return (
    <div
      className="fixed inset-0 bg-[#0A0A0A] overflow-hidden select-none z-[100] flex flex-col p-4 md:p-8"
      style={{ perspective: "1500px" }}
    >
      {/* Ambient background — CSS transition, no JS animation */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pages[currentPage]}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover scale-110 transition-opacity duration-700"
          style={{ filter: "blur(40px) saturate(1.5)", opacity: 0.25 }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-[#0A0A0A]" />
      </div>

      <AnimatePresence initial={false} custom={direction}>
        <motion.img
          key={currentPage}
          src={pages[currentPage]}
          alt={`Menu page ${currentPage + 1}`}
          custom={direction}
          variants={{
            enter: (d: number) => ({ rotateY: d > 0 ? 90 : -90, opacity: 0, scale: 0.9, originX: d > 0 ? 1 : 0 }),
            center: (d: number) => ({ zIndex: 1, rotateY: 0, opacity: 1, scale: 1, originX: d > 0 ? 1 : 0 }),
            exit: (d: number) => ({ zIndex: 0, rotateY: d < 0 ? 90 : -90, opacity: 0, scale: 0.9, originX: d < 0 ? 1 : 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            rotateY: { type: "spring", stiffness: 200, damping: 25 },
            opacity: { duration: 0.3 },
            scale: { duration: 0.3 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.8}
          onDragEnd={(_, { offset, velocity }) => {
            const swipe = Math.abs(offset.x) * velocity.x;
            if (swipe < -5000 && currentPage < pages.length - 1) {
              setDirection(1);
              setCurrentPage((p) => p + 1);
            } else if (swipe > 5000 && currentPage > 0) {
              setDirection(-1);
              setCurrentPage((p) => p - 1);
            }
          }}
          className="absolute inset-0 m-auto w-full h-full max-w-5xl object-contain pointer-events-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10"
        />
      </AnimatePresence>

      <div className="absolute bottom-10 inset-x-0 flex flex-col items-center justify-center z-20 pointer-events-none">
        <div className="flex items-center gap-2 mb-5 bg-white/5 border border-white/10 px-5 py-3 rounded-full shadow-2xl pointer-events-auto"
          style={{ backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}>
          {pages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > currentPage ? 1 : -1);
                setCurrentPage(idx);
              }}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                currentPage === idx ? "w-8 bg-white" : "w-2 bg-white/20 hover:bg-white/40"
              )}
            />
          ))}
        </div>
        <div className="flex flex-col items-center gap-1.5 opacity-90">
          <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/90 drop-shadow-md">Menu Book</span>
          <span className="text-[9px] uppercase tracking-[0.5em] text-white/40 font-medium">Swipe to Explore</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────
export default function PublicMenuPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Search: input state is instant, filter is deferred (React 19)
  const [searchQuery, setSearchQuery] = useState("");
  const deferredQuery = useDeferredValue(searchQuery);

  const [dietaryFilter, setDietaryFilter] = useState<"all" | "veg" | "non-veg">("all");
  const [currentBookPage, setCurrentBookPage] = useState(0);
  const [direction, setDirection] = useState(0);

  const themeColor = restaurant?.themeColor || "#196F03";
  const themeRgb = useMemo(() => hexToRgb(themeColor), [themeColor]);

  // isDark driven by restaurant setting (not hardcoded)
  const isDark = restaurant?.menuTheme !== "light";

  useEffect(() => {
    if (id) fetchMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchMenu = async () => {
    try {
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

      // Step 1: find restaurant by menuId (6-char) or direct doc ID
      let restaurantId: string | null = null;
      let restaurantData: Restaurant | null = null;

      if (id && (id as string).length === 6) {
        // Query by menuId field
        const queryRes = await fetch(`${baseUrl}:runQuery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            structuredQuery: {
              from: [{ collectionId: "restaurants" }],
              where: {
                fieldFilter: {
                  field: { fieldPath: "menuId" },
                  op: "EQUAL",
                  value: { stringValue: id },
                },
              },
              limit: 1,
            },
          }),
        });
        const queryDocs = await queryRes.json();
        const found = queryDocs[0]?.document;
        if (found) {
          restaurantId = found.name.split("/").pop();
          restaurantData = firestoreDocToObj(found.fields) as Restaurant;
        }
      } else {
        // Direct document lookup
        const res = await fetch(`${baseUrl}/restaurants/${id}`);
        if (res.ok) {
          const doc = await res.json();
          restaurantId = (id as string);
          restaurantData = firestoreDocToObj(doc.fields) as Restaurant;
        }
      }

      if (!restaurantId || !restaurantData) return;
      setRestaurant(restaurantData);

      // Step 2: fetch categories and items in parallel — pure REST, no SDK
      const [catRes, itemRes] = await Promise.all([
        fetch(`${baseUrl}:runQuery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            structuredQuery: {
              from: [{ collectionId: "categories" }],
              where: { fieldFilter: { field: { fieldPath: "restaurantId" }, op: "EQUAL", value: { stringValue: restaurantId } } },
            },
          }),
        }),
        fetch(`${baseUrl}:runQuery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            structuredQuery: {
              from: [{ collectionId: "items" }],
              where: { fieldFilter: { field: { fieldPath: "restaurantId" }, op: "EQUAL", value: { stringValue: restaurantId } } },
            },
          }),
        }),
      ]);

      const [catDocs, itemDocs] = await Promise.all([catRes.json(), itemRes.json()]);

      setCategories(
        catDocs
          .filter((d: any) => d.document)
          .map((d: any) => ({ id: d.document.name.split("/").pop(), ...firestoreDocToObj(d.document.fields) } as Category))
      );
      setItems(
        itemDocs
          .filter((d: any) => d.document)
          .map((d: any) => ({ id: d.document.name.split("/").pop(), ...firestoreDocToObj(d.document.fields) } as MenuItem))
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Converts Firestore REST field map to a plain JS object
  function firestoreDocToObj(fields: Record<string, any>): Record<string, any> {
    if (!fields) return {};
    const result: Record<string, any> = {};
    for (const [key, val] of Object.entries(fields)) {
      result[key] = firestoreValueToJs(val);
    }
    return result;
  }

  function firestoreValueToJs(val: any): any {
    if (val.stringValue !== undefined) return val.stringValue;
    if (val.integerValue !== undefined) return Number(val.integerValue);
    if (val.doubleValue !== undefined) return val.doubleValue;
    if (val.booleanValue !== undefined) return val.booleanValue;
    if (val.nullValue !== undefined) return null;
    if (val.arrayValue) return (val.arrayValue.values || []).map(firestoreValueToJs);
    if (val.mapValue) return firestoreDocToObj(val.mapValue.fields || {});
    return null;
  }

  // FIX: uses deferredQuery — input stays instant, filter runs on idle
  const filteredItems = useMemo(() => {
    const q = deferredQuery.toLowerCase();
    return items.filter((item) => {
      const matchesCategory = activeCategory === "all" || item.categoryId === activeCategory;
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q);
      const matchesDietary = dietaryFilter === "all" || item.dietaryType === dietaryFilter;
      return matchesCategory && matchesSearch && matchesDietary;
    });
  }, [items, activeCategory, deferredQuery, dietaryFilter]);

  const featuredItems = useMemo(() => items.filter((i) => i.isPopular), [items]);

  if (loading) return <MenuSkeleton />;

  if (restaurant?.menuType === "book" && restaurant.bookPages?.length) {
    return <BookViewer pages={restaurant.bookPages} />;
  }

  return (
    <div
      className={cn(
        "min-h-screen w-full overflow-x-hidden font-sans selection:bg-[#196F03]/30 pb-32 transition-colors duration-500",
        isDark ? "bg-[#0A0A0A] text-white" : "bg-gray-50 text-gray-900"
      )}
      style={{ "--brand-primary": themeColor, "--brand-primary-rgb": themeRgb } as React.CSSProperties}
    >
      <div className={cn("max-w-md mx-auto min-h-screen flex flex-col relative", isDark ? "bg-[#0A0A0A]" : "bg-gray-50")}>

        {/* Header */}
        <header className="relative w-full overflow-hidden flex flex-col items-center justify-center pt-24 pb-2">
          <div className="absolute top-6 left-6 flex items-center z-30">
            {restaurant?.logoUrl ? (
              <div className={cn("relative h-16 w-16 sm:h-20 sm:w-20 rounded-full flex items-center justify-center p-2 shadow-xl border overflow-hidden", isDark ? "bg-black border-white/10" : "bg-white border-gray-200")}>
                <Image src={restaurant.logoUrl} alt={restaurant.restaurantName || "Restaurant"} fill sizes="80px" priority className="object-contain" />
              </div>
            ) : (
              <div className={cn("h-16 w-16 sm:h-20 sm:w-20 rounded-full flex items-center justify-center shadow-xl border", isDark ? "bg-black border-white/10" : "bg-white border-gray-200")}>
                <Utensils className="h-8 w-8 text-[#196F03]" />
              </div>
            )}
          </div>
          <div className={cn("absolute inset-0 z-0", isDark ? "bg-[#0A0A0A]" : "bg-white")} />
        </header>

        {/* Search & filters */}
        <div className="px-6 relative z-30 space-y-5 mt-4">
          <div className="relative">
            <Search className={cn("absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 z-10", isDark ? "text-gray-500" : "text-gray-400")} />
            <input
              type="search"
              inputMode="search"
              enterKeyHint="search"
              placeholder="Search our selection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoComplete="off"
              className={cn(
                "w-full relative z-10 border rounded-3xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-[#196F03]/40 transition-all font-medium",
                isDark
                  ? "bg-[#1A1A1A] border-white/5 text-white placeholder:text-gray-600 focus:border-[#196F03]/30"
                  : "bg-white border-gray-100 text-gray-900 placeholder:text-gray-400 focus:border-[#196F03]/30"
              )}
            />
          </div>

          <div className={cn("grid grid-cols-3 border rounded-2xl overflow-hidden mt-4", isDark ? "border-white/10 divide-white/10" : "border-gray-200 divide-gray-200", "divide-y divide-x")}>
            <button
              onClick={() => setActiveCategory("all")}
              className={cn(
                "flex items-center justify-center gap-2 px-2 py-4 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 w-full min-h-[44px]",
                activeCategory === "all" ? "bg-[#196F03] text-white" : isDark ? "bg-[#1A1A1A] text-gray-400 hover:bg-white/5" : "bg-white text-gray-500 hover:bg-gray-50"
              )}
            >
              <LayoutGrid className={cn("h-3.5 w-3.5 shrink-0", activeCategory === "all" ? "text-white" : "text-[#196F03]")} />
              <span className="truncate max-w-[120px]">All</span>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "flex items-center justify-center gap-2 px-2 py-4 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 w-full min-h-[44px]",
                  activeCategory === cat.id ? "bg-[#196F03] text-white" : isDark ? "bg-[#1A1A1A] text-gray-400 hover:bg-white/5" : "bg-white text-gray-500 hover:bg-gray-50"
                )}
              >
                {activeCategory === cat.id && <Utensils className="h-3.5 w-3.5 text-white shrink-0" />}
                <span className="truncate max-w-[120px]">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Top Selling */}
        {featuredItems.length > 0 && searchQuery === "" && activeCategory === "all" && (
          <section className="pt-8 pb-4 relative">
            <div className="px-6 mb-6 flex items-center justify-between">
              <div>
                <h2 className={cn("text-2xl font-serif tracking-tight", isDark ? "text-white" : "text-gray-900")}>Signature</h2>
                <p className={cn("text-xs mt-1 font-medium uppercase tracking-widest", isDark ? "text-white/40" : "text-gray-400")}>Most Loved Choices</p>
              </div>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#196F03]"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#196F03]/40"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#196F03]/20"></div>
              </div>
            </div>
            
            <div className="flex gap-5 overflow-x-auto no-scrollbar px-6 pb-8 snap-x snap-mandatory">
              {featuredItems.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="flex-shrink-0 w-64 group cursor-pointer snap-start relative"
                >
                  <div className={cn(
                    "relative flex flex-col p-3 rounded-[2rem] transition-all duration-500",
                    isDark ? "bg-[#111111] border border-white/5 hover:bg-[#1a1a1a]" : "bg-white border border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50",
                    !item.isAvailable && "opacity-75"
                  )}>
                    {/* Badge */}
                    <div className="absolute -top-3 -right-2 z-30">
                       <div className="bg-[#196F03] text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg border-2 border-[#0A0A0A] transform group-hover:-translate-y-1 transition-transform duration-300">
                          Top Seller
                       </div>
                    </div>

                    {/* Image Area */}
                    <div className="relative w-full rounded-[1.5rem] overflow-hidden" style={{ paddingBottom: "100%" }}>
                      {item.imageUrl && (item.imageUrl.startsWith("http") || item.imageUrl.startsWith("/")) ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="256px"
                          priority={idx < 2}
                          className={cn("object-cover transition-transform duration-700 group-hover:scale-110", !item.isAvailable && "grayscale opacity-80")}
                        />
                      ) : (
                        <div className={cn("absolute inset-0 flex items-center justify-center", isDark ? "bg-white/5" : "bg-gray-100")}>
                          <Utensils className="h-10 w-10 opacity-20" />
                        </div>
                      )}
                      
                      {/* Dietary Type Icon */}
                      <div className="absolute top-3 left-3 flex gap-1 z-20">
                        {item.dietaryType === "veg" && (
                          <div className="h-8 w-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
                            <Leaf className="h-4 w-4 text-[#196F03]" />
                          </div>
                        )}
                        {item.dietaryType === "non-veg" && (
                          <div className="h-8 w-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
                            <Flame className="h-4 w-4 text-red-500" />
                          </div>
                        )}
                      </div>

                      {/* Addon thumbnails */}
                      {item.addons && item.addons.length > 0 && (
                        <div className="absolute bottom-3 right-3 z-20 flex -space-x-2">
                          {item.addons.slice(0, 3).map((addon, i) =>
                            addon.imageUrl ? (
                              <div key={addon.id} className="relative h-8 w-8 rounded-full border-2 border-white/90 shadow-md overflow-hidden" style={{ zIndex: 10 - i }}>
                                <Image src={addon.imageUrl} alt={addon.name} fill sizes="32px" className="object-cover" />
                              </div>
                            ) : null
                          )}
                        </div>
                      )}
                    </div>

                    {/* Text Area */}
                    <div className="pt-5 pb-3 px-2 flex flex-col gap-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className={cn("font-serif text-xl leading-tight line-clamp-2", isDark ? "text-white" : "text-gray-900")}>
                          {item.name}
                        </h3>
                      </div>
                      
                      {item.description && (
                         <p className={cn("text-xs line-clamp-1", isDark ? "text-white/40" : "text-gray-500")}>
                           {item.description}
                         </p>
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <span className={cn("text-xl font-black", isDark ? "text-white" : "text-gray-900")}>
                           <span className="text-sm text-[#196F03] mr-0.5">₹</span>{item.price.replace(/[^0-9.]/g, "")}
                        </span>
                        
                        <div className={cn("h-9 w-9 rounded-full flex items-center justify-center transition-colors shadow-sm", isDark ? "bg-white/10 group-hover:bg-[#196F03]" : "bg-gray-50 group-hover:bg-[#196F03]")}>
                           <span className={cn("text-xl font-light leading-none", isDark ? "text-white group-hover:text-white" : "text-gray-900 group-hover:text-white")}>+</span>
                        </div>
                      </div>
                    </div>
                    
                    {!item.isAvailable && (
                       <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] rounded-[2rem] z-40 flex items-center justify-center">
                          <span className="bg-white text-red-500 text-sm font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-2xl transform -rotate-12 border-2 border-red-500">
                             Sold Out
                          </span>
                       </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Menu content */}
        <div className="px-6 py-8 space-y-16 min-h-[400px]">
          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className={cn("h-24 w-24 rounded-full flex items-center justify-center mb-8 border", isDark ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-200")}>
                <Utensils className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className={cn("text-2xl font-serif mb-3", isDark ? "text-white" : "text-gray-900")}>No matches found</h3>
              <p className="text-gray-500 text-sm max-w-[240px] leading-relaxed">We couldn&apos;t find any dishes matching your current selection.</p>
              <button
                onClick={() => { setSearchQuery(""); setDietaryFilter("all"); setActiveCategory("all"); }}
                className={cn("mt-10 px-8 py-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#196F03] rounded-full border transition-all min-h-[44px]", isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-white border-gray-200 hover:bg-gray-50 shadow-sm")}
              >
                Clear all filters
              </button>
            </div>
          )}

          {(activeCategory === "all" ? categories : categories.filter((c) => c.id === activeCategory)).map((cat) => {
            const categoryItems = items
              .filter((item) => item.categoryId === cat.id)
              .sort((a, b) => {
                const aHasImg = a.imageUrl && (a.imageUrl.startsWith("http") || a.imageUrl.startsWith("/"));
                const bHasImg = b.imageUrl && (b.imageUrl.startsWith("http") || b.imageUrl.startsWith("/"));
                if (aHasImg && !bHasImg) return -1;
                if (!aHasImg && bHasImg) return 1;
                return 0;
              });

            if (categoryItems.length === 0) return null;

            return (
              <section key={cat.id} id={`category-${cat.id}`} className="space-y-12 menu-category-section">
                <div className={cn("flex items-end justify-between border-b pb-4", isDark ? "border-white/5" : "border-gray-200")}>
                  <h2 className={cn("text-xl font-semibold uppercase tracking-widest", isDark ? "text-white" : "text-gray-900")}>{cat.name}</h2>
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.4em] mb-1">{categoryItems.length} Selection</span>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {categoryItems.map((item, idx) => {
                    const hasImage = item.imageUrl && (item.imageUrl.startsWith("http") || item.imageUrl.startsWith("/"));

                    if (!hasImage) {
                      return (
                        // FIX: CSS animation replaces framer whileInView — runs on compositor
                        <div
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className={cn(
                            "menu-item-card group cursor-pointer relative flex items-center justify-between py-4 border-b last:border-b-0 transition-colors px-2 -mx-2 rounded-xl min-h-[44px]",
                            isDark ? "border-white/5 hover:bg-white/5" : "border-gray-200 hover:bg-gray-50",
                            !item.isAvailable && "opacity-50"
                          )}
                          style={{ animationDelay: `${Math.min(idx, 3) * 60}ms` }}
                        >
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center gap-2 mb-1">
                              {item.dietaryType === "veg" && (
                                <div className={cn("shrink-0 h-4 w-4 rounded flex items-center justify-center", isDark ? "bg-black/60 text-[#196F03]" : "bg-green-50 text-green-600")}>
                                  <Leaf className="h-2.5 w-2.5" />
                                </div>
                              )}
                              {item.dietaryType === "non-veg" && (
                                <div className={cn("shrink-0 h-4 w-4 rounded flex items-center justify-center", isDark ? "bg-black/60 text-red-500" : "bg-red-50 text-red-500")}>
                                  <Flame className="h-2.5 w-2.5" />
                                </div>
                              )}
                              <h3 className={cn("text-lg font-serif leading-tight truncate", isDark ? "text-white" : "text-gray-900")}>{item.name}</h3>
                            </div>
                            {item.description && <p className={cn("text-xs line-clamp-1 mt-0.5", isDark ? "text-white/50" : "text-gray-500")}>{item.description}</p>}
                            {!item.isAvailable && <span className="text-[9px] font-black text-red-500 uppercase tracking-widest px-1.5 py-0.5 bg-red-500/10 rounded mt-1.5 inline-block">Sold Out</span>}
                          </div>
                          <div className={cn("shrink-0 pl-4 border-l flex flex-col items-end justify-center", isDark ? "border-white/10" : "border-gray-200")}>
                            <span className="font-bold text-[#196F03] text-base">₹{item.price.replace(/[^0-9.]/g, "")}</span>
                            {((item.variants && item.variants.length > 0) || (item.addons && item.addons.length > 0)) && (
                              <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mt-1">Options</span>
                            )}
                          </div>
                        </div>
                      );
                    }

                    return (
                      // FIX: CSS animation replaces framer whileInView
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={cn(
                          "menu-item-card group cursor-pointer relative transition-all duration-500 flex flex-col rounded-[2rem] overflow-hidden",
                          isDark ? "bg-[#1A1A1A] border border-white/5" : "bg-white shadow-xl border border-gray-100",
                          !item.isAvailable && "opacity-70"
                        )}
                        style={{ animationDelay: `${Math.min(idx, 3) * 60}ms` }}
                      >
                        {/* Image — paddingBottom trick guarantees height on all browsers */}
                        <div
                          className={cn("relative w-full overflow-hidden", isDark ? "bg-[#0A0A0A]" : "bg-gray-50")}
                          style={{ paddingBottom: "75%" /* 4:3 ratio = 3/4 = 75% */ }}
                        >
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            sizes="(max-width: 480px) 100vw, (max-width: 768px) 448px, 448px"
                            loading="lazy"
                            className={cn("object-cover transition-transform duration-700 group-hover:scale-105", !item.isAvailable && "grayscale opacity-60")}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

                          <div className={cn("absolute top-3 left-3 h-8 w-8 rounded-xl flex items-center justify-center shadow-sm z-20", isDark ? "bg-black/60" : "bg-white/90")}
                            style={isDark ? {} : {}}>
                            <Utensils className={cn("h-4 w-4", isDark ? "text-white" : "text-[#196F03]")} />
                          </div>

                          {item.dietaryType === "veg" && (
                            <div className={cn("absolute top-3 right-3 h-8 w-8 rounded-xl flex items-center justify-center shadow-sm z-20 text-[#196F03]", isDark ? "bg-black/60" : "bg-white/90")}>
                              <Leaf className="h-4 w-4 fill-[#196F03]/20" />
                            </div>
                          )}
                          {item.dietaryType === "non-veg" && (
                            <div className={cn("absolute top-3 right-3 h-8 w-8 rounded-xl flex items-center justify-center shadow-sm z-20 text-red-500", isDark ? "bg-black/60" : "bg-white/90")}>
                              <Flame className="h-4 w-4 fill-red-500/20" />
                            </div>
                          )}

                          <div className="absolute bottom-4 right-4 bg-[#196F03] text-white px-3 py-1.5 rounded-xl font-black text-sm z-20">
                            ₹{item.price.replace(/[^0-9.]/g, "")}
                          </div>

                          {/* Addon thumbnails — FIX: Next Image */}
                          {item.addons && item.addons.length > 0 && (
                            <div className="absolute bottom-4 left-4 z-20 flex -space-x-3">
                              {item.addons.slice(0, 3).map((addon, i) =>
                                addon.imageUrl ? (
                                  <div key={addon.id} className="relative h-14 w-14 rounded-full border-[3px] border-white overflow-hidden shadow-xl" style={{ zIndex: 10 - i }}>
                                    <Image src={addon.imageUrl} alt={addon.name} fill sizes="56px" className="object-cover" />
                                  </div>
                                ) : null
                              )}
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col p-5">
                          <h3 className={cn("text-2xl font-serif leading-tight", isDark ? "text-white" : "text-gray-900")}>
                            {item.name}
                            {item.addons && item.addons.length > 0 && (
                              <span className="opacity-90 font-medium"> + {item.addons.map((a) => a.name).join(" + ")}</span>
                            )}
                          </h3>
                          {item.variants && item.variants.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {item.variants.map((v) => (
                                <div key={v.id} className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg border", isDark ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}>
                                  <span className="text-[10px] font-bold text-gray-400 uppercase">{v.name}</span>
                                  <span className="text-[10px] font-black text-[#196F03]">₹{v.price}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {!item.isAvailable && (
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest px-2 py-1 bg-red-500/10 rounded-md mt-3 w-fit">Sold Out</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Item detail modal */}
        <AnimatePresence>
          {selectedItem && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedItem(null)}
                className="absolute inset-0 bg-black/90"
                style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y > 100 || info.velocity.y > 200) setSelectedItem(null);
                }}
                className={cn("relative w-full max-w-md overflow-hidden shadow-2xl h-full flex flex-col border-t", isDark ? "bg-[#0F0F0F] border-white/10" : "bg-white border-white")}
              >
                <div className={cn("px-8 pt-8 pb-8 relative z-10 flex-1 flex flex-col h-full overflow-hidden", isDark ? "bg-[#0F0F0F]" : "bg-white")}>
                  <div className="flex-1 overflow-y-auto no-scrollbar space-y-6">

                    {/* Modal image — FIX: Next Image instead of bare <img> */}
                    {selectedItem.imageUrl && (selectedItem.imageUrl.startsWith("http") || selectedItem.imageUrl.startsWith("/")) && (
                      <div className="relative w-full overflow-hidden mb-6 rounded-2xl" style={{ paddingBottom: "75%" }}>
                        <Image
                          src={selectedItem.imageUrl}
                          alt={selectedItem.name}
                          fill
                          sizes="(max-width: 480px) 100vw, 448px"
                          className="object-cover"
                          priority
                        />
                        <button
                          onClick={() => setSelectedItem(null)}
                          className={cn("absolute top-4 right-4 z-[110] h-10 w-10 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center border transition-all", isDark ? "bg-white/10 text-white border-white/20 hover:bg-white/20" : "bg-black/20 text-white border-white/20 hover:bg-black/30")}
                          aria-label="Close"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    )}

                    {(!selectedItem.imageUrl || !(selectedItem.imageUrl.startsWith("http") || selectedItem.imageUrl.startsWith("/"))) && (
                      <div className="flex justify-end mb-2">
                        <button
                          onClick={() => setSelectedItem(null)}
                          className={cn("h-10 w-10 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center border transition-all", isDark ? "bg-white/5 text-white border-white/10 hover:bg-white/10" : "bg-gray-100 text-gray-900 border-gray-200")}
                          aria-label="Close"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.4em]">
                        {categories.find((c) => c.id === selectedItem.categoryId)?.name || "Signature Selection"}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className={cn("text-4xl font-serif tracking-tight leading-tight mb-2", isDark ? "text-white" : "text-gray-900")}>{selectedItem.name}</h2>
                        <span className="text-xl font-black text-[#196F03]">
                          {selectedItem.variants && selectedItem.variants.length > 0 && (
                            <span className="text-[10px] font-bold uppercase text-gray-500 mr-1.5">from</span>
                          )}
                          ₹{selectedItem.price.replace(/[^0-9.]/g, "")}
                        </span>
                      </div>
                      {selectedItem.dietaryType && selectedItem.dietaryType !== "none" && (
                        <div className={cn("shrink-0 h-5 w-5 border-2 rounded-md flex items-center justify-center p-[3px] mt-2", selectedItem.dietaryType === "veg" ? "border-green-600" : "border-red-600")}>
                          <div className={cn("h-full w-full rounded-full", selectedItem.dietaryType === "veg" ? "bg-green-600" : "bg-red-600")} />
                        </div>
                      )}
                    </div>

                    <p className="text-gray-500 text-[15px] leading-relaxed font-medium">{selectedItem.description}</p>

                    {selectedItem.variants && selectedItem.variants.length > 0 && (
                      <div className="pt-4 space-y-3">
                        <h3 className={cn("text-xs font-bold uppercase tracking-widest", isDark ? "text-white" : "text-gray-900")}>Size Options</h3>
                        <div className="grid gap-2">
                          {selectedItem.variants.map((v) => (
                            <div key={v.id} className={cn("flex items-center justify-between p-4 rounded-2xl border", isDark ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50")}>
                              <span className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>{v.name}</span>
                              <span className="text-sm font-bold text-[#196F03]">₹{v.price}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedItem.addons && selectedItem.addons.length > 0 && (
                      <div className="pt-4 space-y-3">
                        <h3 className={cn("text-xs font-bold uppercase tracking-widest", isDark ? "text-white" : "text-gray-900")}>Included in this meal</h3>
                        <div className="grid gap-2">
                          {selectedItem.addons.map((addon) => (
                            <div key={addon.id} className={cn("flex items-center gap-4 p-3 rounded-2xl border", isDark ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50")}>
                              {/* FIX: Next Image for addon thumbnails in modal */}
                              {addon.imageUrl ? (
                                <div className="relative h-12 w-12 rounded-xl overflow-hidden shrink-0 shadow-sm border border-white/5">
                                  <Image src={addon.imageUrl} alt={addon.name} fill sizes="48px" className="object-cover" />
                                </div>
                              ) : (
                                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0", isDark ? "bg-white/5" : "bg-gray-100")}>
                                  <Utensils className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                              <span className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>{addon.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
