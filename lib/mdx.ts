import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { MDXFrontMatter } from "@/lib/types";

const root = process.cwd();

export const postsPath = path.join(root, "blog");

export const getMdx = (fileName: string) => {
  const fullPath = path.join(postsPath, fileName);
  const docSource = fs.readFileSync(fullPath, "utf-8");
  const { data, content } = matter(docSource);
  data.date = new Date(data.date).toDateString();
  return {
    frontMatter: {
      ...data,
    } as MDXFrontMatter,
    content,
  };
};

export const getAllMdx = () => {
  const items = fs.readdirSync(postsPath).map((item) => getMdx(item));
  return items.sort(
    (a, b) =>
      new Date(b.frontMatter.date).getTime() -
      new Date(a.frontMatter.date).getTime()
  );
};
