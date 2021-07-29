import React from "react";
import { getAllPosts } from "@app/lib/api";
import { GetStaticProps } from "next";
import { BlogPostItem, Layout } from "@app/components";
import { BlogPostType } from "@app/components/BlogPostItem";

type props = {
    posts: BlogPostType[];
};

export const Blog = ({ posts }: props): JSX.Element => {
    return (
        <Layout
            customMeta={{
                title: "Blog",
            }}
        >
            <h1 className="text-4xl">Blog</h1>
            {posts.map((post) => (
                <BlogPostItem key={post.slug} post={post} type="blog" />
            ))}
        </Layout>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const posts = getAllPosts(["date", "description", "slug", "title"], "blog");

    return {
        props: { posts },
    };
};

export default Blog;
