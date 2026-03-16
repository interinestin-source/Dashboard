

import AdminStats from '@/components/admin/AdminStats'
import React from 'react'
import { Header } from '@/components/admin/Header'
import { Designer, AdminProject } from '@/components/admin/DesignerStats'
import Desingers from '@/components/admin/Desingers'
import Users from '@/components/admin/Users'
import Projects from '@/components/admin/Projects'

type Props = {}

const page = (props: Props) => {
  const breadcrumbs = [
    { label: "Home", href: "/admin" },
    { label: " Dashboard" },
  ];
  const designers: Designer[] = [
  { id: "d1", name: "AiR Designer Studio", views: 1450, status: "approved" },
  { id: "d2", name: "Minimal Nest", views: 780, status: "pending" },
  { id: "d3", name: "Studio Earthtone", views: 1120, status: "approved" },
];
  const projects: AdminProject[] = [
  { id: "p1", designerId: "d1", isPublished: true },
  { id: "p2", designerId: "d1", isPublished: true },
  { id: "p3", designerId: "d2", isPublished: false },
  { id: "p4", designerId: "d3", isPublished: true },
  { id: "p5", designerId: "d3", isPublished: true },
];
 const totalDesigners = designers.length;
  const totalProjects = projects.length;
  const totalDesignerViews = designers.reduce((n, d) => n + d.views, 0);
  const pendingDesigners = designers.filter((d) => d.status === "pending").length;
  const publishedProjects = projects.filter((p) => p.isPublished).length;
  return (
    <>
    
     <div className="min-h-screen bg-gray-50">
    <Header
        pageTitle="Admin Dashboard"
        breadcrumbs={breadcrumbs}
      />
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col space-y-3" >
      <h2 className="text-xl font-semibold ">Welcome! Admin</h2>
  <AdminStats
           totalDesigners={totalDesigners}
          totalProjects={totalProjects}
           totalDesignerViews={totalDesignerViews}
           pendingDesigners={pendingDesigners}
         publishedProjects={publishedProjects}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Desingers recent pageSize={5} />
        <Users recent pageSize={5} />
      </div>
      <div className="mt-4">
        <Projects />
      </div>
      </div>
      </div>

      </>
  )
}

export default page