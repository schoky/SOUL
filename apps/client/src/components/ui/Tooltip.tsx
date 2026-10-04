import type { ReactNode } from "react";

type TooltipProps = {
  content: string;
  children: ReactNode;
  position?: "top" | "bottom";
  className?: string;
};

function Tooltip({
  content,
  children,
  position = "top",
  className,
}: TooltipProps) {
  return (
    <span
      className={["tooltip", `tooltip--${position}`, className]
        .filter(Boolean)
        .join(" ")}
      data-tooltip={content}
    >
      {children}
    </span>
  );
}

export default Tooltip;
