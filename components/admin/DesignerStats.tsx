"use client";

import React, { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function DesignerStats() {
  const [stats, setStats] = useState({
    totalDesigners: 0,
    totalViews: 0,
    pendingDesigners: 0,
    totalProjects: 0,
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
        let totalViews = 0;
        let pendingDesigners = 0;

        designersSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          totalViews += data.views || 0;
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
          totalViews,
          pendingDesigners,
          totalProjects,
          publishedProjects,
        });
      } catch (err) {
        console.error("Failed to load designer stats", err);
      } finally {
        setLoading(false);
      }
    };

    void fetchStats();
  }, []);

  if (loading) {
    return (
      <section className="rounded-lg border bg-white shadow-sm">
        <div className="px-4 py-3 text-sm text-slate-500">Loading stats...</div>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {/* Total Designers */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold text-slate-600 uppercase">Designers</div>
        <div className="mt-2 text-3xl font-bold text-slate-900">{stats.totalDesigners}</div>
      </div>

      {/* Total Projects */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold text-slate-600 uppercase">Projects</div>
        <div className="mt-2 text-3xl font-bold text-slate-900">{stats.totalProjects}</div>
      </div>

      {/* Designer Views */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-semibold text-slate-600 uppercase">Designer Views</div>
        <div className="mt-2 text-3xl font-bold text-slate-900">{stats.totalViews.toLocaleString()}</div>
      </div>

      {/* Pending */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 shadow-sm">
        <div className="text-xs font-semibold text-yellow-700 uppercase">Pending</div>
        <div className="mt-2 text-3xl font-bold text-yellow-700">{stats.pendingDesigners}</div>
      </div>

      {/* Published Projects */}
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 shadow-sm">
        <div className="text-xs font-semibold text-green-700 uppercase">Published Projects</div>
        <div className="mt-2 text-3xl font-bold text-green-700">{stats.publishedProjects}</div>
      </div>
    </section>
  );
}