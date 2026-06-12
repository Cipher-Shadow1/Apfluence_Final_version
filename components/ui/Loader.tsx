import * as React from "react";
import { Loader2 } from "lucide-react";

export type LoaderOneProps = React.ComponentProps<typeof Loader2>;

/**
 * App-wide spinner icon used by forms and tables.
 *
 * Naming kept for compatibility with existing imports.
 */
export function LoaderOne(props: LoaderOneProps) {
  const { className, ...rest } = props;
  return (
    <Loader2
      {...rest}
      className={["animate-spin", className].filter(Boolean).join(" ")}
    />
  );
}

