import React from "react";

interface ToolbarButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive: boolean;
}

const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
  ({ isActive, ...props }, ref) => {
    return (
      <span
        className={`${isActive ? "text-black" : "text-[#ccc]"}`}
        ref={ref}
        {...props}
      />
    );
  },
);

ToolbarButton.displayName = "ToolbarButton";
export { ToolbarButton };
