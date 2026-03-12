import type { HTMLAttributes, DetailedHTMLProps } from "react";

type LdrsProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "l-ring": LdrsProps & {
        size?: string | number;
        stroke?: string | number;
        color?: string;
        speed?: string | number;
      };
      "l-dot-pulse": LdrsProps & {
        size?: string | number;
        color?: string;
        speed?: string | number;
      };
      "l-waveform": LdrsProps & {
        size?: string | number;
        stroke?: string | number;
        color?: string;
        speed?: string | number;
      };
    }
  }
}
