import type { ButtonHTMLAttributes } from "react";

type Variant = "default" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Button({
  variant = "default",
  size = "md",
  className,
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium " +
    "transition active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none " +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2";

  const variants: Record<Variant, string> = {
    default: "bg-slate-900 text-white hover:bg-slate-800 shadow-sm",
    outline:
      "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 shadow-sm",
    ghost: "bg-transparent text-slate-900 hover:bg-slate-100",
    danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
  };

  const sizes: Record<Size, string> = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-base",
  };

  return (
    <button
      {...props}
      className={cx(base, variants[variant], sizes[size], className)}
    />
  );
}

export default Button;
