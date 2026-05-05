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
    ? `${window.location.origin}/menu/${user?.uid}` 
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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Your QR Code</h1>
        <p className="text-gray-500">Share your digital menu with your customers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Preview Card */}
        <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-xl flex flex-col items-center text-center">
          <div ref={qrRef} className="p-8 bg-white rounded-3xl shadow-inner border border-gray-50 mb-8">
            <QRCodeCanvas 
              value={menuUrl} 
              size={256}
              level="H"
              includeMargin={true}
              imageSettings={{
                src: "/logo.svg", // Optional: Add a small logo in the middle if available
                x: undefined,
                y: undefined,
                height: 40,
                width: 40,
                excavate: true,
              }}
            />
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">{restaurantData?.restaurantName}</h2>
          <p className="text-sm text-gray-500 mb-6">Scan to view digital menu</p>
          
          <div className="flex gap-4 w-full">
            <button 
              onClick={downloadQR}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary text-white font-bold rounded-2xl hover:bg-primary/90 transition-all shadow-md"
            >
              <Download className="h-5 w-5" />
              Download PNG
            </button>
            <button 
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-white border border-gray-100 text-primary font-bold rounded-2xl hover:bg-gray-50 transition-all"
            >
              <Printer className="h-5 w-5" />
              Print
            </button>
          </div>
        </div>

        {/* Link & Info */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
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
              className="mt-4 inline-flex items-center gap-2 text-accent font-bold hover:underline text-sm"
            >
              View live menu <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="bg-accent/10 p-8 rounded-3xl border border-accent/20">
            <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
              <QrIcon className="h-5 w-5 text-accent" />
              How it works
            </h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex gap-3">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold">1</span>
                Download the QR code image or print it directly.
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold">2</span>
                Place it on tables, windows, or promotional material.
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold">3</span>
                Customers scan the code with their smartphone camera.
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-bold">4</span>
                Your menu opens instantly in their browser!
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
