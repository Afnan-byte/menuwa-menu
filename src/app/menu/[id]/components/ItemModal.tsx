"use client";

import { motion } from "framer-motion";
import { X, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ItemModalProps {
  selectedItem: any;
  setSelectedItem: (item: any) => void;
  isDark: boolean;
  categories: any[];
}

export default function ItemModal({ selectedItem, setSelectedItem, isDark, categories }: ItemModalProps) {
  if (!selectedItem) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={() => setSelectedItem(null)} 
        className={cn("absolute inset-0 backdrop-blur-3xl", isDark ? "bg-black/95" : "bg-black/60")} 
      />
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
              <Image 
                src={selectedItem.imageUrl} 
                alt={selectedItem.name} 
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover" 
                loading="lazy"
              />
              <button
                onClick={() => setSelectedItem(null)}
                className={cn("absolute top-4 right-4 z-[110] h-10 w-10 backdrop-blur-xl rounded-full flex items-center justify-center border transition-all", isDark ? "bg-white/5 text-white border-white/10 hover:bg-white/10" : "bg-black/20 text-white border-white/20 hover:bg-black/30 shadow-lg")}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.4em]">
                {categories.find((c: any) => c.id === selectedItem.categoryId)?.name || "Signature Selection"}
              </span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className={cn("text-4xl font-serif tracking-tight leading-tight mb-2", isDark ? "text-white" : "text-gray-900")}>{selectedItem.name}</h2>
                <div className="flex items-center">
                  <span className="text-xl font-black text-[#196F03]">
                    {selectedItem.variants && selectedItem.variants.length > 0 && <span className="text-[10px] font-bold uppercase text-gray-500 mr-1.5 opacity-80">from</span>}
                    ₹{selectedItem.price.replace(/[^0-9.]/g, '')}
                  </span>
                </div>
              </div>
              {selectedItem.dietaryType && selectedItem.dietaryType !== "none" && (
                <div className={cn("shrink-0 h-5 w-5 border-2 rounded-md flex items-center justify-center p-[3px] mt-2", selectedItem.dietaryType === 'veg' ? "border-green-600" : "border-red-600")}>
                  <div className={cn("h-full w-full rounded-full", selectedItem.dietaryType === 'veg' ? "bg-green-600" : "bg-red-600")} />
                </div>
              )}
            </div>
            <p className="text-gray-500 text-[15px] leading-relaxed font-medium opacity-90 mt-2">{selectedItem.description}</p>

            {selectedItem.variants && selectedItem.variants.length > 0 && (
              <div className="pt-4 space-y-3">
                <h3 className={cn("text-xs font-bold uppercase tracking-widest", isDark ? "text-white" : "text-gray-900")}>Size Options</h3>
                <div className="grid gap-2">
                  {selectedItem.variants.map((variant: any) => (
                    <div
                      key={variant.id}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl border",
                        isDark ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50"
                      )}
                    >
                      <span className={cn("text-sm font-semibold", isDark ? "text-white" : "text-gray-900")}>{variant.name}</span>
                      <span className="text-sm font-bold text-[#196F03]">₹{variant.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedItem.addons && selectedItem.addons.length > 0 && (
              <div className="pt-4 space-y-3">
                <h3 className={cn("text-xs font-bold uppercase tracking-widest", isDark ? "text-white" : "text-gray-900")}>Included in this meal</h3>
                <div className="grid gap-2">
                  {selectedItem.addons.map((addon: any) => (
                    <div
                      key={addon.id}
                      className={cn(
                        "flex items-center gap-4 p-3 rounded-2xl border",
                        isDark ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50"
                      )}
                    >
                      {addon.imageUrl ? (
                        <div className="relative h-12 w-12 shrink-0">
                          <Image 
                            src={addon.imageUrl} 
                            alt={addon.name} 
                            fill
                            sizes="48px"
                            className="rounded-xl object-cover shadow-sm border border-white/5" 
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0", isDark ? "bg-white/5 border border-white/5" : "bg-gray-100")}>
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
  );
}
