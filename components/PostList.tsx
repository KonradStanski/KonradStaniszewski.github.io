import Link from "next/link";
import type { MDXFrontMatter } from "@/lib/types";
import { Prose } from "@/components/Prose";
import { cx, slugify } from "@/lib/utils";
import { Tag } from "./Tag";

interface PostListProps {
  posts: Array<MDXFrontMatter>;
}

export const PostList: React.FC<PostListProps> = ({ posts }) => {
  return (
    <ul
      className={cx(
        "divide-y",
        "divide-gray-200",
        "dark:divide-gray-700"
      )}
    >
      {posts.map((post, index) => {
        return (
          <li className="py-2" key={index}>
            <article>
              <div className="flex flex-row justify-between">
                <h2 className="font-bold text-xl">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <time
                  className={cx(
                    "block",
                    "text-gray-500",
                    "dark:text-gray-400"
                  )}
                >
                  {post.date}
                </time>
              </div>
              <div className="flex flex-row justify-between">
                {post.description ? (
                  <div className="">
                    <Prose>
                      <p>{post.description}</p>
                    </Prose>
                  </div>
                ) : null}
                {post.tags ? (
                  <ul className="mt-1 flex flex-wrap space-x-2">
                    {post.tags.map((tag, index) => {
                      return (
                        <li key={index}>
                          <Tag href={`/blog/tagged/${slugify(tag)}`}>{tag}</Tag>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
};
