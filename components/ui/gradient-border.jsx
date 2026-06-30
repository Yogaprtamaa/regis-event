"use client";

/**
 * GradientBorder — wrapper that adds an animated rotating gradient border.
 *
 * Props:
 *  - colors   : array of CSS colours for the conic gradient
 *  - width    : border thickness in px (default 2)
 *  - radius   : border-radius (default "20px")
 *  - animated : spin the gradient (default true)
 *  - className / style / children
 */
export default function GradientBorder({
  colors = ["#EB3C6B", "#FED245", "#31AECE", "#B5D948", "#F6890C", "#EB3C6B"],
  width = 2,
  radius = "20px",
  animated = true,
  className = "",
  style = {},
  children,
}) {
  const gradient = `conic-gradient(from var(--gb-angle, 0deg), ${colors.join(", ")})`;

  return (
    <div
      className={`gb-wrap ${animated ? "gb-spin" : ""} ${className}`}
      style={{
        position: "relative",
        borderRadius: radius,
        padding: width,
        background: gradient,
        ...style,
      }}
    >
      <div
        className="gb-inner"
        style={{
          borderRadius: `calc(${radius} - ${width}px)`,
          width: "100%",
          height: "100%",
          position: "relative",
          zIndex: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
}
