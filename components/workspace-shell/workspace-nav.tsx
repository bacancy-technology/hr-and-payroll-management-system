"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const WORKSPACE_LINKS = [
  { href: "/workspace", label: "Overview" },
  { href: "/workspace/workforce", label: "Workforce" },
  { href: "/workspace/payroll", label: "Payroll" },
  { href: "/workspace/operations", label: "Operations" },
  { href: "/workspace/compliance", label: "Compliance" },
  { href: "/workspace/analytics", label: "Analytics" },
  { href: "/workspace/admin", label: "Admin" },
  { href: "/workspace/self-service", label: "Self-Service" },
];

export function WorkspaceNav() {
  const pathname = usePathname();

  return (
    <nav className="workspace-nav" aria-label="Workspace sections">
      {WORKSPACE_LINKS.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            className={`workspace-nav-link${isActive ? " workspace-nav-link-active" : ""}`}
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
