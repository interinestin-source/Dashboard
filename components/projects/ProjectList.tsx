"use client";
import React, { ReactNode, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CardHeader } from "../ui/card";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import { toast } from "sonner";

export type Project = {
  id: string;
  title: string;
  images: string[];
  budget?: string;
  category: "Interior" | "Exterior" | "Both";
  duration: string;
  location?: string;
  shortDescription?: string;
  status?: "Draft" | "Published" | "";
  uid?: string;
};

type ProjectListProps = {
  projects?: Project[];
};

export default function ProjectList({ projects }: ProjectListProps) {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Project[]>([]);

  const getUidFromCookie = () => {
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/uid=([^;]+)/);
      return match ? match[1] : null;
    }
    return null;
  };

  useEffect(() => {
    if (projects && projects.length) {
      setItems(projects);
      setLoading(false);
      return;
    }

    const uid = getUidFromCookie();
    if (!uid) {
      toast.error("User not logged in");
      setLoading(false);
      return;
    }

    const fetchProjects = async () => {
      try {
        const q = query(collection(db, "projects"), where("uid", "==", uid));
        const snap = await getDocs(q);
        const next: Project[] = snap.docs.map((docSnap) => {
          const data = docSnap.data() as {
            title?: string;
            category?: "Interior" | "Exterior" | "Both";
            budget?: string;
            duration?: string;
            location?: string;
            description?: string;
            imageUrls?: string[];
            status?: "Draft" | "Published" | "";
            uid?: string;
          };

          return {
            id: docSnap.id,
            title: data.title || "Untitled project",
            images: Array.isArray(data.imageUrls) ? data.imageUrls : [],
            budget: data.budget,
            category: data.category || "Interior",
            duration: data.duration || "",
            location: data.location,
            shortDescription: data.description,
            status: data.status,
            uid: data.uid,
          };
        });

        setItems(next);
      } catch (error) {
        console.error("Error loading projects:", error);
        toast.error("Failed to load projects");
      } finally {
        setLoading(false);
      }
    };

    void fetchProjects();
  }, [projects]);
  const pageSize = 6;
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const visible = useMemo(() => items.slice(start, end), [items, start, end]);

  const goto = (p: number) => setPage(Math.min(Math.max(1, p), pageCount));

  if (loading) {
    return (
      <section className="space-y-4">
        <CardHeader className="bg-gradient-to-r from-[#f8f4ec] to-slate-50">
          <p className="mt-1 text-xs md:text-sm text-slate-500">Loading projects...</p>
        </CardHeader>
      </section>
    );
  }

  if (total === 0) {
    return (
      <section className="space-y-4">
        <CardHeader className="bg-gradient-to-r from-[#f8f4ec] to-slate-50">
          <p className="mt-1 text-xs md:text-sm text-slate-500">
            No projects found yet.
          </p>
        </CardHeader>
      </section>
    );
  }

  return (
    <section className="space-y-4">
       
        <CardHeader className=" bg-gradient-to-r from-[#f8f4ec] to-slate-50">
        
          <p className="mt-1 text-xs md:text-sm text-slate-500">
           Showing {Math.min(pageSize, total - start)} of {total} projects
          </p>
        </CardHeader>
   

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visible.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>

      {/* Pagination */}
      <nav className="flex items-center justify-center space-x-3 mt-4">
        <button
          onClick={() => goto(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 rounded-md border bg-white disabled:opacity-50"
        >
          Prev
        </button>

        <div className="flex items-center gap-2">
          {Array.from({ length: pageCount }).map((_, i) => {
            const p = i + 1;
            return (
              <button
                key={p}
                onClick={() => goto(p)}
                aria-current={p === page ? "page" : undefined}
                className={`px-3 py-1 rounded-md border ${p === page ? "bg-[#CAAB06] text-white" : "bg-white"}`}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => goto(page + 1)}
          disabled={page === pageCount}
          className="px-3 py-1 rounded-md border bg-white disabled:opacity-50"
        >
          Next
        </button>
      </nav>
    </section>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const [idx, setIdx] = useState(0);
  const hasMultiple = project.images.length > 1;
  const hasImages = project.images.length > 0;

  const prev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIdx((i) => (i - 1 + project.images.length) % project.images.length);
  };
  const next = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIdx((i) => (i + 1) % project.images.length);
  };

  return (
    <article className="bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-48 bg-gray-100">
        {hasImages ? (
          <img
            src={project.images[idx]}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            No images
          </div>
        )}
        {hasMultiple && (
          <>
            <button
              onClick={prev}
              aria-label="previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 text-gray-700 rounded-full p-1 shadow"
            >
              ‹
            </button>
            <button
              onClick={next}
              aria-label="next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 text-gray-700 rounded-full p-1 shadow"
            >
              ›
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-2 flex gap-1">
              {project.images.map((_, i) => (
                <span key={i} className={`w-2 h-2 rounded-full ${i === idx ? "bg-white" : "bg-white/50"} border`} />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-medium text-gray-900">{project.title}</h3>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              project.category === "Interior"
                ? "bg-green-100 text-green-800"
                : project.category === "Exterior"
                ? "bg-blue-100 text-blue-800"
                : "bg-purple-100 text-purple-800"
            }`}
          >
            {project.category}
          </span>
        </div>

        {project.shortDescription && (
          <p className="text-xs text-gray-500 line-clamp-2">
            {project.shortDescription}
          </p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-700">
          <div>
            <div className="text-sm font-semibold">
              {project.budget ? project.budget : "-"}
            </div>
            <div className="text-xs text-gray-500">Est. cost</div>
          </div>

          <div className="text-right">
            <div className="text-sm">{project.duration || "-"}</div>
            <div className="text-xs text-gray-500">
              {project.location || "-"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/designer-dashboard/projects/${project.id}`}
            className="flex-1 text-center text-sm bg-[#CAAB06] text-white py-2 rounded-md hover:bg-blue-700"
          >
            View Project
          </Link>
        </div>
      </div>
    </article>
  );
}