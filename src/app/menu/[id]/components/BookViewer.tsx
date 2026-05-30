"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface BookViewerProps {
  restaurant: any;
}

export default function BookViewer({ restaurant }: BookViewerProps) {
  const [currentBookPage, setCurrentBookPage] = useState(0);
  const [direction, setDirection] = useState(0);

  if (!restaurant?.bookPages || restaurant.bookPages.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] overflow-hidden select-none z-[100] flex flex-col p-4 md:p-8" style={{ perspective: "1500px" }}>
      {/* Dynamic Ambient Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <AnimatePresence>
          <motion.div 
            key={`bg-${currentBookPage}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <Image
              src={restaurant.bookPages[currentBookPage]}
              alt="Background"
              fill
              className="object-cover blur-[80px] scale-125 saturate-200"
              sizes="100vw"
              loading="lazy"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-[#0A0A0A]" />
      </div>

      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentBookPage}
          custom={direction}
          variants={{
            enter: (direction: number) => ({ 
              rotateY: direction > 0 ? 90 : -90, 
              opacity: 0,
              scale: 0.9,
              originX: direction > 0 ? 1 : 0
            }),
            center: (direction: number) => ({ 
              zIndex: 1, 
              rotateY: 0, 
              opacity: 1,
              scale: 1,
              originX: direction > 0 ? 1 : 0
            }),
            exit: (direction: number) => ({ 
              zIndex: 0, 
              rotateY: direction < 0 ? 90 : -90, 
              opacity: 0,
              scale: 0.9,
              originX: direction < 0 ? 1 : 0
            })
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ 
            rotateY: { type: "spring", stiffness: 200, damping: 25 }, 
            opacity: { duration: 0.3 },
            scale: { duration: 0.3 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.8}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = Math.abs(offset.x) * velocity.x;
            if (swipe < -5000 && currentBookPage < restaurant.bookPages!.length - 1) {
              setDirection(1);
              setCurrentBookPage(p => p + 1);
            } else if (swipe > 5000 && currentBookPage > 0) {
              setDirection(-1);
              setCurrentBookPage(p => p - 1);
            }
          }}
          className="absolute inset-0 m-auto w-full h-full max-w-5xl pointer-events-auto drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10"
        >
          <Image
            src={restaurant.bookPages[currentBookPage]}
            alt={`Page ${currentBookPage + 1}`}
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 1024px"
            loading="lazy"
          />
        </motion.div>
      </AnimatePresence>

      {/* Premium Page Indicators */}
      <div className="absolute bottom-10 inset-x-0 flex flex-col items-center justify-center z-20 pointer-events-none">
        <div className="flex items-center gap-2 mb-5 bg-white/5 border border-white/10 backdrop-blur-xl px-5 py-3 rounded-full shadow-2xl pointer-events-auto">
          {restaurant.bookPages.map((_: any, idx: number) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > currentBookPage ? 1 : -1);
                setCurrentBookPage(idx);
              }}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                currentBookPage === idx ? "w-8 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]" : "w-2 bg-white/20 hover:bg-white/40"
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
