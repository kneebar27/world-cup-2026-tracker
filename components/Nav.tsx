"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="nav">
      <Link href="/today" className={path === "/today" ? "active" : ""}>
        Today
      </Link>
      <Link href="/" className={path === "/" ? "active" : ""}>
        Group Stage
      </Link>
      <Link href="/knockout" className={path === "/knockout" ? "active" : ""}>
        Knockout
      </Link>
    </nav>
  );
}
