import React from "react";

type AdminStatsProps = {
  totalDesigners: number;
  totalProjects: number;
  totalDesignerViews: number;
  pendingDesigners?: number;
  publishedProjects?: number;
};

export default function AdminStats({
  totalDesigners,
  totalProjects,
  totalDesignerViews,
  pendingDesigners = 0,
  publishedProjects = 0,
}: AdminStatsProps) {
  const cards = [
    { label: "Designers", value: totalDesigners },
    { label: "Projects", value: totalProjects },
    { label: "Designer Views", value: totalDesignerViews },
    { label: "Pending", value: pendingDesigners },
    { label: "Published Projects", value: publishedProjects },
  ];

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