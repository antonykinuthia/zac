import { SplitText } from "gsap/SplitText";

type SplitTextVars = NonNullable<Parameters<typeof SplitText.create>[1]>;

export type SplitOptions = {
  selector: string;
  type: "chars" | "words" | "lines";
  className: string;
  mask?: boolean;
};

export function splitText({ selector, type, className, mask = true }: SplitOptions) {
  return SplitText.create(selector, {
    type,
    [`${type}Class`]: className,
    ...(mask && { mask: type }),
  } as SplitTextVars);
}