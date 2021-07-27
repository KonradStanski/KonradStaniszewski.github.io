import React from "react";
import { GetStaticProps } from "next";
import { IndexProps } from "@app/types/post";
import { getAllPosts } from "@app/lib/api";
import { Layout, PostItem } from "@app/components";

export const Projects = ({ posts }: IndexProps): JSX.Element => {
    return (
        <Layout
            customMeta={{
                title: "projects",
            }}
        >
            <h1>Projects</h1>
            {posts.map((post) => (
                <PostItem key={post.slug} post={post} type="projects" />
            ))}
        </Layout>
    );
};

export const getStaticProps: GetStaticProps = async () => {
    const posts = getAllPosts(["date", "description", "slug", "title"], "projects");

    return {
        props: { posts },
    };
};

export default Projects;
