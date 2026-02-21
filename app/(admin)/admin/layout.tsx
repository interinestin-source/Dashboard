import SidebarClientWrapper from "@/components/admin/SidebarClientWrapper";
import { Header } from "@/components/dashboard/Header";


import React from "react";

export default function AdminDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
 <html lang="en">
    <body
           className="antialiased"
         >
           <SidebarClientWrapper>
              <div className="min-h-screen ">
             {/* <Header /> */}
   
             {children}
             </div>
           </SidebarClientWrapper>
         </body>
    </html>
  );
}