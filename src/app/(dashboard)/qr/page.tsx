"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/components/auth-provider";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Printer, Copy, ExternalLink, QrCode as QrIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function QRPage() {
  const { user, restaurantData } = useAuth();
  const qrRef = useRef<HTMLDivElement>(null);
  
  const menuUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/menu/${restaurantData?.menuId || user?.uid}` 
    : "";

  const downloadQR = () => {
    const canvas = document.querySelector("canvas");
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `${restaurantData?.restaurantName || "menu"}-qr.png`;
      link.href = url;
      link.click();
      toast.success("QR Code downloaded!");
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(menuUrl);
    toast.success("Link copied to clipboard!");
  };

  if (!restaurantData?.menuId) {
    return (
      <div className="flex-1 h-[calc(100vh-5rem)] overflow-y-auto custom-scrollbar">
        <div className="p-4 md:p-10 max-w-4xl mx-auto py-20 px-6">
          <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 text-center border border-gray-100 shadow-xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full translate-x-20 -translate-y-20" />
            
            <div className="h-24 w-24 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <QrIcon className="h-10 w-10 text-yellow-600" />
            </div>

            <div className="space-y-4 max-w-md mx-auto">
              <h2 className="text-3xl font-bold text-primary tracking-tight">QR Stand Pending</h2>
              <p className="text-gray-500 font-medium leading-relaxed">
                Your unique 6-digit QR stand is currently being prepared by our team.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Next Steps</p>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                Once the admin assigns your physical stand, your digital QR code will appear here automatically.
              </p>
            </div>

            <a 
              href="mailto:info@menuwo.in"
              className="inline-flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-[calc(100vh-5rem)] overflow-y-auto custom-scrollbar">
      <div className="p-4 md:p-10 max-w-4xl mx-auto space-y-8 pb-20">
        <div>
          <h1 className="text-3xl font-semibold text-primary">Your QR Code</h1>
          <p className="text-gray-500">Share your digital menu with your customers.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* QR Preview Card */}
          <div className="bg-white p-6 md:p-12 rounded-3xl border border-gray-100 shadow-xl flex flex-col items-center text-center">
            <div ref={qrRef} className="p-4 md:p-8 bg-white rounded-3xl shadow-inner border border-gray-50 mb-8 w-full max-w-[300px]">
              <div className="relative aspect-square w-full">
                <QRCodeCanvas 
                  value={menuUrl} 
                  size={1024} // High res canvas, CSS will scale it
                  style={{ width: '100%', height: '100%' }}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-primary mb-2">{restaurantData?.restaurantName}</h2>
            <p className="text-sm text-gray-500 mb-6">Scan to view digital menu</p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button 
                onClick={downloadQR}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary text-white font-semibold rounded-2xl hover:bg-primary/90 transition-all shadow-md text-sm"
              >
                <Download className="h-5 w-5" />
                Download PNG
              </button>
              <button 
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-white border border-gray-100 text-primary font-semibold rounded-2xl hover:bg-gray-50 transition-all text-sm"
              >
                <Printer className="h-5 w-5" />
                Print
              </button>
            </div>
          </div>

          {/* Link & Info */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-accent" />
                Direct Menu Link
              </h3>
              <div className="flex gap-2">
                <input 
                  readOnly
                  type="text" 
                  value={menuUrl}
                  className="flex-1 px-4 py-3 bg-background-soft border-transparent rounded-xl text-sm font-medium text-gray-600 focus:outline-none"
                />
                <button 
                  onClick={copyLink}
                  className="p-3 bg-background-soft text-primary hover:bg-accent hover:text-white rounded-xl transition-all"
                >
                  <Copy className="h-5 w-5" />
                </button>
              </div>
              <a 
                href={menuUrl} 
                target="_blank" 
                className="mt-4 inline-flex items-center gap-2 text-accent font-semibold hover:underline text-sm"
              >
                View live menu <ExternalLink className="h-4 w-4" />
              </a>
            </div>

            <div className="bg-accent/10 p-8 rounded-3xl border border-accent/20">
              <h3 className="font-semibold text-primary mb-2 flex items-center gap-2">
                <QrIcon className="h-5 w-5 text-accent" />
                How it works
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 h-5 w-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-semibold">1</span>
                  Download the QR code image or print it directly.
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 h-5 w-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-semibold">2</span>
                  Place it on tables, windows, or promotional material.
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 h-5 w-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-semibold">3</span>
                  Customers scan the code with their smartphone camera.
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 h-5 w-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-semibold">4</span>
                  Your menu opens instantly in their browser!
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
