import React from "react";

export default function UserDashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-background text-[color:var(--color-text)]">
      <header className="p-4 border-b">
        <h1 className="text-lg font-semibold">User Dashboard</h1>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}