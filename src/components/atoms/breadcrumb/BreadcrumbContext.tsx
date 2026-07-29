"use client";

import * as React from "react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbContextValue = {
  items: BreadcrumbItem[] | null;
  setItems: (items: BreadcrumbItem[] | null) => void;
};

const BreadcrumbContext = React.createContext<BreadcrumbContextValue | null>(
  null,
);

export function BreadcrumbProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = React.useState<BreadcrumbItem[] | null>(null);

  const value = React.useMemo(() => ({ items, setItems }), [items]);

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumb() {
  const ctx = React.useContext(BreadcrumbContext);
  if (!ctx)
    throw new Error("useBreadcrumb must be used within BreadcrumbProvider");
  return ctx;
}
