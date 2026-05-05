"use client";

import Link from "next/link";
import { ArrowRight, QrCode, Menu as MenuIcon, LayoutDashboard, Settings } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center" href="#">
          <div className="bg-primary p-1.5 rounded-lg mr-2">
            <QrCode className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-primary">Menuvo</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-accent transition-colors" href="/login">
            Login
          </Link>
          <Link 
            className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition-all shadow-sm" 
            href="/signup"
          >
            Get Started
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background-soft">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-2"
              >
                <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-primary">
                  Modernize Your Restaurant <br />
                  <span className="text-accent">with Digital Menus</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  The simplest way to create, manage, and share your menu via QR codes.
                  Provide a touchless, premium experience for your customers.
                </p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="space-x-4"
              >
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-white shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  Create Your Menu <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-24 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-12 lg:grid-cols-3">
              <FeatureCard 
                icon={<MenuIcon className="h-10 w-10 text-accent" />}
                title="Easy Menu Manager"
                description="Upload items, set prices, and manage categories with our intuitive drag-and-drop builder."
              />
              <FeatureCard 
                icon={<QrCode className="h-10 w-10 text-accent" />}
                title="Instant QR Generation"
                description="Get a unique QR code for your restaurant instantly. Print it and place it on your tables."
              />
              <FeatureCard 
                icon={<LayoutDashboard className="h-10 w-10 text-accent" />}
                title="Real-time Updates"
                description="Changed a price? Item out of stock? Update it instantly without reprinting your menus."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t bg-background-soft">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <QrCode className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">Menuvo</span>
          </div>
          <p className="text-sm text-gray-500">© 2024 Menuvo. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-gray-500 hover:text-primary">Privacy</Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-primary">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center text-center p-8 rounded-2xl bg-background-soft hover:shadow-lg transition-all duration-300">
      <div className="mb-4 p-3 bg-white rounded-2xl shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-primary">{title}</h3>
      <p className="text-gray-500">{description}</p>
    </div>
  );
}
