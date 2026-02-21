import React, { useMemo } from "react";

export type DesignerStatus = "pending" | "approved" | "rejected";

export type Designer = {
  id: string;
  name: string;
  views: number;
  status: DesignerStatus;
};

export type AdminProject = {
  id: string;
  designerId: string;
  isPublished: boolean;
};

type Props = {
  designers: Designer[];
  projects: AdminProject[];
};

export default function DesignerStats({ designers, projects }: Props) {
  const byDesigner = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) {
      counts.set(p.designerId, (counts.get(p.designerId) ?? 0) + 1);
    }
    return counts;
  }, [projects]);

  return (
    <section className="rounded-lg border bg-white shadow-sm">
      <div className="px-4 py-3 border-b">
        <h2 className="text-sm font-semibold text-slate-900">Designer Stats</h2>
        <p className="text-xs text-slate-500">Projects and views by designer</p>
      </div>

      <div className="divide-y">
        {designers.map((d) => {
          const projectCount = byDesigner.get(d.id) ?? 0;
          return (
            <div key={d.id} className="px-4 py-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-900">{d.name}</div>
                <div className="text-xs text-slate-500">
                  {projectCount} projects • {d.views.toLocaleString()} views
                </div>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  d.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : d.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {d.status}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}