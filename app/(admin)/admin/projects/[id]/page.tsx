"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/admin/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { toast } from "sonner";

type ProjectDetail = {
  title?: string;
  category?: "Interior" | "Exterior" | "Both";
  budget?: string;
  duration?: string;
  location?: string;
  style?: string;
  status?: "Draft" | "Published";
  description?: string;
  tags?: string[];
  imageUrls?: string[];
  uid?: string;
  createdAt?: { seconds: number; nanoseconds: number };
  updatedAt?: { seconds: number; nanoseconds: number };
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadProject = async () => {
      try {
        const projectId = Array.isArray(id) ? id[0] : id;
        const snap = await getDoc(doc(db, "projects", projectId));
        if (!snap.exists()) {
          toast.error("Project not found");
          setProject(null);
          return;
        }
        setProject(snap.data() as ProjectDetail);
      } catch (error) {
        console.error("Load project error", error);
        toast.error("Unable to load project data.");
      } finally {
        setLoading(false);
      }
    };

    void loadProject();
  }, [id]);

  const breadcrumbs = [
    { label: "Home", href: "/admin" },
    { label: "Projects", href: "/admin/projects" },
    { label: "Project Details" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header pageTitle="Project Details" breadcrumbs={breadcrumbs} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-center min-h-[280px]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header pageTitle="Project Details" breadcrumbs={breadcrumbs} />
       <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col space-y-3">
               
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="p-6 text-center">
              <p className="text-lg font-semibold text-slate-800">Project not found</p>
              <p className="text-sm text-slate-500">This project may have been removed or the ID is invalid.</p>
              <Button className="mt-4" variant="secondary" onClick={() => router.push("/admin/projects")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const formatDate = (stamp?: { seconds: number; nanoseconds: number }) => {
    if (!stamp) return "�";
    return new Date(stamp.seconds * 1000).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header pageTitle="Project Details" breadcrumbs={breadcrumbs} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-3 flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => router.push("/admin/projects")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Back
          </Button>
        </div>

        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 border-b">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              <div>
                <CardTitle className="text-xl font-semibold text-slate-900">{project.title || "Untitled Project"}</CardTitle>
                <p className="text-sm text-slate-500">Category: {project.category || "Unspecified"}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="capitalize">{project.status || "unknown"}</Badge>
                <Badge variant="outline">Location: {project.location || "No location"}</Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5 p-5 md:p-6">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Budget</p>
                <p className="text-base font-semibold text-slate-900">{project.budget || "N/A"}</p>
              </div>
              
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Duration</p>
                <p className="text-base font-semibold text-slate-900">{project.duration || "N/A"}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Style</p>
                <p className="text-base font-semibold text-slate-900">{project.style || "N/A"}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">Category type</p>
                <p className="text-base font-semibold text-slate-900">{project.category || "N/A"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Project description</p>
              <p className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">{project.description || "No description available."}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Tags</p>
              <div className="flex flex-wrap gap-2">
                {project.tags && project.tags.length > 0 ? (
                  project.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">{tag}</span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No tags</span>
                )}
              </div>
            </div>
            

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">Images</p>
                <span className="text-xs text-slate-500">{project.imageUrls?.length ?? 0} uploaded</span>
              </div>
              {project.imageUrls && project.imageUrls.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                  {project.imageUrls.map((url, idx) => (
                    <div key={`${url}-${idx}`} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                      <img src={url} alt={`Project image ${idx + 1}`} className="h-28 w-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-500">No images available.</div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-500">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                <p className="font-semibold text-slate-600">Created</p>
                <p>{formatDate(project.createdAt)}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                <p className="font-semibold text-slate-600">Updated</p>
                <p>{formatDate(project.updatedAt)}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => router.push("/admin/projects")}>Back to projects</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
