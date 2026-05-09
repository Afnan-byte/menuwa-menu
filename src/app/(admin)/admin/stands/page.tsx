"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, query, orderBy, limit, writeBatch, doc } from "firebase/firestore";
import { generateUniqueShortId } from "@/lib/id-generator";
import { 
  QrCode, 
  Plus, 
  Download, 
  Loader2, 
  CheckCircle2, 
  ExternalLink,
  Trash2,
  Filter
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from "jszip";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function StandsManager() {
  const [stands, setStands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [batchSize, setBatchSize] = useState(10);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchStands();
  }, []);

  const fetchStands = async () => {
    try {
      const q = query(collection(db, "stands"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setStands(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateBatch = async () => {
    if (batchSize > 50) {
      toast.error("Max batch size is 50");
      return;
    }

    setGenerating(true);
    try {
      const batch = writeBatch(db);
      const newStands = [];

      for (let i = 0; i < batchSize; i++) {
        const shortId = await generateUniqueShortId();
        const standData = {
          id: shortId,
          status: "unassigned",
          createdAt: new Date().toISOString(),
          assignedTo: null
        };
        
        const docRef = doc(collection(db, "stands"), shortId);
        batch.set(docRef, standData);
        newStands.push(standData);
      }

      await batch.commit();
      setStands([...newStands, ...stands]);
      toast.success(`Generated ${batchSize} new IDs`);
    } catch (error) {
      console.error(error);
      toast.error("Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const exportAllQRs = async () => {
    setExporting(true);
    try {
      const zip = new JSZip();
      const unclaimed = stands.filter(s => s.status === "unassigned");

      if (unclaimed.length === 0) {
        toast.error("No unclaimed stands to export");
        return;
      }

      for (const stand of unclaimed) {
        const svg = document.getElementById(`qr-${stand.id}`) as unknown as SVGElement;
        if (svg) {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const img = new Image();
          const svgData = new XMLSerializer().serializeToString(svg);
          const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
          const url = URL.createObjectURL(svgBlob);

          await new Promise((resolve) => {
            img.onload = () => {
              canvas.width = 1000;
              canvas.height = 1000;
              if (ctx) {
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 50, 50, 900, 900);
                
                // Add ID text
                ctx.fillStyle = "black";
                ctx.font = "bold 40px Arial";
                ctx.textAlign = "center";
                ctx.fillText(`ID: ${stand.id}`, 500, 980);
              }
              canvas.toBlob((blob) => {
                if (blob) zip.file(`stand-${stand.id}.png`, blob);
                resolve(null);
              });
            };
            img.src = url;
          });
          URL.revokeObjectURL(url);
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `menuwo-qr-stands-${new Date().toISOString().split('T')[0]}.zip`;
      link.click();
      toast.success("Export complete!");
    } catch (error) {
      console.error(error);
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-12 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight">QR Stand Management</h2>
          <p className="text-gray-500 font-medium mt-2">Generate and manage unique 6-digit IDs for physical production</p>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-[1.5rem] border border-white/5">
          <input 
            type="number" 
            value={batchSize} 
            onChange={(e) => setBatchSize(parseInt(e.target.value))}
            className="w-16 bg-transparent border-none focus:ring-0 text-center font-bold"
            min="1"
            max="50"
          />
          <button 
            onClick={generateBatch}
            disabled={generating}
            className="flex items-center gap-2 px-6 py-3 bg-[#196F03] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-green-700 transition-all disabled:opacity-50"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Generate Batch
          </button>
        </div>
      </header>

      {/* Actions Toolbar */}
      <div className="flex items-center justify-between p-6 bg-[#196F03]/5 border border-[#196F03]/10 rounded-[2rem]">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 bg-[#196F03] rounded-full animate-pulse" />
            <span className="text-xs font-bold text-[#196F03] uppercase tracking-widest">{stands.length} Total IDs</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 bg-blue-500 rounded-full" />
            <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">{stands.filter(s => s.status === 'unassigned').length} Available</span>
          </div>
        </div>

        <button 
          onClick={exportAllQRs}
          disabled={exporting || stands.length === 0}
          className="flex items-center gap-3 px-8 py-4 bg-white text-black text-[10px] font-bold uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all disabled:opacity-50"
        >
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download ZIP (PNGs)
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-12 w-12 text-[#196F03] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <AnimatePresence>
            {stands.map((stand, i) => (
              <motion.div
                key={stand.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(i * 0.05, 1) }}
                className={cn(
                  "p-6 bg-white/5 border rounded-[2rem] space-y-4 group transition-all",
                  stand.status === 'assigned' ? "border-[#196F03]/20 bg-[#196F03]/5" : "border-white/5"
                )}
              >
                <div className="aspect-square bg-white p-4 rounded-2xl relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                  <QRCodeSVG 
                    id={`qr-${stand.id}`}
                    value={`https://menuwo.in/s/${stand.id}`} 
                    size={256}
                    level="H"
                    includeMargin={false}
                    className="w-full h-full"
                  />
                  {stand.status === 'assigned' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                      <CheckCircle2 className="h-10 w-10 text-[#196F03]" />
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <h4 className="text-lg font-black tracking-tighter">{stand.id}</h4>
                  <p className={cn(
                    "text-[8px] font-bold uppercase tracking-widest mt-1",
                    stand.status === 'assigned' ? "text-[#196F03]" : "text-gray-500"
                  )}>
                    {stand.status === 'assigned' ? "Assigned" : "Available"}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
