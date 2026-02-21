import React from "react";
import "../../globals.css";
import { Header } from "@/components/dashboard/Header";
import Stats from "@/components/dashboard/Stats";
import { Card } from "@/components/ui/card";
import ProjectList from "@/components/projects/ProjectList";
type Props = {};

const DesignerDashboard = (props: Props) => {
   const breadcrumbs = [
    { label: "Home", href: "/designer" },
    { label: "Designer Dashboard" },
  ];
  return (
   <>
   <div className="min-h-screen bg-gray-50">
     <Header
        pageTitle="Designer Dashboard"
        breadcrumbs={breadcrumbs}
      />
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col space-y-3" >
      <h2 className="text-xl font-semibold ">Welcome! AiR Designer</h2>

     <Stats/>
<ProjectList/>   
 
      
  
      </div>
    </div>
   </>
  );
};

export default DesignerDashboard;
