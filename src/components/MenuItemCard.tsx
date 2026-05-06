"use client";

import Image from "next/image";
import { Utensils, Edit2, Trash2, Star, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className={cn(
      "bg-white rounded-[2.5rem] p-6 shadow-sm border border-gray-100/50 group transition-all hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-2 relative flex flex-col font-sans h-full",
      !item.isAvailable && "opacity-75"
    )}>
      {/* Price Badge */}
      <div className="absolute top-8 right-8 z-20">
         <div className="bg-brand-green text-white px-3 py-1 rounded-lg font-black text-[10px] shadow-lg shadow-brand-green/20">
           ${item.price}
         </div>
      </div>

      {/* Image Section */}
      <div className="relative aspect-square mb-6">
        <div className="absolute inset-0 bg-gray-50 rounded-full scale-90 group-hover:scale-95 transition-transform duration-500"></div>
        {item.imageUrl ? (
          <div className="relative h-full w-full p-4">
             <Image 
              src={item.imageUrl} 
              alt={item.name} 
              fill 
              className="object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-700" 
              sizes="(max-width: 768px) 100vw, 300px"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <Utensils className="h-16 w-16 opacity-10" />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="text-center flex-1 flex flex-col">
        <h3 className="text-sm font-black text-primary tracking-tight mb-2 group-hover:text-brand-orange transition-colors">
          {item.name}
        </h3>
        
        <div className="flex items-center justify-center gap-0.5 mb-3">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          ))}
        </div>

        <p className="text-[10px] text-gray-400 font-medium leading-relaxed mb-6 line-clamp-2 px-2">
          {item.description || "Made with fresh ingredients and quality maintenance for every food."}
        </p>

        {/* Action Buttons styled like 'Add to Cart' */}
        <div className="mt-auto flex gap-2">
          <button 
            onClick={onEdit}
            className="flex-1 py-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-gray-400 hover:text-brand-orange hover:bg-brand-orange/5 transition-all flex items-center justify-center gap-2"
          >
            <Edit2 className="h-3 w-3" />
            Edit
          </button>
          <button 
            onClick={onToggleAvailability}
            className={cn(
              "flex-1 py-3 rounded-xl text-[10px] font-black text-white transition-all shadow-lg flex items-center justify-center gap-2",
              item.isAvailable ? "bg-brand-orange shadow-brand-orange/20" : "bg-red-500 shadow-red-500/20"
            )}
          >
            {item.isAvailable ? <Plus className="h-3 w-3" /> : <Trash2 className="h-3 w-3" />}
            {item.isAvailable ? "Active" : "Hidden"}
          </button>
        </div>
      </div>
    </div>
  );
}
