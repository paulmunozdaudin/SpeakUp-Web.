import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary";
type Size = "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary: "bg-neutral-900 text-white hover:bg-black",
  secondary:
    "bg-white text-neutral-900 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50",
};

const sizeClasses: Record<Size, string> = {
  md: "h-11 px-5 text-[15px] gap-2",
  lg: "h-14 px-7 text-base gap-2.5",
};

export function BnboostButton({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center rounded-full font-medium tracking-tight transition-all duration-200 active:scale-[0.98]",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
