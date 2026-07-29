"use client";

import { PropsWithChildren } from "react";

import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";

type ActionButtonProps = PropsWithChildren<{
  contentClassName?: string;
}>;

const ActionButton = ({ children, contentClassName }: ActionButtonProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-5 w-5 p-0">
          <span className="sr-only">Buka Menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className={cn("font-poppins", contentClassName)}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActionButton;
