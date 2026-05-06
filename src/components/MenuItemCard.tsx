"use client";

import Image from "next/image";
import { Utensils, Edit2, Trash2, Star, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MenuItemProps {
  item: {
    id: string;
    name: string;
    price: string;
    description: string;
    imageUrl?: string;
    isAvailable: boolean;
    tags?: string[];
  };
  onEdit: () => void;
  onDelete: () => void;
  onToggleAvailability: () => void;
}

export default function MenuItemCard({ item, onEdit, onDelete, onToggleAvailability }: MenuItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white rounded-[3rem] p-6 shadow-xl shadow-gray-200/50 relative group transition-all hover:shadow-2xl hover:shadow-brand-orange/10 font-sans mt-12",
        !item.isAvailable && "grayscale opacity-80"
      )}
    >
      {/* Availability Toggle Floating */}
      <button
        onClick={onToggleAvailability}
        className={cn(
          "absolute -top-4 left-6 z-20 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg transition-all",
          item.isAvailable ? "bg-brand-green text-white" : "bg-red-500 text-white"
        )}
      >
        {item.isAvailable ? "In Stock" : "Out of Stock"}
      </button>

      {/* Overlapping Image Container */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 md:w-36 md:h-36">
        <div className="relative w-full h-full">
          {/* Background Circle */}
          <div className="absolute inset-0 bg-gray-50 rounded-full scale-90 group-hover:scale-100 transition-transform duration-500 shadow-inner"></div>

          {item.imageUrl ? (
            <div className="relative w-full h-full p-2">
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-200 bg-white rounded-full border-4 border-gray-50">
              <Utensils className="h-10 w-10 opacity-20" />
            </div>
          )}

          {/* Price Badge Overlapping Image */}
          <div className="absolute -bottom-2 right-0 bg-brand-orange text-white px-3 py-1.5 rounded-xl font-black text-xs shadow-lg shadow-brand-orange/30">
            ${item.price}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="pt-24 text-center">
        <div className="flex items-center justify-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className={cn("h-3 w-3", i <= 4 ? "fill-yellow-400 text-yellow-400" : "fill-gray-100 text-gray-100")} />
          ))}
          <span className="text-[10px] font-black text-gray-300 ml-1">4.0</span>
        </div>

        <h3 className="text-lg font-black text-primary tracking-tight mb-2 group-hover:text-brand-orange transition-colors line-clamp-1">
          {item.name}
        </h3>

        <p className="text-[11px] text-gray-400 font-medium line-clamp-2 leading-relaxed h-8 mb-6">
          {item.description}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={onEdit}
            className="flex-1 py-3 bg-gray-50 text-primary font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-brand-orange hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <Edit2 className="h-3 w-3" />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="p-3 bg-gray-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
