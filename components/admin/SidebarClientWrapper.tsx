"use client";
import React, { useState, useEffect, createContext, useContext } from "react";
import Sidebar from "./Sidebar";

interface SidebarContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within SidebarClientWrapper");
  return context;
};

export default function SidebarClientWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on desktop resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen((open) => !open);

  return (
    <SidebarContext.Provider value={{ sidebarOpen, toggleSidebar }}>
      <div className="flex min-h-screen w-full">
        {/* Mobile Sidebar */}
        <div className="fixed z-50 lg:hidden">
          <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        </div>
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar isOpen={true} onToggle={() => {}} />
        </div>
        {/* Main content */}
        <div className="flex-1 w-full transition-all duration-300 lg:ml-72">
          {children}
        </div>
      </div>
    </SidebarContext.Provider>
  );
}