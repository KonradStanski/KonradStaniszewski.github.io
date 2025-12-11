import clsx from "clsx";
import slugify from "@sindresorhus/slugify";
export { slugify, clsx as cx };

export const clamp = (min: number, max: number, value: number) => {
  return Math.min(Math.max(value, min), max);
};
