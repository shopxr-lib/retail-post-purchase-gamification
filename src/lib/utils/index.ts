export const capitalize = (s: string) =>
  s
    ? s
        .split(" ")
        .map((word) =>
          word
            .split("-")
            .map((part) => {
              // Handle 3d → 3D
              if (/^\d+d$/i.test(part)) {
                return part.toUpperCase();
              }

              return part.charAt(0).toUpperCase() + part.slice(1);
            })
            .join("-"),
        )
        .join(" ")
    : "";