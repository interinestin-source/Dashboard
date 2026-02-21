import React from "react";
import DesignerProfile from "@/components/profile/DesignerProfile";
import { Header } from "@/components/dashboard/Header";
import ProjectList from "@/components/projects/ProjectList";

export default function ProjectsListPage() {
  const breadcrumbs = [
    { label: "Home", href: "/designer-dashboard" },
    { label: "Designer Workspace" },
  ];
  return (
    <div className="min-h-screen bg-gray-50 ">
      <Header pageTitle="Designer Projects " breadcrumbs={breadcrumbs} />
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col space-y-3">
        <ProjectList />
      </div>
    </div>
  );
}
