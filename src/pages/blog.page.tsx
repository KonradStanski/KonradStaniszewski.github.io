import React from "react";
import { getAllPosts } from "@app/lib/api";
import { GetStaticProps } from "next";
import { BlogPostItem, Layout } from "@app/components";
import { BlogPostType } from "@app/components/BlogPostItem";

type props = {
    blogPosts: BlogPostType[];
};

export const Blog = ({ blogPosts }: props): JSX.Element => {
    return (
        <Layout
            customMeta={{
                title: "Blog",
            }}
        >
            <h1 className="text-4xl">Blog</h1>
            {blogPosts.map((post) => (
                <BlogPostItem key={post.slug} post={post} />
            ))}
        </Layout>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    let blogPosts = getAllPosts(["date", "description", "slug", "title"], "blog");
    const projectPosts = getAllPosts(["date", "description", "slug", "title"], "projects");
    blogPosts = blogPosts.concat(projectPosts);
    blogPosts.sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
    return {
        props: { blogPosts },
    };
};

export default Blog;
