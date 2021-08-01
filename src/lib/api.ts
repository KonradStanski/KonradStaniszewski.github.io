import fs from "fs";
import matter from "gray-matter";
import { join } from "path";
import { getPostPath } from "@app/utils/mdxUtils";

type PostItem = {
    [key: string]: string;
};

/**
 *
 * @returns List of post slugs based on given path
 */
export function getPostSlugs(postType: string): string[] {
    return fs.readdirSync(getPostPath(postType));
}

/**
 *
 * @param slug slug for post
 * @param fields Required info to build post
 * @returns Single postitem corresponding to slug
 */
export function getPostBySlug(slug: string, fields: string[] = [], postType: string): PostItem {
    const realSlug = slug.replace(/\.mdx$/, "");
    const fullPath = join(getPostPath(postType), `${realSlug}.mdx`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    const items: PostItem = {};

    // Ensure only the minimal needed data is exposed
    fields.forEach((field) => {
        if (field === "slug") {
            items[field] = realSlug;
        }
        if (field === "content") {
            items[field] = content;
        }
        if (data[field]) {
            items[field] = data[field];
        }
    });

    return items;
}

/**
 *
 * @param fields Required info to build post
 * @returns list of post items
 */
export function getAllPosts(fields: string[] = [], postType: string): PostItem[] {
    const slugs = getPostSlugs(postType);
    const posts = slugs
        .map((slug) => getPostBySlug(slug, fields, postType))
        // sort posts by date in descending order
        .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
    return posts;
}
