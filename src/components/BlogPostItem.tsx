import React from "react";
import { format, parseISO } from "date-fns";
import Link from "next/link";

export type BlogPostType = {
    date?: string;
    description?: string;
    image?: string;
    slug: string;
    title: string;
};

type props = {
    post: BlogPostType;
    type: string;
};

const BlogPostItem = (props: props): JSX.Element => {
    return (
        <Link as={`/${props.type}/${props.post.slug}`} href={`/${props.type}/[slug]`}>
            <div
                key={props.post.slug}
                className="mt-8 cursor-pointer hover:shadow-md hover:bg-gray-50 dark:hover:bg-opacity-5 hover:bg-opacity-40 rounded py-6 px-4"
            >
                <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                    {format(parseISO(props.post.date), "MMMM dd, yyyy")}
                </p>
                <h1 className="mb-2 text-xl">
                    <a className="text-gray-900 dark:text-white dark:hover:text-blue-400">{props.post.title}</a>
                </h1>
                <p className="mb-3">{props.post.description}</p>
                <p className="mb-0">
                    <a>Read More...</a>
                </p>
            </div>
        </Link>
    );
};

export default BlogPostItem;
