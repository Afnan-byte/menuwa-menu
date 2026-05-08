"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { Loader2, User, Store, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { motion } from "framer-motion";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      // Create restaurant profile in Firestore with official brand green
      await setDoc(doc(db, "restaurants", user.uid), {
        ownerName: name,
        restaurantName,
        email,
        createdAt: new Date().toISOString(),
        themeColor: "#196F03", // Brand Green
      });

      toast.success("Welcome to the family!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFBFF] px-4 font-sans selection:bg-brand-green/10 py-20">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-green/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-green/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[480px] w-full"
      >
        <div className="bg-white rounded-[3rem] p-10 md:p-12 shadow-[0_20px_70px_-10px_rgba(25,111,3,0.1)] border border-gray-100 relative overflow-hidden">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-10">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="relative h-20 w-20 mb-6"
            >
              <Image 
                src="/logo.svg" 
                alt="Menuvo Logo" 
                fill 
                className="object-contain"
                priority
              />
            </motion.div>
            <h1 className="text-3xl font-bold text-primary tracking-tighter mb-2">Join Menuvo</h1>
            <p className="text-gray-400 text-sm font-medium">Launch your digital menu in seconds</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-brand-green transition-colors" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-brand-green/5 transition-all outline-none text-primary placeholder:text-gray-300"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest ml-1">Restaurant</label>
                <div className="relative group">
                  <Store className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-brand-green transition-colors" />
                  <input
                    type="text"
                    required
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    className="w-full pl-14 pr-6 py-4 bg-gray-50 border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-brand-green/5 transition-all outline-none text-primary placeholder:text-gray-300"
                    placeholder="Grand Cafe"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-brand-green transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-brand-green/5 transition-all outline-none text-primary placeholder:text-gray-300"
                  placeholder="hello@restaurant.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-300 uppercase tracking-widest ml-1">Secure Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-brand-green transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-12 py-4 bg-gray-50 border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-brand-green/5 transition-all outline-none text-primary placeholder:text-gray-300"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-brand-green transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#196F03] text-white py-5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#155a02] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-brand-green/20 flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-gray-50 text-center">
            <p className="text-sm text-gray-400 font-medium">
              Already have an account?{" "}
              <Link href="/login" className="text-[#196F03] font-bold hover:underline underline-offset-4">
                Login here
              </Link>
            </p>
          </div>
        </div>
        
        <p className="mt-8 text-center text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em]">
          Join 100+ premium restaurants globally
        </p>
      </motion.div>
    </div>
  );
}
