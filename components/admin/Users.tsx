"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { db } from "@/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

type UserAccount = {
  id: string;
  fullName?: string;
  email?: string;
  role?: string;
  createdAt?: { seconds: number; nanoseconds: number };
};

type UsersProps = {
  recent?: boolean;
  pageSize?: number;
  showPagination?: boolean;
};

export default function Users({ recent = false, pageSize = 10, showPagination = false }: UsersProps) {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const usersRef = collection(db, "interinestUsers");
        const q = query(usersRef, where("role", "==", "user"));
        const snapshot = await getDocs(q);
        const userList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<UserAccount, "id">),
        }));
        const sorted = userList.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
        setUsers(sorted);
      } catch (err) {
        console.error("Failed to load users", err);
        setError("Unable to load user accounts right now.");
      } finally {
        setLoading(false);
      }
    };

    void fetchUsers();
  }, []);

  const displayUsers = useMemo(() => {
    if (recent) return users.slice(0, 5);
    if (showPagination) {
      const start = (page - 1) * pageSize;
      return users.slice(start, start + pageSize);
    }
    return users;
  }, [users, recent, showPagination, pageSize, page]);

  const pageCount = showPagination ? Math.max(1, Math.ceil(users.length / pageSize)) : 1;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">User Accounts</h3>
          <p className="text-xs text-slate-500">{recent ? "Most recent 5 users" : "All registered users"}</p>
        </div>
        {recent && (
          <Link href="/admin/users" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
            View more ?
          </Link>
        )}
      </div>

      {loading ? (
        <div className="text-sm text-slate-500">Loading users...</div>
      ) : error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
      ) : users.length === 0 ? (
        <div className="text-sm text-slate-500">No users found.</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                  <th className="py-2 pr-3">Name</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Role</th>
                  <th className="py-2 pr-3">User ID</th>
                </tr>
              </thead>
              <tbody>
                {displayUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 pr-3 font-medium text-slate-700">{user.fullName || "No name"}</td>
                    <td className="py-2 pr-3 text-slate-600">{user.email || "—"}</td>
                    <td className="py-2 pr-3 text-slate-600">{user.role || "user"}</td>
                    <td className="py-2 pr-3 text-slate-500">{user.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showPagination && users.length > pageSize && (
            <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
              <div>{`Showing ${displayUsers.length} of ${users.length}`}</div>
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
