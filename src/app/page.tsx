"use client";

import Link from "next/link";
import { ArrowRight, QrCode, Menu as MenuIcon, LayoutDashboard, Settings, Phone, Mail, Globe } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-sans">
      {/* Header */}
      <header className="px-10 h-20 flex items-center bg-white/70 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100/50">
        <Link className="flex items-center justify-center" href="/">
          <div className="relative h-18 w-28 mr-3 transition-transform">
            <Image src="/logo.svg" alt="Menuwo Logo" fill className="object-contain" />
          </div>
        </Link>
        <nav className="ml-auto flex items-center gap-8">
          <Link className="text-sm font-semibold text-gray-500 hover:text-[#196F03] transition-colors" href="/login">
            Login
          </Link>
          <Link
            className="text-sm font-bold bg-[#196F03] text-white px-8 py-3 rounded-2xl hover:scale-105 transition-all shadow-xl shadow-[#196F03]/20"
            href="/signup"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-24 md:py-32 lg:py-48 bg-background-soft relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#196F03]/5 blur-[120px] rounded-full translate-x-1/4 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full -translate-x-1/4 translate-y-1/4"></div>

          <div className="container px-4 md:px-6 mx-auto relative z-10">
            <div className="flex flex-col items-center space-y-10 text-center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6"
              >
                <h1 className="text-5xl font-bold tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] text-primary">
                  Modernize Your <br />
                  <span className="text-[#196F03]">Digital Experience</span>
                </h1>
                <p className="mx-auto max-w-[600px] text-gray-400 text-lg md:text-xl font-medium leading-relaxed">
                  The simplest way to create, manage, and share your menu via QR codes.
                  Provide a touchless, premium experience for your customers.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link
                  href="/signup"
                  className="inline-flex h-14 items-center justify-center rounded-2xl bg-[#196F03] px-10 text-sm font-bold text-white shadow-2xl shadow-[#196F03]/20 transition-all hover:scale-105"
                >
                  Create Your Menu <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-14 items-center justify-center rounded-2xl bg-white border border-gray-100 px-10 text-sm font-bold text-primary transition-all hover:bg-gray-50 shadow-sm"
                >
                  View Demo
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-32 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 lg:grid-cols-3">
              <FeatureCard
                icon={<MenuIcon className="h-10 w-10 text-[#196F03]" />}
                title="Smart Menu Manager"
                description="Upload items, set prices, and manage categories with our intuitive cloud-based builder."
              />
              <FeatureCard
                icon={<QrCode className="h-10 w-10 text-[#196F03]" />}
                title="Instant QR Export"
                description="Get high-resolution QR codes for your restaurant instantly. Ready for print and digital use."
              />
              <FeatureCard
                icon={<LayoutDashboard className="h-10 w-10 text-[#196F03]" />}
                title="Live Synchronization"
                description="Update prices or availability in real-time. Changes reflect instantly on customer devices."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 border-t border-gray-50 bg-background-soft">
        <div className="container px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col gap-6">
            <Link className="flex items-center gap-3" href="/">
              <div className="relative h-24 w-24 transition-transform">
                <Image src="/logo.svg" alt="Menuwo Logo" fill className="object-contain" />
              </div>
            </Link>
            <div className="flex flex-col gap-4 text-sm font-medium text-gray-500">
              <a href="tel:+918089685278" className="flex items-center gap-3 hover:text-[#196F03] transition-colors group">
                <div className="h-8 w-8 rounded-full bg-white border border-gray-100 flex items-center justify-center group-hover:bg-[#196F03]/5 group-hover:border-[#196F03]/20 transition-all">
                  <Phone className="h-4 w-4" />
                </div>
                +91 80896 85278
              </a>
              <a href="mailto:info@menuwo.in" className="flex items-center gap-3 hover:text-[#196F03] transition-colors group">
                <div className="h-8 w-8 rounded-full bg-white border border-gray-100 flex items-center justify-center group-hover:bg-[#196F03]/5 group-hover:border-[#196F03]/20 transition-all">
                  <Mail className="h-4 w-4" />
                </div>
                info@menuwo.in
              </a>
              <a href="https://www.instagram.com/menuw.o/?hl=en" target="_blank" className="flex items-center gap-3 hover:text-[#196F03] transition-colors group">
                <div className="h-8 w-8 rounded-full bg-white border border-gray-100 flex items-center justify-center group-hover:bg-[#196F03]/5 group-hover:border-[#196F03]/20 transition-all">
                  <Globe className="h-4 w-4" />
                </div>
                Instagram
              </a>
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest">© 2026 Menuwo. All rights reserved.</p>
          <div className="flex gap-8">
            <Link href="#" className="text-xs font-semibold text-gray-400 hover:text-[#196F03] transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-xs font-semibold text-gray-400 hover:text-[#196F03] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center text-center p-12 rounded-[2.5rem] bg-gray-50/50 border border-gray-100 group hover:bg-white hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500">
      <div className="mb-8 p-5 bg-white rounded-3xl shadow-sm group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4 text-primary tracking-tight">{title}</h3>
      <p className="text-gray-500 font-medium leading-relaxed">{description}</p>
    </div>
  );
}
