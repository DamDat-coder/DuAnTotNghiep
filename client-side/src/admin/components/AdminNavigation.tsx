// src/admin/components/AdminNavigation.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

export interface NavigationItem {
  label: string;
  href: string;
  filter?: string;
}

interface AdminNavigationProps {
  items: NavigationItem[];
  currentFilter: string;
  onFilter?: (filter: string) => void;
  addButton?: {
    label: string;
    href: string;
  };
}

