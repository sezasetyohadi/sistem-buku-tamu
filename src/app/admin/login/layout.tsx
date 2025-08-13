import React from "react";

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Login page should not have any admin layout - completely separate
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
