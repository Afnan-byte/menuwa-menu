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
  ArrowRight,
  ChevronUp,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  order?: number;
  icon?: string;
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
  hideTopSelling?: boolean;
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
  const [showScrollTop, setShowScrollTop] = useState(false);

  const themeColor = restaurant?.themeColor || "#196F03";
  const themeRgb = useMemo(() => hexToRgb(themeColor), [themeColor]);

  // isDark driven by restaurant setting (not hardcoded)
  const isDark = restaurant?.menuTheme !== "light";

  useEffect(() => {
    if (id) fetchMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(categoryId);
    setTimeout(() => {
      const contentEl = document.getElementById("menu-content-area");
      if (contentEl) {
        const headerOffset = 90; // Approx height of sticky categories bar
        const elementPosition = contentEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }, 50);
  };

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
          cache: "no-store",
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
        const res = await fetch(`${baseUrl}/restaurants/${id}`, { cache: "no-store" });
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
          cache: "no-store",
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
          cache: "no-store",
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
          .map((d: any, idx: number) => {
            const data = firestoreDocToObj(d.document.fields);
            return { id: d.document.name.split("/").pop(), ...data, order: data.order ?? idx } as Category;
          })
          .sort((a: Category, b: Category) => a.order! - b.order!)
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

  return (
    <div
      className={cn(
        "min-h-screen w-full overflow-x-hidden font-sans selection:bg-[#196F03]/30 pb-32 transition-colors duration-500",
        isDark ? "bg-[#0A0A0A] text-white" : "bg-gray-50 text-gray-900"
      )}
      style={{ "--brand-primary": themeColor, "--brand-primary-rgb": themeRgb } as React.CSSProperties}
    >
      <div className={cn("max-w-md mx-auto min-h-screen flex flex-col relative", isDark ? "bg-[#0A0A0A]" : "bg-gray-50")}>

        {/* Menuwo Nav Bar */}
        <div className={cn("absolute top-0 inset-x-0 z-50 flex items-center px-6 h-16 border-b", isDark ? "border-white/10 bg-[#0A0A0A]/80 backdrop-blur-md" : "border-gray-200 bg-gray-50/80 backdrop-blur-md")}>
          <a href="https://www.menuwo.in" target="_blank" rel="noopener noreferrer">
            <Image
              src="/menuwo-new.webp"
              alt="Menuwo"
              width={0}
              height={0}
              sizes="100vw"
              style={{ width: '100px', height: 'auto' }}
              className="opacity-90 transition-opacity hover:opacity-100"
            />
          </a>
        </div>

        {/* Header */}
        <header className="relative w-full pt-20 pb-8 flex flex-col items-center justify-center overflow-hidden">
          {/* Dynamic Background Sweep */}
          <div
            className="absolute top-0 inset-x-0 h-64 opacity-20 z-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 0%, var(--brand-primary) 0%, transparent 70%)`
            }}
          />

          <div className="relative z-10 flex flex-col items-center text-center px-6">
            {restaurant?.logoUrl ? (
              <div className={cn(
                "relative h-28 w-28 rounded-[2rem] mb-6 flex items-center justify-center p-1.5 transition-transform duration-700 hover:scale-105",
                isDark ? "bg-white/5 border border-white/10" : "bg-white shadow-2xl shadow-gray-200 border border-gray-100"
              )}
              >
                <div className={cn("relative w-full h-full rounded-2xl overflow-hidden", isDark ? "bg-[#0F0F0F]" : "bg-gray-50")}>
                  <Image src={restaurant.logoUrl} alt={restaurant.restaurantName || "Restaurant"} fill sizes="112px" priority className="object-cover" />
                </div>
              </div>
            ) : (
              <div className={cn(
                "h-28 w-28 rounded-[2rem] flex items-center justify-center mb-6 transition-transform duration-700 hover:scale-105",
                isDark ? "bg-white/5 border border-white/10" : "bg-white shadow-2xl shadow-gray-200 border border-gray-100"
              )}
              >
                <Utensils className="h-10 w-10 text-[var(--brand-primary)]" />
              </div>
            )}

            <h1 className={cn("text-3xl font-semibold tracking-tight mb-2.5", isDark ? "text-white" : "text-gray-900")}>
              {restaurant?.restaurantName || "Welcome"}
            </h1>

            <div className="flex items-center gap-3 opacity-80">
              <div className="h-px w-6 bg-gradient-to-r from-transparent to-[var(--brand-primary)]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--brand-primary)]">
                Digital Menu
              </span>
              <div className="h-px w-6 bg-gradient-to-l from-transparent to-[var(--brand-primary)]" />
            </div>
          </div>
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

          <div className="grid grid-cols-4 gap-2.5 sm:gap-3 mt-6">
            <button
              onClick={() => handleCategoryClick("all")}
              className={cn(
                "flex flex-col items-center justify-start pt-3 pb-2 px-1 rounded-2xl transition-all duration-300 aspect-square border overflow-hidden",
                activeCategory === "all"
                  ? (isDark ? "bg-white/10 border-white/20 shadow-lg shadow-white/5" : "bg-white border-[#196F03]/20 shadow-md shadow-[#196F03]/10 ring-1 ring-[#196F03]/20")
                  : (isDark ? "bg-white/[0.03] border-white/5 hover:bg-white/10" : "bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200")
              )}
            >
              <div className="h-9 w-9 sm:h-10 sm:w-10 relative flex items-center justify-center shrink-0 mb-1">
                <LayoutGrid className={cn("h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-300", activeCategory === "all" ? "text-white scale-110" : isDark ? "text-gray-400" : "text-gray-400")} />
              </div>
              <div className="h-8 flex flex-col items-center justify-center w-full">
                <span className={cn("text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-center leading-tight line-clamp-2 px-1", activeCategory === "all" ? (isDark ? "text-white" : "text-[#196F03]") : (isDark ? "text-gray-400" : "text-gray-500"))}>
                  All
                </span>
              </div>
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={cn(
                  "flex flex-col items-center justify-start pt-3 pb-2 px-1 rounded-2xl transition-all duration-300 aspect-square border group overflow-hidden",
                  activeCategory === cat.id
                    ? (isDark ? "bg-white/10 border-white/20 shadow-lg shadow-white/5" : "bg-white border-[#196F03]/20 shadow-md shadow-[#196F03]/10 ring-1 ring-[#196F03]/20")
                    : (isDark ? "bg-white/[0.03] border-white/5 hover:bg-white/10" : "bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200")
                )}
              >
                <div className="h-9 w-9 sm:h-10 sm:w-10 relative flex items-center justify-center shrink-0 mb-1">
                  {cat.icon ? (
                    <img src={cat.icon} alt="" className={cn("w-full h-full object-contain drop-shadow-md transition-transform duration-300", activeCategory === cat.id ? "scale-110" : "scale-100 opacity-90 group-hover:scale-105")} />
                  ) : (
                    <Utensils className={cn("h-6 w-6 sm:h-7 sm:w-7 transition-transform duration-300", activeCategory === cat.id ? (isDark ? "text-white scale-110" : "text-[#196F03] scale-110") : (isDark ? "text-gray-400 group-hover:scale-105" : "text-gray-400 group-hover:scale-105"))} />
                  )}
                </div>
                <div className="h-8 flex flex-col items-center justify-center w-full">
                  <span className={cn("text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-center leading-tight line-clamp-2 px-1", activeCategory === cat.id ? (isDark ? "text-white" : "text-[#196F03]") : (isDark ? "text-gray-400" : "text-gray-500"))}>
                    {cat.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Top Selling - Minimalist Elegance */}
        {featuredItems.length > 0 && searchQuery === "" && activeCategory === "all" && !restaurant?.hideTopSelling && (
          <section className="pt-8 pb-4">
            <div className="px-6 mb-6">
              <h2 className={cn("text-2xl font-semibold tracking-tight", isDark ? "text-white" : "text-gray-900")}>
                Must Try
              </h2>
            </div>

            <div className="flex gap-5 overflow-x-auto no-scrollbar px-6 pb-6 snap-x snap-mandatory">
              {featuredItems.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="flex-shrink-0 w-44 group cursor-pointer snap-start flex flex-col"
                >
                  {/* Image Container */}
                  <div className="relative w-full rounded-2xl overflow-hidden mb-4 shadow-sm group-hover:shadow-md transition-shadow duration-300 bg-black/5" style={{ paddingBottom: "100%" }}>
                    {item.imageUrl && (item.imageUrl.startsWith("http") || item.imageUrl.startsWith("/")) ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="176px"
                        priority={idx < 2}
                        className={cn("object-cover transition-transform duration-700 group-hover:scale-105", !item.isAvailable && "grayscale opacity-60")}
                      />
                    ) : (
                      <div className={cn("absolute inset-0 flex items-center justify-center", isDark ? "bg-white/5" : "bg-gray-50")}>
                        <Utensils className="h-8 w-8 opacity-20" />
                      </div>
                    )}

                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-white/10 flex items-center justify-center backdrop-blur-sm">
                        <span className={cn("text-[10px] font-medium tracking-widest uppercase px-3 py-1 rounded-full", isDark ? "bg-black/60 text-white" : "bg-white/80 text-black")}>
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info Area */}
                  <div className="flex flex-col gap-1 px-0.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#196F03]">
                        Signature
                      </span>
                      {item.dietaryType === "veg" && <div className="w-1.5 h-1.5 rounded-full bg-[#196F03]" />}
                      {item.dietaryType === "non-veg" && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                    </div>

                    <h3 className={cn("text-lg font-semibold leading-snug line-clamp-2", isDark ? "text-white" : "text-gray-900")}>
                      {item.name}
                    </h3>

                    {item.variants && item.variants.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.variants.slice(0, 2).map((v) => (
                          <div key={v.id} className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded border", isDark ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}>
                            <span className="text-[8px] font-bold text-gray-500 uppercase">{v.name}</span>
                            <span className="text-[8px] font-black text-[#196F03]">₹{v.price}</span>
                          </div>
                        ))}
                        {item.variants.length > 2 && (
                          <div className={cn("flex items-center px-1.5 py-0.5 rounded border", isDark ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}>
                            <span className="text-[8px] font-bold text-gray-500">+{item.variants.length - 2}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <span className={cn("text-sm font-medium", isDark ? "text-white/60" : "text-gray-500")}>
                        ₹{item.price.replace(/[^0-9.]/g, "")}
                      </span>

                      <div className={cn("h-6 w-6 rounded-full flex items-center justify-center transition-all", isDark ? "bg-white/5 text-white/50 group-hover:bg-[#196F03] group-hover:text-white" : "bg-gray-100 text-gray-400 group-hover:bg-[#196F03] group-hover:text-white")}>
                        <span className="text-sm font-light leading-none mb-px">+</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Menu content */}
        <div id="menu-content-area" className="px-6 py-8 space-y-16 min-h-[400px]">
          {filteredItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className={cn("h-24 w-24 rounded-full flex items-center justify-center mb-8 border", isDark ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-200")}>
                <Utensils className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className={cn("text-2xl font-semibold mb-3", isDark ? "text-white" : "text-gray-900")}>No matches found</h3>
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
            const categoryItems = filteredItems
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
                  <div className="flex items-center gap-3">
                    {cat.icon && (
                      <img src={cat.icon} alt="" className="h-6 w-6 object-cover rounded" />
                    )}
                    <h2 className={cn("text-2xl font-semibold tracking-tight", isDark ? "text-white" : "text-gray-900")}>{cat.name}</h2>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.4em] mb-1">{categoryItems.length} Selection</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-8">
                  {categoryItems.map((item, idx) => {
                    const hasImage = item.imageUrl && (item.imageUrl.startsWith("http") || item.imageUrl.startsWith("/"));

                    if (!hasImage) {
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className={cn(
                            "menu-item-card col-span-2 sm:col-span-3 group cursor-pointer relative flex items-center justify-between py-4 border-b last:border-b-0 transition-colors px-2 -mx-2 rounded-xl min-h-[44px]",
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
                              <h3 className={cn("text-lg font-semibold leading-snug truncate", isDark ? "text-white" : "text-gray-900")}>{item.name}</h3>
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
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className="group cursor-pointer flex flex-col"
                        style={{ animationDelay: `${Math.min(idx, 8) * 40}ms` }}
                      >
                        {/* Image Container */}
                        <div className="relative w-full rounded-2xl overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition-shadow duration-300 bg-black/5" style={{ paddingBottom: "100%" }}>
                          {item.imageUrl && (item.imageUrl.startsWith("http") || item.imageUrl.startsWith("/")) ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              sizes="(max-width: 640px) 50vw, 33vw"
                              className={cn("object-cover transition-transform duration-700 group-hover:scale-105", !item.isAvailable && "grayscale opacity-60")}
                            />
                          ) : (
                            <div className={cn("absolute inset-0 flex items-center justify-center", isDark ? "bg-white/5" : "bg-gray-50")}>
                              <Utensils className="h-8 w-8 opacity-20" />
                            </div>
                          )}

                          {!item.isAvailable && (
                            <div className="absolute inset-0 bg-white/10 flex items-center justify-center backdrop-blur-sm">
                              <span className={cn("text-[10px] font-medium tracking-widest uppercase px-3 py-1 rounded-full", isDark ? "bg-black/60 text-white" : "bg-white/80 text-black")}>
                                Sold Out
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Info Area */}
                        <div className="flex flex-col gap-1 px-0.5">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-gray-400">
                              {cat.name}
                            </span>
                            {item.dietaryType === "veg" && <div className="w-1.5 h-1.5 rounded-full bg-[#196F03]" />}
                            {item.dietaryType === "non-veg" && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                          </div>

                          <h3 className={cn("text-[15px] font-semibold leading-snug line-clamp-2", isDark ? "text-white/90" : "text-gray-800")}>
                            {item.name}
                          </h3>

                          {item.variants && item.variants.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.variants.slice(0, 2).map((v) => (
                                <div key={v.id} className={cn("flex items-center gap-1 px-1.5 py-0.5 rounded border", isDark ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}>
                                  <span className="text-[8px] font-bold text-gray-500 uppercase">{v.name}</span>
                                  <span className="text-[8px] font-black text-[#196F03]">₹{v.price}</span>
                                </div>
                              ))}
                              {item.variants.length > 2 && (
                                <div className={cn("flex items-center px-1.5 py-0.5 rounded border", isDark ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100")}>
                                  <span className="text-[8px] font-bold text-gray-500">+{item.variants.length - 2}</span>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-1.5">
                            <span className={cn("text-sm font-medium", isDark ? "text-white/60" : "text-gray-500")}>
                              ₹{item.price.replace(/[^0-9.]/g, "")}
                            </span>

                            <div className={cn("h-6 w-6 rounded-full flex items-center justify-center transition-all", isDark ? "bg-white/5 text-white/50 group-hover:bg-[#196F03] group-hover:text-white" : "bg-gray-100 text-gray-400 group-hover:bg-[#196F03] group-hover:text-white")}>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </div>
                          </div>
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
                      <div className="relative w-full overflow-hidden mb-6 rounded-2xl" style={{ paddingBottom: "100%" }}>
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
                          className="absolute top-4 right-4 z-[110] h-10 w-10 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center border-2 border-red-500 bg-black/40 hover:bg-black/60 transition-all backdrop-blur-sm"
                          aria-label="Close"
                        >
                          <X className="h-5 w-5 text-red-500" />
                        </button>
                      </div>
                    )}

                    {(!selectedItem.imageUrl || !(selectedItem.imageUrl.startsWith("http") || selectedItem.imageUrl.startsWith("/"))) && (
                      <div className="flex justify-end mb-2">
                        <button
                          onClick={() => setSelectedItem(null)}
                          className="h-10 w-10 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center border-2 border-red-500 bg-red-50/10 hover:bg-red-50/20 transition-all"
                          aria-label="Close"
                        >
                          <X className="h-5 w-5 text-red-500" />
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
                        <h2 className={cn("text-2xl font-semibold tracking-tight mb-2", isDark ? "text-white" : "text-gray-900")}>{selectedItem.name}</h2>
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
            <Image src="/menuwo-new.webp" alt="Menuwo" width={0} height={0} sizes="100vw" style={{ width: '120px', height: 'auto' }} className={cn("mx-auto transition-opacity hover:opacity-100 cursor-pointer", isDark ? "opacity-60" : "opacity-40")} onClick={() => window.open('https://www.menuwo.in/', '_blank')} />
          </div>

          <div className="flex flex-col items-center justify-center gap-3 mb-8">
            <a
              href="https://www.instagram.com/menuw.o/"
              target="_blank"
              rel="noopener noreferrer"
              className={cn("text-sm font-medium transition-colors underline-offset-4 hover:underline", isDark ? "text-white/60 hover:text-white" : "text-gray-500 hover:text-gray-900")}
            >
              Follow Menuwo on Instagram
            </a>

            <a
              href="https://www.menuwo.in/"
              target="_blank"
              rel="noopener noreferrer"
              className={cn("text-sm font-medium transition-colors underline-offset-4 hover:underline", isDark ? "text-white/60 hover:text-white" : "text-gray-500 hover:text-gray-900")}
            >
              Visit our Website
            </a>
          </div>

          <div className={cn("h-1 w-12 mx-auto rounded-full", isDark ? "bg-white/10" : "bg-gray-200")} />
        </footer>

        {/* Scroll to top button */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className={cn(
                "fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95",
                isDark ? "bg-white text-black" : "bg-[#196F03] text-white"
              )}
              aria-label="Scroll to top"
            >
              <ChevronUp className="h-6 w-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
