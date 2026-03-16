"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { db } from "@/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

type DesignerUser = {
  id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  city?: string;
  designerType?: string;
  status?: string;
  createdAt?: { seconds: number; nanoseconds: number };
};

type DesingersProps = {
  recent?: boolean;
  pageSize?: number;
  showPagination?: boolean;
};

export default function Desingers({ recent = false, pageSize = 10, showPagination = false }: DesingersProps) {
  const [designers, setDesigners] = useState<DesignerUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchDesigners = async () => {
      setLoading(true);
      setError(null);
      try {
        const usersRef = collection(db, "interinestUsers");
        const q = query(usersRef, where("role", "==", "designer"));
        const snapshot = await getDocs(q);
        const users = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<DesignerUser, "id">),
        }));
        const sorted = users.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
        setDesigners(sorted);
      } catch (err) {
        console.error("Failed to load designers", err);
        setError("Unable to load designers right now.");
      } finally {
        setLoading(false);
      }
    };

    void fetchDesigners();
  }, []);

  const displayDesigners = useMemo(() => {
    if (recent) return designers.slice(0, 5);
    if (showPagination) {
      const start = (page - 1) * pageSize;
      return designers.slice(start, start + pageSize);
    }
    return designers;
  }, [designers, recent, showPagination, pageSize, page]);

  const pageCount = showPagination ? Math.max(1, Math.ceil(designers.length / pageSize)) : 1;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Designer Users</h3>
          <p className="text-xs text-slate-500">{recent ? "Most recent 5 designers" : "All designer users"}</p>
        </div>
        {recent && (
          <Link href="/admin/designers" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
            View more →
          </Link>
        )}
      </div>

      {loading ? (
        <div className="text-sm text-slate-500">Loading designers...</div>
      ) : error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : designers.length === 0 ? (
        <div className="text-sm text-slate-500">No designers found.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Contact</th>
                  <th className="py-2 pr-3">Type</th>
                  <th className="py-2 pr-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {displayDesigners.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 pr-3 font-medium text-slate-700">
                      {user.fullName || "Untitled"}
                      <div className="text-[12px] text-slate-500">{user.email || "no-email"}</div>
                    </td>
                    <td className="py-2 pr-3 text-slate-600">
                      {user.phone || "-"}
                      <div className="text-[12px] text-slate-500">{user.city || "No city"}</div>
                    </td>
                    <td className="py-2 pr-3 text-slate-700">{user.designerType || "N/A"}</td>
                    <td className="py-2 pr-3 text-green-700">{user.status || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showPagination && designers.length > pageSize && (
            <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
              <div>{`Showing ${displayDesigners.length} of ${designers.length}`}</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded border border-slate-300 px-2 py-1 disabled:opacity-50"
                >
                  Prev
                </button>
                <span>{`Page ${page} / ${pageCount}`}</span>
                <button
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  disabled={page === pageCount}
                  className="rounded border border-slate-300 px-2 py-1 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
