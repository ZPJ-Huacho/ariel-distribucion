"use client";

import { useId, useState, forwardRef } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "./input";
import { cn } from "@/shared/lib/utils";

type Props = Omit<React.ComponentProps<typeof Input>, "type"> & {
  showToggleLabel?: boolean;
};

export const PasswordInput = forwardRef<HTMLInputElement, Props>(
  function PasswordInput({ className, showToggleLabel = false, ...props }, ref) {
    const [visible, setVisible] = useState(false);
    const helperId = useId();
    return (
      <div className="relative">
        <Input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn("pr-10", className)}
          aria-describedby={helperId}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground focus:outline-none focus-visible:text-foreground"
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden />
          ) : (
            <Eye className="h-4 w-4" aria-hidden />
          )}
          {showToggleLabel && (
            <span className="ml-1 text-xs">
              {visible ? "Ocultar" : "Mostrar"}
            </span>
          )}
        </button>
        <span id={helperId} className="sr-only">
          {visible ? "Contraseña visible" : "Contraseña oculta"}
        </span>
      </div>
    );
  },
);
