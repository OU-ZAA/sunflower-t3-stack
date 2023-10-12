import React from "react";

type IconProps = React.HTMLAttributes<HTMLSpanElement>;

const Icon = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ ...props }, ref) => (
    <span
      {...props}
      ref={ref}
      className="material-symbols-outlined cursor-pointer align-text-bottom"
      style={{ fontSize: "18px" }}
    />
  ),
);

Icon.displayName = "Icon";
export { Icon };
