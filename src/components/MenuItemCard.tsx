"use client";

import Image from "next/image";
import { Utensils, Edit2, Trash2 } from "lucide-react";
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
      "bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden group transition-all hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 font-sans",
      !item.isAvailable && "opacity-75"
    )}>
      <div className="aspect-[16/10] bg-gray-50 relative overflow-hidden">
        {item.imageUrl ? (
          <Image 
            src={item.imageUrl} 
            alt={item.name} 
            fill 
            className="object-cover transition-transform duration-700 group-hover:scale-110" 
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200 bg-gray-50">
            <Utensils className="h-14 w-14 opacity-20" />
          </div>
        )}
        
        {/* Availability Badge */}
        <div className="absolute top-4 left-4 z-10">
          <button 
            onClick={onToggleAvailability}
            className={cn(
              "text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl backdrop-blur-md transition-all shadow-lg",
              item.isAvailable 
                ? "bg-brand-green/90 text-white" 
                : "bg-red-500/90 text-white"
            )}
          >
            {item.isAvailable ? "Available" : "Out of Stock"}
          </button>
        </div>

        {/* Actions Overlay */}
        <div className="absolute top-4 right-4 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-3 bg-white text-primary rounded-xl shadow-xl hover:bg-brand-green hover:text-white transition-all active:scale-90"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-3 bg-white text-red-500 rounded-xl shadow-xl hover:bg-red-500 hover:text-white transition-all active:scale-90"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-black text-primary group-hover:text-brand-green transition-colors tracking-tight line-clamp-1">{item.name}</h3>
          <span className="font-black text-brand-green bg-brand-green/5 px-3 py-1 rounded-lg text-sm">${item.price}</span>
        </div>
        <p className="text-[11px] text-gray-400 font-medium line-clamp-2 mb-6 h-8 leading-relaxed">{item.description}</p>
        
        <div className="flex items-center gap-2 flex-wrap">
          {item.tags?.slice(0, 3).map((tag) => (
            <span key={tag} className="text-[8px] font-black uppercase tracking-wider px-3 py-1 bg-gray-50 text-gray-400 rounded-md">
              {tag}
            </span>
          ))}
          {(!item.tags || item.tags.length === 0) && (
            <span className="text-[8px] font-black uppercase tracking-wider px-3 py-1 bg-gray-50 text-gray-300 rounded-md">
              No Tags
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
