"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function AdminStats() {
  const [stats, setStats] = useState({
    totalDesigners: 0,
    totalProjects: 0,
    totalDesignerViews: 0,
    pendingDesigners: 0,
    publishedProjects: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Fetch designers
        const designersRef = collection(db, "interinestUsers");
        const designersQuery = query(designersRef, where("role", "==", "designer"));
        const designersSnapshot = await getDocs(designersQuery);

        const totalDesigners = designersSnapshot.size;
        let totalDesignerViews = 0;
        let pendingDesigners = 0;

        designersSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          totalDesignerViews += data.views || 0;
          if (data.status === "pending") pendingDesigners++;
        });

        // Fetch projects
        const projectsRef = collection(db, "projects");
        const projectsSnapshot = await getDocs(projectsRef);

        const totalProjects = projectsSnapshot.size;
        let publishedProjects = 0;

        projectsSnapshot.docs.forEach((doc) => {
          if (doc.data().isPublished) publishedProjects++;
        });

        setStats({
          totalDesigners,
          totalProjects,
          totalDesignerViews,
          pendingDesigners,
          publishedProjects,
        });
      } catch (err) {
        console.error("Failed to load admin stats", err);
      } finally {
        setLoading(false);
      }
    };

    void fetchStats();
  }, []);

  const cards = [
    { label: "Designers", value: stats.totalDesigners },
    { label: "Projects", value: stats.totalProjects },
    { label: "Designer Views", value: stats.totalDesignerViews },
    { label: "Pending", value: stats.pendingDesigners },
    { label: "Published Projects", value: stats.publishedProjects },
  ];

  if (loading) {
    return (
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-lg border bg-white px-4 py-3 shadow-sm animate-pulse"
          >
            <div className="h-3 w-16 bg-slate-200 rounded"></div>
            <div className="mt-2 h-6 w-12 bg-slate-200 rounded"></div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-lg border bg-white px-4 py-3 shadow-sm"
        >
          <div className="text-xs text-slate-500">{c.label}</div>
          <div className="mt-1 text-xl font-semibold text-slate-900">
            {c.value.toLocaleString()}
          </div>
        </div>
      ))}
    </section>
  );
}